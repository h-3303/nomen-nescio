# Changelog

## 2026-09-10 (later)

### Scroll smoothness
- Sections (`data-plx`) and the three strata are now moved by the compositor with CSS
  scroll-driven animations on `translate` (`src/statues/scrollfx.ts`); the JS path remains as
  a fallback and no longer reads layout per element or repaints the strata.
- The WebGL figures follow a damped scroll position (80 ms time constant) so uneven frame timing
  reads as motion rather than jumps.
- Renderer pixel ratio capped at 1.5, `powerPreference: high-performance`.
- The sheet clips with `overflow: clip` and the page clips at `html`, so no ancestor is a
  scroll container. The studio plate and colophon keep their design rotations (the old
  `transform` write had been overriding them).

## 2026-09-10

### Documentation and tooling
- `docs/`: architecture, statue field, design-system port, content editing, models, deploy,
  handoff provenance.
- `tools/models/`: the USDZ to GLB pipeline (extract in headless Chromium, optimise with
  gltf-transform + meshoptimizer); the shipped models are its output.
- `tools/verify/`: headless screenshot and motion checks.

### Photocopy strata (from `Experiment 2.dc.html`, `statues.js` v31)
- Smoke clouds and the continuous render loop removed.
- Halftone dot-grid plates (0.12 x scroll) and 45 degree hatch scraps (0.55 x scroll) drift in
  front of the statues behind the sheet; toner flecks (1.28 x scroll) in front of the sheet.
- `shadowDepth` dial (0 to 1) drives key/fill/hemisphere/environment intensity, shadow camera
  extent, fog reach and the canvas contrast curve. Default 0.
- Chalk material: bump 0.006, environment intensity 0.12.

### First build (from `Experiment.dc.html`)
- Vite 8 + React 19 + TypeScript, static output on Vercel.
- Death to the World design system ported 1:1; 22 fonts vendored.
- Four USDZ scans converted to ~1 MB meshopt GLBs; three.js statue field with scroll parallax
  and `data-plx` foreground drift.
- Work list with the sliding black underside; phone layout; reduced-motion and no-WebGL
  fallbacks.
