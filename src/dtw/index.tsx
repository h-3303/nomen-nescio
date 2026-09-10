/*
 * Death to the World — design language, React/TypeScript port.
 * Ported 1:1 from the h-3303/dttw package: identical class names, props and defaults.
 * Rules of the hand: two inks only, hard edges, no rounding, nothing centered by machine.
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type Size = number | string;
type Ground = 'paper' | 'black';
type Div = HTMLAttributes<HTMLDivElement>;
type Span = HTMLAttributes<HTMLSpanElement>;

const cx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(' ');
const rot = (r: Size | undefined, s?: CSSProperties): CSSProperties | undefined =>
  r ? { transform: `rotate(${r}deg)`, ...s } : s;

/* ---------- surfaces ---------- */

/** The artifact surface every composition sits on: photocopied paper or a field of toner black. */
export function Sheet({ ground = 'paper', texture, rotate, width, height, padding, className, style, children, ...rest }:
  Div & { ground?: 'paper' | 'aged' | 'black'; texture?: boolean; rotate?: Size; width?: Size; height?: Size; padding?: Size }) {
  const xerox = texture ?? ground !== 'black';
  return (
    <div className={cx('dtw-sheet', 'dtw-sheet--' + ground, xerox && 'dtw-xerox', className)}
      style={rot(rotate, { width, height, padding, ...style })} {...rest}>
      {children}
    </div>
  );
}

/** The image device — images are placed as objects, not backgrounds: hard 1px border, no rounding, no shadow. */
export function Plate({ src, alt = '', label, caption, captionCorner = 'top', tone = 'hatch-tone', on = 'paper', height = 200, width, rotate, toneColor, className, style, children, ...rest }:
  Div & { src?: string; alt?: string; label?: ReactNode; caption?: ReactNode; captionCorner?: 'top' | 'bottom'; tone?: 'hatch-tone' | 'hatch' | 'tone' | 'tone-fine' | 'none'; on?: Ground; height?: Size; width?: Size; rotate?: Size; toneColor?: string }) {
  const toneClass = tone === 'none' ? undefined : tone === 'hatch-tone' ? 'dtw-hatch dtw-tone' : 'dtw-' + tone;
  return (
    <div className={cx('dtw-plate', on === 'black' && 'dtw-plate--on-black', className)}
      style={rot(rotate, { height, width, ...style })} {...rest}>
      {src ? (
        <img className="dtw-plate__img" src={src} alt={alt} />
      ) : (
        <>
          <div className={cx('dtw-plate__fill', toneClass)}
            style={{ backgroundColor: toneColor ?? (on === 'black' ? undefined : 'var(--dtw-grey-2)'), opacity: on === 'black' ? 0.45 : 0.9 }} />
          {label && <div className="dtw-plate__label">{label}</div>}
        </>
      )}
      {children}
      {caption && (
        <div className={cx('dtw-plate__spine', captionCorner === 'bottom' && 'dtw-plate__spine--bottom')}>
          <span>{caption}</span>
        </div>
      )}
    </div>
  );
}

/** Section dividers of the zine: heavy toner bar, star row, hatched band, or line-diamond-line rule. */
export function Ornament({ variant = 'diamond', on = 'paper', count = 9, className, ...rest }:
  Div & { variant?: 'diamond' | 'stars' | 'bar' | 'hatch'; on?: Ground; count?: number }) {
  const base = cx('dtw-ornament', 'dtw-ornament--' + variant, on === 'black' && 'dtw-ornament--on-black', className);
  if (variant === 'stars') return <div className={base} {...rest}>{Array.from({ length: count }, () => '✦').join(' ')}</div>;
  if (variant === 'diamond') {
    return (
      <div className={base} {...rest}>
        <div className="dtw-ornament__line" />
        <div className="dtw-ornament__diamond" />
        <div className="dtw-ornament__line" />
      </div>
    );
  }
  return <div className={base} {...rest} />;
}

/* ---------- voices ---------- */

