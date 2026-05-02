import { ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ORG, TEAL, SOLUTIONS, bb, bc, ba } from "../../utils/homeConstants";
import SecLabel from "./SecLabel";

export default function Solutions() {
  const { isDark } = useTheme();
  const bg2    = isDark ? "#0a1e28" : "#ede5da";
  const cardBg = isDark ? "#0d3040" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";

  return (
    <section id="solutions" className="overflow-hidden" style={{ background: bg2 }}>
      <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
        <SecLabel>Our Solutions</SecLabel>
        <h2 className="at-reveal at-d1" style={{ ...bb("clamp(44px,7vw,76px)", { lineHeight: .88, letterSpacing: 2, color: textC }) }}>
          WHY WE<br /><span style={{ color: ORG }}>STAND</span><br />OUT
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 mt-14">
          {SOLUTIONS.map(({ num, Icon, title, desc }, i) => (
            <div key={num}
              className={`sol-card at-reveal relative overflow-hidden p-8 sm:p-11 ${i > 0 ? `at-d${i}` : ""}`}
              style={{ background: cardBg, border: `1px solid ${border}` }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? "#0f2636" : "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.background = cardBg}
            >
              <div className="absolute top-4 right-6" style={{ ...bb(60, { lineHeight: 1, color: ORG, opacity: .15 }) }}>{num}</div>
              <div className="w-12 h-12 rounded-md flex items-center justify-center mb-5"
                style={{ background: "rgba(26,92,120,.15)", border: "1px solid rgba(26,92,120,.3)" }}>
                <Icon size={22} color={TEAL} />
              </div>
              <div style={{ ...bb(26, { letterSpacing: 2, color: textC, marginBottom: 8 }) }}>{title}</div>
              <p style={{ ...ba(13, 300, { color: text2, lineHeight: 1.78, marginBottom: 20 }) }}>{desc}</p>
              <div className="flex items-center gap-1.5"
                style={{ ...bc(12, 700, { letterSpacing: 2, textTransform: "uppercase", color: ORG }) }}>
                View Details <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
