import React from "react";

export default function CtaBand() {
  return (
    <section style={{ background: "#0a1e28", borderTop: "1px solid rgba(255,255,255,.07)", position: "relative", overflow: "hidden" }}>
      {/* slash */}
      <div style={{
        position: "absolute", inset: 0, background: "#e8621a",
        clipPath: "polygon(45% 0%,55% 0%,42% 100%,32% 100%)", opacity: .07,
      }}/>

      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "100px 80px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 2, gap: 60, flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(56px,8vw,96px)",
            lineHeight: .88, letterSpacing: 2, color: "#fff", margin: 0,
          }}>
            LET'S BUILD<br/><span style={{ color: "#e8621a" }}>TOGETHER.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", marginTop: 12, maxWidth: 400, lineHeight: 1.75 }}>
            Thank you for visiting AbyTech Hub! We are dedicated to delivering top-notch technology solutions. Let's build something great together.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start", flexShrink: 0 }}>
          <a href="/contact" style={{
            background: "#e8621a", color: "#fff",
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 3,
            padding: "18px 48px", borderRadius: 4, textDecoration: "none", textAlign: "center",
            boxShadow: "0 8px 28px rgba(232,98,26,.35)",
          }}>Get In Touch</a>
          <div style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,.25)",
          }}>abytechhub.com</div>
        </div>
      </div>
    </section>
  );
}
