/**
 * mapper.js — Smart slide selection: map source slides to destination slides
 *
 * Scoring heuristics weight candidate destination slides on:
 *   1. Available whitespace area          (higher = better)
 *   2. Busyness (existing element count)  (lower = better)
 *   3. Content-type affinity              (text→text-placeholder, image→blank)
 *   4. Dimension compatibility            (aspect ratio match)
 *   5. Placeholder availability           (for text content)
 */

'use strict';

const {
  computeBusyness,
  collectShapeBBoxes,
  findBestPlacement,
  getSlideDimensions,
  getSlideList,
  readZipXml,
  buildRelMap,
  safeGet,
} = require('./utils');

/**
 * Analyze all destination slides and return their profiles.
 *
 * @param {JSZip} zip
 * @returns {Promise<DestSlideProfile[]>}
 */
async function analyzeDestination(zip) {
  const slideList = await getSlideList(zip);
  const dims      = await getSlideDimensions(zip);
  const profiles  = [];

  for (let i = 0; i < slideList.length; i++) {
    const slidePath = slideList[i];
    const slideXml  = await readZipXml(zip, slidePath);
    if (!slideXml) continue;

    const slideRelsPath = slidePath
      .replace('ppt/slides/', 'ppt/slides/_rels/')
      .replace('.xml', '.xml.rels');
    const slideRels = await readZipXml(zip, slideRelsPath);
    const relMap    = buildRelMap(slideRels);

    profiles.push(profileSlide(slideXml, slidePath, relMap, dims, i));
  }

  return profiles;
}

/**
 * Build a profile for a single destination slide.
 */
function profileSlide(slideXml, slidePath, relMap, dims, index) {
  const busyness     = computeBusyness(slideXml);
  const bboxes       = collectShapeBBoxes(slideXml);
  const xmlStr       = JSON.stringify(slideXml);

  // Count placeholder elements
  const phCount = (xmlStr.match(/"p:ph"/g) || []).length;

  // Check for image placeholders
  const hasPicPh  = xmlStr.includes('"type":"pic"') || xmlStr.includes('type="pic"');

  // Check for body/content placeholders
  const hasBodyPh = xmlStr.includes('"type":"body"') || xmlStr.includes('type="body"') || phCount > 1;

  // Check if slide appears mostly empty (just title or layout guides)
  const spCount  = (xmlStr.match(/"p:sp"/g)  || []).length;
  const picCount = (xmlStr.match(/"p:pic"/g) || []).length;
  const isEmpty  = spCount <= 1 && picCount === 0;   // only title or nothing

  // Compute occupied area fraction
  const totalArea = dims.cx * dims.cy;
  const occupiedArea = bboxes.reduce((sum, b) => sum + b.cx * b.cy, 0);
  const freeAreaRatio = Math.max(0, 1 - occupiedArea / totalArea);

  // Detect background fill
  const hasBackground = xmlStr.includes('"p:bg"') || xmlStr.includes('"a:gradFill"');

  // Detect slide layout name from notes or nvPr
  const layoutName = extractLayoutName(slideXml) || '';

  // Rough whitespace rectangles in each quadrant
  const quadrants = computeQuadrantAvailability(bboxes, dims);

  return {
    index,
    path:          slidePath,
    busyness,
    bboxes,
    phCount,
    hasPicPh,
    hasBodyPh,
    isEmpty,
    freeAreaRatio,
    hasBackground,
    layoutName,
    quadrants,
    dims,
    rawXml:        slideXml,
  };
}

/**
 * Split slide into 4 quadrants and report each quadrant's free area ratio.
 */
function computeQuadrantAvailability(bboxes, dims) {
  const midX = dims.cx / 2;
  const midY = dims.cy / 2;

  const quadrants = [
    { id: 'TL', x: 0,    y: 0,    cx: midX, cy: midY, occupied: 0 },
    { id: 'TR', x: midX, y: 0,    cx: midX, cy: midY, occupied: 0 },
    { id: 'BL', x: 0,    y: midY, cx: midX, cy: midY, occupied: 0 },
    { id: 'BR', x: midX, y: midY, cx: midX, cy: midY, occupied: 0 },
  ];

  for (const bbox of bboxes) {
    for (const q of quadrants) {
      const ix = Math.max(0, Math.min(bbox.x + bbox.cx, q.x + q.cx) - Math.max(bbox.x, q.x));
      const iy = Math.max(0, Math.min(bbox.y + bbox.cy, q.y + q.cy) - Math.max(bbox.y, q.y));
      q.occupied += ix * iy;
    }
  }

  return quadrants.map(q => ({
    ...q,
    freeRatio: Math.max(0, 1 - q.occupied / (q.cx * q.cy)),
  }));
}

/**
 * Map each source slide to the best available destination slide.
 *
 * Strategy:
 *  - Score every (source, dest) pair using a weighted heuristic
 *  - Use a greedy assignment (best score first), marking dest slides as used
 *  - If more source slides than dest slides, wrap around (append to last)
 *
 * @param {SourceSlide[]}      sourceSlides
 * @param {DestSlideProfile[]} destProfiles
 * @returns {SlideMapping[]}
 */
