import { Suspense, lazy, useState } from 'react';
import {
  BarHeading, BodyText, Folio, Handwritten, Headline, HollowTitle, Masthead, Ornament, PastedBox,
  PastedSlip, PhotoInLetter, Plate, QuoteBlock, RedStamp, ReversedPanel, Sheet, SpineBanner,
  TornScrap, Typewriter, XBulletList,
} from './dtw';

// The statue field pulls in three.js; it loads after the sheet has painted.
const StatueField = lazy(() => import('./statues/StatueField'));

type Work = { n: string; title: string; meta: string; year: string; tilt: number; body: string };

const WORKS: Work[] = [
  { n: '01', title: 'FIRST PROJECT.', meta: 'IDENTITY · PRINT · SET IN LEAD', year: '2026', tilt: -0.9, body: 'Begun in the winter, finished when it stopped arguing back. Two colors, one press, and every proof kept in the drawer.' },
  { n: '02', title: 'SECOND PROJECT.', meta: 'TYPEFACE · TWO WEIGHTS · IN PROGRESS', year: '2026', tilt: 0.8, body: 'A face cut for reading at arm’s length. The italic fought back for a month; the roman surrendered early.' },
  { n: '03', title: 'THIRD PROJECT.', meta: 'ZINE · 32 PAGES · EDITION OF 200', year: '2025', tilt: -0.5, body: 'Thirty-two pages, folded and stapled by hand. Copies were left in laundromats and given to whoever asked twice.' },
  { n: '04', title: 'FOURTH PROJECT.', meta: 'SITE · HAND-CODED · NO FRAMEWORK', year: '2025', tilt: 1.1, body: 'One page, no build step, nothing measured. It loads fast because there is nothing in it that should not be.' },
];

const NOTES = [
  'Finished work, dated and numbered, in the order it was made.',
  'Marginalia: what was read, what was cut, what failed in the press.',
  'Nothing is removed once pasted. The sheet only gets longer.',
];

type Props = { showStatues?: boolean; workLayout?: 'index' | 'cards'; showNotes?: boolean };
type Focus = { w: Work; phase: 'open' | 'closing' } | null;

