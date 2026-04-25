import React from "react";

const checks = [
  "Custom software development & engineering",
  "Agile methodology & rapid deployment",
  "Dedicated teams & technical expertise",
  "Scalable, secure, and future-proof solutions",
];

export default function Whoweare() {
  return (
    <section style={{ background: "#0d3040", position: "relative", overflow: "hidden" }}>
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
              Who We Are
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,6vw,76px)",
              lineHeight: .88, letterSpacing: 2, color: "#fff", margin: 0,
            }}>
              CRAFTING<br/>DIGITAL<br/><span style={{ color: "#e8621a" }}>SOLUTIONS</span>
            </h2>
            <p style={{
              fontSize: 16, fontWeight: 300, lineHeight: 1.85,
              color: "rgba(255,255,255,.55)", marginTop: 22, maxWidth: 460,
            }}>
              ABYTECH is a cutting-edge software development company delivering world-class digital solutions.
              We transform ideas into powerful applications, driving business growth through innovative technology and expert engineering.
            </p>
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
              {checks.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 14, color: "rgba(255,255,255,.55)" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(232,98,26,.15)", border: "1px solid rgba(232,98,26,.35)",
                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#e8621a",
                  }}>✓</div>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Right — stat cards */}
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {[
                { num: "10+",  key: "Years Experience",    desc: "Building technology that powers businesses globally" },
                { num: "500+", key: "Projects Delivered",  desc: "Across web, mobile, software, and cloud" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "#0a1e28", padding: "36px 28px",
                  border: "1px solid rgba(255,255,255,.07)",
                }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 60, color: "#e8621a", lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginTop: 4 }}>{s.key}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.25)", marginTop: 6, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
              {/* Visual card spanning full width */}
              <div style={{
                gridColumn: "1/-1", height: 200, background: "#1a5c78",
                position: "relative", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  position: "absolute", inset: 0, background: "#e8621a",
                  clipPath: "polygon(60% 0%,80% 0%,56% 100%,36% 100%)", opacity: .22,
                }}/>
                <div style={{
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: 180, lineHeight: .85,
                  color: "rgba(255,255,255,.06)", letterSpacing: 4, userSelect: "none",
                  position: "relative", zIndex: 1,
                }}>AT</div>
                <div style={{ position: "absolute", zIndex: 3 }}>
                  <svg width="80" height="80" viewBox="0 0 200 200" fill="none">
                    <polygon points="100,10 190,190 155,190 100,70 45,190 10,190" fill="rgba(255,255,255,0.9)"/>
                    <polygon points="100,70 83,128 117,128" fill="#1a5c78"/>
                    <rect x="118" y="18" width="68" height="24" fill="#e8621a"/>
                    <rect x="137" y="18" width="30" height="96" fill="#e8621a"/>
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
