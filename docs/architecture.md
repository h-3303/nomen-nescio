# Architecture

The site is one static page. There is no server, no data fetching beyond four model files, and
no client-side routing. Everything the browser needs is in `dist/` after `npm run build`.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Build | Vite 8 (rolldown) | Fast static build, automatic code-splitting of the lazy three.js import. |
| UI | React 19 + TypeScript | The design system is authored as React components; the port stays 1:1. |
| 3D | three.js 0.186 | Renders the four statue scans. Loaded lazily so the sheet paints first. |
| Fonts | Self-hosted WOFF2, 22 faces | Verbatim from the design system; no third-party font requests. |
| Hosting | Vercel, static output | Git-connected; every push to `main` deploys. |

## File map

```
index.html                 HTML shell: meta, favicon, six font preloads
public/
  favicon.svg              toner square with a serif N
  fonts/*.woff2            vendored OFL faces (Pirata One, Old Standard TT, Special Elite,
                           La Belle Aurore, IM Fell English SC)
  models/*.glb             the four statue scans, decimated + meshopt-compressed (see docs/models.md)
src/
  main.tsx                 mounts <App/>; imports the four stylesheets in order
  App.tsx                  the whole page: copy, work list, focus state, section layout
  dtw/index.tsx            design-system components (see docs/design-system.md)
  statues/
    StatueField.tsx        React wrapper: canvas + the three texture strata
    field.ts               the three.js scene, parallax and strata drift (see docs/statue-field.md)
  styles/
    fonts.css              @font-face rules (paths rewritten to /fonts/)
    tokens.css             colour, voice, shadow and texture tokens (verbatim)
    components.css         component CSS (verbatim)
    page.css               page chrome: grain, strata layers, focus animation, mobile rules
tools/                     build-time tooling, separate package.json, not deployed
  models/                  USDZ -> GLB pipeline (extract.mjs, optimize.mjs)
  verify/                  headless screenshot checks
docs/                      this documentation
vercel.json                immutable cache headers for /models and /fonts
```

## Stylesheet order

`main.tsx` imports `fonts.css`, `tokens.css`, `components.css`, then `page.css`. The order matters:
`page.css` overrides two component rules on purpose:

- `.dtw-sheet.dtw-sheet--paper { background: transparent !important }` so the Sheet does not
  paint its own paper (and its xerox grain) over the statues. The page wrapper paints the
  paper and a finer fractal-noise grain instead.
- `.dtw-masthead*` gets `white-space: nowrap` so the blackletter name never wraps on desktop;
  the phone media query lifts it again and drops the title to 32 px.

## Stacking order, back to front

Everything sits inside `.page` (`position: relative`). From the bottom up:

| z | Element | Content | Drift |
| --- | --- | --- | --- |
| 0 | `.statue-field` (fixed, 100vw x 100vh) | canvas: statues, `mix-blend-mode: multiply` | per figure, scroll-anchored |
| 0 | `.statue-dots` inside the field, after the canvas | pasted halftone dot-grid plates | 0.12 x scroll |
| 0 | `.statue-hatch` inside the field | 45 degree hatch scraps | 0.55 x scroll |
| 1 | `.dtw-sheet` | the page content, transparent ground | 1.0 (normal scroll) |
| 1 | elements with `data-plx` | sections of the sheet | rate x distance from viewport centre |
| 2 | `.statue-flecks` (fixed) | toner flecks + registration cross | 1.28 x scroll |

Because the canvas multiplies onto the paper, the chalk-white figures darken the page only
where they carry shadow; the dot plates drawn after the canvas therefore read over the figures.

## Runtime flow

1. `index.html` preloads the six Latin font files that appear above the fold.
2. `main.tsx` mounts `App`. The whole sheet renders synchronously from static data.
3. `App` renders `<Suspense><StatueField/></Suspense>`. The dynamic import fetches the
   `StatueField-*.js` chunk (three.js, ~164 KB gzipped) after the first paint.
4. `StatueField` mounts, calls `createStatueField`, which builds the scene and starts loading
   the four GLBs in parallel (~4 MB total, cached immutably).
5. The scene redraws on `scroll` and `resize` only. Each draw positions the figures, renders,
   shifts the three strata and translates every `data-plx` element.
6. Unmount returns a disposer that removes listeners, clears the `data-plx` transforms and
   disposes the renderer.

If WebGL is unavailable the constructor throws, the wrapper catches it, and the page stands
without statues. `prefers-reduced-motion: reduce` freezes every drift (see statue-field.md).

## Bundle

| Asset | Size | Gzipped |
| --- | --- | --- |
| `index-*.js` (React + page) | 237 KB | 74 KB |
| `StatueField-*.js` (three.js + scene) | 647 KB | 164 KB |
| `index-*.css` | 19 KB | 4 KB |
| Fonts above the fold (6 files) | ~150 KB | already compressed |
| Models (4 files) | 4.1 MB | already compressed |

The three.js chunk exceeds Vite's default 500 KB warning; `chunkSizeWarningLimit` is raised to
700 in `vite.config.ts` because the split is deliberate and the chunk is lazy.
