"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferSlide = transferSlide;
const xmldom_1 = require("xmldom");
const types_1 = require("./types");
const mediaHandler_1 = require("./mediaHandler");
const domParser = new xmldom_1.DOMParser();
const xmlSerializer = new xmldom_1.XMLSerializer();
/**
* Transfer content from a source slide into a new slide based on the destination layout.
*
* This is the core function: it clones the source shape tree, remaps rIds,
* maps placeholders, and produces the new slide XML + rels.
*/
async function transferSlide(sourceZip, mapping, destSlideNumber, destLayoutRelTarget // relative path from new slide to layout, e.g., "../slideLayouts/slideLayout1.xml"
) {
    const { sourceSlide, destinationLayout } = mapping;
    // Parse source slide XML
    const sourceDoc = domParser.parseFromString(sourceSlide.xml, "text/xml");
    // Build the new slide XML starting from a clean slide template
    const newSlideDoc = createBlankSlideDoc();
    const newSpTree = getOrCreateSpTree(newSlideDoc);
    // Get the source spTree
    const sourceSpTree = sourceDoc.getElementsByTagNameNS(types_1.NS.p, "spTree");
    if (sourceSpTree.length === 0) {
        throw new Error(`Slide ${sourceSlide.index}: No <p:spTree> found`);
    }
    const srcTree = sourceSpTree[0];
    // Copy the spTree's <p:nvGrpSpPr> and <p:grpSpPr> (group shape properties) from source
    const nvGrpSpPr = srcTree.getElementsByTagNameNS(types_1.NS.p, "nvGrpSpPr");
    const grpSpPr = srcTree.getElementsByTagNameNS(types_1.NS.p, "grpSpPr");
    // Clear newSpTree and add group shape properties
    while (newSpTree.firstChild) {
        newSpTree.removeChild(newSpTree.firstChild);
    }
    if (nvGrpSpPr.length > 0) {
        newSpTree.appendChild(newSlideDoc.importNode(nvGrpSpPr[0], true));
    }
    if (grpSpPr.length > 0) {
        newSpTree.appendChild(newSlideDoc.importNode(grpSpPr[0], true));
    }
    // Build placeholder map for destination layout
    const destPlaceholderMap = new Map();
    for (const ph of destinationLayout.placeholders) {
        const key = `${ph.type}_${ph.idx}`;
        destPlaceholderMap.set(key, ph);
    }
    // Process each child of the source spTree
    const children = srcTree.childNodes;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.nodeType !== 1)
            continue; // skip non-element nodes
        const element = child;
        const localName = element.localName;
        // Skip nvGrpSpPr and grpSpPr — already handled
        if (localName === "nvGrpSpPr" || localName === "grpSpPr")
            continue;
        // Import the node into the new document
        const cloned = newSlideDoc.importNode(element, true);
        // Handle placeholder shapes
        if (localName === "sp") {
            const handled = handlePlaceholderShape(cloned, destPlaceholderMap, newSlideDoc);
            newSpTree.appendChild(handled);
        }
        else {
            // For all other shape types (pic, graphicFrame, grpSp, cxnSp), copy as-is
            newSpTree.appendChild(cloned);
        }
    }
    // Copy any elements outside spTree (like <p:transition>, <p:timing>, etc.)
    // but skip <p:bg> (background) — let the layout/master handle it
    const cSld = sourceDoc.getElementsByTagNameNS(types_1.NS.p, "cSld");
    if (cSld.length > 0) {
        const newCsld = newSlideDoc.getElementsByTagNameNS(types_1.NS.p, "cSld")[0];
        if (newCsld) {
            // Copy name attribute if present
            const nameAttr = cSld[0].getAttribute("name");
            if (nameAttr) {
                newCsld.setAttribute("name", nameAttr);
            }
        }
    }
    // Copy <p:transition> if present
    const transitions = sourceDoc.getElementsByTagNameNS(types_1.NS.p, "transition");
    if (transitions.length > 0) {
        const newSld = newSlideDoc.documentElement;
        newSld.appendChild(newSlideDoc.importNode(transitions[0], true));
    }
    // Copy <p:timing> if present
    const timings = sourceDoc.getElementsByTagNameNS(types_1.NS.p, "timing");
    if (timings.length > 0) {
        const newSld = newSlideDoc.documentElement;
        newSld.appendChild(newSlideDoc.importNode(timings[0], true));
    }
    // Preserve source slide color mapping so copied content keeps original colors.
    // Removing these nodes causes recoloring through destination theme slots.
    // Now handle relationship remapping
    const sourceSlideDir = sourceSlide.path.substring(0, sourceSlide.path.lastIndexOf("/"));
    // Collect existing rIds (will be populated as we create new ones)
    const destExistingRIds = new Set();
    // Create the layout relationship first
    const layoutRId = (0, mediaHandler_1.generateUniqueRId)(destExistingRIds);
    const { rIdMap, newRelationships, mediaFiles, chartFiles, embeddedFiles, } = await (0, mediaHandler_1.processSlideRelationships)(sourceZip, sourceSlide.relationships, sourceSlideDir, destExistingRIds, layoutRId);
    // Add layout relationship
    newRelationships.unshift({
        id: layoutRId,
        type: types_1.REL_TYPES.slideLayout,
        target: destLayoutRelTarget,
    });
    // Rewrite all rId references in the new slide XML
    const slideXmlStr = xmlSerializer.serializeToString(newSlideDoc);
    const rewrittenXml = rewriteRIds(slideXmlStr, rIdMap);
    // Build the rels XML
    const slideRelsXml = (0, mediaHandler_1.buildRelsXml)(newRelationships);
    return {
        slideXml: rewrittenXml,
        slideRelsXml,
        mediaFiles,
        chartFiles,
        embeddedFiles,
    };
}
/**
* Handle a <p:sp> element that may be a placeholder.
* If it has <p:ph>, try to map it to a destination layout placeholder.
*/
function handlePlaceholderShape(sp, destPlaceholderMap, doc) {
    // Check if this sp has a <p:ph> child (inside <p:nvSpPr> -> <p:nvPr>)
    const nvPr = sp.getElementsByTagNameNS(types_1.NS.p, "nvPr");
    if (nvPr.length === 0)
        return sp;
    const phElements = nvPr[0].getElementsByTagNameNS(types_1.NS.p, "ph");
    if (phElements.length === 0)
        return sp;
    const ph = phElements[0];
    const phType = ph.getAttribute("type") || "body";
    const phIdx = parseInt(ph.getAttribute("idx") || "0", 10);
    const key = `${phType}_${phIdx}`;
    // Also try matching by type only (idx=0 is common for title)
    const destPh = destPlaceholderMap.get(key) ||
        destPlaceholderMap.get(`${phType}_0`) ||
        findByType(destPlaceholderMap, phType);
    if (destPh) {
        // Match found: use destination placeholder's position/size,
        // but keep the source text content
        updateShapePosition(sp, destPh.x, destPh.y, destPh.cx, destPh.cy);
    }
    else {
        // No match: convert to freeform text box by removing the <p:ph> element
        const parent = ph.parentNode;
        if (parent)
            parent.removeChild(ph);
        // Make sure the shape has explicit position values
        // (it should already since we copied from source, but verify)
        ensureExplicitPosition(sp);
    }
    return sp;
}
/**
* Find a placeholder in the map matching by type (ignoring idx).
*/
function findByType(map, type) {
    for (const [, ph] of map) {
        if (ph.type === type)
            return ph;
    }
    return undefined;
}
/**
* Update the position (a:off) and extent (a:ext) of a shape element.
*/
function updateShapePosition(sp, x, y, cx, cy) {
    // Position lives inside <p:spPr> -> <a:xfrm> -> <a:off> and <a:ext>
    const spPr = sp.getElementsByTagNameNS(types_1.NS.p, "spPr");
    if (spPr.length === 0)
        return;
    let xfrm = spPr[0].getElementsByTagNameNS(types_1.NS.a, "xfrm");
    if (xfrm.length === 0) {
        // Create xfrm element
        const xfrmEl = sp.ownerDocument.createElementNS(types_1.NS.a, "a:xfrm");
        const offEl = sp.ownerDocument.createElementNS(types_1.NS.a, "a:off");
        offEl.setAttribute("x", x.toString());
        offEl.setAttribute("y", y.toString());
        const extEl = sp.ownerDocument.createElementNS(types_1.NS.a, "a:ext");
        extEl.setAttribute("cx", cx.toString());
        extEl.setAttribute("cy", cy.toString());
        xfrmEl.appendChild(offEl);
        xfrmEl.appendChild(extEl);
        spPr[0].insertBefore(xfrmEl, spPr[0].firstChild);
        return;
    }
    const off = xfrm[0].getElementsByTagNameNS(types_1.NS.a, "off");
    const ext = xfrm[0].getElementsByTagNameNS(types_1.NS.a, "ext");
    if (off.length > 0 && x > 0 && y > 0) {
        off[0].setAttribute("x", x.toString());
        off[0].setAttribute("y", y.toString());
    }
    if (ext.length > 0 && cx > 0 && cy > 0) {
        ext[0].setAttribute("cx", cx.toString());
        ext[0].setAttribute("cy", cy.toString());
    }
}
/**
* Ensure a shape has explicit position values (not inherited from layout).
* If a:off or a:ext is missing, this means the shape was relying on layout-level positioning.
* We leave it as-is since the source had these values.
*/
function ensureExplicitPosition(sp) {
    // Already in the XML from source — no action needed unless they're truly missing
    const spPr = sp.getElementsByTagNameNS(types_1.NS.p, "spPr");
    if (spPr.length === 0)
        return;
    const xfrm = spPr[0].getElementsByTagNameNS(types_1.NS.a, "xfrm");
    if (xfrm.length === 0) {
        // No transform at all — shape will be invisible. Add a default.
        console.warn("[WARN] Shape converted from placeholder has no explicit position — may appear at (0,0)");
    }
}
/**
* Rewrite all rId references in an XML string using the provided mapping.
*/
function rewriteRIds(xml, rIdMap) {
    let result = xml;
    // Sort by rId length (longest first) to avoid partial replacements
    // e.g., rId10 should be replaced before rId1
    const sortedEntries = Array.from(rIdMap.entries()).sort((a, b) => b[0].length - a[0].length);
    for (const [oldRId, newRId] of sortedEntries) {
        if (oldRId === newRId)
            continue;
        // Replace in attribute values: r:embed="rId1", r:link="rId2", r:id="rId3"
        // Use word boundary-aware replacement
        const escapedOld = escapeRegex(oldRId);
        // Match rId in attribute values — surrounded by quotes or as exact token
        const pattern = new RegExp(`"${escapedOld}"`, "g");
        result = result.replace(pattern, `"${newRId}"`);
    }
    return result;
}
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
* Create a blank slide XML document.
*/
function createBlankSlideDoc() {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
      xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
      xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
 <p:cSld>
   <p:spTree>
     <p:nvGrpSpPr>
       <p:cNvPr id="1" name=""/>
       <p:cNvGrpSpPr/>
       <p:nvPr/>
     </p:nvGrpSpPr>
     <p:grpSpPr>
       <a:xfrm>
         <a:off x="0" y="0"/>
         <a:ext cx="0" cy="0"/>
         <a:chOff x="0" y="0"/>
         <a:chExt cx="0" cy="0"/>
       </a:xfrm>
     </p:grpSpPr>
   </p:spTree>
 </p:cSld>
</p:sld>`;
    return domParser.parseFromString(xml, "text/xml");
}
/**
* Get or create the <p:spTree> element in a slide document.
*/
function getOrCreateSpTree(doc) {
    const spTree = doc.getElementsByTagNameNS(types_1.NS.p, "spTree");
    if (spTree.length > 0)
        return spTree[0];
    const cSld = doc.getElementsByTagNameNS(types_1.NS.p, "cSld");
    if (cSld.length === 0) {
        throw new Error("Invalid slide document: no <p:cSld> found");
    }
    const tree = doc.createElementNS(types_1.NS.p, "p:spTree");
    cSld[0].appendChild(tree);
    return tree;
}
//# sourceMappingURL=transferrer.js.map