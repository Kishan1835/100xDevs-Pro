import JSZip from "jszip";
import { DOMParser, XMLSerializer } from "xmldom";
import {
 Relationship,
 MediaFile,
 ChartFile,
 REL_TYPES,
 NS,
 CONTENT_TYPES,
} from "./types";
import { parseRelationships, resolveRelPath, readZipBinary, readZipFile } from "./parser";
import path from "path";

const domParser = new DOMParser();

/**
* Global counters for generating unique filenames and rIds in the destination.
*/
let mediaCounter = 1;
let chartCounter = 1;
let embeddingCounter = 1;

/**
* Reset counters (call before starting a migration).
*/
export function resetCounters(): void {
 mediaCounter = 1;
 chartCounter = 1;
 embeddingCounter = 1;
}

/**
* Initialize counters based on existing files in the destination ZIP to avoid collisions.
*/
export function initCounters(destZip: JSZip): void {
 // Scan for existing media files
 destZip.forEach((relativePath) => {
   const match = relativePath.match(/^ppt\/media\/(?:src_)?image(\d+)\./);
   if (match) {
     const num = parseInt(match[1], 10);
     if (num >= mediaCounter) mediaCounter = num + 1;
   }
   const chartMatch = relativePath.match(
     /^ppt\/charts\/(?:src_)?chart(\d+)\./
   );
   if (chartMatch) {
     const num = parseInt(chartMatch[1], 10);
     if (num >= chartCounter) chartCounter = num + 1;
   }
   const embedMatch = relativePath.match(
     /^ppt\/embeddings\/(?:src_)?[\w]+(\d+)\./
   );
   if (embedMatch) {
     const num = parseInt(embedMatch[1], 10);
     if (num >= embeddingCounter) embeddingCounter = num + 1;
   }
 });
}

/**
* Generate a new unique rId that doesn't collide with existing relationship IDs.
*/
export function generateUniqueRId(
 existingRIds: Set<string>,
 prefix: string = "rId"
): string {
 let counter = 1;
 // Start from a high number to avoid collisions
 for (const rid of existingRIds) {
   const match = rid.match(/^rId(\d+)$/);
   if (match) {
     const num = parseInt(match[1], 10);
     if (num >= counter) counter = num + 1;
   }
 }
 let newId = `${prefix}${counter}`;
 while (existingRIds.has(newId)) {
   counter++;
   newId = `${prefix}${counter}`;
 }
 existingRIds.add(newId);
 return newId;
}

