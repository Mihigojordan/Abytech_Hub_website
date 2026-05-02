import { CheckCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ORG, TEAL, bb, bc, ba } from "../../utils/homeConstants";
import SecLabel from "./SecLabel";
import aboutImg from "../../assets/untitled folder/image1.jpg";

export default function About() {
  const { isDark } = useTheme();
  const bg2   = isDark ? "#0a1e28" : "#ede5da";
  const bg3   = isDark ? "#0d3040" : "#ddd5c8";
  const border= isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC = isDark ? "#fff"    : "#071418";
  const text2 = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3 = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";

  return (
    <section id="about" className="overflow-hidden" style={{ background: bg3 }}>
      <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <SecLabel>Who We Are</SecLabel>
            <h2 className="at-reveal at-d1" style={{ ...bb("clamp(44px,7vw,76px)", { lineHeight: .88, letterSpacing: 2, color: textC }) }}>
              CRAFTING<br />DIGITAL<br /><span style={{ color: ORG }}>SOLUTIONS</span>
            </h2>
            <p className="at-reveal at-d2 mt-5" style={{ ...ba(15, 300, { lineHeight: 1.9, color: text2 }) }}>
              ABYTECH is a cutting-edge software development company delivering world-class digital solutions. We transform ideas into powerful applications, driving business growth through innovative technology and expert engineering.
            </p>
            <div className="at-reveal at-d3 flex flex-col gap-3 mt-7">
              {[
                "Custom software development & engineering",
                "Agile methodology & rapid deployment",
                "Dedicated teams & technical expertise",
                "Scalable, secure, and future-proof solutions",
              ].map(item => (
                <div key={item} className="flex items-center gap-3" style={{ ...ba(14, 400, { color: text2 }) }}>
                  <div className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(232,98,26,.12)", border: "1px solid rgba(232,98,26,.3)" }}>
                    <CheckCircle size={11} color={ORG} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="grid grid-cols-2 gap-0.5">
              <div className="at-reveal at-d1 p-7" style={{ background: bg2, border: `1px solid ${border}` }}>
                <div style={{ ...bb(56, { color: ORG, lineHeight: 1 }) }}>10+</div>
                <div className="mt-1" style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: "uppercase", color: text2 }) }}>Years Experience</div>
                <div className="mt-1.5 leading-relaxed" style={{ ...ba(12, 300, { color: text3 }) }}>Building technology that powers businesses globally</div>
              </div>
              <div className="at-reveal at-d2 p-7" style={{ background: bg2, border: `1px solid ${border}` }}>
                <div style={{ ...bb(56, { color: ORG, lineHeight: 1 }) }}>500+</div>
                <div className="mt-1" style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: "uppercase", color: text2 }) }}>Projects Delivered</div>
                <div className="mt-1.5 leading-relaxed" style={{ ...ba(12, 300, { color: text3 }) }}>Across web, mobile, software, and cloud</div>
              </div>
              <div className="at-reveal at-d3 col-span-2 h-[200px] lg:h-[230px] relative overflow-hidden flex items-center justify-center"
                style={{ background: TEAL }}>
                <img src={aboutImg}
                  alt="AbyTech team" className="absolute inset-0 w-full h-full object-cover opacity-45" />
                <div className="absolute inset-0" style={{ background: ORG, clipPath: "polygon(60% 0%,80% 0%,56% 100%,36% 100%)", opacity: .22 }} />
                <div className="relative z-[1]" style={{ ...bb(120, { lineHeight: .85, color: "rgba(255,255,255,.06)", letterSpacing: 4, userSelect: "none" }) }}>AT</div>
                <div className="absolute z-[3]">
                  <svg width={72} height={72} viewBox="0 0 200 200" fill="none">
                    <polygon points="100,10 190,190 155,190 100,70 45,190 10,190" fill="rgba(255,255,255,.9)" />
                    <polygon points="100,70 83,128 117,128" fill="#1a5c78" />
                    <rect x="118" y="18" width="68" height="24" fill="#e8621a" />
                    <rect x="137" y="18" width="30" height="96" fill="#e8621a" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
