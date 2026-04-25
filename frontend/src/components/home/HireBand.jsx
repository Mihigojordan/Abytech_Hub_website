import React from "react";

const hireSteps = [
  { n:"01", title:"Share Your Requirements",  text:"Tell us about your project needs, technology stack, and desired expertise level." },
  { n:"02", title:"Review Vetted Developers", text:"We match you with pre-screened, qualified software engineers and specialists." },
  { n:"03", title:"Start Building",           text:"Seamlessly integrate developers with full compliance and ongoing support." },
];

export default function HireBand() {
  return (
    <section style={{ background: "#1a5c78", position: "relative", overflow: "hidden" }}>
      {/* decorative circle */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        border: "100px solid rgba(255,255,255,.07)", right: -120, top: -120, pointerEvents: "none",
      }}/>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 80px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>

          {/* Left */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,.6)",
              display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
            }}>
              <span style={{ width: 28, height: 2, background: "rgba(255,255,255,.4)", display: "block" }}/>
              Work With Us
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(56px,7vw,84px)",
              lineHeight: .88, letterSpacing: 2, color: "#fff", margin: 0,
            }}>
              ACCESS TOP<br/><span style={{ color: "rgba(255,255,255,.25)" }}>TALENT</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", lineHeight: 1.8, marginTop: 14, maxWidth: 420 }}>
              Scale your team with skilled professionals who bring innovation, dedication, and cost-effective solutions to every project.
            </p>
            <a href="https://abytechhub.com/" target="_blank" rel="noreferrer" style={{
              display: "inline-block", marginTop: 32,
              background: "#fff", color: "#e8621a",
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 3,
              padding: "15px 34px", borderRadius: 4, textDecoration: "none",
              boxShadow: "0 8px 28px rgba(0,0,0,.15)",
            }}>Hire Developers →</a>
          </div>

          {/* Right — steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
            {hireSteps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "#fff",
                }}>{s.n}</div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1, color: "#fff", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.7 }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
