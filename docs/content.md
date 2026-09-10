# Editing content

All copy lives in `src/App.tsx`. The page is deliberately a single file so a change is a
one-file diff.

## Placeholders to replace

| Where | Current value |
| --- | --- |
| Masthead | `Nomen Nescio` |
| Masthead tagline | `SELECTED WORK · PRINT` |
| Handwritten note beside the masthead | `your name goes in the bar` |
| Hero drop letter | `N` (`PhotoInLetter letter="N"`); pass `src` to mask a photo into it |
| Elsewhere box | `you@example.com`, `instagram — @handle`, `github — /handle` |
| Studio plate | a hatched placeholder; give `Plate` a `src` for a real photograph |
| `index.html` | `<title>`, description and Open Graph tags |

## The work list

`WORKS` is an array of `{ n, title, meta, year, tilt, body }`:

- `n`: the folio number, stamped crooked at the left of the row.
- `title`: liturgical caps, ends with a period.
- `meta`: typewriter caps separated by middle dots (`·`).
- `year`: right-hand folio.
- `tilt`: rotation used only by the `cards` layout.
- `body`: the paragraph shown on the black underside when the row is opened.

Add a work by appending to the array. Rows fill the 420 px minimum height evenly (`flex: 1`),
so five rows are shorter than four; beyond six, raise `minHeight` on the list container.

## Notes

`NOTES` is the string array for the X-bullet creed under NOTES. The heading text
`1.  WHAT IS KEPT HERE:` is inline in the JSX.

## Page props

`App` accepts the same props the design exposed in its editor:

| Prop | Default | Effect |
| --- | --- | --- |
| `showStatues` | `true` | Mount the statue field at all. |
| `shadowDepth` | `0` | 0 to 1; harder light and deeper shadow on the figures (see statue-field.md). |
| `workLayout` | `'index'` | `'index'` is the sliding list; `'cards'` is a grid of pasted boxes with plates. |
| `showNotes` | `true` | Render the NOTES / colophon section. |

Set them in `main.tsx`, e.g. `<App shadowDepth={0.5} />`.

## The focus state

Clicking a row sets `focus = { w, phase: 'open' }`. The black underside panel mounts absolutely
behind the list; the list's background switches to paper so it covers the panel while it slides
off to the right in four photocopier steps (`dtwListOff .5s steps(4,end)`). BACK TO THE LIST
sets `phase: 'closing'`, which plays `dtwListBack` (.45 s); its `animationend` clears `focus`
and unmounts the panel. Both keyframes are in `page.css`.

## Voice

Write as the system's readme prescribes: matter-of-fact, liturgical cadence, no marketing
voice, no exclamation marks, headlines in caps ending in a period, attributions as
`— ST. NAME (CENTURY)`.

## Mobile

Sections carry `data-m` markers (`pad`, `hero`, `work`, `stack`) that `page.css` restacks at
720 px and below: single columns, the spine banner hidden, the masthead allowed to wrap at 32 px.
