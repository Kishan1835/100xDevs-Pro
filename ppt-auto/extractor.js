/**
 * extractor.js — Extract all content elements from source PPTX slides
 *
 * Produces a structured representation of each slide's content
 * that is independent of the source theme/layout.
 */

'use strict';

const path = require('path');
const {
  getSlideList,
  getSlideDimensions,
  readZipXml,
  readZipText,
  buildRelMap,
  getShapeBBox,
  classifyShape,
  safeGet,
  computeBusyness,
  collectShapeBBoxes,
  emuToInches,
} = require('./utils');

/**
 * Extract all content from a source PPTX zip.
 *
 * @param {JSZip} zip
 * @returns {Promise<SourcePresentation>}
 */
async function extractSource(zip) {
  const slideList  = await getSlideList(zip);
  const slideDims  = await getSlideDimensions(zip);

  const slides = [];

  for (let i = 0; i < slideList.length; i++) {
    const slidePath = slideList[i];
    const slideXml  = await readZipXml(zip, slidePath);
    if (!slideXml) {
      console.warn(`  ⚠  Could not parse ${slidePath}, skipping`);
      continue;
    }

    // Load slide relationships (needed for image/chart refs)
    const slideRelsPath = slidePath.replace(
      'ppt/slides/',
      'ppt/slides/_rels/'
    ).replace('.xml', '.xml.rels');
    const slideRels = await readZipXml(zip, slideRelsPath);
    const relMap    = buildRelMap(slideRels);

    const slide = await extractSlide(zip, slideXml, slidePath, relMap, slideDims, i + 1);
    slides.push(slide);
  }

  return { slides, dims: slideDims };
}

function buildCleanLayoutSource(source) {
  const cleanedSlides = source.slides.map(slide => {
    const elements = selectCleanElements(slide.elements, slide.dims);
    return { ...slide, elements };
  });
  return { ...source, slides: cleanedSlides };
}

// ─── Per-Slide Extraction ─────────────────────────────────────────────────────

async function extractSlide(zip, slideXml, slidePath, relMap, dims, slideNum) {
  const root     = slideXml['p:sld'] || slideXml['sld'];
  const cSld     = safeGet(root, 'p:cSld', 0);
  const spTree   = cSld ? safeGet(cSld, 'p:spTree', 0) : null;

  const slide = {
    index:    slideNum - 1,
    number:   slideNum,
    path:     slidePath,
    elements: [],
    busyness: computeBusyness(slideXml),
    bboxes:   collectShapeBBoxes(slideXml),
    dims,
  };

  if (!spTree) return slide;

  // Iterate all shape-like children of spTree
  const shapeTypes = ['p:sp', 'p:pic', 'p:graphicFrame', 'p:cxnSp', 'p:grpSp'];

  for (const tag of shapeTypes) {
    const items = spTree[tag] || [];
    for (const item of items) {
      if (tag === 'p:grpSp') {
        const nested = await extractGroupChildren(zip, item, relMap, slidePath);
        if (nested.length > 0) {
          slide.elements.push(...nested);
          continue;
        }
      }
      const wrapped = { [tag]: [item] };
      const type    = classifyShape(wrapped);
      const element = await extractElement(zip, type, tag, item, relMap, slidePath);
      if (element) slide.elements.push(element);
    }
  }

  return slide;
}

// ─── Element-Level Extraction ─────────────────────────────────────────────────

async function extractElement(zip, type, tag, node, relMap, slidePath) {
  const spPr = safeGet(node, 'p:spPr', 0);
  const bbox  = spPr ? getShapeBBox(spPr) : null;
  const nvPr  = extractNvPr(node, tag);

  const base = {
    type,
    tag,
    name:    nvPr?.name || `Shape_${Math.random().toString(36).slice(2, 7)}`,
    id:      nvPr?.id   || '0',
    bbox,
    rawXml:  node,        // preserve full XML node for direct injection
  };

  switch (type) {
    case 'text':      return { ...base, ...extractText(node) };
    case 'shape':     return { ...base, ...extractShape(node) };
    case 'image':     return { ...base, ...(await extractImage(zip, node, relMap, slidePath)) };
    case 'chart':     return { ...base, ...extractChart(node) };
    case 'table':     return { ...base, ...extractTable(node) };
    case 'connector': return { ...base };
    case 'group':     return { ...base, ...extractGroup(node) };
    default:          return { ...base };
  }
}

