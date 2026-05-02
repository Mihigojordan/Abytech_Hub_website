import { useTheme } from "../../context/ThemeContext";
import { ORG, TEAL, TESTIMONIALS, bb, bc, ba } from "../../utils/homeConstants";
import SecLabel from "./SecLabel";

export default function Testimonials() {
  const { isDark } = useTheme();
  const bg2    = isDark ? "#0a1e28" : "#ede5da";
  const cardBg = isDark ? "#0d3040" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3  = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";

  return (
    <section id="testimonials" className="overflow-hidden" style={{ background: bg2 }}>
      <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
        <SecLabel>What Our Clients Say</SecLabel>
        <h2 className="at-reveal at-d1" style={{ ...bb("clamp(44px,7vw,76px)", { lineHeight: .88, letterSpacing: 2, color: textC }) }}>
          REAL<br /><span style={{ color: ORG }}>STORIES</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 mt-14">
          {TESTIMONIALS.map(({ initials, name, role, date, text }, i) => (
            <div key={name}
              className={`at-reveal relative overflow-hidden p-7 sm:p-9 ${i % 3 > 0 ? `at-d${i % 3}` : ""}`}
              style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="absolute top-[-12px] left-[18px]" style={{ ...bb(90, { color: ORG, opacity: .1, lineHeight: 1 }) }}>"</div>
              <p className="relative z-[1] mb-5" style={{ ...ba(14, 300, { color: text2, lineHeight: 1.82, fontStyle: "italic" }) }}>
                &ldquo;{text}&rdquo;
              </p>
              <div className="flex items-center gap-3 relative z-[1]">
                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                  style={{ ...bb(14, { color: "#fff" }), background: TEAL }}>
                  {initials}
                </div>
                <div>
                  <div style={{ ...bc(14, 700, { letterSpacing: 1, color: textC }) }}>{name}</div>
                  <div className="mt-0.5" style={{ ...ba(11, 400, { color: text3 }) }}>{role}</div>
                </div>
              </div>
              <div className="mt-3" style={{ ...ba(10, 400, { color: text3, letterSpacing: 1 }) }}>{date}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
