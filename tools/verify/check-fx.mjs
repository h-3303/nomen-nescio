import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.setDefaultTimeout(400000);
const logs = [];
page.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => ({
  supports: [CSS.supports('animation-timeline: view()'), CSS.supports('animation-timeline: scroll()')],
  range: getComputedStyle(document.documentElement).getPropertyValue('--scroll-range'),
  scrollRange: document.documentElement.scrollHeight - innerHeight,
  hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  anims: document.getAnimations().map((a) => (a.animationName || a.id) + ':' + a.timeline?.constructor.name + ':' + a.playState),
  sheet: document.querySelector('style[data-scrollfx]')?.textContent.slice(0, 400),
}));
console.log(JSON.stringify(info, null, 1));
for (const y of [0, 1100]) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const vh = innerHeight;
    const plx = [...document.querySelectorAll('[data-plx]')].map((el) => {
      const rate = parseFloat(el.dataset.plx);
      const cs = getComputedStyle(el);
      // Layout position ignores transforms; the rect includes them. Their difference is the drift.
      let layoutTop = 0; for (let o = el; o; o = o.offsetParent) layoutTop += o.offsetTop;
      layoutTop -= scrollY;
      const rc = el.getBoundingClientRect();
      const actual = rc.top - layoutTop;
      const expected = (layoutTop + el.offsetHeight / 2 - vh / 2) * -rate;
      return `${rate}: got ${actual.toFixed(1)} exp ${expected.toFixed(1)}${cs.transform !== 'none' ? ' (rotated)' : ''}`;
    });
    const strata = ['.statue-dots', '.statue-hatch', '.statue-flecks'].map((c) => c + '=' + getComputedStyle(document.querySelector(c)).translate + ' h=' + document.querySelector(c).getBoundingClientRect().height.toFixed(0));
    return { scrollY, plx, strata };
  });
  console.log(JSON.stringify(r, null, 1));
  await page.screenshot({ path: `/tmp/claude-1000/-home-h-dev/35d5fae1-bb43-4397-8694-da8d8547ed43/scratchpad/shots/fx-${y}.png` });
}
console.log('logs:', logs.join('\n') || 'none');
await browser.close();
