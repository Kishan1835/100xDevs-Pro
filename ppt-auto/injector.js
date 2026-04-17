/**
 * injector.js — Place source content into destination slides
 *
 * Handles:
 *  - Coordinate rescaling between different slide dimensions
 *  - Whitespace detection and placement
 *  - Image binary transfer with relationship registration
 *  - Placeholder-aware text injection
 *  - Collision avoidance with existing destination elements
 */

'use strict';

const path = require('path');
const {
  buildXml,
  readZipXml,
  readZipText,
  getSlideList,
  buildRelMap,
  getShapeBBox,
  buildXfrm,
  findBestPlacement,
  scaleBBox,
  clampBBox,
  collectShapeBBoxes,
  generateRId,
  safeGet,
  SLIDE_MARGIN,
} = require('./utils');

/**
 * Apply all slide mappings to the destination zip, producing the output.
 *
 * @param {JSZip}          destZip
 * @param {SlideMapping[]} mapping
 * @param {object}         srcDims   - { cx, cy } source slide dimensions
 * @param {object}         dstDims   - { cx, cy } destination slide dimensions
 */
async function applyMappings(destZip, mapping, srcDims, dstDims, options = {}) {
  const results = [];

  for (const m of mapping) {
    if (!m.dest) {
      results.push({ success: false, reason: 'no destination slide' });
      continue;
    }

    try {
      const effectiveMapping = await resolveMappingTarget(destZip, m);
      await applyOneMapping(destZip, effectiveMapping, srcDims, dstDims, options);
      results.push({ success: true, srcSlide: m.source.number, destSlide: m.dest.index + 1 });
    } catch (err) {
      results.push({ success: false, srcSlide: m.source.number, error: err.message });
      console.error(`  ✗  Slide ${m.source.number}: ${err.message}`);
    }
  }

  return results;
}

async function resolveMappingTarget(destZip, mapping) {
  if (!mapping.dest || !mapping.reuseCount || mapping.reuseCount <= 0) return mapping;
  const clonedSlidePath = await cloneDestinationSlide(destZip, mapping.dest.path);
  return {
    ...mapping,
    dest: {
      ...mapping.dest,
      path: clonedSlidePath,
    },
  };
}

// ─── Single-Mapping Application ───────────────────────────────────────────────

