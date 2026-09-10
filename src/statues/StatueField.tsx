import { useEffect, useRef } from 'react';
import { createStatueField } from './field';

// Layer 3 (in front of the sheet): sparse toner flecks + one registration cross, fastest.
const FLECKS = 'url("data:image/svg+xml,' + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='1400'><g fill='#141412'><rect x='220' y='340' width='5' height='3' opacity='.5' transform='rotate(24 222 341)'/><rect x='1310' y='190' width='3' height='3' opacity='.45'/><rect x='860' y='760' width='6' height='2' opacity='.5' transform='rotate(-15 863 761)'/><rect x='430' y='1120' width='3' height='4' opacity='.45' transform='rotate(40 431 1122)'/><rect x='1450' y='980' width='4' height='3' opacity='.5'/><path d='M1080 470h11M1085.5 464.5v11' stroke='#141412' stroke-width='1' opacity='.3' fill='none'/></g></svg>",
) + '")';

export default function StatueField() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      return createStatueField(host.current!, canvas.current!, front.current!);
    } catch (e) {
      // No WebGL: the sheet stands on its own.
      console.warn('statue field unavailable', e);
    }
  }, []);
  return (
    <>
      <div ref={host} className="statue-field" aria-hidden="true">
        <canvas ref={canvas} />
      </div>
      <div ref={front} className="statue-flecks" aria-hidden="true" style={{ backgroundImage: FLECKS }} />
    </>
  );
}
