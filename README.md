# Nomen Nescio — one sheet

A single-page portfolio set in the *Death to the World* design language: toner black on
photocopied paper, six type voices, hard-edged paste-up devices, nothing centered by machine.
Four marble figures stand behind the sheet and drift with the scroll.

Built from the Claude Design handoff (`Experiment.dc.html`) and deployed on Vercel.

## Stack

- **Vite 8 + React 19 + TypeScript.** Static output, no server.
- **Design system** — `src/dtw/` is a 1:1 TypeScript port of the `@dtw/react` components
  (identical class names, props and defaults); `src/styles/` carries the tokens, component
  CSS and the 22 vendored OFL webfonts verbatim.
- **Statues** — `src/statues/` renders four photogrammetry scans with three.js: a shared
  procedural chalk material, a hard key light with self-shadow, paper-coloured fog, and a
  scroll-anchored parallax per figure. Three photocopy strata drift at their own rates:
  halftone dot-grid plates and 45° hatch scraps pasted in front of the figures, toner flecks
  in front of the sheet. Elements marked `data-plx` drift too. The scene only redraws on
  scroll and resize. The three.js chunk is lazy-loaded after the sheet has painted.
- **Models** — the source USDZ scans (15 MB each) were converted at build time to
  geometry-only GLB: welded, decimated to ~90k triangles, centred and normalised to unit
  height, quantized and meshopt-compressed. Roughly 1 MB each, in `public/models/`.

## Develop

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the build
```

## Content

Copy, the work list and the notes live at the top of `src/App.tsx`. Contact links are in the
*Elsewhere* block. The page respects `prefers-reduced-motion`: the statues stand still and the
dust stops turning.

## Credits

Type: Pirata One, Old Standard TT, Special Elite, La Belle Aurore, IM Fell English SC (SIL OFL).
Statue scans supplied with the design handoff (Winged Victory of Samothrace, Muse, Nymphe der
Flora, Diana).