// ─── Text Extraction ──────────────────────────────────────────────────────────

function extractText(sp) {
  const txBody  = safeGet(sp, 'p:txBody', 0);
  if (!txBody) return { textContent: '', paragraphs: [], isPlaceholder: false };

  const paras   = txBody['a:p'] || [];
  const paragraphs = paras.map(extractParagraph);
  const textContent = paragraphs.map(p => p.runs.map(r => r.text).join('')).join('\n');

  // Detect if this is a placeholder (nvSpPr/ph element)
  const nvSpPr  = safeGet(sp, 'p:nvSpPr', 0);
  const nvPr2   = nvSpPr ? safeGet(nvSpPr, 'p:nvPr', 0) : null;
  const isPlaceholder = nvPr2 ? !!(nvPr2['p:ph']) : false;

  // Compute approximate character density (text per area unit)
  const charCount = textContent.length;

  return {
    textContent,
    paragraphs,
    isPlaceholder,
    charCount,
    wordCount: textContent.split(/\s+/).filter(Boolean).length,
  };
}

function extractParagraph(para) {
  const pPr  = safeGet(para, 'a:pPr', 0);
  const runs = (para['a:r'] || []).map(extractRun);
  return {
    align:   pPr?.$?.algn || 'l',
    indent:  pPr?.$?.indent ? parseInt(pPr.$.indent) : 0,
    spacing: pPr ? extractSpacing(pPr) : null,
    runs,
    rawXml:  para,
  };
}

function extractRun(run) {
  const rPr = safeGet(run, 'a:rPr', 0);
  const tNode = run['a:t'];
  const text = Array.isArray(tNode)
    ? (tNode[0]?._ || tNode[0] || '')
    : (tNode?._ || tNode || '');

  return {
    text:   String(text),
    bold:   rPr?.$?.b === '1',
    italic: rPr?.$?.i === '1',
    sz:     rPr?.$?.sz ? parseInt(rPr.$.sz) : null,  // in hundredths of points
    color:  extractRunColor(rPr),
    rawXml: run,
  };
}

function extractRunColor(rPr) {
  if (!rPr) return null;
  const solidFill = safeGet(rPr, 'a:solidFill', 0);
  if (!solidFill) return null;
  const srgb = safeGet(solidFill, 'a:srgbClr', 0);
  return srgb?.$?.val || null;
}

function extractSpacing(pPr) {
  const lnSpc = safeGet(pPr, 'a:lnSpc', 0);
  const spcBef = safeGet(pPr, 'a:spcBef', 0);
  return {
    lineSpacing:   lnSpc  ? (safeGet(lnSpc, 'a:spcPts', 0)?.$?.val || null) : null,
    spaceBefore:   spcBef ? (safeGet(spcBef, 'a:spcPts', 0)?.$?.val || null) : null,
  };
}

// ─── Shape Extraction ─────────────────────────────────────────────────────────

function extractShape(sp) {
  const spPr   = safeGet(sp, 'p:spPr', 0);
  const prstGeom = spPr ? safeGet(spPr, 'a:prstGeom', 0) : null;
  const fill   = spPr ? extractFill(spPr) : null;
  const ln     = spPr ? safeGet(spPr, 'a:ln', 0) : null;

  return {
    geometry:  prstGeom?.$?.prst || 'rect',
    fill,
    hasStroke: !!ln,
    strokeWidth: ln?.$?.w ? parseInt(ln.$.w) : null,
  };
}