/** Voice I — blackletter masthead lockup. Covers and mastheads only. */
export function Masthead({ children, tagline, bar = true, size = 44, rotate = -0.6, className, style, ...rest }:
  Div & { tagline?: ReactNode; bar?: boolean; size?: Size; rotate?: Size }) {
  return (
    <div className={cx('dtw-masthead', bar && 'dtw-masthead--bar', className)} style={rot(rotate, style)} {...rest}>
      <div className="dtw-masthead__title" style={{ fontSize: size }}>{children}</div>
      {tagline != null && <div className="dtw-masthead__tagline">{tagline}</div>}
    </div>
  );
}

/** Voice I-B, the hollow — outlined blackletter. One word, display only. */
export function HollowTitle({ children, on = 'paper', boxed = false, size = 34, className, style, ...rest }:
  Span & { on?: Ground; boxed?: boolean; size?: Size }) {
  const span = (
    <span className={cx('dtw-hollow', (boxed || on === 'black') && 'dtw-hollow--on-black', className)} style={{ fontSize: size, ...style }} {...rest}>
      {children}
    </span>
  );
  return boxed ? <span className="dtw-hollow-chip">{span}</span> : span;
}

/** Voice II — liturgical caps. Old Standard bold; headlines end in a period. */
export function Headline({ children, on = 'paper', size = 21, align = 'left', className, style, ...rest }:
  HTMLAttributes<HTMLHeadingElement> & { on?: Ground; size?: Size; align?: CSSProperties['textAlign'] }) {
  return (
    <h2 className={cx('dtw-headline', on === 'black' && 'dtw-headline--on-black', className)} style={{ fontSize: size, textAlign: align, ...style }} {...rest}>
      {children}
    </h2>
  );
}

/** The red rule, inline. One red gesture per artifact — a word, never two. */
export function RedWord({ children, on = 'paper', underline = false, className, ...rest }: Span & { on?: Ground; underline?: boolean }) {
  return <span className={cx('dtw-redword', on === 'black' && 'dtw-redword--on-black', underline && 'dtw-redword--underline', className)} {...rest}>{children}</span>;
}

/** Voice III — body. Old Standard, always justified. */
export function BodyText({ children, on = 'paper', dropCap, dropCapVoice = 'blackletter', columns = false, italic = false, size = 12.5, className, style, ...rest }:
  Div & { on?: Ground; dropCap?: string; dropCapVoice?: 'blackletter' | 'serif'; columns?: boolean; italic?: boolean; size?: Size }) {
  return (
    <div className={cx('dtw-body', on === 'black' && 'dtw-body--on-black', columns && 'dtw-body--columns', italic && 'dtw-body--italic', className)}
      style={{ fontSize: size, ...style }} {...rest}>
      {dropCap && <span className={cx('dtw-body__dropcap', dropCapVoice === 'serif' && 'dtw-body__dropcap--serif')}>{dropCap}</span>}
      {children}
    </div>
  );
}

/** Voice IV — the typewriter. Manifestos, addresses, labels, colophons. */
export function Typewriter({ children, on = 'paper', tracked = false, caps = false, muted = false, size = 13, align, className, style, ...rest }:
  Div & { on?: Ground; tracked?: boolean; caps?: boolean; muted?: boolean; size?: Size; align?: CSSProperties['textAlign'] }) {
  return (
    <div className={cx('dtw-typewriter', on === 'black' && 'dtw-typewriter--on-black', tracked && 'dtw-typewriter--tracked', caps && 'dtw-typewriter--caps', muted && 'dtw-typewriter--muted', className)}
      style={{ fontSize: size, textAlign: align, ...style }} {...rest}>
      {children}
    </div>
  );
}

/** Voice V — the hand. La Belle Aurore, always in toner black, on paper. */
export function Handwritten({ children, size = 21.5, rotate, className, style, ...rest }: Div & { size?: Size; rotate?: Size }) {
  return <div className={cx('dtw-hand', className)} style={rot(rotate, { fontSize: size, ...style })} {...rest}>{children}</div>;
}

