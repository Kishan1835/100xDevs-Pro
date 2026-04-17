import JSZip from "jszip";
import { Relationship, MediaFile, ChartFile } from "./types";
/**
* Reset counters (call before starting a migration).
*/
export declare function resetCounters(): void;
/**
* Initialize counters based on existing files in the destination ZIP to avoid collisions.
*/
export declare function initCounters(destZip: JSZip): void;
/**
* Generate a new unique rId that doesn't collide with existing relationship IDs.
*/
export declare function generateUniqueRId(existingRIds: Set<string>, prefix?: string): string;
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
export declare function processSlideRelationships(sourceZip: JSZip, sourceSlideRels: Map<string, Relationship>, sourceSlideDir: string, // e.g., "ppt/slides"
destExistingRIds: Set<string>, layoutRelId: string): Promise<{
    rIdMap: Map<string, string>;
    newRelationships: Relationship[];
    mediaFiles: MediaFile[];
    chartFiles: ChartFile[];
    embeddedFiles: {
        sourcePath: string;
        destPath: string;
        contentType: string;
    }[];
}>;
/**
* Build a .rels XML string from an array of relationships.
*/
export declare function buildRelsXml(relationships: Relationship[]): string;
/**
* Copy media/chart/embedded files from source ZIP to destination ZIP.
*/
export declare function copyFilesToDestZip(sourceZip: JSZip, destZip: JSZip, mediaFiles: MediaFile[], chartFiles: ChartFile[], embeddedFiles: {
    sourcePath: string;
    destPath: string;
    contentType: string;
}[]): Promise<{
    copiedMedia: number;
    copiedCharts: number;
}>;
//# sourceMappingURL=mediaHandler.d.ts.map