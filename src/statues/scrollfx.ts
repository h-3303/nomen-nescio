/*
 * Scroll-linked motion on the compositor.
 *
 * The page has two kinds of scroll-linked drift besides the WebGL figures: sections marked
 * data-plx="rate" and the three fixed texture strata. Driving them from a scroll listener
 * moves them one frame after the compositor has already scrolled the page, and needs layout
 * reads and repaints on every frame; that is what reads as jitter. Where the browser supports
 * CSS scroll-driven animations they are declared here as compositor animations on the
 * `translate` property, with concrete keyframe values (no var() lookups) so they stay eligible
 * for the compositor. The JS path in field.ts is only used when this is unsupported.
 */

export const supportsViewTimeline = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');
export const supportsScrollTimeline = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');

// Strata drift rates, as fractions of the page scroll. Must match the heights in page.css.
export const STRATA_RATES = { dots: 0.12, hatch: 0.55, flecks: 1.28 } as const;

let sheet: HTMLStyleElement | null = null;
const plxRules = new Map<string, string>();
let strataRule = '';

function flush() {
  if (!sheet) {
    sheet = document.createElement('style');
    sheet.dataset.scrollfx = '';
    document.head.appendChild(sheet);
  }
  sheet.textContent = [...plxRules.values(), strataRule].join('\n');
}

const slug = (rate: number) => 'plx-' + (rate < 0 ? 'n' : 'p') + Math.round(Math.abs(rate) * 1000);

/**
 * Give every [data-plx] element under `root` a view-timeline animation reproducing
 *   y = (elementCentre - viewportCentre) * -rate
 * exactly: over the element's `cover` range its centre travels from vh + h/2 to -h/2, so
 * translate runs linearly from -(rate)(50vh + 50%) to +(rate)(50vh + 50%).
 */
export function installParallax(root: ParentNode = document) {
  if (!supportsViewTimeline) return;
  root.querySelectorAll<HTMLElement>('[data-plx]').forEach((el) => {
    const rate = parseFloat(el.dataset.plx || '') || 0;
    const name = slug(rate);
    if (!plxRules.has(name)) {
      const a = (rate * 50).toFixed(3);
      plxRules.set(name, `@keyframes ${name}{from{translate:0 calc(${-a}vh - ${a}%)}to{translate:0 calc(${a}vh + ${a}%)}}`);
    }
    el.style.animationName = name;
  });
  flush();
}

/**
 * Keep --scroll-range (used for the strata heights) and the strata keyframes in step with the
 * document height. Returns a disposer.
 */
export function watchScrollRange(): () => void {
  const root = document.documentElement;
  let last = -1;
  const update = () => {
    const range = Math.max(0, root.scrollHeight - window.innerHeight);
    if (range === last) return;
    last = range;
    root.style.setProperty('--scroll-range', range + 'px');
    if (supportsScrollTimeline) {
      strataRule = (Object.keys(STRATA_RATES) as Array<keyof typeof STRATA_RATES>)
        .map((k) => `@keyframes strata-${k}{from{translate:0 0}to{translate:0 ${(-STRATA_RATES[k] * range).toFixed(1)}px}}`)
        .join('\n');
      flush();
    }
  };
  update();
  const ro = new ResizeObserver(update);
  ro.observe(document.body);
  window.addEventListener('resize', update);
  return () => { ro.disconnect(); window.removeEventListener('resize', update); };
}