function extractFill(spPr) {
  if (safeGet(spPr, 'a:noFill', 0)) return { type: 'none' };
  const solidFill = safeGet(spPr, 'a:solidFill', 0);
  if (solidFill) {
    const srgb = safeGet(solidFill, 'a:srgbClr', 0);
    const schemeClr = safeGet(solidFill, 'a:schemeClr', 0);
    return {
      type: 'solid',
      color: srgb?.$?.val || null,
      schemeColor: schemeClr?.$?.val || null,
    };
  }
  const gradFill = safeGet(spPr, 'a:gradFill', 0);
  if (gradFill) return { type: 'gradient' };
  return { type: 'unknown' };
}

// ─── Image Extraction ─────────────────────────────────────────────────────────

async function extractImage(zip, pic, relMap, slidePath) {
  const rEmbed = findEmbedRel(pic);
  if (!rEmbed) return { imageData: null, imageType: null, imagePath: null };

  const target = relMap[rEmbed];
  if (!target) return { imageData: null, imageType: null, imagePath: null };

  // Resolve absolute path inside zip
  const slideDir   = path.dirname(slidePath);
  const imagePath  = path.posix.join(slideDir, target).replace(/^\//, '');

  const imageFile = zip.file(imagePath);
  const imageData = imageFile ? await imageFile.async('base64') : null;

  // Detect type from extension
  const ext  = path.extname(target).toLowerCase().replace('.', '');
  const typeMap = { jpg: 'jpeg', jpeg: 'jpeg', png: 'png', gif: 'gif', svg: 'svg+xml', emf: 'x-emf', wmf: 'x-wmf' };

  return {
    imagePath,
    imageName: path.basename(target),
    imageData,
    imageType:  typeMap[ext] || ext,
    imageRel:   rEmbed,
    origTarget: target,
  };
}

function findEmbedRel(node) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const rel = findEmbedRel(item);
      if (rel) return rel;
    }
    return null;
  }

  if (node.$ && node.$['r:embed']) return node.$['r:embed'];

  for (const value of Object.values(node)) {
    const rel = findEmbedRel(value);
    if (rel) return rel;
  }
  return null;
}

// ─── Chart Extraction ─────────────────────────────────────────────────────────

function extractChart(graphicFrame) {
  const str = JSON.stringify(graphicFrame);
  return {
    isChart: true,
    hasData: str.includes('"c:ser"') || str.includes('"c:barChart"') || str.includes('"c:lineChart"'),
    note: 'Chart preserved as raw XML — direct injection maintains all data',
  };
}

// ─── Table Extraction ─────────────────────────────────────────────────────────

function extractTable(graphicFrame) {
  const tbl = findNestedKey(graphicFrame, 'a:tbl');
  if (!tbl) return { isTable: true, rows: [], cols: 0 };

  const rows = (tbl[0]?.['a:tr'] || []).map(row => {
    const cells = (row['a:tc'] || []).map(cell => {
      const txBody = safeGet(cell, 'a:txBody', 0);
      const paras  = txBody?.['a:p'] || [];
      const text   = paras.flatMap(p => (p['a:r'] || []).map(r => {
        const t = r['a:t'];
        return Array.isArray(t) ? (t[0]?._ || t[0] || '') : (t?._ || t || '');
      })).join('');
      return { text: String(text) };
    });
    return cells;
  });

  return {
    isTable: true,
    rows,
    colCount: rows[0]?.length || 0,
    rowCount: rows.length,
  };
}

// ─── Group Extraction ─────────────────────────────────────────────────────────

function extractGroup(grpSp) {
  return {
    isGroup: true,
    note: 'Group shape preserved as raw XML for full fidelity',
  };
}

// ─── Non-Visual Properties ────────────────────────────────────────────────────