/**
* Process all relationships for a slide being transferred.
*
* Returns:
*  - rIdMap: old rId -> new rId
*  - newRels: array of new relationship entries
*  - mediaFiles: media files to copy
*  - chartFiles: chart files to copy (with their rels and embeddings)
*  - embeddedFiles: other embedded files
*/
export async function processSlideRelationships(
 sourceZip: JSZip,
 sourceSlideRels: Map<string, Relationship>,
 sourceSlideDir: string, // e.g., "ppt/slides"
 destExistingRIds: Set<string>,
 layoutRelId: string // rId that will point to the dest layout
): Promise<{
 rIdMap: Map<string, string>;
 newRelationships: Relationship[];
 mediaFiles: MediaFile[];
 chartFiles: ChartFile[];
 embeddedFiles: { sourcePath: string; destPath: string; contentType: string }[];
}> {
 const rIdMap = new Map<string, string>();
 const newRelationships: Relationship[] = [];
 const mediaFiles: MediaFile[] = [];
 const chartFiles: ChartFile[] = [];
 const embeddedFiles: { sourcePath: string; destPath: string; contentType: string }[] = [];

 for (const [oldRId, rel] of sourceSlideRels) {
   // Skip layout relationship — we'll set our own
   if (rel.type === REL_TYPES.slideLayout) {
     rIdMap.set(oldRId, layoutRelId);
     continue;
   }

   // Skip notes slides (not transferring notes in this version)
   if (rel.type === REL_TYPES.notesSlide) {
     continue;
   }

   // Handle external hyperlinks
   if (rel.targetMode === "External") {
     const newRId = generateUniqueRId(destExistingRIds);
     rIdMap.set(oldRId, newRId);
     newRelationships.push({
       id: newRId,
       type: rel.type,
       target: rel.target,
       targetMode: "External",
     });
     continue;
   }

   const resolvedSourcePath = resolveRelPath(
     `${sourceSlideDir}/dummy.xml`,
     rel.target
   );

   // Handle images
   if (rel.type === REL_TYPES.image) {
     const ext = path.extname(rel.target).toLowerCase();
     const destFileName = `src_image${mediaCounter++}${ext}`;
     const destPath = `ppt/media/${destFileName}`;

     const newRId = generateUniqueRId(destExistingRIds);
     rIdMap.set(oldRId, newRId);

     newRelationships.push({
       id: newRId,
       type: rel.type,
       target: `../media/${destFileName}`,
     });

     const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
     mediaFiles.push({ sourcePath: resolvedSourcePath, destPath, contentType });
     continue;
   }

   // Handle charts
   if (rel.type === REL_TYPES.chart) {
     const destChartName = `src_chart${chartCounter++}.xml`;
     const destChartPath = `ppt/charts/${destChartName}`;
     const destChartRelsPath = `ppt/charts/_rels/${destChartName}.rels`;

     const newRId = generateUniqueRId(destExistingRIds);
     rIdMap.set(oldRId, newRId);

     newRelationships.push({
       id: newRId,
       type: rel.type,
       target: `../charts/${destChartName}`,
     });

     // Process chart's own relationships (embedded Excel, etc.)
     const sourceChartRelsPath = resolvedSourcePath.replace(
       /([^/]+)$/,
       "_rels/$1.rels"
     );
     const chartEmbeddings: { sourcePath: string; destPath: string }[] = [];

     try {
       const chartRelsXml = await readZipFile(sourceZip, sourceChartRelsPath);
       const chartRels = parseRelationships(chartRelsXml);

       // Rewrite chart rels to point to new embedding paths
       const chartRIdMap = new Map<string, string>();
       const newChartRels: Relationship[] = [];
       const chartExistingRIds = new Set<string>();

       for (const [, chartRel] of chartRels) {
         chartExistingRIds.add(chartRel.id);
       }

       for (const [cOldRId, chartRel] of chartRels) {
         if (
           chartRel.type === REL_TYPES.package ||
           chartRel.type === REL_TYPES.oleObject
         ) {
           const ext = path.extname(chartRel.target).toLowerCase();
           const destEmbedName = `src_embed${embeddingCounter++}${ext}`;
           const destEmbedPath = `ppt/embeddings/${destEmbedName}`;
           const sourceEmbedPath = resolveRelPath(
             resolvedSourcePath,
             chartRel.target
           );

           chartEmbeddings.push({
             sourcePath: sourceEmbedPath,
             destPath: destEmbedPath,
           });

           const contentType =
             CONTENT_TYPES[ext] || "application/octet-stream";
           embeddedFiles.push({
             sourcePath: sourceEmbedPath,
             destPath: destEmbedPath,
             contentType,
           });

           const newCRId = generateUniqueRId(chartExistingRIds);
           chartRIdMap.set(cOldRId, newCRId);
           newChartRels.push({
             id: newCRId,
             type: chartRel.type,
             target: `../embeddings/${destEmbedName}`,
           });
         } else {
           // Keep other rels as-is but with new rIds
           const newCRId = generateUniqueRId(chartExistingRIds);
           chartRIdMap.set(cOldRId, newCRId);
           newChartRels.push({
             id: newCRId,
             type: chartRel.type,
             target: chartRel.target,
             targetMode: chartRel.targetMode,
           });
         }
       }

       // Build new chart rels XML
       const destChartRelsXmlContent = buildRelsXml(newChartRels);

       // We need to also rewrite rIds inside the chart XML itself
       // Store this info for later processing
       chartFiles.push({
         sourcePath: resolvedSourcePath,
         destPath: destChartPath,
         sourceRelsPath: sourceChartRelsPath,
         destRelsPath: destChartRelsPath,
         embeddedFiles: chartEmbeddings,
       });

       // We'll handle the chart XML rewriting in transferrer.ts
     } catch {
       // No chart rels — just copy the chart XML
       chartFiles.push({
         sourcePath: resolvedSourcePath,
         destPath: destChartPath,
         sourceRelsPath: "",
         destRelsPath: destChartRelsPath,
         embeddedFiles: [],
       });
     }

     continue;
   }

   // Handle OLE objects and other embedded content
   if (
     rel.type === REL_TYPES.oleObject ||
     rel.type === REL_TYPES.package
   ) {
     const ext = path.extname(rel.target).toLowerCase();
     const destEmbedName = `src_embed${embeddingCounter++}${ext || ".bin"}`;
     const destEmbedPath = `ppt/embeddings/${destEmbedName}`;

     const newRId = generateUniqueRId(destExistingRIds);
     rIdMap.set(oldRId, newRId);

     const relTarget = rel.target.startsWith("../")
       ? `../embeddings/${destEmbedName}`
       : destEmbedPath;

     newRelationships.push({
       id: newRId,
       type: rel.type,
       target: `../embeddings/${destEmbedName}`,
     });

     const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
     embeddedFiles.push({
       sourcePath: resolvedSourcePath,
       destPath: destEmbedPath,
       contentType,
     });
     continue;
   }

   // Handle VML drawings
   if (rel.type === REL_TYPES.vmlDrawing) {
     const newRId = generateUniqueRId(destExistingRIds);
     rIdMap.set(oldRId, newRId);
     // Copy VML file
     const ext = path.extname(rel.target).toLowerCase();
     const destVmlName = `src_vml${mediaCounter++}${ext || ".vml"}`;
     const destVmlPath = `ppt/drawings/${destVmlName}`;
     newRelationships.push({
       id: newRId,
       type: rel.type,
       target: `../drawings/${destVmlName}`,
     });
     mediaFiles.push({
       sourcePath: resolvedSourcePath,
       destPath: destVmlPath,
       contentType: "application/vnd.openxmlformats-officedocument.vmlDrawing",
     });
     continue;
   }

   // Generic fallback — copy the relationship but keep the target
   const newRId = generateUniqueRId(destExistingRIds);
   rIdMap.set(oldRId, newRId);
   newRelationships.push({
     id: newRId,
     type: rel.type,
     target: rel.target,
     targetMode: rel.targetMode,
   });
 }

 return { rIdMap, newRelationships, mediaFiles, chartFiles, embeddedFiles };
}

