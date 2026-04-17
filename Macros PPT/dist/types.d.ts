import JSZip from "jszip";
/**
* Represents a parsed relationship entry from a .rels file.
*/
export interface Relationship {
    id: string;
    type: string;
    target: string;
    targetMode?: string;
}
/**
* A placeholder element found in a slide layout.
*/
export interface Placeholder {
    type: string;
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
    index: number;
    path: string;
    relsPath: string;
    xml: string;
    relsXml: string;
    relationships: Map<string, Relationship>;
    layoutRef: string;
    layoutResolvedPath: string;
    notesSlidePath?: string;
}
/**
* Parsed representation of a slide layout in the destination template.
*/
export interface SlideLayout {
    name: string;
    type: string;
    path: string;
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
    layoutPaths: string[];
}
/**
* Top-level parsed representation of a .pptx file.
*/
export interface ParsedPresentation {
    zip: JSZip;
    slides: ParsedSlide[];
    slideLayouts: SlideLayout[];
    slideMasters: SlideMaster[];
    theme: string;
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
    sourcePath: string;
    destPath: string;
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
    embeddedFiles: {
        sourcePath: string;
        destPath: string;
    }[];
}
/**
* Result of transferring a single slide's content.
*/
export interface TransferResult {
    slideXml: string;
    slideRelsXml: string;
    mediaFiles: MediaFile[];
    chartFiles: ChartFile[];
    embeddedFiles: {
        sourcePath: string;
        destPath: string;
        contentType: string;
    }[];
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
export declare const NS: {
    readonly a: "http://schemas.openxmlformats.org/drawingml/2006/main";
    readonly r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    readonly p: "http://schemas.openxmlformats.org/presentationml/2006/main";
    readonly ct: "http://schemas.openxmlformats.org/package/2006/content-types";
    readonly rel: "http://schemas.openxmlformats.org/package/2006/relationships";
};
/**
* OOXML relationship type URIs.
*/
export declare const REL_TYPES: {
    readonly slide: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide";
    readonly slideLayout: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout";
    readonly slideMaster: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster";
    readonly theme: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme";
    readonly image: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";
    readonly chart: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart";
    readonly notesSlide: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide";
    readonly oleObject: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject";
    readonly package: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/package";
    readonly hyperlink: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink";
    readonly vmlDrawing: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing";
};
/**
* Content type constants.
*/
export declare const CONTENT_TYPES: Record<string, string>;
//# sourceMappingURL=types.d.ts.map