/** Voice VI — Fell SC. Folios and page furniture, set crooked as if stamped. */
export function Folio({ children, on = 'paper', size = 18, rotate = -4, className, style, ...rest }: Span & { on?: Ground; size?: Size; rotate?: Size }) {
  return <span className={cx('dtw-folio', on === 'black' && 'dtw-folio--on-black', className)} style={rot(rotate, { fontSize: size, ...style })} {...rest}>{children}</span>;
}

/* ---------- devices ---------- */

/** Bar heading — type knocked out of a toner-black bar. Knockout, never tinted grey. */
export function BarHeading({ children, voice = 'serif', size, rotate, className, style, ...rest }: Div & { voice?: 'serif' | 'typewriter'; size?: Size; rotate?: Size }) {
  return (
    <div className={cx('dtw-bar-heading', 'dtw-bar-heading--' + voice, className)} style={rot(rotate, size != null ? { fontSize: size, ...style } : style)} {...rest}>
      {children}
    </div>
  );
}

/** Pasted box — a cut-and-taped panel of paper with a hard offset shadow. */
export function PastedBox({ children, rotate = -0.8, bordered = true, maxWidth, className, style, ...rest }: Div & { rotate?: Size; bordered?: boolean; maxWidth?: Size }) {
  return (
    <div className={cx('dtw-pasted-box', !bordered && 'dtw-pasted-box--borderless', className)} style={rot(rotate, { maxWidth, ...style })} {...rest}>
      {children}
    </div>
  );
}

/** Device D03 — pasted slip. A white strip glued over art or black ground. */
export function PastedSlip({ children, voice = 'hand', rotate = -1.6, size, className, style, ...rest }: Div & { voice?: 'hand' | 'typewriter'; rotate?: Size; size?: Size }) {
  return (
    <div className={cx('dtw-pasted-slip', 'dtw-pasted-slip--' + voice, className)} style={rot(rotate, size != null ? { fontSize: size, ...style } : style)} {...rest}>
      {children}
    </div>
  );
}

/** Device D02 — torn scrap. Body text on a ripped patch of paper. */
export function TornScrap({ children, variant = 1, rotate = -0.9, texture = true, className, style, ...rest }: Div & { variant?: 1 | 2 | '1' | '2'; rotate?: Size; texture?: boolean }) {
  return (
    <div className={cx('dtw-torn-scrap', 'dtw-torn-scrap--v' + variant, texture && 'dtw-xerox', className)} style={rot(rotate, style)} {...rest}>
      {children}
    </div>
  );
}

/** Device D01 — spine banner. Vertical script that reads upward and owns the outer edge. */
export function SpineBanner({ children, size = 20.5, minHeight, className, style, ...rest }: Div & { size?: Size; minHeight?: Size }) {
  return (
    <div className={cx('dtw-spine-banner', className)} style={{ minHeight, ...style }} {...rest}>
      <span className="dtw-spine-banner__text" style={{ fontSize: size }}>{children}</span>
    </div>
  );
}

/** Device D06 — frame text. Script running around all four edges of a plate. */
export function FrameText({ top, bottom, left, right, children, width = 300, height = 210, inset, className, style, ...rest }:
  Div & { top?: ReactNode; bottom?: ReactNode; left?: ReactNode; right?: ReactNode; width?: number; height?: number; inset?: { top?: number; left?: number; right?: number; bottom?: number } }) {
  const sw = height * 0.66;
  return (
    <div className={cx('dtw-frame-text', className)} style={{ width, height, ...style }} {...rest}>
      <div className="dtw-frame-text__inner" style={{ top: inset?.top ?? 26, left: inset?.left ?? 34, right: inset?.right ?? 34, bottom: inset?.bottom ?? 30 }}>{children}</div>
      {top && <div className="dtw-frame-text__top">{top}</div>}
      {bottom && <div className="dtw-frame-text__bottom">{bottom}</div>}
      {left && <div className="dtw-frame-text__left" style={{ left: -sw / 2 + 16, width: sw, transform: 'translateY(-50%) rotate(-90deg)' }}>{left}</div>}
      {right && <div className="dtw-frame-text__right" style={{ right: -sw / 2 + 14, width: sw, transform: 'translateY(-50%) rotate(90deg)' }}>{right}</div>}
    </div>
  );
}