async function applyOneMapping(destZip, mapping, srcDims, dstDims, options = {}) {
  const { source, dest, strategy } = mapping;
  const destSlidePath = dest.path;

  // Load destination slide XML as a raw string (so we can safely re-serialize)
  const destXmlStr = await readZipText(destZip, destSlidePath);
  if (!destXmlStr) throw new Error(`Cannot read destination slide: ${destSlidePath}`);

  let destXml = await parseXmlSafe(destXmlStr);

  // Load destination slide relationships
  const destRelsPath = destSlidePath
    .replace('ppt/slides/', 'ppt/slides/_rels/')
    .replace('.xml', '.xml.rels');
  let destRels    = await readZipXml(destZip, destRelsPath);
  let destRelMap  = buildRelMap(destRels);
  let relsDirty   = false;

  // Collect existing bboxes on dest (for collision avoidance)
  const existingBBoxes = collectShapeBBoxes(destXml);
  const placeholderBBoxes = collectPlaceholderBBoxes(destXml);
  let placeholderCursor = 0;
  clearPlaceholderContent(destXml);

  // Navigate to spTree
  const root   = destXml['p:sld'] || destXml['sld'];
  const cSld   = safeGet(root, 'p:cSld', 0);
  const spTree = cSld ? safeGet(cSld, 'p:spTree', 0) : null;
  if (!spTree) throw new Error('Destination slide has no spTree');

  let nextId = findMaxShapeId(destXml) + 1;
  const cleanState = {
    textIndex: 0,
    visualIndex: 0,
    shapeIndex: 0,
    slots: buildCleanLayoutSlots(dstDims),
  };

  for (const element of source.elements) {
    if (options.cleanLayout && element.type !== 'text') continue;

    // Compute scaled + clamped bounding box
    const scaledBBox = element.bbox
      ? clampBBox(scaleBBox(element.bbox, srcDims, dstDims), dstDims)
      : null;

    // Determine final placement
    let placeBBox = scaledBBox;

    if (options.cleanLayout) {
      placeBBox = getCleanLayoutBBox(element, cleanState, scaledBBox, dstDims) || scaledBBox;
    } else if (strategy === 'use-placeholder' && placeholderBBoxes.length > 0) {
      const targetPh = placeholderBBoxes[placeholderCursor % placeholderBBoxes.length];
      placeholderCursor += 1;
      placeBBox = { x: targetPh.x, y: targetPh.y, cx: targetPh.cx, cy: targetPh.cy };
    } else if (strategy === 'place-in-whitespace' || strategy === 'best-effort') {
      const required = scaledBBox || { cx: 2743200, cy: 1828800 }; // default 3"×2"
      const found    = findBestPlacement(existingBBoxes, dstDims, { cx: required.cx, cy: required.cy });
      if (found) {
        placeBBox = { ...required, x: found.x, y: found.y };
        // Register this new bbox to avoid future overlaps in same slide
        existingBBoxes.push(placeBBox);
      }
    }

    if (!placeBBox) {
      console.warn(`    ⚠  No placement found for ${element.type} "${element.name}", skipping`);
      continue;
    }

    // Inject element into spTree
    switch (element.type) {
      case 'text':
        injectText(spTree, element, placeBBox, nextId++, dstDims);
        break;

      case 'shape':
        injectShape(spTree, element, placeBBox, nextId++);
        break;

      case 'image': {
        if (!element.imageData) {
          console.warn(`    ⚠  Image "${element.name}" has no data, skipping`);
          break;
        }
        const rId = await injectImage(
          destZip, spTree, element, placeBBox, nextId++,
          destSlidePath, destRels, destRelMap
        );
        relsDirty = true;
        break;
      }

      case 'chart':
      case 'table':
      case 'group':
        // For complex elements: inject raw XML node with updated coordinates
        injectRaw(spTree, element, placeBBox, nextId++, srcDims, dstDims);
        break;

      case 'connector':
        // Connectors typically reference other shapes; skip for safety
        break;

      default:
        injectRaw(spTree, element, placeBBox, nextId++, srcDims, dstDims);
    }
  }

  // Serialize and write back
  const newXmlStr = buildXml(destXml);
  destZip.file(destSlidePath, newXmlStr);

  // Update rels only when we actually added media rels.
  if (relsDirty && destRels) {
    const newRelsStr = buildXml(destRels);
    destZip.file(destRelsPath, newRelsStr);
  }
}

// ─── Text Injection ───────────────────────────────────────────────────────────

/**
 * Inject a text box shape into spTree.
 * Strips source color info so it inherits from destination theme.
 */
function injectText(spTree, element, bbox, shapeId, dstDims) {
  const { x, y, cx, cy } = bbox;

  // Rebuild paragraphs — strip source colors so dest theme colors apply
  const paras = (element.paragraphs || []).map(para => {
    const runs = para.runs.map(run => {
      const rPrAttrs = { lang: 'en-US', dirty: '0' };
      if (run.bold)   rPrAttrs.b  = '1';
      if (run.italic) rPrAttrs.i  = '1';
      if (run.sz)     rPrAttrs.sz = String(run.sz);
      // Force theme text color token to avoid invisible text on some templates.

      return {
        'a:rPr': [{
          $: rPrAttrs,
          'a:solidFill': [{ 'a:schemeClr': [{ $: { val: 'tx1' } }] }],
        }],
        'a:t':   [{ _: run.text, $: run.text.match(/^\s|\s$/) ? { 'xml:space': 'preserve' } : {} }],
      };
    });

    const pPrAttrs = { algn: para.align || 'l' };
    const pPrChildren = {};
    if (para.spacing?.lineSpacing) {
      pPrChildren['a:lnSpc'] = [{ 'a:spcPts': [{ $: { val: para.spacing.lineSpacing } }] }];
    }

    return {
      'a:pPr': [{ $: pPrAttrs, ...pPrChildren }],
      'a:r':   runs,
    };
  });

  // Ensure at least one empty paragraph if no content
  if (paras.length === 0) paras.push({ 'a:r': [] });

  const sp = {
    'p:nvSpPr': [{
      'p:cNvPr': [{ $: { id: String(shapeId), name: `TextBox_${shapeId}`, descr: '' } }],
      'p:cNvSpPr': [{ $: { txBox: '1' }, 'a:spLocks': [{ $: { noGrp: '1' } }] }],
      'p:nvPr':  [{}],
    }],
    'p:spPr': [{
      'a:xfrm': [buildXfrm(x, y, cx, cy)],
      'a:prstGeom': [{ $: { prst: 'rect' }, 'a:avLst': [{}] }],
      'a:noFill':   [{}],
    }],
    'p:txBody': [{
      'a:bodyPr': [{ $: {
        wrap:   'square',
        rtlCol: '0',
        anchor: 't',
      }}],
      'a:lstStyle': [{}],
      'a:p':        paras,
    }],
  };

  ensureArray(spTree, 'p:sp');
  spTree['p:sp'].push(sp);
}

