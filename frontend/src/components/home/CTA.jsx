import { useTheme } from "../../context/ThemeContext";
import { ORG, bb, ba, bc } from "../../utils/homeConstants";

export default function CTA() {
  const { isDark } = useTheme();

  const bg      = isDark ? "#040f13" : "#0f1f2b";
  const textC   = "#fff";
  const subText = isDark ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.7)";
  const meta    = isDark ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.35)";

  return (
    <section id="cta" className="relative overflow-hidden" style={{ background: bg }}>
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=70"
          alt="tech background" className="w-full h-full object-cover"
          style={{ opacity: isDark ? .07 : .12 }} />
      </div>
      <div className="absolute inset-0" style={{ background: ORG, clipPath: "polygon(0 0,28% 0,22% 100%,0 100%)", opacity: isDark ? .16 : .22 }} />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24 relative z-[2]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div>
            <h2 className="at-reveal" style={{ ...bb("clamp(52px,8vw,96px)", { lineHeight: .87, letterSpacing: 2, color: textC }) }}>
              LET'S BUILD<br /><span style={{ color: ORG }}>TOGETHER.</span>
            </h2>
            <p className="at-reveal at-d1 mt-5 max-w-[480px]"
              style={{ ...ba(15, 300, { color: subText, lineHeight: 1.82 }) }}>
              Thank you for visiting AbyTech Hub! We are dedicated to delivering top-notch technology solutions. Let's build something great together.
            </p>
          </div>
          <div className="at-reveal at-d2 flex flex-col items-start lg:items-center gap-4 shrink-0">
            <a href="https://abytechhub.com/" target="_blank" rel="noreferrer"
              className="btn-primary inline-block no-underline text-center"
              style={{ ...bb(18, { letterSpacing: 3, color: "#fff" }), background: ORG, padding: "16px 48px", borderRadius: 4, boxShadow: "0 8px 32px rgba(232,98,26,.38)" }}>
              Get In Touch
            </a>
            <div style={{ ...bc(11, 700, { letterSpacing: 4, textTransform: "uppercase", color: meta }) }}>
              abytechhub.com
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
