import { ORG, TEAL, bb, bc } from "../../utils/homeConstants";

export default function Quote() {
  return (
    <section id="quote" className="relative overflow-hidden" style={{ background: TEAL }}>
      <div className="absolute inset-0" style={{ background: ORG, clipPath: "polygon(0 0,20% 0,8% 100%,0 100%)", opacity: .25 }} />
      <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-14 lg:py-20 relative z-[2]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">
          <div className="relative flex-1">
            <div className="absolute pointer-events-none hidden lg:block"
              style={{ ...bb(180, { lineHeight: .7, color: "rgba(255,255,255,.07)" }), top: 20, left: 50 }}>"</div>
            <p className="at-reveal relative z-[2]"
              style={{ ...bc("clamp(18px,3vw,32px)", 400, { lineHeight: 1.48, color: "#fff", fontStyle: "italic", letterSpacing: .5 }) }}>
              "Rwanda's tech ecosystem is experiencing unprecedented growth — with innovation hubs and skilled developers, we're positioning Africa as a global technology leader."
            </p>
          </div>
          <div className="at-reveal at-d1 lg:text-right shrink-0">
            <div style={{ ...bb(22, { letterSpacing: 3, color: "#fff" }) }}>Sadiki Rukara</div>
            <div className="mt-1" style={{ ...bc(12, 600, { letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.55)", lineHeight: 1.6 }) }}>
              CEO & Founder<br />ABYTECH HUB
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
