/*
 * Headless visual check of a built site. Start `npm run preview` in the repo root first, then
 * from tools/: node verify/screenshots.mjs [base-url]
 *
 * Emulates prefers-reduced-motion so the software WebGL rasteriser is not asked to redraw the
 * 360k-triangle scene continuously; the statues still render at their anchors. Captures six
 * scroll positions at desktop and phone widths, plus the work-list focus and unfocus states.
 * Output: tools/verify/shots/.
 */
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const base = process.argv[2] || 'http://localhost:4173/';
const out = new URL('./shots/', import.meta.url).pathname;
import { mkdirSync } from 'node:fs'; mkdirSync(out, { recursive: true });
async function run(name, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 }); page.setDefaultTimeout(180000); await page.emulateMedia({ reducedMotion: 'reduce' });
  const logs = [];
  page.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(name, 'page height', h);
  const steps = [0, 0.18, 0.36, 0.55, 0.75, 1];
  for (let i = 0; i < steps.length; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((h - viewport.height) * steps[i]));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${out}${name}-${i}.png` });
  }
  if (name === 'desktop') {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('.work-row').nth(1).scrollIntoViewIfNeeded();
    await page.locator('.work-row').nth(1).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}${name}-focus.png` });
    await page.locator('.back-btn').click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}${name}-unfocus.png` });
  }
  console.log(name, 'logs:', logs.length ? logs.join('\n  ') : 'none');
  await page.close();
}
await run('desktop', { width: 1280, height: 800 });
await run('phone', { width: 400, height: 780 });
await browser.close();
