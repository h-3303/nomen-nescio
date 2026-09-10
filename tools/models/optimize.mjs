/*
 * Step 2 of the statue pipeline: raw GLB -> web-ready GLB in public/models/.
 *
 * Usage (from tools/):
 *   node models/optimize.mjs [target-triangles]     default 90000
 *
 * For each raw/<key>.glb:
 *   weld      merge duplicate vertices so the simplifier sees a connected surface
 *   simplify  meshoptimizer decimation to ~target triangles (error 0.0015 of the bbox)
 *   normalise bake a transform so the bbox is centred on the origin and exactly 1 unit tall;
 *             the site then scales each figure by its world height directly
 *   dedup/prune  drop leftover accessors and unused materials
 *   quantize  14-bit positions, 10-bit normals, 12-bit uvs
 *   meshopt   EXT_meshopt_compression, level medium (decoded by three's MeshoptDecoder)
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, dedup, prune, getBounds, transformMesh } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import { mat4 } from 'gl-matrix';
import { statSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const rawDir = resolve(here, 'raw');
const outDir = resolve(here, '..', '..', 'public', 'models');
const TARGET = Number(process.argv[2]) || 90000;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await MeshoptSimplifier.ready; await MeshoptEncoder.ready;

for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.glb'))) {
  const k = file.replace(/\.glb$/, '');
  const doc = await io.read(resolve(rawDir, file));
  const count = () => doc.getRoot().listMeshes().reduce((n, m) => n + m.listPrimitives().reduce((a, p) => a + p.getIndices().getCount() / 3, 0), 0);
  await doc.transform(weld({ tolerance: 0.0001 }));
  const before = count();
  await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: Math.min(1, TARGET / before), error: 0.0015, lockBorder: false }));

  const b = getBounds(doc.getRoot().listScenes()[0]);
  const c = [0, 1, 2].map((i) => (b.min[i] + b.max[i]) / 2);
  const s = 1 / (b.max[1] - b.min[1]);
  const m = mat4.create(); mat4.scale(m, m, [s, s, s]); mat4.translate(m, m, [-c[0], -c[1], -c[2]]);
  for (const mesh of doc.getRoot().listMeshes()) transformMesh(mesh, m);
  for (const node of doc.getRoot().listNodes()) { node.setTranslation([0, 0, 0]); node.setRotation([0, 0, 0, 1]); node.setScale([1, 1, 1]); }

  await doc.transform(dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const out = resolve(outDir, `${k}.glb`);
  await io.write(out, doc);
  const b2 = getBounds(doc.getRoot().listScenes()[0]);
  console.log(k.padEnd(6), 'tris', String(before).padStart(7), '->', String(Math.round(count())).padStart(6), ' height', (b2.max[1] - b2.min[1]).toFixed(3), ' KB', (statSync(out).size / 1024).toFixed(0));
}
