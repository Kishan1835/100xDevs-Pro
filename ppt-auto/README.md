# pptx-transfer

Transfer content from one PowerPoint presentation into another with a **different theme**, without losing either the source content or the destination design.

```
node index.js --source slides.pptx --dest template.pptx --output result.pptx --verbose
```

---

## Library Recommendation & Why

### ✅ Chosen: JSZip + xml2js (direct OOXML manipulation)

A `.pptx` file is a ZIP archive containing XML files (the Open Office XML / OOXML standard). We manipulate that XML directly.

| Library | Read? | Write? | Theme-aware? | Notes |
|---|---|---|---|---|
| **JSZip + xml2js** ✅ | ✓ | ✓ | ✓ | Full OOXML access; this project's approach |
| PptxGenJS | ✗ | ✓ | ✗ | **Write-only** — cannot read existing files |
| Office.js | ✓ | ✓ | ✓ | Requires a running Office host (add-in only) |
| node-pptx | Partial | ✓ | ✗ | Abandoned; limited shape support |
| python-pptx | ✓ | ✓ | ✓ | Python only; best option if language is flexible |

**PptxGenJS is not used** because it generates PPTX from scratch and has no API for reading or parsing existing presentations — which is the core requirement here.

---

## Architecture

```
index.js                  ← CLI entry point / pipeline orchestrator
src/
  utils.js                ← EMU math, PPTX I/O, XML helpers, whitespace engine
  extractor.js            ← Read source slides → structured element tree
  mapper.js               ← Score & match source slides to destination slides
  injector.js             ← Write elements into destination with collision avoidance
test.js                   ← Unit tests for geometry, scoring, and mapping
```

### Pipeline

```
Source PPTX                 Destination PPTX
     │                            │
     ▼                            ▼
 extractSource()          analyzeDestination()
     │                            │
     └──────────┬─────────────────┘
                ▼
           mapSlides()
          (scoring engine)
                │
                ▼
          applyMappings()
          (injector + image transfer)
                │
                ▼
           Output PPTX
```

---

## How Whitespace Detection Works

### EMU Grid Scan

PowerPoint uses **EMU (English Metric Units)** for all coordinates: 1 inch = 914,400 EMU. The detector divides each slide into a **20×15 grid** of cells and marks cells as occupied based on existing shape bounding boxes.

```
Slide (12,192,000 × 6,858,000 EMU)
┌─────────────────────────────────────┐
│ M │ M │ M │   │   │ ░░░░░ │   │   │  ← M = margin (0.5" = 457,200 EMU)
│ M │   │   │   │ ████████ │   │   │  ← ░ = occupied cell
│ M │   │   │   │   │   │   │   │   │
│ M │   │   │   │   │   │   │   │   │
│ M │ M │ M │   │   │   │   │ M │ M │
└─────────────────────────────────────┘
```

A **sliding window** of the required size scans for free rectangles. Candidates are scored by:
1. Amount of free space surrounding the placement (breathing room)
2. Proximity to top-left (natural reading order)

### Quadrant Analysis

Each slide is divided into 4 quadrants (TL/TR/BL/BR) with independent free-area ratios. This helps the mapper quickly identify which half of a slide is available without a full grid scan.

---

## Slide Mapping Strategy

The mapper scores every `(source slide, destination slide)` pair using a weighted heuristic:

| Factor | Weight | Rationale |
|---|---|---|
| Free area ratio | ×40 | Primary signal — enough room to add content |
| Busyness penalty | −0.2× | Too many existing shapes = visual conflict risk |
| Empty/blank bonus | +20 | Blank slides are ideal canvases |
| Image → blank/pic-placeholder | +25/+15 | Images clash with busy backgrounds |
| Text → body placeholder | +35 | Semantic placement matches layout intent |
| Placeholder count | +12 | More placeholders = more structured space |
| Busy background + image | −10 | Would create visual chaos |
| Max free quadrant | ×15 | Ensures at least one clear area exists |
| Already-used slide | −50 | Prefer unused destinations |

Assignment is **greedy** (best score first), respecting a "used" set to avoid mapping multiple source slides to the same destination. If source slides outnumber destination slides, slides are reused.

