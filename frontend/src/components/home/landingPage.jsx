import React, { useEffect, useRef } from "react";

const ABY_LOGO = (
  <svg width="36" height="36" viewBox="0 0 200 200" fill="none">
    <polygon points="100,10 190,190 155,190 100,70 45,190 10,190" fill="#1a5c78"/>
    <polygon points="100,70 83,128 117,128" fill="#071418"/>
    <rect x="118" y="18" width="68" height="24" fill="#e8621a"/>
    <rect x="137" y="18" width="30" height="96" fill="#e8621a"/>
  </svg>
);

const stats = [
  { val: "10+",  key: "Years\nExperience" },
  { val: "500+", key: "Projects\nDelivered" },
  { val: "10+",  key: "Trusted\nPartners" },
  { val: "Live", key: "Internship\nOpen" },
];

export default function HeroSection() {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0";
    requestAnimationFrame(() => { el.style.transition = "opacity .6s ease"; el.style.opacity = "1"; });
  }, []);

  return (
    <section
      ref={heroRef}
      style={{
        minHeight: "100vh", background: "#0a1e28", position: "relative",
        overflow: "hidden", display: "flex", alignItems: "center", paddingTop: 72,
      }}
    >
      {/* diagonal slash orange */}
      <div style={{
        position: "absolute", inset: 0, background: "#e8621a",
        clipPath: "polygon(55% 0%,74% 0%,51% 100%,32% 100%)", opacity: .82,
      }}/>
      {/* diagonal slash teal */}
      <div style={{
        position: "absolute", inset: 0, background: "#1a5c78",
        clipPath: "polygon(59% 0%,64% 0%,41% 100%,36% 100%)", opacity: .7,
      }}/>
      {/* dot grid */}
      <div style={{
        position: "absolute", top: 80, right: 100, width: 160, height: 160,
        backgroundImage: "radial-gradient(circle,rgba(255,255,255,.12) 1.5px,transparent 1.5px)",
        backgroundSize: "18px 18px", zIndex: 1,
      }}/>
      {/* scanlines */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.006) 3px,rgba(255,255,255,.006) 4px)",
      }}/>

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 10, padding: "0 80px", maxWidth: 760 }}>
        {/* kicker */}
        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: 6, textTransform: "uppercase", color: "#e8621a",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
        }}>
          <span style={{ display: "block", width: 32, height: 2, background: "#e8621a" }}/>
          Technology · Innovation · Rwanda
        </div>

        {/* headline */}
        <h1 style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(64px,8vw,108px)",
          lineHeight: .87, color: "#fff", letterSpacing: 2, margin: 0,
        }}>
          BUILDING<br/>TECHNOLOGY.<br/>
          <span style={{ color: "#e8621a" }}>POWERING</span><br/>
          <span style={{ color: "rgba(255,255,255,.1)" }}>INNOVATION.</span>
        </h1>

        {/* sub */}
        <p style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 400,
          letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,.55)",
          marginTop: 18, lineHeight: 1.7, maxWidth: 520,
        }}>
          Creating scalable technology solutions for a digital world. We design, build, and scale modern digital products.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40 }}>
          <a href="/contact" style={{
            background: "#e8621a", color: "#fff",
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 3,
            padding: "15px 34px", borderRadius: 4, textDecoration: "none",
            boxShadow: "0 8px 28px rgba(232,98,26,.35)", display: "inline-block",
          }}>Get In Touch</a>
          <a href="/internship" style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.55)",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
          }}>Join Our Talent →</a>
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: "rgba(26,92,120,.12)", borderTop: "1px solid rgba(26,92,120,.3)",
        display: "flex", alignItems: "center", padding: "0 80px", zIndex: 10,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            flex: 1, display: "flex", alignItems: "center", gap: 16,
            padding: i === 0 ? "0 24px 0 0" : "0 24px",
            borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none",
          }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color: "#e8621a", lineHeight: 1 }}>
              {s.val}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700,
              letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.55)",
              lineHeight: 1.4, whiteSpace: "pre-line",
            }}>{s.key}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
