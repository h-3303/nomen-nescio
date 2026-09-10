import { useEffect, useRef } from 'react';
import { createStatueField } from './field';

const svg = (markup: string) => 'url("data:image/svg+xml,' + encodeURIComponent(markup) + '")';

// Pasted halftone tone plates: rectangular dot grids, drifting slowest.
const DOT_PLATES = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1000'><defs><pattern id='d' width='9' height='9' patternUnits='userSpaceOnUse'><circle cx='3' cy='3' r='1.6' fill='#141412'/></pattern></defs><g opacity='.05'><rect x='90' y='120' width='430' height='300' fill='url(#d)' transform='rotate(-2 305 270)'/><rect x='760' y='620' width='340' height='240' fill='url(#d)' transform='rotate(1.5 930 740)'/></g></svg>",
);
// Stray 45° hatch scraps, keeping pace with the statues.
const HATCH_SCRAPS = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='1500' height='1200'><defs><pattern id='h' width='7' height='7' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><rect width='1.4' height='7' fill='#141412'/></pattern></defs><g opacity='.06'><rect x='1080' y='180' width='300' height='110' fill='url(#h)' transform='rotate(-1.2 1230 235)'/><rect x='140' y='880' width='240' height='90' fill='url(#h)' transform='rotate(2 260 925)'/></g></svg>",
);
// In front of the sheet: sparse toner flecks + one registration cross, fastest.
const FLECKS = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='1400'><g fill='#141412'><rect x='220' y='340' width='5' height='3' opacity='.5' transform='rotate(24 222 341)'/><rect x='1310' y='190' width='3' height='3' opacity='.45'/><rect x='860' y='760' width='6' height='2' opacity='.5' transform='rotate(-15 863 761)'/><rect x='430' y='1120' width='3' height='4' opacity='.45' transform='rotate(40 431 1122)'/><rect x='1450' y='980' width='4' height='3' opacity='.5'/><path d='M1080 470h11M1085.5 464.5v11' stroke='#141412' stroke-width='1' opacity='.3' fill='none'/></g></svg>",
);

/** Four marble figures behind the sheet, with dot plates and hatch scraps pasted over them. */
export default function StatueField({ shadowDepth = 0 }: { shadowDepth?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const deep = useRef<HTMLDivElement>(null);
  const mid = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      return createStatueField(host.current!, canvas.current!, { deep: deep.current!, mid: mid.current!, front: front.current! }, shadowDepth);
    } catch (e) {
      // No WebGL: the sheet stands on its own.
      console.warn('statue field unavailable', e);
    }
  }, [shadowDepth]);
  return (
    <>
      <div ref={host} className="statue-field" aria-hidden="true">
        <canvas ref={canvas} />
        <div ref={deep} className="statue-stratum statue-dots" style={{ backgroundImage: DOT_PLATES }} />
        <div ref={mid} className="statue-stratum statue-hatch" style={{ backgroundImage: HATCH_SCRAPS }} />
      </div>
      <div ref={front} className="statue-flecks" aria-hidden="true" style={{ backgroundImage: FLECKS }} />
    </>
  );
}