// ─── Shape Injection ──────────────────────────────────────────────────────────

function injectShape(spTree, element, bbox, shapeId) {
  const { x, y, cx, cy } = bbox;

  // Use destination theme's accent color instead of source color
  // by using schemeClr references
  const fillNode = buildThemeFillNode(element.fill);

  const sp = {
    'p:nvSpPr': [{
      'p:cNvPr': [{ $: { id: String(shapeId), name: `Shape_${shapeId}` } }],
      'p:cNvSpPr': [{ 'a:spLocks': [{ $: { noGrp: '1' } }] }],
      'p:nvPr':    [{}],
    }],
    'p:spPr': [{
      'a:xfrm':    [buildXfrm(x, y, cx, cy)],
      'a:prstGeom': [{ $: { prst: element.geometry || 'rect' }, 'a:avLst': [{}] }],
      ...fillNode,
    }],
  };

  ensureArray(spTree, 'p:sp');
  spTree['p:sp'].push(sp);
}

/**
 * Build a fill node that references the destination theme color
 * instead of hardcoding the source RGB.
 */
function buildThemeFillNode(fill) {
  if (!fill || fill.type === 'none') return { 'a:noFill': [{}] };

  // Map source fill to a neutral theme color reference
  // 'accent1' adapts to whatever the destination theme defines
  return {
    'a:solidFill': [{
      'a:schemeClr': [{ $: { val: 'accent1' }, 'a:lumMod': [{ $: { val: '75000' } }] }],
    }],
  };
}

// ─── Image Injection ──────────────────────────────────────────────────────────

