/**
 * utils.js — Shared helpers for PPTX XML parsing, coordinate math, and EMU conversions
 *
 * PowerPoint internally uses EMUs (English Metric Units):
 *   1 inch = 914400 EMU
 *   1 cm   = 360000 EMU
 *   Standard slide = 9144000 × 6858000 EMU  (10" × 7.5")
 */

'use strict';

const JSZip = require('jszip');
const xml2js = require('xml2js');
const fs = require('fs-extra');

// ─── Constants ───────────────────────────────────────────────────────────────

const EMU_PER_INCH = 914400;
const EMU_PER_CM   = 360000;

// Standard widescreen slide dimensions (13.33" × 7.5")
const STANDARD_CX = 12192000;
const STANDARD_CY =  6858000;

// Minimum whitespace rectangle needed to place a shape (in EMU)
const MIN_WHITESPACE_WIDTH  = 914400;   // 1 inch
const MIN_WHITESPACE_HEIGHT = 685800;   // 0.75 inch

// Safe content margin from slide edges (in EMU)
const SLIDE_MARGIN = 457200;  // 0.5 inch

// ─── PPTX File I/O ───────────────────────────────────────────────────────────

/**
 * Load a .pptx file and return a JSZip instance plus all parsed slide XMLs.
 */
async function loadPptx(filePath) {
  const buffer = await fs.readFile(filePath);
  const zip = await JSZip.loadAsync(buffer);
  return zip;
}

/**
 * Save a JSZip instance back to a .pptx file.
 */
async function savePptx(zip, outputPath) {
  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  await fs.writeFile(outputPath, content);
}

// ─── XML Parsing ─────────────────────────────────────────────────────────────

const xmlParseOptions = {
  explicitArray: true,
  explicitCharkey: true,
  attrkey: '$',
  charkey: '_',
  tagNameProcessors: [],   // keep full qualified names like "p:sp", "a:txBody"
  mergeAttrs: false,
};

const xmlBuildOptions = {
  attrkey: '$',
  charkey: '_',
  headless: false,
  renderOpts: { pretty: false },
};

/**
 * Parse XML string → JS object
 */
async function parseXml(xmlString) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlString, xmlParseOptions, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * Build XML string from JS object
 */
function buildXml(obj) {
  const builder = new xml2js.Builder(xmlBuildOptions);
  return builder.buildObject(obj);
}

/**
 * Read and parse a file from a JSZip instance.
 */
async function readZipXml(zip, path) {
  const file = zip.file(path);
  if (!file) return null;
  const text = await file.async('string');
  return parseXml(text);
}

/**
 * Read the raw text of a zip entry.
 */
async function readZipText(zip, path) {
  const file = zip.file(path);
  if (!file) return null;
  return file.async('string');
}

// ─── Slide List Helpers ───────────────────────────────────────────────────────

/**
 * Return ordered list of slide paths from ppt/presentation.xml
 * e.g. ['ppt/slides/slide1.xml', 'ppt/slides/slide2.xml', ...]
 */
async function getSlideList(zip) {
  const prs = await readZipXml(zip, 'ppt/presentation.xml');
  if (!prs) throw new Error('Invalid PPTX: missing ppt/presentation.xml');

  // Navigate to sldIdLst
  const root = prs['p:presentation'] || prs['presentation'];
  const sldIdLst = safeGet(root, 'p:sldIdLst', 0) || safeGet(root, 'sldIdLst', 0);
  if (!sldIdLst) return [];

  const sldIds = sldIdLst['p:sldId'] || sldIdLst['sldId'] || [];

  // Build r:id → slide path from presentation relationships
  const relsPath = 'ppt/_rels/presentation.xml.rels';
  const rels = await readZipXml(zip, relsPath);
  const relMap = buildRelMap(rels);

  const slides = [];
  for (const sldId of sldIds) {
    const rid = sldId.$['r:id'];
    const target = relMap[rid];
    if (target) {
      slides.push(target.startsWith('ppt/') ? target : `ppt/${target}`);
    }
  }
  return slides;
}

/**
 * Build a map of r:id → target from a relationships XML object.
 */
