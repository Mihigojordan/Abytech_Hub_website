import { useTheme } from "../../context/ThemeContext";
import { ORG, NEWS_ITEMS, bb, bc, ba } from "../../utils/homeConstants";
import SecLabel from "./SecLabel";

export default function NewsSection() {
  const { isDark } = useTheme();
  const bg3    = isDark ? "#0d3040" : "#ddd5c8";
  const cardBg = isDark ? "#0a1e28" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3  = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";

  return (
    <section id="news" className="overflow-hidden" style={{ background: bg3 }}>
      <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
        <SecLabel>Daily News</SecLabel>
        <h2 className="at-reveal at-d1" style={{ ...bb("clamp(44px,7vw,76px)", { lineHeight: .88, letterSpacing: 2, color: textC }) }}>
          NEWS &<br /><span style={{ color: ORG }}>INSIGHTS</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 mt-14">
          {NEWS_ITEMS.map(({ abbr, tag, date, title, desc, img }, i) => (
            <div key={abbr}
              className={`news-card at-reveal overflow-hidden cursor-pointer ${i > 0 ? `at-d${i}` : ""}`}
              style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="h-[180px] sm:h-[195px] relative overflow-hidden flex items-center justify-center">
                <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(26,92,120,.82),rgba(232,98,26,.42))" }} />
                <div className="absolute inset-0" style={{ background: ORG, clipPath: "polygon(60% 0%,80% 0%,56% 100%,36% 100%)", opacity: .28 }} />
                <div className="relative z-[2]" style={{ ...bb(48, { color: "rgba(255,255,255,.25)", letterSpacing: 3 }) }}>{abbr}</div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="inline-block rounded-[3px] px-2.5 py-[3px] mb-3"
                  style={{ background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)", ...bc(9, 700, { letterSpacing: 2, textTransform: "uppercase", color: ORG }) }}>
                  {tag}
                </div>
                <div className="mb-2" style={{ ...ba(10, 400, { color: text3, letterSpacing: 1 }) }}>{date}</div>
                <div className="mb-2" style={{ ...bc(17, 700, { letterSpacing: .4, color: textC, lineHeight: 1.32 }) }}>{title}</div>
                <p style={{ ...ba(12, 300, { color: text2, lineHeight: 1.72 }) }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
