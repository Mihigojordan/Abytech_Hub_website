import { useTheme } from "../context/ThemeContext";
import { ORG, TEAL } from "../utils/homeConstants";

const CSS = `
  @keyframes ls-bar {
    0%   { transform: scaleX(0); }
    50%  { transform: scaleX(0.65); }
    80%  { transform: scaleX(0.88); }
    100% { transform: scaleX(1); }
  }
  @keyframes ls-fade {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ls-fade-r {
    from { opacity: 0; transform: translateX(18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ls-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: .3; }
  }
  @keyframes ls-grid {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes ls-circle-in {
    from { opacity: 0; transform: scale(.82); }
    to   { opacity: 1; transform: scale(1); }
  }
  .ls-a1 { animation: ls-fade .25s ease both; }
  .ls-a2 { animation: ls-fade .25s .04s ease both; }
  .ls-a3 { animation: ls-fade .25s .08s ease both; }
  .ls-a4 { animation: ls-fade .25s .12s ease both; }
  .ls-a5 { animation: ls-fade .25s .16s ease both; }
  .ls-ar { animation: ls-fade-r .3s .06s ease both; }
  .ls-ci { animation: ls-circle-in .3s .08s ease both; }
  .ls-bar { animation: ls-bar .9s cubic-bezier(.4,0,.2,1) forwards; transform-origin: left; }
  .ls-dot { animation: ls-pulse .7s ease-in-out infinite; }
  .ls-dot:nth-child(2) { animation-delay: .1s; }
  .ls-dot:nth-child(3) { animation-delay: .2s; }
  .ls-grid-bg { animation: ls-grid .2s ease both; }
`;

/* ── Shared SVG logo (A + T mark) ─────────────── */
function ATMark({ size = 72, dark = true }) {
  const teal   = dark ? "#1a5c78" : "#1a5c78";
  const orange = ORG;
  const bg     = dark ? "rgba(255,255,255,.06)" : "rgba(7,20,24,.06)";
  return (
    <svg width={size} height={size * 0.88} viewBox="0 0 200 176" fill="none">
      {/* A shape */}
      <polygon points="90,10 180,166 148,166 90,60 32,166 0,166" fill={teal} />
      <polygon points="90,60 74,116 106,116" fill={dark ? "#071418" : "#f5efe6"} />
      {/* T crossbar */}
      <rect x="106" y="14" width="72" height="22" fill={orange} />
      {/* T stem */}
      <rect x="125" y="14" width="28" height="90" fill={orange} />
    </svg>
  );
}

/* ── DARK banner ──────────────────────────────── */
function DarkBanner() {
  const navyBg  = "#0b1923";
  const navyBg2 = "#0d1f2d";
  const gridCol = "rgba(255,255,255,.045)";

  return (
    <div className="fixed w-full h-dvh  overflow-hidden flex flex-col" style={{ background: navyBg }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Grid lines */}
      <div className="ls-grid-bg absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(${gridCol} 1px,transparent 1px),linear-gradient(90deg,${gridCol} 1px,transparent 1px)`,
        backgroundSize: "72px 72px",
      }} />

      {/* Corner crosses */}
      {[["top-8 left-8"],["top-8 right-8"],["bottom-8 left-8"],["bottom-8 right-8"]].map(([cls],i)=>(
        <div key={i} className={`absolute ${cls} pointer-events-none`} style={{ width:18,height:18 }}>
          <div style={{ position:"absolute",top:"50%",left:0,right:0,height:1,background:gridCol,transform:"translateY(-50%)" }} />
          <div style={{ position:"absolute",left:"50%",top:0,bottom:0,width:1,background:gridCol,transform:"translateX(-50%)" }} />
        </div>
      ))}

      {/* Top label */}
      <div className="ls-a1 relative z-10 pt-8 pl-10 sm:pl-16"
        style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:5, textTransform:"uppercase", color:"rgba(255,255,255,.4)" }}>
        ABYTECH-HUB &nbsp;·&nbsp; INTERNSHIP
      </div>

      {/* Main content row */}
      <div className="relative z-10 flex flex-1 items-center justify-between px-10 sm:px-16">

        {/* Left: headline */}
        <div className="flex flex-col gap-0">
          <div className="ls-a2" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(64px,11vw,148px)", lineHeight:.88, color:TEAL, letterSpacing:4 }}>
            BUILDING
          </div>
          <div className="ls-a3" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(64px,11vw,148px)", lineHeight:.88, color:"#fff", letterSpacing:4 }}>
            TECHNO
          </div>
          <div className="ls-a4" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(64px,11vw,148px)", lineHeight:.88, color:ORG, letterSpacing:4 }}>
            LOGY
          </div>
        </div>

        {/* Right: logo in circle */}
        <div className="ls-ci hidden sm:flex items-center justify-center shrink-0"
          style={{ width:"clamp(200px,28vw,360px)", height:"clamp(200px,28vw,360px)", borderRadius:"50%", border:`1px solid rgba(232,98,26,.35)`, background:"rgba(232,98,26,.04)" }}>
          <ATMark size={Math.min(180, 140)} dark={true} />
        </div>
      </div>

      {/* Stats row */}
      <div className="ls-a5 relative z-10 px-10 sm:px-16 pb-10 flex items-end gap-8 sm:gap-14">
        {[["10+","EXPERIENCE"],["500+","PROJECTS"],["10+","PARTNERS"],["Open","APPLY NOW"]].map(([big,small])=>(
          <div key={big}>
            <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:"clamp(15px,2vw,22px)", fontWeight:700, color:ORG, letterSpacing:.5 }}>{big}</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:4, textTransform:"uppercase", color:"rgba(255,255,255,.35)", marginTop:1 }}>{small}</div>
          </div>
        ))}
        {/* size hint */}
        <div className="hidden md:block ml-auto" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:3, color:"rgba(255,255,255,.18)", textTransform:"uppercase" }}>
          Loading…
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height:6, background:"rgba(255,255,255,.06)" }}>
        <div className="ls-bar h-full" style={{ background:`linear-gradient(90deg,${TEAL},${ORG})` }} />
      </div>

      {/* Pulsing dots overlay bottom-right */}
      <div className="absolute bottom-5 right-8 flex items-center gap-2">
        {[0,1,2].map(i=>(
          <div key={i} className="ls-dot w-1.5 h-1.5 rounded-full" style={{ background:ORG }} />
        ))}
      </div>
    </div>
  );
}

