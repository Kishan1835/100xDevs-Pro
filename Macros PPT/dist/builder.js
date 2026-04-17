"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMigratedPresentation = buildMigratedPresentation;
const xmldom_1 = require("xmldom");
const types_1 = require("./types");
const transferrer_1 = require("./transferrer");
const mediaHandler_1 = require("./mediaHandler");
const path_1 = __importDefault(require("path"));
const domParser = new xmldom_1.DOMParser();
const xmlSerializer = new xmldom_1.XMLSerializer();
/**
* Build the final migrated .pptx by:
*  1. Removing existing slides from the destination template
*  2. Transferring each source slide
*  3. Updating [Content_Types].xml and presentation.xml.rels
*  4. Validating the result
*/
async function buildMigratedPresentation(source, destination, mappings) {
    const summary = {
        slidesTransferred: 0,
        slidesSkipped: 0,
        mediaFilesCopied: 0,
        chartsCopied: 0,
        warnings: [],
    };
    (0, mediaHandler_1.resetCounters)();
    const destZip = destination.zip;
    (0, mediaHandler_1.initCounters)(destZip);
    // Optional cleanup: remove divider/separator theme shapes from layout/master files.
    // These decorative lines from the template can appear on every migrated slide.
    await stripTemplateDividers(destZip);
    // Step 1: Remove existing slides from destination
    removeExistingSlides(destZip, destination);
    // Step 2: Transfer each source slide
    const slideEntries = [];
    for (let i = 0; i < mappings.length; i++) {
        const mapping = mappings[i];
        const destSlideNumber = i + 1;
        const slidePath = `ppt/slides/slide${destSlideNumber}.xml`;
        const relsPath = `ppt/slides/_rels/slide${destSlideNumber}.xml.rels`;
        // Calculate relative path from slide to layout
        const layoutPath = mapping.destinationLayout.path;
        const layoutRelTarget = getRelativePath(`ppt/slides/slide${destSlideNumber}.xml`, layoutPath);
        try {
            const result = await (0, transferrer_1.transferSlide)(source.zip, mapping, destSlideNumber, layoutRelTarget);
            // Write slide XML
            destZip.file(slidePath, result.slideXml);
            destZip.file(relsPath, result.slideRelsXml);
            // Copy media, charts, embeddings
            const { copiedMedia, copiedCharts } = await (0, mediaHandler_1.copyFilesToDestZip)(source.zip, destZip, result.mediaFiles, result.chartFiles, result.embeddedFiles);
            summary.mediaFilesCopied += copiedMedia;
            summary.chartsCopied += copiedCharts;
            summary.slidesTransferred++;
            slideEntries.push({
                slideNumber: destSlideNumber,
                slidePath,
                relsPath,
            });
            console.log(`  [OK] Slide ${mapping.sourceSlide.index} -> slide${destSlideNumber}.xml ` +
                `(layout: "${mapping.destinationLayout.name}", match: ${mapping.matchType})`);
        }
        catch (err) {
            console.error(`[ERROR] Failed to transfer slide ${mapping.sourceSlide.index}: ${err}`);
            summary.slidesSkipped++;
            summary.warnings.push(`Slide ${mapping.sourceSlide.index}: transfer failed — ${err}`);
        }
    }
    // Step 3: Update presentation.xml — sldIdLst and presentation.xml.rels
    updatePresentationXml(destZip, destination, slideEntries);
    // Step 4: Update [Content_Types].xml
    updateContentTypes(destZip, destination, slideEntries);
    // Step 5: Validate
    const validationWarnings = await validateOutput(destZip, slideEntries);
    summary.warnings.push(...validationWarnings);
    // Generate final buffer
    const buffer = await destZip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
    });
    return { buffer, summary };
}
/**
* Remove divider/separator shapes from template layouts and masters.
* This is heuristic-based and intentionally conservative.
*/
async function stripTemplateDividers(destZip) {
    const candidatePaths = [];
    destZip.forEach((relativePath) => {
        if (/^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(relativePath) ||
            /^ppt\/slideMasters\/slideMaster\d+\.xml$/.test(relativePath)) {
            candidatePaths.push(relativePath);
        }
    });
    for (const xmlPath of candidatePaths) {
        const file = destZip.file(xmlPath);
        if (!file)
            continue;
        const xml = await file.async("string");
        const doc = domParser.parseFromString(xml, "text/xml");
        const spTreeNodes = doc.getElementsByTagNameNS(types_1.NS.p, "spTree");
        if (spTreeNodes.length === 0)
            continue;
        const spTree = spTreeNodes[0];
        const toRemove = [];
        const children = spTree.childNodes;
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (node.nodeType !== 1)
                continue;
            const el = node;
            if (el.localName !== "sp")
                continue;
            if (shouldRemoveDividerShape(el)) {
                toRemove.push(el);
            }
        }
        if (toRemove.length > 0) {
            for (const el of toRemove) {
                spTree.removeChild(el);
            }
            destZip.file(xmlPath, xmlSerializer.serializeToString(doc));
        }
    }
}
function shouldRemoveDividerShape(sp) {
    const cNvPr = sp.getElementsByTagNameNS(types_1.NS.p, "cNvPr");
    const shapeName = (cNvPr.length > 0 ? cNvPr[0].getAttribute("name") : "") || "";
    const nameLc = shapeName.toLowerCase();
    // Most templates name these explicitly.
    if (nameLc.includes("divider") ||
        nameLc.includes("separator") ||
        nameLc.includes("seperator")) {
        return true;
    }
    // Fallback: explicit line geometry with no text content.
    const prstGeom = sp.getElementsByTagNameNS(types_1.NS.a, "prstGeom");
    const hasLineGeom = prstGeom.length > 0 && (prstGeom[0].getAttribute("prst") || "") === "line";
    if (!hasLineGeom) {
        return false;
    }
    const textRuns = sp.getElementsByTagNameNS(types_1.NS.a, "t");
    const hasNonEmptyText = Array.from({ length: textRuns.length }).some((_, idx) => {
        const value = textRuns[idx].textContent || "";
        return value.trim().length > 0;
    });
    return !hasNonEmptyText;
}
/**
* Remove existing slides from the destination ZIP and clean up their references.
*/
function removeExistingSlides(destZip, dest) {
    // Remove slide files and their rels
    for (const slide of dest.slides) {
        destZip.remove(slide.path);
        try {
            destZip.remove(slide.relsPath);
        }
        catch {
            // rels might not exist
        }
    }
    // Also remove any slide files that match the pattern (in case of gaps)
    const toRemove = [];
    destZip.forEach((relativePath) => {
        if (/^ppt\/slides\/slide\d+\.xml$/.test(relativePath)) {
            toRemove.push(relativePath);
        }
        if (/^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(relativePath)) {
            toRemove.push(relativePath);
        }
    });
    for (const p of toRemove) {
        destZip.remove(p);
    }
}
/**
* Update ppt/presentation.xml and its .rels to reference the new slides.
*/
function updatePresentationXml(destZip, dest, slideEntries) {
    // Update presentation.xml.rels
    const presRelsDoc = domParser.parseFromString(dest.presentationRelsXml, "text/xml");
    const relsRoot = presRelsDoc.documentElement;
    // Remove existing slide relationships
    const existingRels = relsRoot.getElementsByTagName("Relationship");
    const toRemove = [];
    const existingRIds = new Set();
    for (let i = 0; i < existingRels.length; i++) {
        const rel = existingRels[i];
        const type = rel.getAttribute("Type") || "";
        const rid = rel.getAttribute("Id") || "";
        existingRIds.add(rid);
        if (type === types_1.REL_TYPES.slide) {
            toRemove.push(rel);
        }
    }
    for (const el of toRemove) {
        relsRoot.removeChild(el);
    }
    // Add new slide relationships
    const newSlideRIds = [];
    let rIdCounter = 1;
    for (const rid of existingRIds) {
        const match = rid.match(/^rId(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num >= rIdCounter)
                rIdCounter = num + 1;
        }
    }
    for (const entry of slideEntries) {
        const rId = `rId${rIdCounter++}`;
        const relEl = presRelsDoc.createElement("Relationship");
        relEl.setAttribute("Id", rId);
        relEl.setAttribute("Type", types_1.REL_TYPES.slide);
        relEl.setAttribute("Target", `slides/slide${entry.slideNumber}.xml`);
        relsRoot.appendChild(relEl);
        newSlideRIds.push({ rId, slideNumber: entry.slideNumber });
    }
    destZip.file("ppt/_rels/presentation.xml.rels", xmlSerializer.serializeToString(presRelsDoc));
    // Update presentation.xml — rebuild sldIdLst
    const presDoc = domParser.parseFromString(dest.presentationXml, "text/xml");
    // Find or create <p:sldIdLst>
    let sldIdLst = presDoc.getElementsByTagNameNS(types_1.NS.p, "sldIdLst");
    let sldIdLstEl;
    if (sldIdLst.length > 0) {
        sldIdLstEl = sldIdLst[0];
        // Remove all existing <p:sldId> children
        while (sldIdLstEl.firstChild) {
            sldIdLstEl.removeChild(sldIdLstEl.firstChild);
        }
    }
    else {
        sldIdLstEl = presDoc.createElementNS(types_1.NS.p, "p:sldIdLst");
        // Insert after <p:sldMasterIdLst> if it exists
        const masterIdLst = presDoc.getElementsByTagNameNS(types_1.NS.p, "sldMasterIdLst");
        if (masterIdLst.length > 0 && masterIdLst[0].nextSibling) {
            masterIdLst[0].parentNode.insertBefore(sldIdLstEl, masterIdLst[0].nextSibling);
        }
        else {
            presDoc.documentElement.appendChild(sldIdLstEl);
        }
    }
    // Add new sldId entries. IDs start at 256 per OOXML convention
    let slideId = 256;
    for (const entry of newSlideRIds) {
        const sldId = presDoc.createElementNS(types_1.NS.p, "p:sldId");
        sldId.setAttribute("id", slideId.toString());
        sldId.setAttributeNS(types_1.NS.r, "r:id", entry.rId);
        sldIdLstEl.appendChild(sldId);
        slideId++;
    }
    destZip.file("ppt/presentation.xml", xmlSerializer.serializeToString(presDoc));
}
/**
* Update [Content_Types].xml with entries for new slides and any new media types.
*/
function updateContentTypes(destZip, dest, slideEntries) {
    const ctDoc = domParser.parseFromString(dest.contentTypesXml, "text/xml");
    const root = ctDoc.documentElement;
    // Remove existing slide Override entries
    const overrides = root.getElementsByTagName("Override");
    const toRemove = [];
    for (let i = 0; i < overrides.length; i++) {
        const partName = overrides[i].getAttribute("PartName") || "";
        if (/^\/ppt\/slides\/slide\d+\.xml$/.test(partName)) {
            toRemove.push(overrides[i]);
        }
    }
    for (const el of toRemove) {
        root.removeChild(el);
    }
    // Add new slide Override entries
    for (const entry of slideEntries) {
        const override = ctDoc.createElement("Override");
        override.setAttribute("PartName", `/${entry.slidePath}`);
        override.setAttribute("ContentType", "application/vnd.openxmlformats-officedocument.presentationml.slide+xml");
        root.appendChild(override);
    }
    // Ensure Default entries exist for common media types
    const existingDefaults = new Set();
    const defaults = root.getElementsByTagName("Default");
    for (let i = 0; i < defaults.length; i++) {
        const ext = (defaults[i].getAttribute("Extension") || "").toLowerCase();
        existingDefaults.add(ext);
    }
    // Check all files in the ZIP and ensure their extensions have Default entries
    const extensionsNeeded = new Set();
    destZip.forEach((relativePath) => {
        const ext = path_1.default.extname(relativePath).toLowerCase().replace(".", "");
        if (ext && !existingDefaults.has(ext)) {
            extensionsNeeded.add(ext);
        }
    });
    const extToContentType = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        bmp: "image/bmp",
        tif: "image/tiff",
        tiff: "image/tiff",
        emf: "image/x-emf",
        wmf: "image/x-wmf",
        svg: "image/svg+xml",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        bin: "application/vnd.openxmlformats-officedocument.oleObject",
        vml: "application/vnd.openxmlformats-officedocument.vmlDrawing",
    };
    for (const ext of extensionsNeeded) {
        if (extToContentType[ext]) {
            const def = ctDoc.createElement("Default");
            def.setAttribute("Extension", ext);
            def.setAttribute("ContentType", extToContentType[ext]);
            root.appendChild(def);
            existingDefaults.add(ext);
        }
    }
    // Also add Override for any chart files we added
    destZip.forEach((relativePath) => {
        if (/^ppt\/charts\/.*\.xml$/.test(relativePath)) {
            // Check if override already exists
            let found = false;
            const allOverrides = root.getElementsByTagName("Override");
            for (let i = 0; i < allOverrides.length; i++) {
                if (allOverrides[i].getAttribute("PartName") === `/${relativePath}`) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                const override = ctDoc.createElement("Override");
                override.setAttribute("PartName", `/${relativePath}`);
                override.setAttribute("ContentType", "application/vnd.openxmlformats-officedocument.drawingml.chart+xml");
                root.appendChild(override);
            }
        }
    });
    destZip.file("[Content_Types].xml", xmlSerializer.serializeToString(ctDoc));
}
/**
* Validate the output ZIP for common issues.
*/
async function validateOutput(destZip, slideEntries) {
    const warnings = [];
    // 1. Check [Content_Types].xml has all slide entries
    const ctFile = destZip.file("[Content_Types].xml");
    if (ctFile) {
        const ctXml = await ctFile.async("string");
        for (const entry of slideEntries) {
            if (!ctXml.includes(`/${entry.slidePath}`)) {
                warnings.push(`[VALIDATION] Missing Content_Types entry for ${entry.slidePath}`);
            }
        }
    }
    else {
        warnings.push("[VALIDATION] [Content_Types].xml is missing!");
    }
    // 2. Check presentation.xml.rels references all slides
    const presRelsFile = destZip.file("ppt/_rels/presentation.xml.rels");
    if (presRelsFile) {
        const presRelsXml = await presRelsFile.async("string");
        for (const entry of slideEntries) {
            const target = `slides/slide${entry.slideNumber}.xml`;
            if (!presRelsXml.includes(target)) {
                warnings.push(`[VALIDATION] presentation.xml.rels missing reference to ${target}`);
            }
        }
    }
    // 3. Check for duplicate rIds in each slide's .rels
    for (const entry of slideEntries) {
        const relsFile = destZip.file(entry.relsPath);
        if (relsFile) {
            const relsXml = await relsFile.async("string");
            const doc = domParser.parseFromString(relsXml, "text/xml");
            const rels = doc.getElementsByTagName("Relationship");
            const rIds = new Set();
            for (let i = 0; i < rels.length; i++) {
                const rId = rels[i].getAttribute("Id") || "";
                if (rIds.has(rId)) {
                    warnings.push(`[VALIDATION] Duplicate rId "${rId}" in ${entry.relsPath}`);
                }
                rIds.add(rId);
            }
        }
    }
    // 4. Check all media referenced in rels actually exist in the ZIP
    for (const entry of slideEntries) {
        const relsFile = destZip.file(entry.relsPath);
        if (relsFile) {
            const relsXml = await relsFile.async("string");
            const doc = domParser.parseFromString(relsXml, "text/xml");
            const rels = doc.getElementsByTagName("Relationship");
            for (let i = 0; i < rels.length; i++) {
                const target = rels[i].getAttribute("Target") || "";
                const targetMode = rels[i].getAttribute("TargetMode") || "";
                if (targetMode === "External")
                    continue;
                // Resolve relative to slide directory
                const resolvedPath = resolveFromSlideDir(entry.slidePath, target);
                if (resolvedPath && !destZip.file(resolvedPath)) {
                    // Check if it's a layout/master reference (those should already exist)
                    if (!resolvedPath.includes("slideLayout") &&
                        !resolvedPath.includes("slideMaster")) {
                        warnings.push(`[VALIDATION] Referenced file missing in ZIP: ${resolvedPath} (from ${entry.relsPath})`);
                    }
                }
            }
        }
    }
    return warnings;
}
/**
* Resolve a relative target path from a slide directory.
*/
function resolveFromSlideDir(slidePath, target) {
    const parts = slidePath.split("/");
    parts.pop();
    const targetParts = target.split("/");
    const combined = [...parts];
    for (const p of targetParts) {
        if (p === "..")
            combined.pop();
        else if (p !== ".")
            combined.push(p);
    }
    return combined.join("/");
}
/**
* Compute relative path from source file to target file within the ZIP.
*/
function getRelativePath(from, to) {
    const fromParts = from.split("/");
    fromParts.pop(); // remove filename
    const toParts = to.split("/");
    // Find common prefix length
    let common = 0;
    while (common < fromParts.length &&
        common < toParts.length &&
        fromParts[common] === toParts[common]) {
        common++;
    }
    const ups = fromParts.length - common;
    const remaining = toParts.slice(common);
    const parts = [...Array(ups).fill(".."), ...remaining];
    return parts.join("/");
}
//# sourceMappingURL=builder.js.map