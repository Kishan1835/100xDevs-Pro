import JSZip from "jszip";
import { ParsedPresentation, Placeholder, Relationship } from "./types";
/**
* Parse a .pptx file from a Buffer into our internal representation.
*/
export declare function parsePresentation(buffer: Buffer): Promise<ParsedPresentation>;
/**
* Extract placeholder definitions from a layout or slide XML document.
*/
export declare function extractPlaceholders(doc: Document): Placeholder[];
/**
* Parse a .rels XML string into a Map of rId -> Relationship.
*/
export declare function parseRelationships(relsXml: string): Map<string, Relationship>;
/**
* Resolve a relative relationship target path against the source file's directory.
* e.g., resolveRelPath("ppt/slides/slide1.xml", "../slideLayouts/slideLayout1.xml")
*       -> "ppt/slideLayouts/slideLayout1.xml"
*/
export declare function resolveRelPath(sourceFilePath: string, relativeTarget: string): string;
/**
* Read a file from the ZIP as a UTF-8 string. Throws if not found.
*/
export declare function readZipFile(zip: JSZip, path: string): Promise<string>;
/**
* Read a file from the ZIP as a binary Buffer. Returns null if not found.
*/
export declare function readZipBinary(zip: JSZip, path: string): Promise<Buffer | null>;
/**
* Serialize an XML Document back to string.
*/
export declare function serializeXml(doc: Document): string;
//# sourceMappingURL=parser.d.ts.map