function mapSlides(sourceSlides, destProfiles, options = {}) {
  const usageCounts = new Map();
  const used = new Set();
  const mapping = [];

  for (const srcSlide of sourceSlides) {
    const scored = destProfiles
      .map(dest => ({ dest, score: scoreMatch(srcSlide, dest, usageCounts) }))
      .filter(item => !options.disableReuse || !used.has(item.dest.index))
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (!best) {
      // No destination slides at all — skip
      mapping.push({ source: srcSlide, dest: null, strategy: 'skip' });
      continue;
    }

    const chosen = best;
    const prevUses = usageCounts.get(chosen.dest.index) || 0;
    usageCounts.set(chosen.dest.index, prevUses + 1);
    used.add(chosen.dest.index);
    mapping.push({
      source:   srcSlide,
      dest:     chosen.dest,
      strategy: deriveStrategy(srcSlide, chosen.dest),
      score:    chosen.score,
      reuseCount: prevUses,
    });
  }

  return mapping;
}

/**
 * Score how well a source slide maps to a destination slide.
 * Higher is better.
 */
function scoreMatch(srcSlide, dest, usageCounts) {
  let score = 0;
  const srcTypes = new Set(srcSlide.elements.map(e => e.type));
  const usageCount = usageCounts.get(dest.index) || 0;

  // ── Reuse penalty (content-aware) ──
  if (usageCount > 0) {
    const visualHeavy = srcTypes.has('image') || srcTypes.has('chart') || srcTypes.has('table');
    const canComfortablyReuse = dest.isEmpty || dest.freeAreaRatio > 0.6;
    const reusePenalty = visualHeavy && canComfortablyReuse ? 12 : 20;
    score -= usageCount * reusePenalty;
  }

  // ── Free space (most important factor) ──
  score += dest.freeAreaRatio * 40;

  // ── Busyness penalty ──
  score -= Math.min(dest.busyness, 100) * 0.2;

  // ── Empty/blank slide bonus ──
  if (dest.isEmpty) score += 20;

  // ── Content-type affinity ──
  if (srcTypes.has('image')) {
    // Images prefer blank or near-blank slides
    if (dest.isEmpty)     score += 25;
    if (dest.hasPicPh)    score += 15;
    if (dest.busyness > 50) score -= 20;
  }

  if (srcTypes.has('text')) {
    // Text strongly prefers slides with body placeholders —
    // weight high enough to beat a slightly emptier blank slide
    if (dest.hasBodyPh)   score += 35;
    if (dest.phCount > 0) score += 12;
    // Penalty: blank slides offer no semantic placement aid for text
    if (dest.isEmpty && !dest.hasBodyPh) score -= 8;
  }

  if (srcTypes.has('chart') || srcTypes.has('table')) {
    // Charts/tables need lots of space
    if (dest.freeAreaRatio > 0.6) score += 20;
    if (dest.isEmpty)             score += 10;
  }

  // ── Background conflict penalty ──
  if (dest.hasBackground && srcTypes.has('image')) score -= 10;

  // ── Quadrant bonus: at least one largely free quadrant ──
  const maxFreeQuadrant = Math.max(...dest.quadrants.map(q => q.freeRatio));
  score += maxFreeQuadrant * 15;

  return score;
}

/**
 * Derive the placement strategy for a (source, dest) pair.
 * Returns a strategy hint used by the injector.
 */
function deriveStrategy(srcSlide, dest) {
  const types = new Set(srcSlide.elements.map(e => e.type));

  if (dest.isEmpty && types.has('image'))  return 'fill-blank';
  if (dest.hasBodyPh && types.has('text')) return 'use-placeholder';
  if (dest.freeAreaRatio > 0.5)            return 'place-in-whitespace';
  return 'best-effort';
}

/**
 * Attempt to extract layout name from slide XML (for debug/logging).
 */
function extractLayoutName(slideXml) {
  try {
    const str = JSON.stringify(slideXml);
    const match = str.match(/"name":"([^"]+)"/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

/**
 * Log the mapping plan.
 */
function summarizeMapping(mapping) {
  return mapping.map(m => {
    const srcTypes = m.source.elements.map(e => e.type).join(', ') || 'empty';
    const reuse = m.reuseCount > 0 ? ` reused=${m.reuseCount}` : '';
    const destInfo = m.dest
      ? `→ Dest slide ${m.dest.index + 1} (busyness=${m.dest.busyness}, free=${(m.dest.freeAreaRatio * 100).toFixed(0)}%) [${m.strategy}]${reuse}`
      : '→ SKIPPED (no dest available)';
    return `  Src slide ${m.source.number} [${srcTypes}] ${destInfo}`;
  }).join('\n');
}

function buildDestinationPlaybook(destProfiles) {
  return destProfiles.map(dest => {
    const recommendations = [];
    if (dest.isEmpty || dest.freeAreaRatio > 0.65) recommendations.push('image', 'table', 'chart');
    if (dest.hasBodyPh) recommendations.push('text');
    if (dest.freeAreaRatio < 0.35) recommendations.push('small-content');
    return {
      slide: dest.index + 1,
      free: Math.round(dest.freeAreaRatio * 100),
      busyness: dest.busyness,
      recommendations: [...new Set(recommendations)],
    };
  });
}

module.exports = { analyzeDestination, mapSlides, summarizeMapping, buildDestinationPlaybook };