function buildRelMap(relsObj) {
  if (!relsObj) return {};
  const root = relsObj['Relationships'] || {};
  const rels = root['Relationship'] || [];
  const map = {};
  for (const rel of rels) {
    const id = rel.$['Id'];
    const target = rel.$['Target'];
    if (id && target) map[id] = target;
  }
  return map;
}

// ─── Slide Dimension Helpers ──────────────────────────────────────────────────

/**
 * Get the slide dimensions from ppt/presentation.xml.
 * Returns { cx, cy } in EMU.
 */
async function getSlideDimensions(zip) {
  const prs = await readZipXml(zip, 'ppt/presentation.xml');
  const root = prs['p:presentation'] || prs['presentation'];
  const sldSz = safeGet(root, 'p:sldSz', 0) || safeGet(root, 'sldSz', 0);
  if (!sldSz) return { cx: STANDARD_CX, cy: STANDARD_CY };
  return {
    cx: parseInt(sldSz.$['cx']) || STANDARD_CX,
    cy: parseInt(sldSz.$['cy']) || STANDARD_CY,
  };
}

// ─── Shape Geometry Helpers ───────────────────────────────────────────────────

/**
 * Extract the bounding box of a shape element from its spPr/xfrm.
 * Returns { x, y, cx, cy } in EMU, or null if not found.
 */
function getShapeBBox(spPr) {
  if (!spPr) return null;
  const xfrm = safeGet(spPr, 'a:xfrm', 0);
  if (!xfrm) return null;
  const off = safeGet(xfrm, 'a:off', 0);
  const ext = safeGet(xfrm, 'a:ext', 0);
  if (!off || !ext) return null;
  return {
    x:  parseInt(off.$['x'])  || 0,
    y:  parseInt(off.$['y'])  || 0,
    cx: parseInt(ext.$['cx']) || 0,
    cy: parseInt(ext.$['cy']) || 0,
  };
}

/**
 * Build an xfrm XML fragment object for use in shape definitions.
 */
function buildXfrm(x, y, cx, cy, rot = 0, flipH = false, flipV = false) {
  const xfrmAttrs = {};
  if (rot !== 0)    xfrmAttrs['rot']   = String(rot);
  if (flipH)        xfrmAttrs['flipH'] = '1';
  if (flipV)        xfrmAttrs['flipV'] = '1';

  return {
    $: xfrmAttrs,
    'a:off': [{ $: { x: String(x), y: String(y) } }],
    'a:ext': [{ $: { cx: String(cx), cy: String(cy) } }],
  };
}

// ─── Whitespace Analysis ──────────────────────────────────────────────────────

/**
 * Compute a "busy-ness" score for a slide's XML content.
 * Higher score = more elements = busier slide.
 *
 * @param {object} slideXml  - Parsed slide XML object
 * @returns {number}         - Busyness score (0 = empty, 100+ = very busy)
 */
function computeBusyness(slideXml) {
  let score = 0;
  const xmlStr = JSON.stringify(slideXml);

  // Count shape containers
  const spMatches    = (xmlStr.match(/"p:sp"/g)    || []).length;
  const picMatches   = (xmlStr.match(/"p:pic"/g)   || []).length;
  const cxnMatches   = (xmlStr.match(/"p:cxnSp"/g) || []).length;
  const grpMatches   = (xmlStr.match(/"p:grpSp"/g) || []).length;
  const graphicMatches = (xmlStr.match(/"p:graphicFrame"/g) || []).length;

  // Each shape type weighted by visual impact
  score += spMatches     * 10;
  score += picMatches    * 20;   // images are high visual impact
  score += cxnMatches    * 5;
  score += grpMatches    * 15;
  score += graphicMatches * 25;  // charts/tables are very heavy

  // Bonus score for background/fill presence
  if (xmlStr.includes('"p:bg"') || xmlStr.includes('"a:gradFill"') || xmlStr.includes('"a:pattFill"')) {
    score += 15;
  }

  return score;
}

/**
 * Collect bounding boxes of all shapes on a slide.
 * Returns an array of { x, y, cx, cy } in EMU.
 */
