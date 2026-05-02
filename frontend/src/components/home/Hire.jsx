import { TEAL, bb, bc, ba } from "../../utils/homeConstants";

const STEPS = [
  ["01", "Share Your Vision",    "Tell us about your project goals, challenges, and the outcomes you want to achieve."],
  ["02", "We Plan & Propose",    "Our team designs a tailored solution and clear roadmap built around your needs."],
  ["03", "We Build & Deliver",   "We execute with quality, transparency, and ongoing support from start to launch."],
];

export default function Hire() {
  return (
    <section id="hire" className="relative overflow-hidden" style={{ background: TEAL }}>
      <div className="absolute pointer-events-none rounded-full"
        style={{ width: 500, height: 500, border: "100px solid rgba(255,255,255,.06)", right: -120, top: -120 }} />
      <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 relative z-[2]">

          {/* Left */}
          <div>
            <div className="flex items-center gap-3 mb-4"
              style={{ ...bc(11, 700, { letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,.6)" }) }}>
              <div className="w-7 h-0.5" style={{ background: "rgba(255,255,255,.4)" }} />
              Work With Us
            </div>
            <h2 className="at-reveal" style={{ ...bb("clamp(48px,7vw,84px)", { lineHeight: .88, letterSpacing: 2, color: "#fff" }) }}>
              LET'S BUILD<br /><span style={{ color: "rgba(255,255,255,.22)" }}>TOGETHER</span>
            </h2>
            <p className="at-reveal at-d1 mt-4" style={{ ...ba(15, 400, { color: "rgba(255,255,255,.65)", lineHeight: 1.82 }) }}>
              Partner with AbyTech Hub to bring your ideas to life. We deliver end-to-end digital solutions — from concept to launch — with innovation, precision, and dedicated support at every step.
            </p>
            <a href="/contact-us"
              className="btn-white at-reveal at-d2 inline-block mt-7 no-underline"
              style={{ ...bb(15, { letterSpacing: 2, color: "#071418" }), background: "#fff", padding: "13px 30px", borderRadius: 4 }}>
              Hire Us →
            </a>
          </div>

          {/* Right: steps */}
          <div className="flex flex-col gap-6 justify-center">
            {STEPS.map(([num, title, text], i) => (
              <div key={num} className={`at-reveal at-d${i + 1} flex items-start gap-4`}>
                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                  style={{ ...bb(15, { color: "#fff" }), background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.22)" }}>
                  {num}
                </div>
                <div>
                  <div style={{ ...bc(15, 700, { letterSpacing: 1, color: "#fff", marginBottom: 3 }) }}>{title}</div>
                  <div style={{ ...ba(13, 400, { color: "rgba(255,255,255,.68)", lineHeight: 1.7 }) }}>{text}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
