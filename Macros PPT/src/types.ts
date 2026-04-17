import JSZip from "jszip";

/**
* Represents a parsed relationship entry from a .rels file.
*/
export interface Relationship {
 id: string;
 type: string;
 target: string;
 targetMode?: string; // "External" for hyperlinks, etc.
}

/**
* A placeholder element found in a slide layout.
*/
export interface Placeholder {
 type: string; // title | body | ctrTitle | subTitle | dt | ftr | sldNum | pic | tbl | chart | obj
 idx: number;
 x: number;
 y: number;
 cx: number;
 cy: number;
}

/**
* Parsed representation of a single slide.
*/
export interface ParsedSlide {
 index: number; // 1-based slide number
 path: string; // e.g., "ppt/slides/slide1.xml"
 relsPath: string; // e.g., "ppt/slides/_rels/slide1.xml.rels"
 xml: string; // raw slide XML
 relsXml: string; // raw .rels XML
 relationships: Map<string, Relationship>; // rId -> Relationship
 layoutRef: string; // relative path from slide .rels to the layout, resolved to ZIP path
 layoutResolvedPath: string; // absolute ZIP path like "ppt/slideLayouts/slideLayout1.xml"
 notesSlidePath?: string; // if notes exist
}

/**
* Parsed representation of a slide layout in the destination template.
*/
export interface SlideLayout {
 name: string; // layout name from <p:cSld name="...">
 type: string; // layout type from <p:sldLayoutIdLst> if available
 path: string; // ZIP path
 xml: string;
 placeholders: Placeholder[];
 relsXml: string;
 relationships: Map<string, Relationship>;
}

/**
* Parsed slide master.
*/
export interface SlideMaster {
 path: string;
 xml: string;
 relsXml: string;
 relationships: Map<string, Relationship>;
 layoutPaths: string[]; // which layouts belong to this master
}

/**
* Top-level parsed representation of a .pptx file.
*/
export interface ParsedPresentation {
 zip: JSZip;
 slides: ParsedSlide[];
 slideLayouts: SlideLayout[];
 slideMasters: SlideMaster[];
 theme: string; // raw theme XML
 themePath: string;
 presentationXml: string;
 presentationRelsXml: string;
 contentTypesXml: string;
}

/**
* Mapping result: source slide -> destination layout.
*/
export interface LayoutMapping {
 sourceSlide: ParsedSlide;
 destinationLayout: SlideLayout;
 matchType: "exact-name" | "placeholder-count" | "blank-fallback";
}

/**
* Media file descriptor for transfer.
*/
export interface MediaFile {
 sourcePath: string; // ZIP path in source
 destPath: string; // ZIP path in destination
 contentType: string;
}

/**
* Chart descriptor for transfer.
*/
export interface ChartFile {
 sourcePath: string;
 destPath: string;
 sourceRelsPath: string;
 destRelsPath: string;
 embeddedFiles: { sourcePath: string; destPath: string }[];
}

/**
* Result of transferring a single slide's content.
*/
export interface TransferResult {
 slideXml: string;
 slideRelsXml: string;
 mediaFiles: MediaFile[];
 chartFiles: ChartFile[];
 embeddedFiles: { sourcePath: string; destPath: string; contentType: string }[];
}

/**
* Summary stats for the migration.
*/
export interface MigrationSummary {
 slidesTransferred: number;
 slidesSkipped: number;
 mediaFilesCopied: number;
 chartsCopied: number;
 warnings: string[];
}

/**
* OOXML namespace constants.
*/
export const NS = {
 a: "http://schemas.openxmlformats.org/drawingml/2006/main",
 r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
 p: "http://schemas.openxmlformats.org/presentationml/2006/main",
 ct: "http://schemas.openxmlformats.org/package/2006/content-types",
 rel: "http://schemas.openxmlformats.org/package/2006/relationships",
} as const;

/**
* OOXML relationship type URIs.
*/
export const REL_TYPES = {
 slide:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide",
 slideLayout:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout",
 slideMaster:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster",
 theme:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
 image:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
 chart:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
 notesSlide:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide",
 oleObject:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject",
 package:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/package",
 hyperlink:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
 vmlDrawing:
   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
} as const;

/**
* Content type constants.
*/
export const CONTENT_TYPES: Record<string, string> = {
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