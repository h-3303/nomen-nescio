/*
 * Motion check: loads the built site with prefers-reduced-motion OFF, scrolls, and prints the
 * strata background offsets so the parallax rates can be confirmed, then screenshots. Slow under
 * software WebGL (allow a few minutes). Start `npm run preview` first; from tools/:
 *   node verify/motion.mjs [base-url]
 */
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.setDefaultTimeout(400000);
const logs = [];
page.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
const base = process.argv[2] || 'http://localhost:4173/';
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
const out = new URL('./shots/', import.meta.url).pathname;
await page.screenshot({ path: out + 'motion-top.png' });
await page.evaluate(() => window.scrollTo(0, 1100));
await page.waitForTimeout(2500);
const pos = await page.evaluate(() => ['.statue-dots', '.statue-hatch', '.statue-flecks'].map((c) => c + '=' + document.querySelector(c).style.backgroundPosition));
console.log('strata positions:', pos.join(' | '));
await page.screenshot({ path: out + 'motion-1100.png' });
console.log('logs:', logs.filter(l => !l.includes('PCFSoft')).join('\n') || 'none');
await browser.close();
