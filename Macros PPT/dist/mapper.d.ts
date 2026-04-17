import { ParsedSlide, LayoutMapping, ParsedPresentation } from "./types";
/**
* For each source slide, find the best-matching layout in the destination template.
*
* Strategy:
* 1. Try exact match by layout name (compare source slide's layout name to dest layout names)
* 2. Try match by placeholder count similarity
* 3. Fallback to "Blank" layout or first available layout
*/
export declare function mapLayouts(source: ParsedPresentation, destination: ParsedPresentation, sourceSlides: ParsedSlide[]): LayoutMapping[];
//# sourceMappingURL=mapper.d.ts.map