import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ORG, SERVICES, bb, bc, ba } from "../../utils/homeConstants";
import SecLabel from "./SecLabel";

function SvcCard({ num, title, Icon, desc }) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);
  const cardBg = isDark ? "#0d3040" : "#ffffff";
  const surface= isDark ? "#0f2636" : "#f6f6f6";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3  = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";

  return (
    <div
      className="svc-card at-reveal relative overflow-hidden cursor-default p-8 sm:p-10"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? surface : cardBg, border: `1px solid ${hov ? ORG : border}` }}
    >
      <div className="svc-bar absolute top-0 left-0 right-0 h-[3px]" style={{ background: ORG }} />
      <div style={{ ...bb(38, { color: text3, lineHeight: 1, marginBottom: 16 }) }}>{num}</div>
      <div className="inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-[3px] mb-3"
        style={{ background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)" }}>
        <Icon size={11} color={ORG} />
        <span style={{ ...bc(9, 700, { letterSpacing: 2, textTransform: "uppercase", color: ORG }) }}>Available Now</span>
      </div>
      <div style={{ ...bb(24, { letterSpacing: 2, color: textC, marginBottom: 8 }) }}>{title}</div>
      <p style={{ ...ba(13, 300, { color: text2, lineHeight: 1.78 }) }}>{desc}</p>
      <div className="flex items-center gap-1.5 mt-5 cursor-pointer"
        style={{ ...bc(12, 700, { letterSpacing: 2, textTransform: "uppercase", color: ORG }) }}>
        Learn More <ArrowRight size={12} />
      </div>
    </div>
  );
}

export default function Services() {
  const { isDark } = useTheme();
  const bg    = isDark ? "#071418" : "#f5efe6";
  const textC = isDark ? "#fff"    : "#071418";
  const text3 = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";

  return (
    <section id="services" className="overflow-hidden" style={{ background: bg }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
        <SecLabel>What We Do</SecLabel>
        <h2 className="at-reveal at-d1" style={{ ...bb("clamp(44px,7vw,76px)", { lineHeight: .88, letterSpacing: 2, color: textC }) }}>
          OUR<br /><span style={{ color: ORG }}>SERVICES</span><br /><span style={{ color: text3 }}>FOR YOU</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 mt-14">
          {SERVICES.map(s => <SvcCard key={s.num} {...s} />)}
        </div>
      </div>
    </section>
  );
}