async function injectImage(destZip, spTree, element, bbox, shapeId, destSlidePath, destRels, destRelMap) {
  const { x, y, cx, cy } = bbox;

  // ── 1. Copy image binary into destination zip ──
  const destMediaDir = 'ppt/media/';
  const safeName     = `transferred_${shapeId}_${element.imageName || 'image.png'}`;
  const destImagePath = `${destMediaDir}${safeName}`;

  const imageBuffer = Buffer.from(element.imageData, 'base64');
  destZip.file(destImagePath, imageBuffer);

  // ── 2. Register relationship ──
  const rId = generateRId(destRelMap);
  const mediaTarget = `../media/${safeName}`;
  const mediaType   = getMimeType(element.imageType || 'png');

  // Ensure relationship file exists
  ensureRelsFile(destRels, rId, mediaTarget, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
  destRelMap[rId] = mediaTarget;

  // ── 3. Register in [Content_Types].xml if not already present ──
  const ext = path.extname(safeName).replace('.', '');
  await ensureContentType(destZip, ext, mediaType);

  // ── 4. Build pic XML node ──
  const pic = {
    'p:nvPicPr': [{
      'p:cNvPr':   [{ $: { id: String(shapeId), name: `Picture_${shapeId}`, descr: '' } }],
      'p:cNvPicPr': [{ 'a:picLocks': [{ $: { noChangeAspect: '1' } }] }],
      'p:nvPr':    [{}],
    }],
    'p:blipFill': [{
      'a:blip':   [{ $: { 'r:embed': rId, 'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships' } }],
      'a:stretch': [{ 'a:fillRect': [{}] }],
    }],
    'p:spPr': [{
      'a:xfrm': [buildXfrm(x, y, cx, cy)],
      'a:prstGeom': [{ $: { prst: 'rect' }, 'a:avLst': [{}] }],
    }],
  };

  ensureArray(spTree, 'p:pic');
  spTree['p:pic'].push(pic);

  return rId;
}

// ─── Raw XML Injection (Charts, Tables, Groups) ───────────────────────────────

/**
 * Inject a complex element by cloning its raw XML and updating coordinates.
 * Strips relationship references that would be invalid in the destination.
 */
function injectRaw(spTree, element, bbox, shapeId, srcDims, dstDims) {
  const { x, y, cx, cy } = bbox;

  // Deep clone the raw node
  const cloned = JSON.parse(JSON.stringify(element.rawXml));

  // Update the xfrm in the cloned node
  patchXfrmInNode(cloned, x, y, cx, cy);

  // Update shape ID to avoid conflicts
  patchShapeId(cloned, shapeId);

  // Inject into appropriate spTree array
  const tag = element.tag;
  ensureArray(spTree, tag);
  spTree[tag].push(cloned);
}

// ─── XML Patch Helpers ────────────────────────────────────────────────────────

/**
 * Recursively find and update a:xfrm / a:off / a:ext in a node tree.
 */
function patchXfrmInNode(node, x, y, cx, cy) {
  if (typeof node !== 'object' || !node) return;

  if (node['a:xfrm']) {
    const xfrm = Array.isArray(node['a:xfrm']) ? node['a:xfrm'][0] : node['a:xfrm'];
    if (xfrm['a:off']) {
      const off = Array.isArray(xfrm['a:off']) ? xfrm['a:off'][0] : xfrm['a:off'];
      if (off.$) { off.$.x = String(x); off.$.y = String(y); }
    }
    if (xfrm['a:ext']) {
      const ext = Array.isArray(xfrm['a:ext']) ? xfrm['a:ext'][0] : xfrm['a:ext'];
      if (ext.$) { ext.$.cx = String(cx); ext.$.cy = String(cy); }
    }
    return; // found, stop descending into this branch
  }

  for (const val of Object.values(node)) {
    if (Array.isArray(val)) val.forEach(v => patchXfrmInNode(v, x, y, cx, cy));
    else if (typeof val === 'object') patchXfrmInNode(val, x, y, cx, cy);
  }
}

/**
 * Update the cNvPr id attribute in a cloned node.
 */
function patchShapeId(node, newId) {
  function walk(n) {
    if (typeof n !== 'object' || !n) return;
    if (n['p:cNvPr']) {
      const cnv = Array.isArray(n['p:cNvPr']) ? n['p:cNvPr'][0] : n['p:cNvPr'];
      if (cnv.$) cnv.$.id = String(newId);
      return;
    }
    Object.values(n).forEach(v => {
      if (Array.isArray(v)) v.forEach(walk);
      else walk(v);
    });
  }
  walk(node);
}

// ─── Relationship Helpers ─────────────────────────────────────────────────────

function ensureRelsFile(relsObj, rId, target, type) {
  if (!relsObj) return;
  const root = relsObj['Relationships'];
  if (!root) return;
  ensureArray(root, 'Relationship');
  root['Relationship'].push({
    $: { Id: rId, Type: type, Target: target },
  });
}

async function ensureContentType(zip, ext, mimeType) {
  const ctPath = '[Content_Types].xml';
  const ctText = await zip.file(ctPath)?.async('string');
  if (!ctText) return;

  // Simple text check — if extension already registered, skip
  if (ctText.includes(`Extension="${ext}"`)) return;

  // Insert before closing tag
  const newEntry = `<Default Extension="${ext}" ContentType="${mimeType}"/>`;
  const patched  = ctText.replace('</Types>', `${newEntry}\n</Types>`);
  zip.file(ctPath, patched);
}

// ─── Utility Helpers ──────────────────────────────────────────────────────────

function findMaxShapeId(slideXml) {
  let max = 100;
  const str = JSON.stringify(slideXml);
  const matches = str.matchAll(/"id":"(\d+)"/g);
  for (const m of matches) {
    const n = parseInt(m[1]);
    if (n > max) max = n;
  }
  return max;
}

function collectPlaceholderBBoxes(slideXml) {
  const root = slideXml['p:sld'] || slideXml['sld'];
  const cSld = safeGet(root, 'p:cSld', 0);
  const spTree = cSld ? safeGet(cSld, 'p:spTree', 0) : null;
  if (!spTree) return [];

  const shapes = spTree['p:sp'] || [];
  const bboxes = [];

  for (const sp of shapes) {
    const nvSpPr = safeGet(sp, 'p:nvSpPr', 0);
    const nvPr = nvSpPr ? safeGet(nvSpPr, 'p:nvPr', 0) : null;
    const ph = nvPr ? safeGet(nvPr, 'p:ph', 0) : null;
    if (!ph) continue;

    const spPr = safeGet(sp, 'p:spPr', 0);
    const bbox = spPr ? getShapeBBox(spPr) : null;
    if (!bbox || bbox.cx <= 0 || bbox.cy <= 0) continue;

    bboxes.push(bbox);
  }

  return bboxes;
}

function clearPlaceholderContent(slideXml) {
  const root = slideXml['p:sld'] || slideXml['sld'];
  const cSld = safeGet(root, 'p:cSld', 0);
  const spTree = cSld ? safeGet(cSld, 'p:spTree', 0) : null;
  if (!spTree) return;

  const shapes = spTree['p:sp'] || [];
  for (const sp of shapes) {
    const nvSpPr = safeGet(sp, 'p:nvSpPr', 0);
    const nvPr = nvSpPr ? safeGet(nvSpPr, 'p:nvPr', 0) : null;
    const ph = nvPr ? safeGet(nvPr, 'p:ph', 0) : null;
    if (!ph) continue;

    if (sp['p:txBody']) {
      sp['p:txBody'] = [{
        'a:bodyPr': [{ $: { wrap: 'square', rtlCol: '0', anchor: 't' } }],
        'a:lstStyle': [{}],
        'a:p': [{ 'a:r': [] }],
      }];
    }
  }

  // Remove picture placeholders so imported visuals can occupy those regions.
  const pics = spTree['p:pic'] || [];
  spTree['p:pic'] = pics.filter(pic => {
    const nvPicPr = safeGet(pic, 'p:nvPicPr', 0);
    const nvPr = nvPicPr ? safeGet(nvPicPr, 'p:nvPr', 0) : null;
    const ph = nvPr ? safeGet(nvPr, 'p:ph', 0) : null;
    return !ph;
  });
}

function isCleanLayoutElement(element) {
  return element.type === 'text' || element.type === 'image' || element.type === 'chart' || element.type === 'table';
}

function buildCleanLayoutSlots(dstDims) {
  const margin = SLIDE_MARGIN;
  const usableW = Math.max(0, dstDims.cx - margin * 2);
  const usableH = Math.max(0, dstDims.cy - margin * 2);
  const gap = Math.round(usableH * 0.03);

  const titleH = Math.round(usableH * 0.16);
  const bodyH = Math.round(usableH * 0.38);
  const visualH = Math.max(0, usableH - titleH - bodyH - (gap * 2));

  return {
    title: { x: margin, y: margin, cx: usableW, cy: titleH },
    body: { x: margin, y: margin + titleH + gap, cx: usableW, cy: bodyH },
    visual: { x: margin, y: margin + titleH + bodyH + (gap * 2), cx: usableW, cy: visualH },
  };
}

function getCleanLayoutBBox(element, cleanState, scaledBBox, dstDims) {
  if (element.type === 'text') {
    const slot = cleanState.textIndex === 0 ? cleanState.slots.title : cleanState.slots.body;
    cleanState.textIndex += 1;
    return fitToSlot(scaledBBox, slot);
  }
  if (element.type === 'image' || element.type === 'chart' || element.type === 'table') {
    cleanState.visualIndex += 1;
    return fitToSlot(scaledBBox, cleanState.slots.visual);
  }
  cleanState.shapeIndex += 1;
  return clampBBox(scaledBBox || cleanState.slots.body, dstDims);
}

function fitToSlot(bbox, slot) {
  if (!bbox) return { ...slot };
  const srcRatio = bbox.cx > 0 && bbox.cy > 0 ? bbox.cx / bbox.cy : null;
  if (!srcRatio) return { ...slot };

  let cx = slot.cx;
  let cy = Math.round(cx / srcRatio);
  if (cy > slot.cy) {
    cy = slot.cy;
    cx = Math.round(cy * srcRatio);
  }
  const x = slot.x + Math.round((slot.cx - cx) / 2);
  const y = slot.y + Math.round((slot.cy - cy) / 2);
  return { x, y, cx, cy };
}

function ensureArray(obj, key) {
  if (!obj[key]) obj[key] = [];
  else if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
}

function getMimeType(type) {
  const map = {
    png:     'image/png',
    jpeg:    'image/jpeg',
    jpg:     'image/jpeg',
    gif:     'image/gif',
    'svg+xml': 'image/svg+xml',
    'x-emf': 'image/x-emf',
    'x-wmf': 'image/x-wmf',
  };
  return map[type] || `image/${type}`;
}

async function parseXmlSafe(xmlStr) {
  const { parseXml } = require('./utils');
  return parseXml(xmlStr);
}

async function cloneDestinationSlide(destZip, sourceSlidePath) {
  const slideList = await getSlideList(destZip);
  const maxSlideNum = slideList
    .map(p => parseInt((p.match(/slide(\d+)\.xml$/) || [])[1] || '0', 10))
    .reduce((a, b) => Math.max(a, b), 0);
  const nextSlideNum = maxSlideNum + 1;

  const newSlidePath = `ppt/slides/slide${nextSlideNum}.xml`;
  const newSlideRelsPath = `ppt/slides/_rels/slide${nextSlideNum}.xml.rels`;

  const sourceSlideText = await readZipText(destZip, sourceSlidePath);
  if (!sourceSlideText) throw new Error(`Cannot clone missing slide: ${sourceSlidePath}`);
  destZip.file(newSlidePath, sourceSlideText);

  const sourceRelsPath = sourceSlidePath
    .replace('ppt/slides/', 'ppt/slides/_rels/')
    .replace('.xml', '.xml.rels');
  const sourceRelsObj = await readZipXml(destZip, sourceRelsPath);
  if (sourceRelsObj && sourceRelsObj.Relationships) {
    const rels = sourceRelsObj.Relationships.Relationship || [];
    const relArr = Array.isArray(rels) ? rels : [rels];
    sourceRelsObj.Relationships.Relationship = relArr.filter(r => {
      const type = r?.$?.Type || '';
      return !type.endsWith('/notesSlide');
    });
    destZip.file(newSlideRelsPath, buildXml(sourceRelsObj));
  }

  const prsRelsPath = 'ppt/_rels/presentation.xml.rels';
  const prsRelsObj = await readZipXml(destZip, prsRelsPath);
  if (!prsRelsObj || !prsRelsObj.Relationships) {
    throw new Error('Cannot update presentation relationships');
  }

  const prsRelMap = buildRelMap(prsRelsObj);
  const newRid = generateRId(prsRelMap);
  ensureArray(prsRelsObj.Relationships, 'Relationship');
  prsRelsObj.Relationships.Relationship.push({
    $: {
      Id: newRid,
      Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide',
      Target: `slides/slide${nextSlideNum}.xml`,
    },
  });
  destZip.file(prsRelsPath, buildXml(prsRelsObj));

  const prsPath = 'ppt/presentation.xml';
  const prsObj = await readZipXml(destZip, prsPath);
  const root = prsObj && (prsObj['p:presentation'] || prsObj['presentation']);
  if (!root) throw new Error('Cannot update presentation.xml');

  ensureArray(root, 'p:sldIdLst');
  const sldIdLst = root['p:sldIdLst'][0];
  ensureArray(sldIdLst, 'p:sldId');
  const maxSldId = sldIdLst['p:sldId']
    .map(n => parseInt(n?.$?.id || '0', 10))
    .reduce((a, b) => Math.max(a, b), 255);
  sldIdLst['p:sldId'].push({
    $: { id: String(maxSldId + 1), 'r:id': newRid },
  });
  destZip.file(prsPath, buildXml(prsObj));

  await ensureSlideOverride(destZip, nextSlideNum);
  return newSlidePath;
}

async function ensureSlideOverride(destZip, slideNum) {
  const ctPath = '[Content_Types].xml';
  const ctText = await destZip.file(ctPath)?.async('string');
  if (!ctText) return;

  const partName = `/ppt/slides/slide${slideNum}.xml`;
  if (ctText.includes(`PartName="${partName}"`)) return;

  const override = `<Override PartName="${partName}" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  const patched = ctText.replace('</Types>', `${override}\n</Types>`);
  destZip.file(ctPath, patched);
}

module.exports = { applyMappings };
