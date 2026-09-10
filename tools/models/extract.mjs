/*
 * Step 1 of the statue pipeline: USDZ scan -> raw geometry-only GLB.
 *
 * Usage (from tools/):
 *   node models/extract.mjs <source-dir>
 * where <source-dir> holds the USDZ files named in SOURCES below. Writes raw/<key>.glb.
 * Serves the repo root on a local port so the page can fetch three from tools/node_modules
 * and the scans from the source dir (which is symlinked into raw/src for the run).
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, symlinkSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..');
const srcDir = resolve(process.argv[2] || '.');
const rawDir = resolve(here, 'raw');
const PORT = 8791;

// key -> USDZ filename inside <source-dir>. Keys match MODELS in src/statues/field.ts.
const SOURCES = {
  fa: 'Winged_Victory_of_Samothrace.usdz',
  muse: 'Muse.usdz',
  nymph: 'Nymphe_der_Flora.usdz',
  diana: 'Diana.usdz',
};

mkdirSync(rawDir, { recursive: true });
const link = resolve(rawDir, 'src');
if (existsSync(link)) rmSync(link, { recursive: true, force: true });
symlinkSync(srcDir, link, 'dir');

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: repo, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1000));
// Make sure it is our server answering on the port, not something else already bound there.
const probe = await fetch(`http://localhost:${PORT}/tools/models/extract.html`).catch(() => null);
if (!probe || !probe.ok) { server.kill(); throw new Error(`port ${PORT} is not serving the repo root (in use?)`); }
try {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(180000);
  page.on('console', (m) => console.log('[page]', m.text()));
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/tools/models/extract.html`);
  await page.waitForFunction(() => window.ready);
  for (const [k, file] of Object.entries(SOURCES)) {
    const t0 = Date.now();
    const r = await page.evaluate((u) => window.convert(u), `/tools/models/raw/src/${file}`);
    const buf = Buffer.from(r.b64, 'base64');
    writeFileSync(resolve(rawDir, `${k}.glb`), buf);
    console.log(k, 'tris', r.tris, 'meshes', r.meshes, 'size', r.size.map((n) => n.toFixed(2)).join('x'), 'MB', (buf.length / 1048576).toFixed(1), 'ms', Date.now() - t0);
  }
  await browser.close();
} finally {
  server.kill();
  rmSync(link, { recursive: true, force: true });
}