export default function App({ showStatues = true, workLayout = 'index', showNotes = true }: Props) {
  const [focus, setFocus] = useState<Focus>(null);
  const focusWork = focus?.w;
  const listAnim = focus ? (focus.phase === 'open' ? 'dtwListOff .5s steps(4,end) forwards' : 'dtwListBack .45s steps(4,end) forwards') : 'none';
  const listBg = focus ? '#e8e5dc' : 'transparent';
  const openWork = (w: Work) => (e: React.MouseEvent) => { e.preventDefault(); setFocus({ w, phase: 'open' }); };
  const closeFocus = () => setFocus((f) => (f ? { ...f, phase: 'closing' } : f));
  const focusEnd = () => setFocus((f) => (f && f.phase === 'closing' ? null : f));

  return (
    <div className="page">
      {showStatues && (
        <Suspense fallback={null}>
          <StatueField />
        </Suspense>
      )}
      <Sheet ground="paper" width="100%" padding={0} style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <div data-m="pad" style={{ position: 'relative', zIndex: 1, maxWidth: 940, margin: '0 auto', padding: '38px 28px 140px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, whiteSpace: 'nowrap' }}>
            <BarHeading voice="typewriter" size="10px" rotate="0.7">PORTFOLIO &middot; MMXXVI</BarHeading>
            <Folio size="17px" rotate="-3">&#8470; 01</Folio>
          </div>

          <div style={{ marginTop: 18, whiteSpace: 'nowrap' }}>
            <Masthead size="44px" tagline={<>SELECTED WORK &middot; PRINT</>}>Nomen Nescio</Masthead>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginRight: 12 }}>
            <Handwritten size="20px" rotate="-2.4">your name goes in the bar</Handwritten>
          </div>

          <div data-plx="0.08" data-m="hero" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,150px) minmax(0,1fr)', gap: 26, alignItems: 'start', marginTop: '22vh', maxWidth: 560 }}>
            <PhotoInLetter letter="N" size="150px" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <Headline size="26px">THE WORK IS THE ONLY ARGUMENT.</Headline>
              <BodyText size="13px" dropCap="T">his page is one sheet, photocopied and pasted. New work goes on as it is finished; nothing already pasted is taken down. Everything here was made by hand, in the open, and is legible at arm&#8217;s length.</BodyText>
              <div style={{ marginTop: 6 }}>
                <PastedSlip voice="typewriter" size="11px" rotate="-1.4">AVAILABLE FOR COMMISSIONS &middot; WRITE FIRST, TALK LATER</PastedSlip>
              </div>
            </div>
          </div>

          <div data-plx="-0.05" style={{ marginTop: '22vh' }}>
            <Ornament variant="diamond" />
          </div>

          <div data-plx="0.05" data-m="work" style={{ display: 'flex', gap: 26, alignItems: 'stretch', marginTop: '14vh', maxWidth: 720, marginLeft: 'auto' }}>
            <SpineBanner size="21px" minHeight="360px">the work</SpineBanner>
            <div style={{ flex: 1, minWidth: 0 }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, whiteSpace: 'nowrap' }}>
                <BarHeading voice="serif" size="20px" rotate="-0.5">THE WORK.</BarHeading>
                <RedStamp shape="box" on="paper" rotate="-3.4">TAKE ONE</RedStamp>
              </div>

              {workLayout === 'index' && (
                <div style={{ position: 'relative', marginTop: 22, overflow: 'hidden', minHeight: 420, display: 'flex', flexDirection: 'column' }}>
                  {focusWork && (
                    <div style={{ position: 'absolute', inset: 0, background: '#141412', padding: '20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                        <Typewriter on="black" size="9.5px" tracked caps>THE UNDERSIDE &middot; PROJECT IN FULL</Typewriter>
                        <Folio size="15px" rotate="-3" style={{ color: '#e8e5dc' }}>{focusWork.n}</Folio>
                      </div>
                      <Headline on="black" size="21px">{focusWork.title}</Headline>
                      <BodyText on="black" size="12px">{focusWork.body}</BodyText>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginTop: 'auto', flexWrap: 'wrap' }}>
                        <Typewriter on="black" size="9px" tracked caps muted>{focusWork.meta} &middot; {focusWork.year}</Typewriter>
                        <button type="button" className="back-btn" onClick={closeFocus}>
                          <Typewriter on="black" size="11px" tracked caps>&larr; BACK TO THE LIST</Typewriter>
                        </button>
                      </div>
                    </div>
                  )}
                  <div onAnimationEnd={focusEnd} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid #1a1a18', background: listBg, animation: listAnim }}>
                    {WORKS.map((w) => (
                      <a key={w.n} href="#" className="work-row" onClick={openWork(w)}>
                        <Folio size="15px" rotate="-4">{w.n}</Folio>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                          <Headline size="17px">{w.title}</Headline>
                          <Typewriter size="10px" tracked caps muted>{w.meta}</Typewriter>
                        </div>
                        <Folio size="14px" rotate="2">{w.year}</Folio>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {workLayout === 'cards' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 26, marginTop: 26 }}>
                  {WORKS.map((w) => (
                    <PastedBox key={w.n} rotate={w.tilt}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Plate label="WORK PLATE" height="120px" tone="hatch-tone" />
                        <Headline size="15px">{w.title}</Headline>
                        <Typewriter size="10px" tracked caps muted>{w.meta}</Typewriter>
                      </div>
                    </PastedBox>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 18, marginLeft: 10 }}>
                <Handwritten size="19px" rotate="-1.6">new work gets pasted in here</Handwritten>
              </div>

            </div>
          </div>

          <div data-m="stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 60, alignItems: 'start', marginTop: '24vh' }}>
            <Plate data-plx="0.12" label="STUDIO PLATE" caption="THE WORKING TABLE" height="260px" rotate="-0.8" />
            <div data-plx="-0.06" style={{ display: 'flex', flexDirection: 'column', gap: 36, marginTop: '10vh' }}>
              <QuoteBlock attribution={<>&mdash; ST. ISAAC OF SYRIA (7TH CENTURY)</>} rotate="0.6">&ldquo;Be at peace with your own soul, then heaven and earth will be at peace with you.&rdquo;</QuoteBlock>
              <TornScrap variant="1" rotate="-1.2">Process notes, offcuts and rejected plates are kept. Ask and they will be shown.</TornScrap>
            </div>
          </div>

          {showNotes && (
            <div style={{ marginTop: '26vh' }}>
              <Ornament variant="stars" />
              <div data-m="stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', gap: 60, alignItems: 'start', marginTop: 90 }}>
                <div data-plx="0.04" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18, maxWidth: 420 }}>
                  <BarHeading voice="serif" size="18px" rotate="0.4">NOTES.</BarHeading>
                  <XBulletList title={<>1.&#160; WHAT IS KEPT HERE:</>} items={NOTES} size="12.5px" />
                </div>
                <ReversedPanel data-plx="-0.1" attribution={<>&mdash;the colophon</>} rotate="-0.7" style={{ marginTop: '12vh' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Headline on="black" size="17px">FREEDOM FROM THE TYRANNY OF FASHION.</Headline>
                    <BodyText on="black" size="12px">Set in Old Standard, Special Elite and Pirata One. Assembled by hand, copied twice, and posted without apology. No trackers, no newsletter, no scroll-jacking beyond the statues.</BodyText>
                  </div>
                </ReversedPanel>
              </div>
            </div>
          )}

          <div style={{ marginTop: '26vh' }}>
            <Ornament variant="bar" />
          </div>

          <div data-m="stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 30, alignItems: 'center', marginTop: '12vh', minHeight: '40vh' }}>
            <div data-plx="0.06" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 16, maxWidth: 360 }}>
              <HollowTitle size="40px" on="paper">Elsewhere</HollowTitle>
              <PastedBox rotate="0.7" maxWidth="360px">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Typewriter size="12px"><a href="mailto:you@example.com">you@example.com</a></Typewriter>
                  <Typewriter size="12px"><a href="#">instagram &mdash; @handle</a></Typewriter>
                  <Typewriter size="12px"><a href="#">github &mdash; /handle</a></Typewriter>
                </div>
              </PastedBox>
            </div>
            <div data-plx="-0.08" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
              <Handwritten size="20px" rotate="-2">write, and it will be answered</Handwritten>
              <Folio size="16px" rotate="-4" style={{ whiteSpace: 'nowrap' }}>&#8470; 01 &middot; MMXXVI</Folio>
            </div>
          </div>

          <div style={{ marginTop: '12vh' }}>
            <Typewriter size="9.5px" tracked caps muted align="center">One sheet &middot; photocopied &middot; pass it on</Typewriter>
          </div>

        </div>
      </Sheet>
    </div>
  );
}
