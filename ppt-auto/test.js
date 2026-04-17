/**
 * test.js — Integration tests for the PPTX transfer pipeline
 *
 * Tests core logic without requiring real .pptx files,
 * by mocking the zip/XML structures directly.
 */

'use strict';

const { findBestPlacement, scaleBBox, clampBBox, computeBusyness, SLIDE_MARGIN, STANDARD_CX, STANDARD_CY } = require('./utils');
const { mapSlides } = require('./mapper');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  FAIL: ${label}`);
    failed++;
  }
}

// ─── Test: findBestPlacement ──────────────────────────────────────────────────

console.log('\n[1] findBestPlacement — empty slide');
{
  const dims    = { cx: STANDARD_CX, cy: STANDARD_CY };
  const result  = findBestPlacement([], dims, { cx: 2000000, cy: 1000000 });
  assert(result !== null, 'Finds placement on empty slide');
  assert(result.x >= SLIDE_MARGIN, 'Placement respects left margin');
  assert(result.y >= SLIDE_MARGIN, 'Placement respects top margin');
}

console.log('\n[2] findBestPlacement — fully occupied slide');
{
  const dims = { cx: 3000000, cy: 3000000 };
  // Cover the entire slide
  const bboxes = [{ x: 0, y: 0, cx: 3000000, cy: 3000000 }];
  const result = findBestPlacement(bboxes, dims, { cx: 2000000, cy: 2000000 });
  assert(result === null, 'Returns null when no space available');
}

console.log('\n[3] findBestPlacement — partial occupation');
{
  const dims   = { cx: STANDARD_CX, cy: STANDARD_CY };
  // Occupy left half
  const bboxes = [{ x: 0, y: 0, cx: STANDARD_CX / 2, cy: STANDARD_CY }];
  const result = findBestPlacement(bboxes, dims, { cx: 2000000, cy: 1500000 });
  assert(result !== null, 'Finds space in unoccupied right half');
  if (result) {
    assert(result.x >= STANDARD_CX / 2 - 1000000, 'Placement is in right half (approx)');
  }
}

// ─── Test: scaleBBox ──────────────────────────────────────────────────────────

console.log('\n[4] scaleBBox');
{
  const srcDims = { cx: 9144000, cy: 6858000 };
  const dstDims = { cx: 12192000, cy: 6858000 };
  const bbox    = { x: 914400, y: 685800, cx: 4572000, cy: 2286000 };
  const scaled  = scaleBBox(bbox, srcDims, dstDims);

  const expectedScaleX = dstDims.cx / srcDims.cx; // ≈ 1.333
  assert(Math.abs(scaled.cx - bbox.cx * expectedScaleX) < 10, 'Width scaled correctly');
  assert(scaled.y === bbox.y, 'Y unchanged when cy same');
  assert(scaled.x > bbox.x, 'X scaled up proportionally');
}

// ─── Test: clampBBox ─────────────────────────────────────────────────────────

console.log('\n[5] clampBBox');
{
  const dims = { cx: STANDARD_CX, cy: STANDARD_CY };
  // Box that extends beyond the slide
  const bbox   = { x: STANDARD_CX - 100000, y: STANDARD_CY - 100000, cx: 5000000, cy: 5000000 };
  const clamped = clampBBox(bbox, dims);
  assert(clamped.x + clamped.cx <= dims.cx, 'Right edge clamped to slide width');
  assert(clamped.y + clamped.cy <= dims.cy, 'Bottom edge clamped to slide height');
}

// ─── Test: computeBusyness ────────────────────────────────────────────────────

console.log('\n[6] computeBusyness');
{
  const emptySlide = { 'p:sld': {} };
  const busySlide  = {
    'p:sld': {
      'p:sp':  [{}, {}, {}],
      'p:pic': [{}],
      'p:graphicFrame': [{}],
    }
  };
  const emptyScore = computeBusyness(emptySlide);
  const busyScore  = computeBusyness(busySlide);
  assert(emptyScore < busyScore, 'Busy slide scores higher than empty');
  assert(emptyScore === 0, 'Empty slide scores 0');
}

// ─── Test: mapSlides scoring ──────────────────────────────────────────────────

console.log('\n[7] mapSlides — image prefers blank dest');
{
  const srcSlides = [{
    index: 0, number: 1, elements: [{ type: 'image', bbox: { x: 0, y: 0, cx: 2000000, cy: 1500000 } }],
    busyness: 20, bboxes: [], dims: { cx: STANDARD_CX, cy: STANDARD_CY },
  }];

  const destProfiles = [
    {
      index: 0, path: 'slide1.xml', busyness: 80, bboxes: [],
      freeAreaRatio: 0.2, isEmpty: false, hasBodyPh: true, hasPicPh: false,
      hasBackground: false, phCount: 2, layoutName: 'content',
      quadrants: [{ freeRatio: 0.1 }, { freeRatio: 0.2 }, { freeRatio: 0.1 }, { freeRatio: 0.2 }],
      dims: { cx: STANDARD_CX, cy: STANDARD_CY },
    },
    {
      index: 1, path: 'slide2.xml', busyness: 5, bboxes: [],
      freeAreaRatio: 0.95, isEmpty: true, hasBodyPh: false, hasPicPh: true,
      hasBackground: false, phCount: 0, layoutName: 'blank',
      quadrants: [{ freeRatio: 0.95 }, { freeRatio: 0.95 }, { freeRatio: 0.95 }, { freeRatio: 0.95 }],
      dims: { cx: STANDARD_CX, cy: STANDARD_CY },
    },
  ];

  const mapping = mapSlides(srcSlides, destProfiles);
  assert(mapping.length === 1, 'Produces one mapping');
  assert(mapping[0].dest.index === 1, 'Image maps to blank/empty slide (index 1)');
}

console.log('\n[8] mapSlides — text prefers placeholder dest');
{
  const srcSlides = [{
    index: 0, number: 1,
    elements: [{ type: 'text', bbox: { x: 0, y: 0, cx: 3000000, cy: 1000000 } }],
    busyness: 10, bboxes: [], dims: { cx: STANDARD_CX, cy: STANDARD_CY },
  }];

  const destProfiles = [
    {
      index: 0, path: 'slide1.xml', busyness: 10, bboxes: [],
      freeAreaRatio: 0.7, isEmpty: false, hasBodyPh: true, hasPicPh: false,
      hasBackground: false, phCount: 2, layoutName: 'content',
      quadrants: [{ freeRatio: 0.7 }, { freeRatio: 0.7 }, { freeRatio: 0.7 }, { freeRatio: 0.7 }],
      dims: { cx: STANDARD_CX, cy: STANDARD_CY },
    },
    {
      index: 1, path: 'slide2.xml', busyness: 5, bboxes: [],
      freeAreaRatio: 0.95, isEmpty: true, hasBodyPh: false, hasPicPh: false,
      hasBackground: false, phCount: 0, layoutName: 'blank',
      quadrants: [{ freeRatio: 0.95 }, { freeRatio: 0.95 }, { freeRatio: 0.95 }, { freeRatio: 0.95 }],
      dims: { cx: STANDARD_CX, cy: STANDARD_CY },
    },
  ];

  const mapping = mapSlides(srcSlides, destProfiles);
  // Text with body placeholder vs pure blank — body placeholder should win for text
  // (slide 0 has hasBodyPh=true, which adds +20 points)
  assert(mapping[0].dest.index === 0, 'Text maps to slide with body placeholder (index 0)');
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