### Strategies

| Strategy | Triggered When | Behavior |
|---|---|---|
| `fill-blank` | Destination is empty, source has image | Place image to fill available area |
| `use-placeholder` | Destination has body placeholder, source is text-heavy | Inject into placeholder's coordinates |
| `place-in-whitespace` | Moderate free space | Run grid-scan to find open rectangle |
| `best-effort` | Fallback | Scale source coordinates, clamp to margins |

---

## Theme Mismatch Handling

### What can conflict

| Source element | Potential conflict | Solution |
|---|---|---|
| Text color | Clashes with destination background | Strip `a:solidFill` from runs → inherits theme color |
| Shape fill | Wrong brand color | Replace with `a:schemeClr val="accent1"` (theme-relative) |
| Fonts | Not installed in destination | Font fallback is handled by PowerPoint at open time |
| Images | Background color assumptions | Scale + place; let destination background show through |
| Charts | Embedded colors | Chart colors reference theme slots; re-theme automatically |

### Color neutralization

When injecting text boxes, run-level colors are **intentionally omitted**:
```javascript
// Source run: { text: "Hello", color: "FF0000" }
// Injected as:
{ 'a:rPr': [{ $: { lang: 'en-US', dirty: '0' } }], 'a:t': [{ _: 'Hello' }] }
// → PowerPoint applies destination theme color automatically
```

Shapes are recolored to `accent1` with a luminance modifier, so they match the destination palette regardless of source colors.

---

## Content That Doesn't Fit

Overflow is handled in layers:

1. **Scale first**: Source coordinates are proportionally scaled from source to destination dimensions.
2. **Clamp to margins**: If the scaled box still exceeds the slide, it's clamped at 0.5" margins.
3. **Whitespace search**: If the scaled position collides with existing elements, the grid scanner finds the best free rectangle.
4. **Warn and skip**: If no placement is found (fully packed slide), a warning is logged and the element is skipped rather than overlapping.

---

## Installation & Usage

```bash
# Install dependencies
npm install

# Basic usage
node index.js --source source.pptx --dest destination.pptx --output result.pptx

# With verbose output (shows scoring, busyness, placement details)
node index.js -s source.pptx -d dest.pptx -o result.pptx --verbose

# Run tests
npm test
```

### Example verbose output

```
► Step 3: Analyzing destination slides…
  ✓ Analyzed 8 destination slides
    Slide 1: busyness=5  free=92% empty=true  hasBodyPh=false hasPicPh=false
    Slide 2: busyness=45 free=61% empty=false hasBodyPh=true  hasPicPh=false
    Slide 3: busyness=80 free=18% empty=false hasBodyPh=false hasPicPh=false

► Step 4: Computing slide mapping…
  Src 1 [text, text] → Dest slide 2 (busyness=45, free=61%) [use-placeholder]
  Src 2 [image]      → Dest slide 1 (busyness=5,  free=92%) [fill-blank]
  Src 3 [chart]      → Dest slide 2 (busyness=45, free=61%) [place-in-whitespace]
```

---

## Key Technical Notes

### OOXML shape ID uniqueness

Each shape in a slide requires a unique numeric `id` in its `p:cNvPr` element. The injector scans all existing IDs in the destination slide and starts new shapes above the current maximum to avoid conflicts.

### Image transfer

Images are:
1. Read as base64 from the source zip's `ppt/media/` directory
2. Written to the destination zip's `ppt/media/` with a unique name
3. Registered in the destination slide's `.rels` file with a new `rId`
4. Registered in `[Content_Types].xml` if the extension is new

### Relationship file management

Each slide has a companion `ppt/slides/_rels/slideN.xml.rels` file that maps `r:id` references (e.g., `rId3`) to actual targets. The injector correctly updates this file when adding images or linked content.

---

## Limitations

- **Animations**: Slide transitions and animations are not preserved (they reference shape IDs which may change).
- **Linked charts**: Charts with external data links need the source data files copied separately.
- **Embedded fonts**: Non-standard fonts must be present on the system opening the output file.
- **Master slide overrides**: Some design elements are defined in the slide master/layout, not the slide itself. These are correctly preserved since we keep the destination's master intact.
