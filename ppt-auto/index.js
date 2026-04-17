#!/usr/bin/env node
/**
 * pptx-transfer — Transfer content between PowerPoint presentations
 *                 while handling theme mismatches.
 *
 * Usage:
 *   node index.js --source src.pptx --dest dest.pptx --output result.pptx
 *   node index.js -s src.pptx -d dest.pptx -o result.pptx [--verbose]
 *
 * Library choice: JSZip + xml2js (direct OOXML manipulation)
 * ─────────────────────────────────────────────────────────
 * We do NOT use PptxGenJS for this task because PptxGenJS is a
 * write-only library — it creates new presentations but cannot
 * read or parse existing .pptx files. Office.js only runs inside
 * Office add-ins (requires a running Office host).
 *
 * JSZip + xml2js gives us full read/write access to the raw OOXML
 * (Open XML) format that every .pptx file uses internally, letting
 * us extract and transplant elements with full fidelity.
 */

'use strict';

const { program } = require('commander');
const chalkLib    = require('chalk');
const chalk       = chalkLib.default || chalkLib;
const path        = require('path');
const fs          = require('fs-extra');

const { loadPptx, savePptx, getSlideDimensions, emuToInches } = require('./utils');
const { extractSource, summarizeExtraction, buildCleanLayoutSource } = require('./extractor');
const { analyzeDestination, mapSlides, summarizeMapping, buildDestinationPlaybook } = require('./mapper');
const { applyMappings }                                        = require('./injector');

// ─── CLI Definition ───────────────────────────────────────────────────────────

program
  .name('pptx-transfer')
  .description('Transfer content between PowerPoint presentations with theme-mismatch handling')
  .version('1.0.0')
  .requiredOption('-s, --source <file>',  'Source PPTX file (content to extract)')
  .requiredOption('-d, --dest <file>',    'Destination PPTX file (theme/template to keep)')
  .requiredOption('-o, --output <file>',  'Output PPTX file path')
  .option('--verbose',                    'Print detailed progress and analysis')
  .option('--clean-layout',               'Keep only title/body/key visuals to reduce clutter')
  .option('--strategy <mode>',            'Placement strategy: auto | whitespace | scale', 'auto')
  .parse(process.argv);

const opts = program.opts();

// ─── Main Pipeline ────────────────────────────────────────────────────────────

async function main() {
  console.log(chalk.bold.cyan('\n══════════════════════════════════════════'));
  console.log(chalk.bold.cyan('   PPTX Content Transfer Tool'));
  console.log(chalk.bold.cyan('══════════════════════════════════════════\n'));

  // ── Validate inputs ──
  for (const f of [opts.source, opts.dest]) {
    if (!(await fs.pathExists(f))) {
      console.error(chalk.red(`✗ File not found: ${f}`));
      process.exit(1);
    }
  }

  // ── Step 1: Load both PPTX files ──
  console.log(chalk.yellow('► Step 1: Loading PPTX files…'));
  const [srcZip, dstZip] = await Promise.all([
    loadPptx(opts.source),
    loadPptx(opts.dest),
  ]);
  console.log(chalk.green('  ✓ Both files loaded'));

  // ── Step 2: Extract source content ──
  console.log(chalk.yellow('\n► Step 2: Extracting source content…'));
  let source = await extractSource(srcZip);
  if (opts.cleanLayout) {
    source = buildCleanLayoutSource(source);
    console.log(chalk.green('  ✓ Applied clean-layout filtering (title/body/key visuals)'));
  }
  console.log(chalk.green(`  ✓ Extracted ${source.slides.length} slides`));
  if (opts.verbose) console.log(summarizeExtraction(source));

  // ── Step 3: Analyze destination slides ──
  console.log(chalk.yellow('\n► Step 3: Analyzing destination slides…'));
  const srcDims = source.dims;
  const dstDims = await getSlideDimensions(dstZip);
  const destProfiles = await analyzeDestination(dstZip);
  console.log(chalk.green(`  ✓ Analyzed ${destProfiles.length} destination slides`));
  if (opts.verbose) {
    destProfiles.forEach(p => {
      console.log(`    Slide ${p.index + 1}: busyness=${p.busyness} free=${(p.freeAreaRatio * 100).toFixed(0)}% ` +
        `empty=${p.isEmpty} hasBodyPh=${p.hasBodyPh} hasPicPh=${p.hasPicPh}`);
    });
    const playbook = buildDestinationPlaybook(destProfiles);
    console.log('\n  Suggested destination playbook:');
    playbook.forEach(entry => {
      const rec = entry.recommendations.length > 0 ? entry.recommendations.join(', ') : 'general';
      console.log(`    Slide ${entry.slide}: free=${entry.free}% busyness=${entry.busyness} → ${rec}`);
    });
  }

  console.log(chalk.dim(`  Source dims:      ${emuToInches(srcDims.cx)}" × ${emuToInches(srcDims.cy)}"`));
  console.log(chalk.dim(`  Destination dims: ${emuToInches(dstDims.cx)}" × ${emuToInches(dstDims.cy)}"`));

  // ── Step 4: Map source slides to destination slides ──
  console.log(chalk.yellow('\n► Step 4: Computing slide mapping…'));
  const mapping = mapSlides(source.slides, destProfiles, { disableReuse: !!opts.cleanLayout });
  console.log(chalk.green(`  ✓ Mapped ${mapping.length} source slides`));
  if (opts.verbose) console.log(summarizeMapping(mapping));
  else {
    mapping.forEach(m => {
      const destNum = m.dest ? `slide ${m.dest.index + 1}` : 'SKIPPED';
      const types   = m.source.elements.map(e => e.type).slice(0, 3).join(', ') || 'empty';
      console.log(chalk.dim(`    Src ${m.source.number} [${types}] → Dest ${destNum} [${m.strategy || ''}]`));
    });
  }

  // ── Step 5: Inject content into destination zip ──
  console.log(chalk.yellow('\n► Step 5: Injecting content into destination slides…'));
  const results = await applyMappings(dstZip, mapping, srcDims, dstDims, { cleanLayout: !!opts.cleanLayout });

  const succeeded = results.filter(r => r.success).length;
  const failed    = results.filter(r => !r.success).length;
  console.log(chalk.green(`  ✓ Injected: ${succeeded} slides`));
  if (failed > 0) {
    console.log(chalk.yellow(`  ⚠ Failed:   ${failed} slides`));
    results.filter(r => !r.success).forEach(r => {
      console.log(chalk.red(`    ✗ Slide ${r.srcSlide}: ${r.error || r.reason}`));
    });
  }

  // ── Step 6: Save output ──
  console.log(chalk.yellow('\n► Step 6: Saving output…'));
  await fs.ensureDir(path.dirname(path.resolve(opts.output)));
  await savePptx(dstZip, opts.output);

  const stat = await fs.stat(opts.output);
  console.log(chalk.green(`  ✓ Saved: ${opts.output} (${(stat.size / 1024).toFixed(1)} KB)`));

  console.log(chalk.bold.cyan('\n══════════════════════════════════════════'));
  console.log(chalk.bold.green('   Transfer complete!'));
  console.log(chalk.bold.cyan('══════════════════════════════════════════\n'));
}

// ─── Error handling ───────────────────────────────────────────────────────────

main().catch(err => {
  console.error(chalk.red(`\n✗ Fatal error: ${err.message}`));
  if (opts.verbose) console.error(err.stack);
  process.exit(1);
});