/** Device D07 — reversed panel. The black box testament: serif knocked out of toner. */
export function ReversedPanel({ children, attribution, maxWidth, rotate, className, style, ...rest }: Div & { attribution?: ReactNode; maxWidth?: Size; rotate?: Size }) {
  return (
    <div className={cx('dtw-reversed-panel', className)} style={rot(rotate, { maxWidth, ...style })} {...rest}>
      {children}
      {attribution != null && <div className="dtw-reversed-panel__attr">{attribution}</div>}
    </div>
  );
}

/** Attributed quote block — a hard-bordered clipping with italic serif quote + typewriter credit. */
export function QuoteBlock({ children, attribution, maxWidth, rotate, className, style, ...rest }: Div & { attribution?: ReactNode; maxWidth?: Size; rotate?: Size }) {
  return (
    <div className={cx('dtw-quote', className)} style={rot(rotate, { maxWidth, ...style })} {...rest}>
      <div className="dtw-quote__text">{children}</div>
      {attribution != null && <div className="dtw-quote__attr">{attribution}</div>}
    </div>
  );
}

/** Device D05 — X-bullet creed. A manifesto list whose bullets are the hand's script X. */
export function XBulletList({ title, items, size = 12, className, ...rest }: Omit<Div, 'title'> & { title?: ReactNode; items: ReactNode[]; size?: Size }) {
  return (
    <div className={cx('dtw-x-list', className)} {...rest}>
      {title != null && <div className="dtw-x-list__title">{title}</div>}
      {items.map((item, i) => (
        <div className="dtw-x-list__item" key={i} style={{ fontSize: size }}>
          <span className="dtw-x-list__x">X</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

/** Device D04 — photo-in-letter. An image masked into a single serif glyph. */
export function PhotoInLetter({ letter, src, size = 150, className, style, ...rest }: Div & { letter: string; src?: string; size?: Size }) {
  return (
    <div className={cx('dtw-photo-letter', src && 'dtw-photo-letter--img', className)}
      style={src ? { fontSize: size, backgroundImage: `url(${src})`, ...style } : { fontSize: size, ...style }} {...rest}>
      {letter}
    </div>
  );
}

/** Device D10 — red stamps, the only color devices. One stamp per artifact. */
export function RedStamp({ children, shape = 'box', on = 'paper', rotate = -3, size, className, style, ...rest }:
  Div & { shape?: 'box' | 'circle' | 'solid' | 'cross'; on?: Ground; rotate?: Size; size?: number }) {
  if (shape === 'cross') {
    const h = size ?? 38;
    const arm = h * (30 / 38);
    const w = h * (6 / 38);
    return (
      <div className={cx('dtw-redcross', on === 'black' && 'dtw-redcross--on-black', className)} style={rot(rotate, { width: h, height: h, ...style })} {...rest}>
        <div className="dtw-redcross__v" style={{ left: (h - w) / 2, top: 0, width: w, height: h }} />
        <div className="dtw-redcross__h" style={{ left: (h - arm) / 2, top: h * 0.24, width: arm, height: w }} />
      </div>
    );
  }
  const sized = shape === 'circle' ? { width: size ?? 64, height: size ?? 64, ...style } : style;
  return (
    <div className={cx('dtw-stamp', shape === 'circle' && 'dtw-stamp--circle', shape === 'solid' && 'dtw-stamp--solid', on === 'black' && 'dtw-stamp--on-black', className)}
      style={rot(rotate, sized)} {...rest}>
      {shape === 'circle' ? <span>{children}</span> : children}
    </div>
  );
}