function extractNvPr(node, tag) {
  const nvMap = {
    'p:sp':           'p:nvSpPr',
    'p:pic':          'p:nvPicPr',
    'p:graphicFrame': 'p:nvGraphicFramePr',
    'p:cxnSp':        'p:nvCxnSpPr',
    'p:grpSp':        'p:nvGrpSpPr',
  };
  const nvKey = nvMap[tag];
  if (!nvKey || !node[nvKey]) return null;
  const nvPr = node[nvKey][0];
  const cNvPr = safeGet(nvPr, 'p:cNvPr', 0);
  return {
    id:   cNvPr?.$?.id   || '0',
    name: cNvPr?.$?.name || '',
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findNestedKey(obj, key) {
  if (typeof obj !== 'object' || obj === null) return null;
  if (obj[key]) return obj[key];
  for (const val of Object.values(obj)) {
    const found = findNestedKey(val, key);
    if (found) return found;
  }
  return null;
}

async function extractGroupChildren(zip, grpSp, relMap, slidePath) {
  const elements = [];
  const shapeTypes = ['p:sp', 'p:pic', 'p:graphicFrame', 'p:cxnSp', 'p:grpSp'];

  for (const tag of shapeTypes) {
    const items = grpSp[tag] || [];
    for (const item of items) {
      if (tag === 'p:grpSp') {
        const nested = await extractGroupChildren(zip, item, relMap, slidePath);
        elements.push(...nested);
        continue;
      }
      const wrapped = { [tag]: [item] };
      const type = classifyShape(wrapped);
      const element = await extractElement(zip, type, tag, item, relMap, slidePath);
      if (element) elements.push(element);
    }
  }

  return elements;
}

function selectCleanElements(elements, dims) {
  const texts = elements.filter(e => e.type === 'text' && (e.charCount || 0) > 0);
  const visuals = elements.filter(e => e.type === 'image' || e.type === 'chart' || e.type === 'table');
  const shapes = elements.filter(e => e.type === 'shape');
  const selected = [];

  const topBoundary = dims?.cy ? dims.cy * 0.28 : null;
  const title = pickTitle(texts, topBoundary);
  if (title) selected.push(title);

  const remainingTexts = texts.filter(t => t !== title);
  const body = pickBody(remainingTexts);
  if (body) selected.push(body);

  const extraTexts = remainingTexts
    .filter(t => t !== body)
    .sort((a, b) => (b.charCount || 0) - (a.charCount || 0))
    .slice(0, 1);
  selected.push(...extraTexts);

  const topVisuals = visuals
    .sort((a, b) => bboxArea(b.bbox) - bboxArea(a.bbox))
    .slice(0, 2);
  selected.push(...topVisuals);

  if (selected.length === 0 && shapes.length > 0) {
    const biggestShape = [...shapes].sort((a, b) => bboxArea(b.bbox) - bboxArea(a.bbox))[0];
    if (biggestShape) selected.push(biggestShape);
  }

  return dedupeElements(selected);
}

function pickTitle(texts, topBoundary) {
  if (texts.length === 0) return null;
  const sortedByTop = [...texts].sort((a, b) => (a.bbox?.y || Number.MAX_SAFE_INTEGER) - (b.bbox?.y || Number.MAX_SAFE_INTEGER));
  if (topBoundary != null) {
    const topText = sortedByTop.find(t => (t.bbox?.y || Number.MAX_SAFE_INTEGER) <= topBoundary);
    if (topText) return topText;
  }
  return sortedByTop[0];
}

function pickBody(texts) {
  if (texts.length === 0) return null;
  return [...texts].sort((a, b) => (b.charCount || 0) - (a.charCount || 0))[0];
}

function bboxArea(bbox) {
  if (!bbox) return 0;
  return Math.max(0, (bbox.cx || 0) * (bbox.cy || 0));
}

function dedupeElements(elements) {
  const seen = new Set();
  const result = [];
  for (const element of elements) {
    const key = `${element.type}|${element.id}|${element.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(element);
  }
  return result;
}

// ─── Summary Logging ──────────────────────────────────────────────────────────

function summarizeExtraction(source) {
  const { slides, dims } = source;
  const lines = [
    `  Source dimensions: ${emuToInches(dims.cx)}" × ${emuToInches(dims.cy)}"`,
    `  Slide count: ${slides.length}`,
  ];
  for (const slide of slides) {
    const types = slide.elements.map(e => e.type);
    const counts = {};
    types.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    const summary = Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
    lines.push(`  Slide ${slide.number}: [busyness=${slide.busyness}] ${summary || 'empty'}`);
  }
  return lines.join('\n');
}

module.exports = { extractSource, summarizeExtraction, buildCleanLayoutSource };
