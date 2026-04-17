"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTENT_TYPES = exports.REL_TYPES = exports.NS = void 0;
/**
* OOXML namespace constants.
*/
exports.NS = {
    a: "http://schemas.openxmlformats.org/drawingml/2006/main",
    r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    p: "http://schemas.openxmlformats.org/presentationml/2006/main",
    ct: "http://schemas.openxmlformats.org/package/2006/content-types",
    rel: "http://schemas.openxmlformats.org/package/2006/relationships",
};
/**
* OOXML relationship type URIs.
*/
exports.REL_TYPES = {
    slide: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide",
    slideLayout: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout",
    slideMaster: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster",
    theme: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
    image: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
    chart: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
    notesSlide: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide",
    oleObject: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject",
    package: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/package",
    hyperlink: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
    vmlDrawing: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
};
/**
* Content type constants.
*/
exports.CONTENT_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".emf": "image/x-emf",
    ".wmf": "image/x-wmf",
    ".svg": "image/svg+xml",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".bin": "application/vnd.openxmlformats-officedocument.oleObject",
};
//# sourceMappingURL=types.js.map