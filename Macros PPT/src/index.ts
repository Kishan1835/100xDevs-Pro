import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import { parsePresentation } from "./parser";
import { mapLayouts } from "./mapper";
import { buildMigratedPresentation } from "./builder";
import { ParsedSlide, NS } from "./types";
import { DOMParser } from "xmldom";

const domParser = new DOMParser();

const program = new Command();

program
 .name("pptx-theme-migrator")
 .description(
   "Migrate PowerPoint content from a source .pptx to a destination template .pptx, " +
     "preserving spatial layout while adopting the new theme."
 )
 .requiredOption("-s, --source <path>", "Source PowerPoint file (.pptx)")
 .requiredOption(
   "-t, --template <path>",
   "Destination template PowerPoint file (.pptx)"
 )
 .requiredOption("-o, --output <path>", "Output file path (.pptx)")
 .option(
   "--slide-range <range>",
   'Slide range to migrate (e.g., "1-5", "1,3,5", "2-")',
   undefined
 )
 .action(async (options) => {
   try {
     await run(options);
   } catch (err) {
     console.error(`\n[FATAL] ${err}`);
     process.exit(1);
   }
 });

program.parse();

async function run(options: {
 source: string;
 template: string;
 output: string;
 slideRange?: string;
}): Promise<void> {
 const startTime = Date.now();

 console.log("╔══════════════════════════════════════════════╗");
 console.log("║     PPTX Theme Migration Tool v1.0.0        ║");
 console.log("╚══════════════════════════════════════════════╝\n");

 // Validate input files exist
 if (!(await fs.pathExists(options.source))) {
   throw new Error(`Source file not found: ${options.source}`);
 }
 if (!(await fs.pathExists(options.template))) {
   throw new Error(`Template file not found: ${options.template}`);
 }

 // Ensure output directory exists
 const outputDir = path.dirname(options.output);
 if (outputDir) {
   await fs.ensureDir(outputDir);
 }

 // Step 1: Parse source presentation
 console.log(`[1/5] Parsing source: ${options.source}`);
 const sourceBuffer = await fs.readFile(options.source);
 const source = await parsePresentation(sourceBuffer);
 console.log(
   `      Found ${source.slides.length} slides, ` +
     `${source.slideLayouts.length} layouts, ` +
     `${source.slideMasters.length} masters`
 );

 // Step 2: Parse destination template
 console.log(`[2/5] Parsing template: ${options.template}`);
 const templateBuffer = await fs.readFile(options.template);
 const template = await parsePresentation(templateBuffer);
 console.log(
   `      Found ${template.slides.length} slides, ` +
     `${template.slideLayouts.length} layouts, ` +
     `${template.slideMasters.length} masters`
 );

 // Step 3: Filter slides by range if specified
 let slidesToMigrate: ParsedSlide[] = source.slides;
 if (options.slideRange) {
   slidesToMigrate = filterSlidesByRange(source.slides, options.slideRange);
   console.log(
     `      Slide range "${options.slideRange}" selected: ${slidesToMigrate.length} slides`
   );
 }

 // Step 3b: Skip final "thank you" closing slide when detected
 const beforeClosingFilter = slidesToMigrate.length;
 slidesToMigrate = removeClosingThankYouSlide(slidesToMigrate, source.slides.length);
 if (slidesToMigrate.length < beforeClosingFilter) {
   console.log(
     "      Detected and skipped final closing 'Thank you' slide from source"
   );
 }

 if (slidesToMigrate.length === 0) {
   throw new Error("No slides to migrate after applying filters");
 }

 // Step 4: Map layouts
 console.log("[3/5] Mapping source slides to destination layouts...");
 const mappings = mapLayouts(source, template, slidesToMigrate);
 for (const m of mappings) {
   console.log(
     `      Slide ${m.sourceSlide.index} -> "${m.destinationLayout.name}" (${m.matchType})`
   );
 }

 // Step 5: Transfer and build
 console.log("[4/5] Transferring content...");
 const { buffer, summary } = await buildMigratedPresentation(
   source,
   template,
   mappings
 );

 // Step 6: Write output
 console.log(`[5/5] Writing output: ${options.output}`);
 await fs.writeFile(options.output, buffer);

 // Print summary
 const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
 console.log("\n══════════════════════════════════════════════");
 console.log("  Migration Summary");
 console.log("══════════════════════════════════════════════");
 console.log(`  Slides transferred: ${summary.slidesTransferred}`);
 console.log(`  Slides skipped:     ${summary.slidesSkipped}`);
 console.log(`  Media files copied:  ${summary.mediaFilesCopied}`);
 console.log(`  Charts copied:       ${summary.chartsCopied}`);
 console.log(`  Time elapsed:        ${elapsed}s`);

 if (summary.warnings.length > 0) {
   console.log(`\n  Warnings (${summary.warnings.length}):`);
   for (const w of summary.warnings) {
     console.log(`    ⚠ ${w}`);
   }
 }

 console.log("\n  ✅ Migration complete!\n");
}

/**
* Parse a slide range string and filter slides accordingly.
* Supports: "1-5", "1,3,5", "2-", "-3", "1-3,7,9-11"
*/
function filterSlidesByRange(
 slides: ParsedSlide[],
 rangeStr: string
): ParsedSlide[] {
 const maxSlide = slides.length;
 const selectedIndices = new Set<number>();

 const parts = rangeStr.split(",").map((s) => s.trim());
 for (const part of parts) {
   if (part.includes("-")) {
     const [startStr, endStr] = part.split("-");
     const start = startStr ? parseInt(startStr, 10) : 1;
     const end = endStr ? parseInt(endStr, 10) : maxSlide;

     if (isNaN(start) || isNaN(end)) {
       console.warn(`[WARN] Invalid range part: "${part}", skipping`);
       continue;
     }

     for (let i = start; i <= end && i <= maxSlide; i++) {
       selectedIndices.add(i);
     }
   } else {
     const num = parseInt(part, 10);
     if (!isNaN(num) && num >= 1 && num <= maxSlide) {
       selectedIndices.add(num);
     }
   }
 }

 return slides
   .filter((s) => selectedIndices.has(s.index))
   .sort((a, b) => a.index - b.index);
}

function removeClosingThankYouSlide(
 slides: ParsedSlide[],
 totalSourceSlides: number
): ParsedSlide[] {
 if (slides.length === 0) return slides;
 const maybeLast = slides[slides.length - 1];
 if (maybeLast.index !== totalSourceSlides) return slides;

 if (!looksLikeThankYouSlide(maybeLast.xml)) return slides;
 return slides.slice(0, -1);
}

function looksLikeThankYouSlide(slideXml: string): boolean {
 const doc = domParser.parseFromString(slideXml, "text/xml");
 const textNodes = doc.getElementsByTagNameNS(NS.a, "t");
 let text = "";
 for (let i = 0; i < textNodes.length; i++) {
   const value = textNodes[i].textContent || "";
   if (value.trim()) {
     text += ` ${value.trim()}`;
   }
 }

 const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
 if (!normalized) return false;

 return (
   normalized.includes("thank you") ||
   normalized === "thanks" ||
   normalized.includes("thanks for") ||
   normalized.includes("questions?")
 );
}