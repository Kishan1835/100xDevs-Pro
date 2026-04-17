"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePresentation = parsePresentation;
exports.extractPlaceholders = extractPlaceholders;
exports.parseRelationships = parseRelationships;
exports.resolveRelPath = resolveRelPath;
exports.readZipFile = readZipFile;
exports.readZipBinary = readZipBinary;
exports.serializeXml = serializeXml;
const jszip_1 = __importDefault(require("jszip"));
const xmldom_1 = require("xmldom");
const types_1 = require("./types");
const domParser = new xmldom_1.DOMParser();
/**
* Parse a .pptx file from a Buffer into our internal representation.
*/
async function parsePresentation(buffer) {
    const zip = await jszip_1.default.loadAsync(buffer);
    // Parse [Content_Types].xml
    const contentTypesXml = await readZipFile(zip, "[Content_Types].xml");
    // Parse ppt/presentation.xml
    const presentationXml = await readZipFile(zip, "ppt/presentation.xml");
    // Parse ppt/_rels/presentation.xml.rels
    const presentationRelsXml = await readZipFile(zip, "ppt/_rels/presentation.xml.rels");
    const presentationRels = parseRelationships(presentationRelsXml);
    // Find theme
    let themePath = "ppt/theme/theme1.xml";
    let themeXml = "";
    for (const [, rel] of presentationRels) {
        if (rel.type === types_1.REL_TYPES.theme) {
            themePath = resolveRelPath("ppt/presentation.xml", rel.target);
            break;
        }
    }
    try {
        themeXml = await readZipFile(zip, themePath);
    }
    catch {
        console.warn(`[WARN] Could not read theme at ${themePath}`);
    }
    // Discover slides from presentation.xml.rels
    const slideRels = [];
    for (const [, rel] of presentationRels) {
        if (rel.type === types_1.REL_TYPES.slide) {
            const slidePath = resolveRelPath("ppt/presentation.xml", rel.target);
            slideRels.push({ rId: rel.id, path: slidePath });
        }
    }
    // Determine slide ordering from presentation.xml <p:sldIdLst>
    const presDoc = domParser.parseFromString(presentationXml, "text/xml");
    const sldIdLst = presDoc.getElementsByTagNameNS(types_1.NS.p, "sldId");
    const orderedSlideRIds = [];
    for (let i = 0; i < sldIdLst.length; i++) {
        const rIdAttr = sldIdLst[i].getAttributeNS(types_1.NS.r, "id");
        if (rIdAttr)
            orderedSlideRIds.push(rIdAttr);
    }
    // Order slides according to presentation.xml order
    const orderedSlideRels = orderedSlideRIds
        .map((rId) => slideRels.find((sr) => sr.rId === rId))
        .filter(Boolean);
    // If ordering failed, fallback to natural order
    const slidesToParse = orderedSlideRels.length > 0 ? orderedSlideRels : slideRels;
    // Parse each slide
    const slides = [];
    for (let i = 0; i < slidesToParse.length; i++) {
        const { path: slidePath } = slidesToParse[i];
        try {
            const slide = await parseSlide(zip, slidePath, i + 1);
            slides.push(slide);
        }
        catch (err) {
            console.error(`[ERROR] Failed to parse slide ${i + 1} at ${slidePath}: ${err}`);
        }
    }
    // Parse slide masters
    const slideMasters = [];
    for (const [, rel] of presentationRels) {
        if (rel.type === types_1.REL_TYPES.slideMaster) {
            const masterPath = resolveRelPath("ppt/presentation.xml", rel.target);
            try {
                const master = await parseSlideMaster(zip, masterPath);
                slideMasters.push(master);
            }
            catch (err) {
                console.error(`[ERROR] Failed to parse slide master at ${masterPath}: ${err}`);
            }
        }
    }
    // Parse slide layouts
    const slideLayouts = [];
    for (const master of slideMasters) {
        for (const layoutPath of master.layoutPaths) {
            try {
                const layout = await parseSlideLayout(zip, layoutPath);
                slideLayouts.push(layout);
            }
            catch (err) {
                console.error(`[ERROR] Failed to parse slide layout at ${layoutPath}: ${err}`);
            }
        }
    }
    return {
        zip,
        slides,
        slideLayouts,
        slideMasters,
        theme: themeXml,
        themePath,
        presentationXml,
        presentationRelsXml,
        contentTypesXml,
    };
}
/**
* Parse a single slide from the ZIP.
*/
async function parseSlide(zip, slidePath, index) {
    const xml = await readZipFile(zip, slidePath);
    // Build rels path: ppt/slides/slide1.xml -> ppt/slides/_rels/slide1.xml.rels
    const pathParts = slidePath.split("/");
    const fileName = pathParts.pop();
    const relsPath = [...pathParts, "_rels", `${fileName}.rels`].join("/");
    let relsXml = "";
    let relationships = new Map();
    try {
        relsXml = await readZipFile(zip, relsPath);
        relationships = parseRelationships(relsXml);
    }
    catch {
        // Slide may have no rels (unlikely but handle gracefully)
    }
    // Find layout reference
    let layoutRef = "";
    let layoutResolvedPath = "";
    for (const [, rel] of relationships) {
        if (rel.type === types_1.REL_TYPES.slideLayout) {
            layoutRef = rel.target;
            layoutResolvedPath = resolveRelPath(slidePath, rel.target);
            break;
        }
    }
    // Find notes slide if present
    let notesSlidePath;
    for (const [, rel] of relationships) {
        if (rel.type === types_1.REL_TYPES.notesSlide) {
            notesSlidePath = resolveRelPath(slidePath, rel.target);
            break;
        }
    }
    return {
        index,
        path: slidePath,
        relsPath,
        xml,
        relsXml,
        relationships,
        layoutRef,
        layoutResolvedPath,
        notesSlidePath,
    };
}
/**
* Parse a slide master and discover its layouts.
*/
async function parseSlideMaster(zip, masterPath) {
    const xml = await readZipFile(zip, masterPath);
    const pathParts = masterPath.split("/");
    const fileName = pathParts.pop();
    const relsPath = [...pathParts, "_rels", `${fileName}.rels`].join("/");
    let relsXml = "";
    let relationships = new Map();
    try {
        relsXml = await readZipFile(zip, relsPath);
        relationships = parseRelationships(relsXml);
    }
    catch {
        // no rels
    }
    const layoutPaths = [];
    for (const [, rel] of relationships) {
        if (rel.type === types_1.REL_TYPES.slideLayout) {
            layoutPaths.push(resolveRelPath(masterPath, rel.target));
        }
    }
    return { path: masterPath, xml, relsXml, relationships, layoutPaths };
}
/**
* Parse a slide layout, extracting its name and placeholders.
*/
async function parseSlideLayout(zip, layoutPath) {
    const xml = await readZipFile(zip, layoutPath);
    const pathParts = layoutPath.split("/");
    const fileName = pathParts.pop();
    const relsPath = [...pathParts, "_rels", `${fileName}.rels`].join("/");
    let relsXml = "";
    let relationships = new Map();
    try {
        relsXml = await readZipFile(zip, relsPath);
        relationships = parseRelationships(relsXml);
    }
    catch {
        // no rels
    }
    const doc = domParser.parseFromString(xml, "text/xml");
    // Extract layout name from <p:cSld name="...">
    const cSld = doc.getElementsByTagNameNS(types_1.NS.p, "cSld");
    let name = "";
    if (cSld.length > 0) {
        name = cSld[0].getAttribute("name") || "";
    }
    // Extract layout type attribute if present
    const sldLayout = doc.documentElement;
    const type = sldLayout?.getAttribute("type") || "";
    // Extract placeholders
    const placeholders = extractPlaceholders(doc);
    return { name, type, path: layoutPath, xml, placeholders, relsXml, relationships };
}
/**
* Extract placeholder definitions from a layout or slide XML document.
*/
function extractPlaceholders(doc) {
    const placeholders = [];
    const spElements = doc.getElementsByTagNameNS(types_1.NS.p, "sp");
    for (let i = 0; i < spElements.length; i++) {
        const sp = spElements[i];
        const phElements = sp.getElementsByTagNameNS(types_1.NS.p, "ph");
        if (phElements.length === 0)
            continue;
        const ph = phElements[0];
        const type = ph.getAttribute("type") || "body";
        const idx = parseInt(ph.getAttribute("idx") || "0", 10);
        // Get position from <a:off> and <a:ext> inside <p:spPr>
        const spPr = sp.getElementsByTagNameNS(types_1.NS.p, "spPr");
        let x = 0, y = 0, cx = 0, cy = 0;
        if (spPr.length > 0) {
            const off = spPr[0].getElementsByTagNameNS(types_1.NS.a, "off");
            const ext = spPr[0].getElementsByTagNameNS(types_1.NS.a, "ext");
            if (off.length > 0) {
                x = parseInt(off[0].getAttribute("x") || "0", 10);
                y = parseInt(off[0].getAttribute("y") || "0", 10);
            }
            if (ext.length > 0) {
                cx = parseInt(ext[0].getAttribute("cx") || "0", 10);
                cy = parseInt(ext[0].getAttribute("cy") || "0", 10);
            }
        }
        placeholders.push({ type, idx, x, y, cx, cy });
    }
    return placeholders;
}
/**
* Parse a .rels XML string into a Map of rId -> Relationship.
*/
function parseRelationships(relsXml) {
    const map = new Map();
    if (!relsXml)
        return map;
    const doc = domParser.parseFromString(relsXml, "text/xml");
    const relElements = doc.getElementsByTagName("Relationship");
    for (let i = 0; i < relElements.length; i++) {
        const el = relElements[i];
        const id = el.getAttribute("Id") || "";
        const type = el.getAttribute("Type") || "";
        const target = el.getAttribute("Target") || "";
        const targetMode = el.getAttribute("TargetMode") || undefined;
        map.set(id, { id, type, target, targetMode });
    }
    return map;
}
/**
* Resolve a relative relationship target path against the source file's directory.
* e.g., resolveRelPath("ppt/slides/slide1.xml", "../slideLayouts/slideLayout1.xml")
*       -> "ppt/slideLayouts/slideLayout1.xml"
*/
function resolveRelPath(sourceFilePath, relativeTarget) {
    if (relativeTarget.startsWith("/")) {
        // Absolute path within the ZIP
        return relativeTarget.substring(1);
    }
    const sourceParts = sourceFilePath.split("/");
    sourceParts.pop(); // remove the filename
    const targetParts = relativeTarget.split("/");
    const combined = [...sourceParts];
    for (const part of targetParts) {
        if (part === "..") {
            combined.pop();
        }
        else if (part !== ".") {
            combined.push(part);
        }
    }
    return combined.join("/");
}
/**
* Read a file from the ZIP as a UTF-8 string. Throws if not found.
*/
async function readZipFile(zip, path) {
    const file = zip.file(path);
    if (!file) {
        throw new Error(`File not found in ZIP: ${path}`);
    }
    return file.async("string");
}
/**
* Read a file from the ZIP as a binary Buffer. Returns null if not found.
*/
async function readZipBinary(zip, path) {
    const file = zip.file(path);
    if (!file)
        return null;
    const data = await file.async("nodebuffer");
    return data;
}
/**
* Serialize an XML Document back to string.
*/
function serializeXml(doc) {
    return new xmldom_1.XMLSerializer().serializeToString(doc);
}
//# sourceMappingURL=parser.js.map