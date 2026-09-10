# Design system port

`src/dtw/index.tsx` is a TypeScript port of the *Death to the World* React package
(`@dtw/react`, github.com/h-3303/dttw). The handoff bundle shipped the same components as
compiled JSX in `_ds_bundle.js`; the port follows that source line for line: identical class
names, prop names, default values and DOM structure. `src/styles/tokens.css` and
`src/styles/components.css` are the package's CSS verbatim. Only `fonts.css` was touched, to
point the `@font-face` URLs at `/fonts/`.

## Rules of the hand (from the system's readme)

- Two inks only: toner `#141412` on paper `#e8e5dc` (second-generation paper `#d9d4c6`), or
  paper knocked out of toner. Halftone greys are textures, never type tints.
- One red gesture per artifact (`RedStamp` or `RedWord`), cardinal `#b3202c` on paper,
  dried blood `#8e1a1f` on black. This page spends it on the TAKE ONE stamp.
- Six voices: I blackletter (Pirata One, mastheads only) and I-B hollow; II liturgical caps
  (Old Standard bold, every headline ends in a period); III body (Old Standard, always
  justified); IV typewriter (Special Elite); V the hand (La Belle Aurore, always black on
  paper); VI Fell SC folios, stamped crooked.
- Nothing is centred by machine: pasted elements carry a rotation of 0.5 to 4 degrees.
- Hard offset shadows only, no blur, no rounded corners, no transparency layering.
- No icons, no emoji, no logo file. Ornaments are typographic.

## Component inventory

Common conventions: `size` accepts a number (px) or any CSS length string; `rotate` is degrees
and is applied as `transform: rotate()`; `on="black"` switches to the knockout palette; `style`,
`className` and any other DOM attribute (including `data-plx`) pass through to the root.

### Surfaces

| Component | Root class | Props (default) | Notes |
| --- | --- | --- | --- |
| `Sheet` | `.dtw-sheet .dtw-sheet--{ground}` | `ground` (paper), `texture`, `rotate`, `width`, `height`, `padding` | Adds `.dtw-xerox` grain unless ground is black or `texture={false}`. The page overrides its background to transparent. |
| `Plate` | `.dtw-plate` | `src`, `alt`, `label`, `caption`, `captionCorner` (top), `tone` (hatch-tone), `on`, `height` (200), `width`, `rotate`, `toneColor` | Without `src` it draws a grey-2 fill with hatch + dots at .9 opacity and a centred typewriter label. `caption` runs up the left spine. Images get the 1-bit photocopy filter. |
| `Ornament` | `.dtw-ornament--{variant}` | `variant` (diamond), `on`, `count` (9) | `diamond`: line, rotated square, line. `stars`: a row of U+2726. `bar`: 8 px toner rule. `hatch`: 14 px hatched band. |

### Voices

| Component | Root | Props (default) |
| --- | --- | --- |
| `Masthead` | `div.dtw-masthead(--bar)` | `tagline`, `bar` (true), `size` (44), `rotate` (-0.6) |
| `HollowTitle` | `span.dtw-hollow` | `on`, `boxed` (false), `size` (34) |
| `Headline` | `h2.dtw-headline` | `on`, `size` (21), `align` (left) |
| `RedWord` | `span.dtw-redword` | `on`, `underline` (false) |
| `BodyText` | `div.dtw-body` | `on`, `dropCap`, `dropCapVoice` (blackletter), `columns`, `italic`, `size` (12.5) |
| `Typewriter` | `div.dtw-typewriter` | `on`, `tracked`, `caps`, `muted`, `size` (13), `align` |
| `Handwritten` | `div.dtw-hand` | `size` (21.5), `rotate` |
| `Folio` | `span.dtw-folio` | `on`, `size` (18), `rotate` (-4) |

### Devices

| Component | Root | Props (default) |
| --- | --- | --- |
| `BarHeading` | `div.dtw-bar-heading--{voice}` | `voice` (serif), `size`, `rotate` |
| `PastedBox` | `div.dtw-pasted-box` | `rotate` (-0.8), `bordered` (true), `maxWidth` |
| `PastedSlip` | `div.dtw-pasted-slip--{voice}` | `voice` (hand), `rotate` (-1.6), `size` |
| `TornScrap` | `div.dtw-torn-scrap--v{n}` | `variant` (1), `rotate` (-0.9), `texture` (true) |
| `SpineBanner` | `div.dtw-spine-banner` | `size` (20.5), `minHeight` |
| `FrameText` | `div.dtw-frame-text` | `top`, `bottom`, `left`, `right`, `width` (300), `height` (210), `inset` |
| `ReversedPanel` | `div.dtw-reversed-panel` | `attribution`, `maxWidth`, `rotate` |
| `QuoteBlock` | `div.dtw-quote` | `attribution`, `maxWidth`, `rotate` |
| `XBulletList` | `div.dtw-x-list` | `title`, `items` (required), `size` (12) |
| `PhotoInLetter` | `div.dtw-photo-letter` | `letter` (required), `src`, `size` (150) |
| `RedStamp` | `div.dtw-stamp` or `.dtw-redcross` | `shape` (box), `on`, `rotate` (-3), `size` |

`FrameText` and `RedWord` are ported for completeness but unused on this page.

## Deviations from the compiled bundle

- `XBulletList` types `title` as `ReactNode` and omits the DOM `title` attribute from its
  props (the JSX version relied on untyped spreading).
- `Headline` is typed against `HTMLHeadingElement`, `HollowTitle` and `Folio` against
  `HTMLSpanElement`; everything else against `HTMLDivElement`.
- The `rot()` helper treats a `rotate` of `0` or `"0"` as "no transform", exactly as the
  bundle's truthiness check did.

## Using the components

```tsx
import { Sheet, Masthead, Headline, BodyText, Ornament } from './dtw';

<Sheet ground="paper" padding={30}>
  <Masthead tagline="THE VOICE OF ONE CRYING IN THE WILDERNESS">Death to the World</Masthead>
  <Headline size={26} style={{ marginTop: 22 }}>THE LAST TRUE REBELLION.</Headline>
  <BodyText dropCap="T" style={{ marginTop: 12 }}>o be dead to this world and alive to the other.</BodyText>
  <Ornament variant="diamond" style={{ marginTop: 18 }} />
</Sheet>
```

Spacing between components is done with inline `style` on wrapper divs, as the design file
does; the system has no spacing utilities by design.

## Adding a component

Port it from the `dttw` repo, keep the class names, put the CSS in `components.css` under the
matching section comment, and export it from `src/dtw/index.tsx`. Do not invent background
colours, radii or soft shadows.
