# The statue field

`src/statues/field.ts` builds and drives the three.js scene. `src/statues/StatueField.tsx` is a
thin React wrapper that owns the DOM (canvas and strata divs) and the lifecycle.

## Scene

- **Renderer**: `WebGLRenderer` with `alpha: true`, clear alpha 0, `antialias: true`,
  PCF shadow maps, ACES filmic tone mapping at exposure 1, `powerPreference: high-performance`.
  Pixel ratio capped at 1.5: the figures are multiply-blended and filtered, so 2x only doubled
  the fill cost.
- **Camera**: perspective, 34 degree vertical FOV, aspect from the host element, near 0.1, far 100,
  fixed at the origin looking down -Z.
- **Fog**: `Fog(0xefece3, near, far)`, paper-coloured. With the multiply blend a fogged figure
  fades into the page rather than into grey.
- **Environment**: `RoomEnvironment` through a PMREM generator, sigma 0.04, intensity from the
  depth dial.
- **Lights**: a hard key `DirectionalLight(0xfff6ea)` at (-6, 9, 6) casting a 2048 px shadow
  map (bias -0.0004, normal bias 0.02, ortho extent from the dial); a cool fill
  `DirectionalLight(0xe4e6ea)` at (5, -2, 4); a `HemisphereLight(0xffffff, 0xb9b3a6)`.
- **Material** (`makeChalk`): one `MeshStandardMaterial` shared by every figure. A 1024 px canvas
  filled `#f7f5f0` with +/-7 units of monochrome noise is the colour map (repeat 4x4) and, at
  repeat 6x6, the bump map (`bumpScale 0.006`). Roughness 1, metalness 0, `envMapIntensity 0.12`.
  The scans' own textures were discarded at build time.

## The shadow-depth dial

`createStatueField(host, canvas, strata, shadowDepth)` takes a value `t` in [0, 1]; the page
passes its `shadowDepth` prop (default 0). One dial moves four levers:

| Lever | t = 0 | t = 1 |
| --- | --- | --- |
| Key intensity | 3.2 | 5.8 |
| Fill intensity | 0.7 | 0.3 |
| Hemisphere intensity | 0.6 | 0.25 |
| Environment intensity | 0.3 | 0.08 |
| Shadow camera half-extent (harder edges when tighter) | 14 | 9 |
| Fog near / far | 15 / 42 | 27 / 56 |
| Canvas filter | `saturate(.5) contrast(1.06) brightness(1)` | `contrast(1.56) brightness(1.06)` |

## Figures

Each entry in `FIGURES` places one model:

| key | file | x (fraction of half-width at its depth) | z | height | ry | rz | anchor | speed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fa | fa.glb (Winged Victory) | 0.62 | -8.5 | 3.0 | -0.5 | 0.03 | 0.05 | 0.5 |
| muse | muse.glb | -0.74 | -14 | 5.0 | 0.35 | -0.03 | 0.34 | 0.55 |
| nymph | nymph.glb (Nymphe der Flora) | 0.7 | -10 | 4.0 | -0.4 | 0.02 | 0.64 | 0.55 |
| diana | diana.glb | -0.66 | -9 | 3.6 | 0.5 | -0.02 | 0.9 | 0.6 |

Anchors are spread so each figure owns one stretch of the page: hero, the gap before the work
list, between studio plate and notes, beside Elsewhere. Speeds differ per depth so the figures
separate as you scroll.

Models arrive centred on their bounding box and exactly 1 unit tall (see models.md), so placing
one is `statue.scale.setScalar(height)` inside a pivot group that carries the rotation and depth.

## Parallax

On every draw, for each figure:

```
halfH  = tan(fov / 2) * |z|            world half-height of the view at that depth
halfW  = halfH * aspect
perPx  = 2 * halfH / viewportHeight    world units per CSS pixel at that depth
delta  = (scrollY - anchor * scrollRange) * perPx * speed
x      = def.x * halfW
y      = delta - 0.3
ry     = def.ry + delta * 0.06         a slow turn as it passes
```

So a figure sits at rest (y = -0.3) when the page is scrolled to `anchor * scrollRange`, and
moves against the scroll at `speed` times the page rate, in screen-true units at its own depth.

## Scroll-linked motion: why the compositor

