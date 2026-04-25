import React from "react";

const steps = [
  { n:"01", title:"Get Started",    desc:"Begin your journey with our expert-driven process, ensuring a smooth onboarding experience." },
  { n:"02", title:"Requirements",   desc:"We gather detailed requirements to fully understand your goals, timeline, and technical needs." },
  { n:"03", title:"Strategy",       desc:"Planning and strategy phase where architecture, design, and milestones are defined clearly." },
  { n:"04", title:"Development",    desc:"Agile execution — we build, test, iterate and ship with full transparency throughout." },
  { n:"05", title:"Deployment",     desc:"Launch and ongoing support to ensure your solution runs smoothly and scales with you." },
];

export default function WorkProcess() {
  return (
    <section style={{ background: "#0d3040", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 80px" }}>

        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: 5, textTransform: "uppercase", color: "#e8621a",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        }}>
          <span style={{ width: 28, height: 2, background: "#e8621a", display: "block" }}/>
          How We Work
        </div>
        <h2 style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,6vw,76px)",
          lineHeight: .88, letterSpacing: 2, color: "#fff", margin: 0,
        }}>
          OUR WORKING<br/><span style={{ color: "#e8621a" }}>PROCESS</span>
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5,1fr)",
          gap: 0, marginTop: 60, border: "1px solid rgba(255,255,255,.07)",
        }}>
          {steps.map((s, i) => <StepCard key={i} {...s} last={i===steps.length-1} />)}
        </div>
      </div>
    </section>
  );
}

function StepCard({ n, title, desc, last }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "40px 28px",
        borderRight: last ? "none" : "1px solid rgba(255,255,255,.07)",
        background: hover ? "#0f2636" : "transparent",
        transition: "background .2s", position: "relative",
      }}
    >
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 60,
        color: "#e8621a", opacity: .18, lineHeight: 1, marginBottom: 14,
      }}>{n}</div>
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 20,
        letterSpacing: 2, color: "#fff", marginBottom: 8,
      }}>{title}</div>
      <p style={{ fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,.55)", lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}
