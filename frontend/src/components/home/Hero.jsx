import { ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ORG, TEAL, bb, bc } from "../../utils/homeConstants";
import heroPng from "../../assets/erasebg-transformed.png";

const STATS = [
  ["10+",  "Years\nExperience"],
  ["500+", "Projects\nDelivered"],
  ["10+",  "Trusted\nPartners"],
  ["Live", "Internship\nOpen"],
];

export default function Hero() {
  const { isDark } = useTheme();
  const bg    = isDark ? "#0a1e28" : "#ede5da";
  const textC = isDark ? "#fff"    : "#071418";
  const text2 = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const border= isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";

  return (
    <section id="hero" className="relative overflow-hidden flex items-center min-h-screen pt-[72px]" style={{ background: bg }}>
      {/* Diagonal slashes */}
      <div className="absolute inset-0" style={{ background: ORG,  clipPath: "polygon(55% 0%,74% 0%,51% 100%,32% 100%)", opacity: .82 }} />
      <div className="absolute inset-0" style={{ background: TEAL, clipPath: "polygon(59% 0%,64% 0%,41% 100%,36% 100%)", opacity: .7  }} />
      {/* Dot grid */}
      <div className="absolute z-[1] hidden lg:block" style={{
        top: 80, right: 100, width: 160, height: 160,
        backgroundImage: `radial-gradient(circle,${isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"} 1.5px,transparent 1.5px)`,
        backgroundSize: "18px 18px",
      }} />
      {/* Scanlines */}
      <div className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.006) 3px,rgba(255,255,255,.006) 4px)" }} />

      {/* Foreground character image — right side */}
      <img src={heroPng} alt="AbyTech"
        className="absolute bottom-0 right-0 z-[4] hidden lg:block pointer-events-none"
        style={{ height: "88%", width: "auto", objectFit: "contain", objectPosition: "bottom right" }} />

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-10 lg:px-20 max-w-[780px]">
        <div className="flex items-center gap-3 mb-5" style={{ ...bc(11, 700, { letterSpacing: 6, textTransform: "uppercase", color: ORG }), animation: "atUp .7s ease both" }}>
          <div className="w-8 h-0.5 shrink-0" style={{ background: ORG }} />
          Technology · Innovation · Rwanda
        </div>
        <h1 style={{ ...bb("clamp(56px,10vw,110px)", { lineHeight: .86, color: textC, letterSpacing: 2 }), animation: "atUp .7s .08s ease both" }}>
          BUILDING<br />TECHNOLOGY.<br />
          <span style={{ color: ORG }}>POWERING</span><br />
          <span style={{ color: isDark ? "rgba(255,255,255,.1)" : "rgba(7,20,24,.08)" }}>INNOVATION.</span>
        </h1>
        <p className="mt-5 max-w-[520px]" style={{ ...bc(15, 400, { letterSpacing: 1.5, textTransform: "uppercase", color: text2, lineHeight: 1.7 }), animation: "atUp .7s .18s ease both" }}>
          Creating scalable technology solutions for a digital world.<br className="hidden sm:block" />
          We design, build, and scale modern digital products.
        </p>
        <div className="flex flex-wrap items-center gap-5 mt-10" style={{ animation: "atUp .7s .26s ease both" }}>
          <a href="#hire" className="btn-primary inline-block no-underline"
            style={{ ...bb(16, { letterSpacing: 3, color: "#fff" }), background: ORG, padding: "14px 32px", borderRadius: 4, boxShadow: "0 8px 28px rgba(232,98,26,.35)" }}>
            Get In Touch
          </a>
          <a href="#about" className="flex items-center gap-2 no-underline"
            style={{ ...bc(13, 700, { letterSpacing: 3, textTransform: "uppercase", color: text2 }) }}>
            Join Our Talent <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 lg:grid-cols-4 z-10 px-5 sm:px-10 lg:px-20"
        style={{
          background: isDark ? "rgba(26,92,120,.13)" : "rgba(26,92,120,.07)",
          borderTop: `1px solid ${isDark ? "rgba(26,92,120,.3)" : "rgba(26,92,120,.14)"}`,
          animation: "atUp .7s .38s ease both",
        }}>
        {STATS.map(([val, key], i) => (
          <div key={i} className="flex items-center gap-4 py-5 px-4 sm:px-6"
            style={{ borderRight: (i === 1 || i < 3) ? `1px solid ${border}` : "none", borderBottom: i < 2 ? `1px solid ${border}` : "none" }}>
            <div style={{ ...bb(32, { color: ORG, lineHeight: 1 }) }}>{val}</div>
            <div className="whitespace-pre-line" style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: "uppercase", color: text2, lineHeight: 1.5 }) }}>{key}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
