import { useTheme } from "../../context/ThemeContext";
import { PARTNERS, ORG, TEAL, bc } from "../../utils/homeConstants";

export default function Partners() {
  const { isDark } = useTheme();
  const bg     = isDark ? "#071418" : "#f5efe6";
  const cardBg = isDark ? "#0d3040" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3  = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";
  const doubled = [...PARTNERS, ...PARTNERS];

  return (
    <div id="partners" className="py-12 overflow-hidden" style={{ background: bg, borderBottom: `1px solid ${border}` }}>
      <p className="text-center mb-7" style={{ ...bc(11, 700, { letterSpacing: 4, textTransform: "uppercase", color: text3 }) }}>
        ABYTECH HUB is trusted by 10+ companies across the world
      </p>
      <div className="relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-20 sm:w-28 pointer-events-none z-[2]"
          style={{ background: `linear-gradient(90deg,${bg},transparent)` }} />
        <div className="absolute top-0 bottom-0 right-0 w-20 sm:w-28 pointer-events-none z-[2]"
          style={{ background: `linear-gradient(-90deg,${bg},transparent)` }} />
        <div className="marquee-track">
          {doubled.map((name, i) => (
            <div key={`${name}-${i}`} className="partner-chip flex items-center gap-2.5 rounded-md px-5 py-2.5 shrink-0"
              style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: i % 2 === 0 ? TEAL : ORG }} />
              <div style={{ ...bc(13, 700, { letterSpacing: 2, textTransform: "uppercase", color: text2 }) }}>{name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
