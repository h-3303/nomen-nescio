# Statue models

The four figures are photogrammetry scans supplied with the design handoff as USDZ files
(binary USDC plus a baked colour texture), 6 to 15 MB each. The site never shows their textures
(every figure gets the shared chalk material), so they are reduced at build time to compact,
geometry-only GLBs in `public/models/`.

## Results

| key | Source | Source size | Triangles in | Triangles out | GLB size |
| --- | --- | --- | --- | --- | --- |
| fa | Winged_Victory_of_Samothrace.usdz | 8.9 MB | 283,134 | 89,995 | 793 KB |
| muse | Muse.usdz | 15 MB | 483,414 | 91,420 | 1,172 KB |
| nymph | Nymphe_der_Flora.usdz | 15 MB | 505,493 | 89,724 | 1,045 KB |
| diana | Diana.usdz | 15 MB | 500,726 | 91,862 | 1,094 KB |

Total 4.1 MB, served with `Cache-Control: immutable`.

## Pipeline

The tooling lives in `tools/models/` with its own `package.json` (`cd tools && npm install`,
then `npx playwright install chromium` once).

### 1. Extract: `node models/extract.mjs <dir-with-usdz>`

three.js is the only free USDZ reader that handles these USDC files, and its loader needs a
DOM, so extraction runs in headless Chromium through Playwright:

1. Serve the repo root on a local port (the script checks the port is really its own server);
   open `tools/models/extract.html`, which imports three from `tools/node_modules`.
2. `USDZLoader` parses each file. Every texture request is answered with a 1 x 1 PNG data URL.
3. Each mesh is de-indexed and rebuilt with position, normal and uv only, with its world matrix
   baked in. UVs are kept because the chalk material uses a repeating grain and bump map.
4. `GLTFExporter` writes a binary GLB; it comes back to Node as base64 and lands in
   `tools/models/raw/<key>.glb` (27 to 48 MB each, ignored by git).

`SOURCES` in the script maps each key to a USDZ filename inside the directory you pass.

### 2. Optimise: `node models/optimize.mjs [targetTriangles=90000]`

Runs with `@gltf-transform` and `meshoptimizer` on each raw GLB:

| Step | Setting | Purpose |
| --- | --- | --- |
| `weld` | tolerance 0.0001 | Merge duplicate vertices so the simplifier sees a connected surface. |
| `simplify` | ratio = target / count, error 0.0015, border unlocked | Decimate to ~90k triangles. |
| normalise | bake a scale + translate | Bounding box centred on the origin, height exactly 1. |
| `dedup`, `prune` | | Drop leftover accessors and unused materials. |
| `quantize` | position 14 bit, normal 10 bit, uv 12 bit | Halves the vertex payload. |
| `meshopt` | level medium | `EXT_meshopt_compression`; decoded by three's `MeshoptDecoder`. |

Output goes straight to `public/models/<key>.glb`. The shipped models were produced by exactly
this tooling at the pinned dependency versions in `tools/package-lock.json`; a re-run with a
different `meshoptimizer` release lands within a few dozen triangles of these counts.

### Why ~90k triangles

At the depths used (8.5 to 14 units, 34 degree FOV) a figure is 300 to 500 CSS pixels tall,
multiply-blended and half-lost in fog. 90k triangles keeps drapery folds and the carving of the
faces; 120k was visually identical and 30 percent heavier.

## Adding a statue

1. Put the USDZ in a directory and add it to `SOURCES` in `extract.mjs` with a short key.
2. Run extract, then optimise.
3. Add the key to `MODELS` in `src/statues/field.ts` and a row to `FIGURES` with position,
   depth, height, facing, scroll anchor and speed (see statue-field.md).
4. Check the shadow camera still covers it: the key light's ortho extent is 14 units at
   `shadowDepth 0`.

## Loading

`GLTFLoader` with `setMeshoptDecoder(MeshoptDecoder)` (the WASM decoder ships inside the
three.js chunk; no extra files). On load every mesh gets `castShadow`, `receiveShadow` and the
shared chalk material, and the scene queues one redraw.