/**
* Build a .rels XML string from an array of relationships.
*/
export function buildRelsXml(relationships: Relationship[]): string {
 const doc = new DOMParser().parseFromString(
   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
     '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>',
   "text/xml"
 );
 const root = doc.documentElement;

 for (const rel of relationships) {
   const el = doc.createElement("Relationship");
   el.setAttribute("Id", rel.id);
   el.setAttribute("Type", rel.type);
   el.setAttribute("Target", rel.target);
   if (rel.targetMode) {
     el.setAttribute("TargetMode", rel.targetMode);
   }
   root.appendChild(el);
 }

 return new XMLSerializer().serializeToString(doc);
}

/**
* Copy media/chart/embedded files from source ZIP to destination ZIP.
*/
export async function copyFilesToDestZip(
 sourceZip: JSZip,
 destZip: JSZip,
 mediaFiles: MediaFile[],
 chartFiles: ChartFile[],
 embeddedFiles: { sourcePath: string; destPath: string; contentType: string }[]
): Promise<{ copiedMedia: number; copiedCharts: number }> {
 let copiedMedia = 0;
 let copiedCharts = 0;

 // Copy media files (images, etc.)
 for (const mf of mediaFiles) {
   const data = await readZipBinary(sourceZip, mf.sourcePath);
   if (data) {
     destZip.file(mf.destPath, data);
     copiedMedia++;
   } else {
     console.warn(
       `[WARN] Media file not found in source: ${mf.sourcePath}, skipping`
     );
   }
 }

 // Copy chart files
 for (const cf of chartFiles) {
   const chartData = await readZipBinary(sourceZip, cf.sourcePath);
   if (chartData) {
     destZip.file(cf.destPath, chartData);
     copiedCharts++;

     // Copy chart rels
     if (cf.sourceRelsPath) {
       const relsData = await readZipBinary(sourceZip, cf.sourceRelsPath);
       if (relsData) {
         destZip.file(cf.destRelsPath, relsData);
       }
     }

     // Copy embedded files (Excel workbooks, etc.)
     for (const ef of cf.embeddedFiles) {
       const embedData = await readZipBinary(sourceZip, ef.sourcePath);
       if (embedData) {
         destZip.file(ef.destPath, embedData);
       } else {
         console.warn(
           `[WARN] Embedded file not found: ${ef.sourcePath}, skipping`
         );
       }
     }
   } else {
     console.warn(
       `[WARN] Chart file not found in source: ${cf.sourcePath}, skipping`
     );
   }
 }

 // Copy other embedded files
 for (const ef of embeddedFiles) {
   const data = await readZipBinary(sourceZip, ef.sourcePath);
   if (data) {
     destZip.file(ef.destPath, data);
   } else {
     console.warn(
       `[WARN] Embedded file not found: ${ef.sourcePath}, skipping`
     );
   }
 }

 return { copiedMedia, copiedCharts };
}