function collectShapeBBoxes(slideXml) {
  const bboxes = [];
  const xmlStr = JSON.stringify(slideXml);

  // We traverse by re-parsing the stringified version to extract spPr elements
  // This is a simplified scan — a full DOM traversal would be more complete
  function extractFromNode(node) {
    if (typeof node !== 'object' || node === null) return;
    if (Array.isArray(node)) { node.forEach(extractFromNode); return; }

    const spPr = node['p:spPr'] || node['spPr'];
    if (spPr) {
      const bbox = getShapeBBox(Array.isArray(spPr) ? spPr[0] : spPr);
      if (bbox && bbox.cx > 0 && bbox.cy > 0) bboxes.push(bbox);
    }
    Object.values(node).forEach(extractFromNode);
  }

  extractFromNode(slideXml);
  return bboxes;
}

/**
 * Find available whitespace regions on a slide.
 * Uses a grid-scan approach: divides slide into cells and marks occupied cells.
 *
 * @param {object[]} existingBBoxes  - Occupied bounding boxes in EMU
 * @param {{ cx, cy }} slideDims     - Slide dimensions in EMU
 * @param {{ cx, cy }} required      - Required space for the content being placed
 * @returns {{ x, y, cx, cy }|null} - Best placement rectangle, or null if none found
 */
function findBestPlacement(existingBBoxes, slideDims, required) {
  const GRID_COLS = 20;
  const GRID_ROWS = 15;

  const cellW = Math.floor(slideDims.cx / GRID_COLS);
  const cellH = Math.floor(slideDims.cy / GRID_ROWS);

  // Build occupancy grid
  const grid = Array.from({ length: GRID_ROWS }, () => new Array(GRID_COLS).fill(false));

  for (const bbox of existingBBoxes) {
    const c0 = Math.max(0, Math.floor(bbox.x / cellW));
    const r0 = Math.max(0, Math.floor(bbox.y / cellH));
    const c1 = Math.min(GRID_COLS - 1, Math.ceil((bbox.x + bbox.cx) / cellW));
    const r1 = Math.min(GRID_ROWS - 1, Math.ceil((bbox.y + bbox.cy) / cellH));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        grid[r][c] = true;
      }
    }
  }

  // Mark margin cells as occupied
  const marginCols = Math.ceil(SLIDE_MARGIN / cellW);
  const marginRows = Math.ceil(SLIDE_MARGIN / cellH);
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < marginCols; c++)                     grid[r][c] = true;
    for (let c = GRID_COLS - marginCols; c < GRID_COLS; c++) grid[r][c] = true;
  }
  for (let c = 0; c < GRID_COLS; c++) {
    for (let r = 0; r < marginRows; r++)                     grid[r][c] = true;
    for (let r = GRID_ROWS - marginRows; r < GRID_ROWS; r++) grid[r][c] = true;
  }

  // Required size in grid cells (rounded up)
  const reqCols = Math.ceil(required.cx / cellW);
  const reqRows = Math.ceil(required.cy / cellH);

  // Sliding-window scan for a free rectangle
  let bestScore = -1;
  let bestRect  = null;

  for (let r = 0; r <= GRID_ROWS - reqRows; r++) {
    for (let c = 0; c <= GRID_COLS - reqCols; c++) {
      let canPlace = true;
      for (let dr = 0; dr < reqRows && canPlace; dr++) {
        for (let dc = 0; dc < reqCols && canPlace; dc++) {
          if (grid[r + dr][c + dc]) canPlace = false;
        }
      }
      if (canPlace) {
        // Score: prefer top-left placements with ample surrounding space
        const surroundFree = countFreeSurrounding(grid, r, c, reqRows, reqCols, GRID_ROWS, GRID_COLS);
        const score = surroundFree - (r * 2) - c;
        if (score > bestScore) {
          bestScore = score;
          bestRect = {
            x:  c * cellW,
            y:  r * cellH,
            cx: reqCols * cellW,
            cy: reqRows * cellH,
          };
        }
      }
    }
  }

  return bestRect;
}

