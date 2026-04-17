import { ParsedPresentation, LayoutMapping, MigrationSummary } from "./types";
/**
* Build the final migrated .pptx by:
*  1. Removing existing slides from the destination template
*  2. Transferring each source slide
*  3. Updating [Content_Types].xml and presentation.xml.rels
*  4. Validating the result
*/
export declare function buildMigratedPresentation(source: ParsedPresentation, destination: ParsedPresentation, mappings: LayoutMapping[]): Promise<{
    buffer: Buffer;
    summary: MigrationSummary;
}>;
//# sourceMappingURL=builder.d.ts.map