/* ── LIGHT banner ─────────────────────────────── */
function LightBanner() {
  const leftBg  = "#0d1b2e";
  const rightBg = "#f5efe6";

  return (
    <div className="fixed inset-0 overflow-hidden flex" >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* LEFT panel */}
      <div className="relative flex flex-col justify-between py-10 px-9 sm:px-14 shrink-0"
        style={{ background:leftBg, width:"clamp(220px,35%,460px)" }}>

        {/* Label */}
        <div className="ls-a1"
          style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:5, textTransform:"uppercase", color:ORG }}>
          INTERNSHIP PROGRAM
        </div>

        {/* Headline */}
        <div>
          <div className="ls-a2" style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(36px,5.5vw,82px)", fontWeight:700, color:"#fff", lineHeight:1.05 }}>
            Start<br />Your
          </div>
          <div className="ls-a3" style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(36px,5.5vw,82px)", fontWeight:700, color:ORG, lineHeight:1.05, fontStyle:"italic" }}>
            Journey.
          </div>
          <div className="ls-a4 mt-5" style={{ width:36, height:2, background:"rgba(255,255,255,.25)" }} />
        </div>

        {/* Bottom site */}
        <div className="ls-a5"
          style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:4, textTransform:"uppercase", color:"rgba(255,255,255,.38)" }}>
          ABYTECHHUB.COM
        </div>

        {/* Progress bar on left edge */}
        <div className="absolute right-0 top-0 bottom-0 w-[3px]">
          <div className="ls-bar w-full h-full origin-top"
            style={{ background:`linear-gradient(180deg,${ORG},${TEAL})`, transformOrigin:"top" }} />
        </div>
      </div>

      {/* RIGHT panel */}
      <div className="ls-ar relative flex-1 flex flex-col justify-between py-10 px-9 sm:px-14 overflow-hidden" style={{ background:rightBg }}>

        {/* Ghost "A" watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(200px,35vw,480px)", color:"rgba(7,20,24,.05)", lineHeight:1, userSelect:"none", right:"-2%" }}>
          A
        </div>

        {/* Top label */}
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:5, textTransform:"uppercase", color:TEAL }}>
          ABYTECH-HUB &nbsp;·&nbsp; NOW ACCEPTING APPLICATIONS
        </div>

        {/* Main headline */}
        <div className="relative z-10">
          <div style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(48px,8vw,120px)", fontWeight:700, color:"#0d1b2e", lineHeight:.92 }}>
            Real
          </div>
          <div style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(48px,8vw,120px)", fontWeight:700, color:TEAL, lineHeight:.92, fontStyle:"italic" }}>
            Experience.
          </div>
        </div>

        {/* Bottom: logo + label */}
        <div className="relative z-10 flex items-center gap-5">
          <ATMark size={36} dark={false} />
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:700, letterSpacing:2, color:"#0d1b2e" }}>
              ABY<span style={{ color:ORG }}>TECH</span>-HUB
            </div>
          </div>
          <div style={{ width:1, height:36, background:"rgba(7,20,24,.2)", margin:"0 8px" }} />
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:4, textTransform:"uppercase", color:"rgba(7,20,24,.45)" }}>
            TECHNOLOGY INTERNSHIP
          </div>
        </div>

        {/* Pulsing dots */}
        <div className="absolute bottom-5 right-8 flex items-center gap-2">
          {[0,1,2].map(i=>(
            <div key={i} className="ls-dot w-1.5 h-1.5 rounded-full" style={{ background:ORG }} />
          ))}
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height:4, background:"rgba(7,20,24,.07)" }}>
          <div className="ls-bar h-full" style={{ background:`linear-gradient(90deg,${ORG},${TEAL})` }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────── */
export default function LoadingScreen() {
  const { isDark } = useTheme();
  return isDark ? <DarkBanner /> : <LightBanner />;
}
