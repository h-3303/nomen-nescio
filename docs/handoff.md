# Design handoff and provenance

## Source

Claude Design project **Portfolio site with 3D statues**
(`claude.ai/design/p/1c227270-0ef4-48d3-bcc8-7352fb141f35`). The project contains several
sheets; the site implements:

- `Experiment.dc.html`: the page structure, copy, section spacing, mobile rules and the focus
  interaction. Implemented as the first commit.
- `Experiment 2.dc.html` with `statues.js` v31: the same page with the `shadowDepth` prop and
  a rewritten statue field. Implemented in the second commit.
- `_ds/death-to-the-world-design-system-…/`: the design system (tokens, component CSS, fonts,
  compiled component bundle, readme). Ported into `src/dtw` and `src/styles`.
- `uploads/*.usdz`: the four statue scans, converted (see models.md).

The design's own `dust.js`, `Dust Experiments`, `Focus State Ideas` and `Portfolio` sheets are
earlier explorations and were not implemented.

## How the prototype maps to the build

| Prototype construct | Build |
| --- | --- |
| `<x-import component-from-global-scope="…Sheet" …>` | The matching component from `src/dtw` with the same props |
| `sc-if` / `sc-for` | JSX conditionals and `WORKS.map` |
| `data-props` editor props (`showStatues`, `shadowDepth`, `workLayout`, `showNotes`) | Props of `App` with the same defaults |
| `style-hover` / `style-active` on the back button | `.back-btn:hover` / `:active` in `page.css` |
| `<statue-field>` custom element | `StatueField` React component + `createStatueField` |
| `hint-size` attributes | Editor-only; dropped |
| `<helmet><style>` | `src/styles/page.css` |

## Deliberate deviations

- **Strata order.** In `statues.js` v31 the dot plates are inserted before the canvas (behind
  the statues) and the hatch after it. Per the brief, the dot plates sit in front of the
  statues here. Because the figures multiply onto the paper, the visual difference is slight.
- **The back button** is a real `<button>` with reset styling rather than a clickable `div`,
  for keyboard access. Its look is identical.
- **Work rows** keep the prototype's `<a href="#">` with `preventDefault` so they are
  focusable and keyboard-activatable.
- **Models** are GLB rather than USDZ, loaded with `GLTFLoader` instead of `USDZLoader`. The
  prototype's bounding-box "fix" for flaky USDZ boxes is unnecessary because the GLBs are
  normalised at build time.
- **`preserveDrawingBuffer`** is off (the prototype needed it for editor screenshots).
- **Smoke clouds** from the first `statues.js` were replaced by the strata when the design
  moved to v31; none of the cloud code remains.
- **Cache headers and font preloads** are production additions with no design impact.

## Assets not used

`uploads/105.FA.usdz`, `uploads/Nike_of_Samothrace.usdz` and the loose texture JPEGs are in
the design project but not referenced by v31 and are not in this repository.
