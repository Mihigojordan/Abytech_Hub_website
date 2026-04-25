import { useTheme } from "../../context/ThemeContext";
import { ORG, PROCESS, bb, ba } from "../../utils/homeConstants";
import SecLabel from "./SecLabel";

export default function Process() {
  const { isDark } = useTheme();
  const bg3    = isDark ? "#0d3040" : "#ddd5c8";
  const surface= isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";

  return (
    <section id="process" className="overflow-hidden" style={{ background: bg3 }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
        <SecLabel>How We Work</SecLabel>
        <h2 className="at-reveal at-d1" style={{ ...bb("clamp(44px,7vw,76px)", { lineHeight: .88, letterSpacing: 2, color: textC }) }}>
          OUR WORKING<br /><span style={{ color: ORG }}>PROCESS</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mt-14" style={{ border: `1px solid ${border}` }}>
          {PROCESS.map(({ num, title, desc }, i) => (
            <div key={num}
              className={`ps-step at-reveal p-8 sm:p-10 relative ${i > 0 ? `at-d${Math.min(i, 4)}` : ""}`}
              style={{
                borderRight:  i < 4 ? `1px solid ${border}` : "none",
                borderBottom: i < 3 && i % 2 === 0 ? `1px solid ${border}` : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = surface}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ ...bb(48, { color: ORG, opacity: .18, lineHeight: 1, marginBottom: 12 }) }}>{num}</div>
              <div style={{ ...bb(18, { letterSpacing: 2, color: textC, marginBottom: 6 }) }}>{title}</div>
              <p style={{ ...ba(12, 300, { color: text2, lineHeight: 1.72 }) }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
