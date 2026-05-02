import { useTheme } from "../../context/ThemeContext";
import { ORG, WORKSHOP_MODS, bb, bc, ba } from "../../utils/homeConstants";
import SecLabel from "./SecLabel";

export default function Workshop() {
  const { isDark } = useTheme();
  const bg     = isDark ? "#071418" : "#f5efe6";
  const cardBg = isDark ? "#0d3040" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC  = isDark ? "#fff" : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3  = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";

  return (
    <section id="workshop" className="overflow-hidden" style={{ background: bg }}>
      <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <SecLabel>Developer Workshop</SecLabel>
            <h2 className="at-reveal at-d1" style={{ ...bb("clamp(40px,6vw,64px)", { lineHeight: .88, letterSpacing: 2, color: textC }) }}>
              BECOME A<br />MASTER OF<br /><span style={{ color: ORG }}>SOFTWARE</span>
            </h2>
            <p className="at-reveal at-d2" style={{ ...ba(15, 300, { color: text2, lineHeight: 1.82, marginTop: 20 }) }}>
              Comprehensive workshops, bootcamps, and seminars to keep developers and their teams current as technology advances.
            </p>
            <div className="at-reveal at-d3 flex flex-col gap-3 mt-7">
              {[
                "Building industry-standard software with modern best practices and methodologies.",
                "Practical understanding of software architecture, testing, and deployment strategies.",
                "Master version control, CI/CD pipelines, and collaborative development workflows.",
              ].map(item => (
                <div key={item} className="flex items-start gap-3" style={{ ...ba(13, 400, { color: text2, lineHeight: 1.65 }) }}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-[6px]" style={{ background: ORG }} />
                  {item}
                </div>
              ))}
            </div>
            <a href="#hire" className="btn-primary at-reveal at-d4 inline-block mt-8"
              style={{ ...bb(18, { letterSpacing: 3, color: "#fff", textDecoration: "none" }), background: ORG, padding: "15px 36px", borderRadius: 4 }}>
              Book a Training
            </a>
          </div>

          {/* Right: module grid */}
          <div className="at-reveal at-d2 relative">
            <div className="absolute inset-[-20px] rounded-lg overflow-hidden z-0">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
                alt="coding workshop"
                className="w-full h-full object-cover opacity-[0.08]"
              />
            </div>
            <div className="grid grid-cols-2 gap-0.5 relative z-10">
              {WORKSHOP_MODS.map(({ Icon, title, sub }) => (
                <div
                  key={title}
                  className="ws-mod p-5 transition-colors duration-200"
                  style={{ background: cardBg, border: `1px solid ${border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? "#0f2636" : "#f2f2f2"}
                  onMouseLeave={e => e.currentTarget.style.background = cardBg}
                >
                  <div className="w-9 h-9 rounded flex items-center justify-center mb-3"
                    style={{ background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)" }}>
                    <Icon size={16} color={ORG} />
                  </div>
                  <div style={{ ...bc(14, 700, { letterSpacing: 1, color: textC, marginBottom: 4 }) }}>{title}</div>
                  <div style={{ ...ba(11, 300, { color: text3, lineHeight: 1.55 }) }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
