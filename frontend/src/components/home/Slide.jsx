import React from "react";

const services = [
  { n:"01", tag:"Available Now", title:"Analytics",    desc:"Real-time data insights driving business decisions. Transform raw data into actionable insights with our advanced analytics platform." },
  { n:"02", tag:"Available Now", title:"Security",     desc:"Enterprise-grade security with multi-layer infrastructure, end-to-end encryption, and threat detection to keep your business safe 24/7." },
  { n:"03", tag:"Available Now", title:"Automation",   desc:"Intelligent automation streamlining workflows. Automate repetitive tasks with AI-powered operations and save time at every layer." },
  { n:"04", tag:"Available Now", title:"Cloud",        desc:"Scalable cloud infrastructure for growth. Deploy, scale, and manage applications effortlessly. Pay only for what you use." },
  { n:"05", tag:"Available Now", title:"Support",      desc:"24/7 expert support keeping you running. Round-the-clock help from certified technical experts whenever you need it." },
  { n:"06", tag:"Available Now", title:"Integration",  desc:"Seamless API-first integration with all your favourite tools and platforms in one unified and powerful place." },
];

export default function Services() {
  return (
    <section style={{ background: "#071418", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 80px" }}>

        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: 5, textTransform: "uppercase", color: "#e8621a",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        }}>
          <span style={{ width: 28, height: 2, background: "#e8621a", display: "block" }}/>
          What We Do
        </div>
        <h2 style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,6vw,76px)",
          lineHeight: .88, letterSpacing: 2, color: "#fff", margin: 0,
        }}>
          OUR<br/><span style={{ color: "#e8621a" }}>SERVICES</span><br/>
          <span style={{ color: "rgba(255,255,255,.25)" }}>FOR YOU</span>
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, marginTop: 56,
        }}>
          {services.map((s, i) => (
            <SvcCard key={i} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SvcCard({ n, tag, title, desc }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#0f2636" : "#0d3040",
        border: `1px solid ${hover ? "#e8621a" : "rgba(255,255,255,.07)"}`,
        padding: "40px 32px", position: "relative", overflow: "hidden",
        transition: "background .25s,border-color .25s", cursor: "default",
      }}
    >
      {/* top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "#e8621a", transform: hover ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left", transition: "transform .3s",
      }}/>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: "rgba(255,255,255,.25)", lineHeight: 1, marginBottom: 16 }}>{n}</div>
      <div style={{
        display: "inline-block", background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)",
        borderRadius: 3, padding: "3px 10px",
        fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700,
        letterSpacing: 2, textTransform: "uppercase", color: "#e8621a", marginBottom: 12,
      }}>{tag}</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 2, color: "#fff", marginBottom: 10 }}>{title}</div>
      <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,.55)", lineHeight: 1.75 }}>{desc}</p>
      <a href="/services" style={{
        display: "flex", alignItems: "center", gap: 6, marginTop: 20,
        fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
        letterSpacing: 2, textTransform: "uppercase", color: "#e8621a", textDecoration: "none",
      }}>Learn More →</a>
    </div>
  );
}