The browser's compositor scrolls the page before any JavaScript scroll handler runs. Anything
moved from a scroll listener therefore lands one frame after the sheet has already moved, and
if a frame is late the mismatch shows as jitter. Three things on this page move with the scroll
besides the figures: the sections marked `data-plx`, and the three texture strata. Both are
declared as CSS scroll-driven animations on the `translate` property (`src/statues/scrollfx.ts`
generates the keyframes with concrete values), so the compositor moves them in the same frame
as the scroll with no layout reads and no repaints. The figures, which need a WebGL render,
stay on the main thread but follow a damped scroll position (below).

Two CSS details make the timelines resolve against the document rather than an ancestor:
`html { overflow-x: hidden }` clips at the viewport instead of on `.page`, and the sheet uses
`overflow: clip` instead of the design system's `overflow: hidden` (identical clipping, but
`hidden` creates a scroll container and `view()` would measure against it).

## Strata

Three repeating SVG tiles, generated inline in `StatueField.tsx`. Each layer is
`100vh + rate x scroll range` tall (the range is written to `--scroll-range` on `:root` by
`watchScrollRange`, and refreshed by a `ResizeObserver` on `body`) and translates upward with a
`scroll(root)` timeline; the keyframes `strata-dots`, `strata-hatch`, `strata-flecks` are
rewritten whenever the page height changes:

| Layer | Content | Tile | Opacity | Rate |
| --- | --- | --- | --- | --- |
| `.statue-dots` | two rectangles filled with a 9 px dot pattern (r 1.6), rotated -2 and 1.5 degrees | 1200 x 1000 | .05 | 0.12 |
| `.statue-hatch` | two rectangles of 45 degree hatch (1.4 px bars on a 7 px pitch), rotated -1.2 and 2 degrees | 1500 x 1200 | .06 | 0.55 |
| `.statue-flecks` | five toner flecks and one registration cross | 1600 x 1400 | .3 to .5 | 1.28 |

Dots and hatch live inside the fixed field, after the canvas, so they sit in front of the
figures and behind the sheet. Flecks are a separate fixed layer at `z-index: 2`, in front of
the sheet.

## Foreground parallax (`data-plx`)

Any element with `data-plx="rate"` drifts by `(elementCentre - viewportCentre) * -rate` pixels.
Positive rates lag the scroll, negative rates lead it. Rates in use range from -0.1 to 0.12.

`installParallax` (called from `App` in a layout effect, before first paint) gives each such
element a `view()` timeline animation over its `cover` range. Across that range the element's
centre travels from `vh + h/2` to `-h/2`, so the drift runs linearly from
`-rate x (50vh + 50%)` to `+rate x (50vh + 50%)`; one `@keyframes plx-<rate>` rule is generated
per distinct rate. Because it animates `translate`, it composes with the design's `rotate()`
transforms (the studio plate and colophon keep their tilt).

## Redraw policy and damping

There is no free-running animation loop. A scroll event records the target offset and starts a
short `requestAnimationFrame` chain in which the displayed offset eases toward the target with
a time constant of 80 ms (`shown += (target - shown) * (1 - e^(-dt/80))`), stopping once within
a quarter pixel. A late or dropped frame therefore shows as a slightly larger step rather than a
jump, and the figures settle about 150 ms after the reader stops. `resize` snaps to the target
and draws immediately; model load completion draws once.

## Fallback without scroll-driven animations

If `CSS.supports('animation-timeline: view()')` (or `scroll()`) is false, `field.ts` moves the
strata and the `data-plx` sections itself on each scroll frame, still with `translate` (no
repaint), with all layout reads batched before the writes.

## Reduced motion and fallbacks

- `prefers-reduced-motion: reduce`: figures hold at `delta = 0` (their rest pose); the
  scroll-driven animations are inside a `no-preference` media block so strata and sections
  hold still too. Everything still renders.
- No WebGL: `WebGLRenderer` throws; the wrapper logs a warning and renders nothing behind the
  sheet.
- Phone widths (max 720 px): canvas opacity drops to .8 so type stays legible over a figure.

## Disposal

The disposer cancels any queued frame, removes the scroll and resize listeners, clears any
fallback `translate` values, and disposes the PMREM generator and renderer; the wrapper also
stops the scroll-range observer. React runs it on
unmount and whenever `shadowDepth` changes (the scene is rebuilt).
