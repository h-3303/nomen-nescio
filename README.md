# Nomen Nescio — one sheet

A single-page portfolio set in the *Death to the World* design language: toner black on
photocopied paper, six type voices, hard-edged paste-up devices, nothing centred by machine.
Four marble figures stand behind the sheet and drift with the scroll, under pasted halftone
plates and hatch scraps.

Live: **https://nomen-nescio.vercel.app**

Built from the Claude Design handoff *Portfolio site with 3D statues* (`Experiment 2.dc.html`)
and deployed on Vercel. The design is implemented visually 1:1; see
[docs/handoff.md](docs/handoff.md) for the few deliberate deviations.

## Quick start

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build -> dist/
npm run preview    # serve the build on http://localhost:4173
```

Pushing to `main` deploys to production (the repo is connected to the Vercel project).

## Stack in one paragraph

Vite 8, React 19, TypeScript, static output. The design system is a 1:1 TypeScript port of
`@dtw/react` in `src/dtw/`, with its tokens, component CSS and 22 OFL webfonts vendored
verbatim. The statue field in `src/statues/` renders four photogrammetry scans with three.js:
one shared chalk material, a hard key light with self-shadow, paper-coloured fog, a
scroll-anchored parallax per figure, and three photocopy strata (dot plates, hatch scraps,
toner flecks) drifting at their own rates. The three.js chunk lazy-loads after the sheet paints
and the scene only redraws on scroll. The 15 MB USDZ scans were reduced at build time to ~1 MB
meshopt-compressed GLBs.

## Documentation

| Document | What it covers |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Stack, file map, stylesheet order, stacking/z-index strata, runtime flow, bundle sizes |
| [docs/statue-field.md](docs/statue-field.md) | The three.js scene: lights, chalk material, the `shadowDepth` dial, figure table, parallax maths, strata rates, `data-plx`, reduced motion, disposal |
| [docs/design-system.md](docs/design-system.md) | The component port: rules of the hand, full prop inventory, deviations, how to add a component |
| [docs/content.md](docs/content.md) | Editing copy, the work list, page props, how the focus state animates, mobile markers |
| [docs/models.md](docs/models.md) | The USDZ to GLB pipeline, settings, results table, adding a statue |
| [docs/deploy.md](docs/deploy.md) | Build, headless verification scripts, Vercel project, caching, custom domain |
| [docs/handoff.md](docs/handoff.md) | Provenance: the design project, prototype-to-build mapping, deliberate deviations |
| [CHANGELOG.md](CHANGELOG.md) | What changed and when |

## Repository layout

```
index.html          HTML shell, font preloads, meta
public/             favicon, fonts/, models/
src/
  App.tsx           the page and all its copy
  dtw/              design-system components
  statues/          three.js statue field
  styles/           fonts, tokens, components (verbatim) + page.css
tools/              build-time tooling (separate package.json): models/ pipeline, verify/ screenshots
docs/               documentation
vercel.json         cache headers
```

## Content

Copy, the work list and the notes live at the top of `src/App.tsx`; contact links are in the
*Elsewhere* block. The name, e-mail and handles are still the design's placeholders. The page
respects `prefers-reduced-motion` (figures and strata hold still) and degrades to the plain
sheet without WebGL.

## Credits

Type: Pirata One, Old Standard TT, Special Elite, La Belle Aurore, IM Fell English SC
(SIL Open Font License). Design language: *Death to the World* (github.com/h-3303/dttw).
Statue scans supplied with the design handoff: Winged Victory of Samothrace, Muse, Nymphe der
Flora, Diana.
