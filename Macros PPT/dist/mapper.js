"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapLayouts = mapLayouts;
const types_1 = require("./types");
const xmldom_1 = require("xmldom");
const types_2 = require("./types");
const domParser = new xmldom_1.DOMParser();
/**
* For each source slide, find the best-matching layout in the destination template.
*
* Strategy:
* 1. Try exact match by layout name (compare source slide's layout name to dest layout names)
* 2. Try match by placeholder count similarity
* 3. Fallback to "Blank" layout or first available layout
*/
function mapLayouts(source, destination, sourceSlides) {
    const destLayouts = destination.slideLayouts;
    const basePreferredLayouts = destLayouts.filter((l) => !isDividerLayoutName(l.name) && !isClosingLayoutName(l.name));
    const candidateLayouts = basePreferredLayouts.length > 0 ? basePreferredLayouts : destLayouts;
    const sourceLayoutCache = new Map();
    let fallbackCursor = 0;
    const mappings = [];
    for (const slide of sourceSlides) {
        const prefersWhiteCanvas = slideNeedsWhiteCanvas(slide);
        const isFirstSlide = slide.index === 1;
        const nonFrontMatterLayouts = isFirstSlide
            ? candidateLayouts
            : candidateLayouts.filter((l) => !isFrontMatterLayoutName(l.name));
        const perSlideCandidates = prefersWhiteCanvas
            ? nonFrontMatterLayouts
            : nonFrontMatterLayouts.filter((l) => !isWhiteCanvasLayoutName(l.name));
        const activeCandidates = perSlideCandidates.length > 0
            ? perSlideCandidates
            : nonFrontMatterLayouts.length > 0
                ? nonFrontMatterLayouts
                : candidateLayouts;
        let bestMatch = null;
        let matchType = "blank-fallback";
        // Get source slide's layout info
        const sourceLayout = getSourceSlideLayout(source, slide, sourceLayoutCache);
        const sourceLayoutName = sourceLayout?.name?.toLowerCase().trim() || "";
        const sourcePlaceholders = sourceLayout?.placeholders || [];
        // Strategy 1: Exact name match
        if (sourceLayoutName) {
            bestMatch =
                activeCandidates.find((dl) => dl.name.toLowerCase().trim() === sourceLayoutName) || null;
            if (bestMatch) {
                matchType = "exact-name";
            }
        }
        // Strategy 1b: Partial name match (e.g., "Title Slide" matches "Title Slide")
        if (!bestMatch && sourceLayoutName) {
            bestMatch =
                activeCandidates.find((dl) => dl.name.toLowerCase().trim().includes(sourceLayoutName) ||
                    sourceLayoutName.includes(dl.name.toLowerCase().trim())) || null;
            if (bestMatch) {
                matchType = "exact-name";
            }
        }
        // Strategy 2: Match by placeholder types
        if (!bestMatch && sourcePlaceholders.length > 0) {
            const sourcePhTypes = new Set(sourcePlaceholders.map((p) => p.type));
            const sourceHasImages = slideHasImages(slide);
            let bestScore = -1;
            for (const dl of activeCandidates) {
                const destPhTypes = new Set(dl.placeholders.map((p) => p.type));
                // Count matching placeholder types
                let score = 0;
                for (const t of sourcePhTypes) {
                    if (destPhTypes.has(t))
                        score++;
                }
                // Penalize extra placeholders in dest
                const extraInDest = dl.placeholders.length - score;
                let adjustedScore = score - extraInDest * 0.1;
                if (sourceHasImages && isImageFriendlyLayout(dl)) {
                    adjustedScore += 1.5;
                }
                if (adjustedScore > bestScore) {
                    bestScore = adjustedScore;
                    bestMatch = dl;
                    matchType = "placeholder-count";
                }
            }
            // Only accept if at least one placeholder matched
            if (bestScore <= 0) {
                bestMatch = null;
            }
        }
        // Strategy 3: Fallback
        if (!bestMatch) {
            bestMatch =
                pickRotatingFallbackLayout(activeCandidates, fallbackCursor) ||
                    activeCandidates[0] ||
                    destLayouts[0] ||
                    null;
            fallbackCursor++;
            matchType = "blank-fallback";
            if (!bestMatch) {
                console.error(`[ERROR] No layouts available in destination template for slide ${slide.index}`);
                // Use first layout anyway
                bestMatch = destLayouts[0];
            }
            console.warn(`[WARN] Slide ${slide.index}: No matching layout found, using "${bestMatch?.name || "unknown"}" as fallback`);
        }
        if (bestMatch) {
            mappings.push({
                sourceSlide: slide,
                destinationLayout: bestMatch,
                matchType,
            });
        }
    }
    return mappings;
}
/**
* Find a "Blank" layout in the destination's layouts.
*/
function findBlankLayout(layouts) {
    // Try exact match first
    const blank = layouts.find((l) => l.name.toLowerCase().trim() === "blank");
    if (blank)
        return blank;
    // Try contains match
    const blankish = layouts.find((l) => l.name.toLowerCase().includes("blank"));
    if (blankish)
        return blankish;
    // Find layout with fewest placeholders
    if (layouts.length > 0) {
        return layouts.reduce((min, l) => l.placeholders.length < min.placeholders.length ? l : min);
    }
    return null;
}
/**
* Get the layout used by a source slide (from the source presentation's parsed layouts).
*/
function getSourceSlideLayout(source, slide, cache) {
    const layoutPath = slide.layoutResolvedPath;
    if (!layoutPath)
        return null;
    if (cache.has(layoutPath)) {
        return cache.get(layoutPath);
    }
    const layout = source.slideLayouts.find((l) => l.path === layoutPath) || null;
    cache.set(layoutPath, layout);
    return layout;
}
function isDividerLayoutName(name) {
    const n = name.toLowerCase();
    return (n.includes("divider") ||
        n.includes("separator") ||
        n.includes("seperator"));
}
function isClosingLayoutName(name) {
    const n = name.toLowerCase();
    return (n.includes("thank you") ||
        n.includes("thankyou") ||
        n.includes("thanks") ||
        n.includes("closing") ||
        n.includes("end slide") ||
        n === "end");
}
function slideHasImages(slide) {
    for (const [, rel] of slide.relationships) {
        if (rel.type === types_1.REL_TYPES.image)
            return true;
    }
    return false;
}
function isImageFriendlyLayout(layout) {
    const types = new Set(layout.placeholders.map((p) => p.type.toLowerCase()));
    return (types.has("pic") ||
        types.has("obj") ||
        types.has("chart") ||
        layout.name.toLowerCase().includes("picture") ||
        layout.name.toLowerCase().includes("photo") ||
        layout.name.toLowerCase().includes("image"));
}
function isWhiteCanvasLayoutName(name) {
    const n = name.toLowerCase();
    return n.includes("white canvas") || n === "canvas";
}
function isFrontMatterLayoutName(name) {
    const n = name.toLowerCase();
    return (n.includes("cover") ||
        n.includes("title slide") ||
        n === "title" ||
        n.includes("statement") ||
        n.includes("agenda") ||
        n.includes("intro"));
}
function pickRotatingFallbackLayout(layouts, cursor) {
    if (layouts.length === 0)
        return null;
    const preferred = layouts.filter((l) => !isWhiteCanvasLayoutName(l.name) && !isFrontMatterLayoutName(l.name));
    const pool = preferred.length > 0 ? preferred : layouts;
    return pool[cursor % pool.length] || null;
}
function slideNeedsWhiteCanvas(slide) {
    const doc = domParser.parseFromString(slide.xml, "text/xml");
    const slideArea = 9144000 * 6858000; // default 16:9 EMU area
    const largeVisualRatio = 0.24;
    let hasLargePicture = false;
    const pics = doc.getElementsByTagNameNS(types_2.NS.p, "pic");
    for (let i = 0; i < pics.length; i++) {
        const pic = pics[i];
        const ext = pic.getElementsByTagNameNS(types_2.NS.a, "ext");
        if (ext.length === 0)
            continue;
        const cx = parseInt(ext[0].getAttribute("cx") || "0", 10);
        const cy = parseInt(ext[0].getAttribute("cy") || "0", 10);
        if (cx > 0 && cy > 0 && (cx * cy) / slideArea >= largeVisualRatio) {
            hasLargePicture = true;
            break;
        }
    }
    let hasLargeChart = false;
    const frames = doc.getElementsByTagNameNS(types_2.NS.p, "graphicFrame");
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const ext = frame.getElementsByTagNameNS(types_2.NS.a, "ext");
        if (ext.length === 0)
            continue;
        const cx = parseInt(ext[0].getAttribute("cx") || "0", 10);
        const cy = parseInt(ext[0].getAttribute("cy") || "0", 10);
        const hasChartRef = frame.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/chart", "chart").length > 0;
        if (hasChartRef && cx > 0 && cy > 0 && (cx * cy) / slideArea >= largeVisualRatio) {
            hasLargeChart = true;
            break;
        }
    }
    return hasLargePicture || hasLargeChart;
}
//# sourceMappingURL=mapper.js.map