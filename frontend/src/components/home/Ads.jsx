import React from "react";

const checks = [
  "Building industry-standard software with modern best practices and methodologies.",
  "Practical understanding of software architecture, testing, and deployment strategies.",
  "Master version control, CI/CD pipelines, and collaborative development workflows.",
];

const modules = [
  { icon:"☀️", title:"Opening Circle",       sub:"Introductions and setting expectations" },
  { icon:"💻", title:"Dev Environment Setup", sub:"Configuring IDEs, tools, and best practices" },
  { icon:"📋", title:"Code Review Session",   sub:"Learning effective code review techniques" },
  { icon:"💡", title:"Development Sprint",    sub:"Build a real-world application module" },
  { icon:"🎯", title:"Architecture Talks",    sub:"Team presentations and technical discussions" },
  { icon:"✅", title:"Closing Circle",        sub:"Recap, Q&A, and networking" },
];

export default function AbytechWorkshop() {
  return (
    <section style={{ background: "#071418", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Left */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: 5, textTransform: "uppercase", color: "#e8621a",
              display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
            }}>
              <span style={{ width: 28, height: 2, background: "#e8621a", display: "block" }}/>
              Developer Workshop
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(40px,5vw,64px)",
              lineHeight: .88, letterSpacing: 2, color: "#fff", margin: 0,
            }}>
              BECOME A<br/>MASTER OF<br/><span style={{ color: "#e8621a" }}>SOFTWARE</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", lineHeight: 1.8, marginTop: 18, maxWidth: 440 }}>
              Comprehensive workshops, bootcamps, and seminars to keep developers and their teams current as technology advances.
            </p>
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
              {checks.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8621a", flexShrink: 0, marginTop: 6 }}/>
                  {c}
                </div>
              ))}
            </div>
            <a href="/contact" style={{
              display: "inline-block", marginTop: 32,
              background: "#e8621a", color: "#fff",
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 3,
              padding: "15px 34px", borderRadius: 4, textDecoration: "none",
              boxShadow: "0 8px 28px rgba(232,98,26,.35)",
            }}>Book a Training</a>
          </div>

          {/* Right — modules grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {modules.map((m, i) => <ModCard key={i} {...m} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModCard({ icon, title, sub }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#0f2636" : "#0d3040",
        border: "1px solid rgba(255,255,255,.07)",
        padding: "20px", transition: "background .2s",
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "#fff", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}