function countFreeSurrounding(grid, r0, c0, rows, cols, maxR, maxC) {
  let count = 0;
  const pad = 2;
  for (let r = Math.max(0, r0 - pad); r < Math.min(maxR, r0 + rows + pad); r++) {
    for (let c = Math.max(0, c0 - pad); c < Math.min(maxC, c0 + cols + pad); c++) {
      if (!grid[r][c]) count++;
    }
  }
  return count;
}

// ─── Content Type Classification ─────────────────────────────────────────────

/**
 * Classify a shape element into a content type.
 * Returns: 'text' | 'image' | 'shape' | 'chart' | 'table' | 'connector' | 'unknown'
 */
function classifyShape(shapeNode) {
  const keys = Object.keys(shapeNode);
  if (keys.includes('p:pic'))          return 'image';
  if (keys.includes('p:graphicFrame')) {
    const str = JSON.stringify(shapeNode);
    if (str.includes('"c:chart"') || str.includes('"chartSpace"')) return 'chart';
    if (str.includes('"a:tbl"')   || str.includes('"tbl"'))        return 'table';
    return 'graphic';
  }
  if (keys.includes('p:cxnSp'))  return 'connector';
  if (keys.includes('p:grpSp'))  return 'group';
  if (keys.includes('p:sp')) {
    const sp = shapeNode['p:sp'][0];
    const txBody = safeGet(sp, 'p:txBody', 0);
    if (txBody) return 'text';
    return 'shape';
  }
  return 'unknown';
}

// ─── Scale / Transform Helpers ────────────────────────────────────────────────

/**
 * Scale a bounding box from source slide dimensions to destination dimensions.
 */
function scaleBBox(bbox, srcDims, dstDims) {
  const scaleX = dstDims.cx / srcDims.cx;
  const scaleY = dstDims.cy / srcDims.cy;
  return {
    x:  Math.round(bbox.x  * scaleX),
    y:  Math.round(bbox.y  * scaleY),
    cx: Math.round(bbox.cx * scaleX),
    cy: Math.round(bbox.cy * scaleY),
  };
}

/**
 * Clamp a bounding box to stay within slide boundaries (with margin).
 */
function clampBBox(bbox, slideDims) {
  const maxX  = slideDims.cx - SLIDE_MARGIN;
  const maxY  = slideDims.cy - SLIDE_MARGIN;
  let { x, y, cx, cy } = bbox;

  x  = Math.max(SLIDE_MARGIN, Math.min(x, maxX - 100));
  y  = Math.max(SLIDE_MARGIN, Math.min(y, maxY - 100));
  cx = Math.min(cx, maxX - x);
  cy = Math.min(cy, maxY - y);

  return { x, y, cx, cy };
}

// ─── General Utilities ────────────────────────────────────────────────────────

/**
 * Safe deep-get: obj[key][index]
 */
function safeGet(obj, key, index = 0) {
  if (!obj || !obj[key]) return null;
  const val = obj[key];
  if (Array.isArray(val)) return val[index] || null;
  return val || null;
}

/**
 * Generate a unique relationship ID that doesn't collide with existing ones.
 */
function generateRId(existingRels) {
  const existingIds = new Set(Object.keys(existingRels));
  let n = 1;
  while (existingIds.has(`rId${n}`)) n++;
  return `rId${n}`;
}

/**
 * Convert EMU to inches (for display)
 */
function emuToInches(emu) {
  return (emu / EMU_PER_INCH).toFixed(2);
}

module.exports = {
  EMU_PER_INCH,
  EMU_PER_CM,
  STANDARD_CX,
  STANDARD_CY,
  MIN_WHITESPACE_WIDTH,
  MIN_WHITESPACE_HEIGHT,
  SLIDE_MARGIN,
  loadPptx,
  savePptx,
  parseXml,
  buildXml,
  readZipXml,
  readZipText,
  getSlideList,
  buildRelMap,
  getSlideDimensions,
  getShapeBBox,
  buildXfrm,
  computeBusyness,
  collectShapeBBoxes,
  findBestPlacement,
  classifyShape,
  scaleBBox,
  clampBBox,
  safeGet,
  generateRId,
  emuToInches,
};
