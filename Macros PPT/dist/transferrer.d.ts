import { LayoutMapping, TransferResult } from "./types";
import JSZip from "jszip";
/**
* Transfer content from a source slide into a new slide based on the destination layout.
*
* This is the core function: it clones the source shape tree, remaps rIds,
* maps placeholders, and produces the new slide XML + rels.
*/
export declare function transferSlide(sourceZip: JSZip, mapping: LayoutMapping, destSlideNumber: number, destLayoutRelTarget: string): Promise<TransferResult>;
//# sourceMappingURL=transferrer.d.ts.map