import React from "react";
import { Monitor, Layers, GraduationCap } from "lucide-react";

const solutions = [
  {
    n: "01",
    Icon: Monitor,
    title: "Web Development",
    desc: "Building modern, responsive applications using React, JavaScript, and related frameworks to create high-impact digital products.",
  },
  {
    n: "02",
    Icon: Layers,
    title: "Software Solutions",
    desc: "Delivering cutting-edge software solutions that drive businesses forward and transform ideas into impactful digital experiences.",
  },
  {
    n: "03",
    Icon: GraduationCap,
    title: "IT Training",
    desc: "Empowering local talent through coding workshops and digital skills programs, supporting innovation within Rwanda's growing tech ecosystem.",
  },
];

export default function WhyChooseUs() {
  return (
    <section style={{ background: "#0a1e28", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 80px" }}>

        {/* label */}
        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: 5, textTransform: "uppercase", color: "#e8621a",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        }}>
          <span style={{ width: 28, height: 2, background: "#e8621a", display: "block" }} />
          Our Solutions
        </div>

        {/* heading */}
        <h2 style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: "clamp(48px,6vw,76px)",
          lineHeight: 0.88, letterSpacing: 2, color: "#fff", margin: 0,
        }}>
          WHY WE<br /><span style={{ color: "#e8621a" }}>STAND</span><br />OUT
        </h2>

        {/* cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: 2, marginTop: 56,
        }}>
          {solutions.map((s, i) => (
            <SolCard key={i} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SolCard({ n, Icon, title, desc }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#0f2636" : "#0d3040",
        border: "1px solid rgba(255,255,255,.07)",
        padding: "44px 36px", position: "relative", overflow: "hidden",
        transition: "background .25s",
      }}
    >
      {/* faint large number */}
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, lineHeight: 1,
        color: "#e8621a", opacity: 0.15,
        position: "absolute", top: 16, right: 24,
      }}>{n}</div>

      {/* icon box */}
      <div style={{
        width: 48, height: 48,
        background: "rgba(26,92,120,.15)",
        border: "1px solid rgba(26,92,120,.3)",
        borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <Icon size={22} color="#1a5c78" strokeWidth={1.5} />
      </div>

      <div style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 28,
        letterSpacing: 2, color: "#fff", marginBottom: 10,
      }}>{title}</div>

      <p style={{
        fontSize: 13, fontWeight: 300,
        color: "rgba(255,255,255,.55)", lineHeight: 1.75, marginBottom: 20,
      }}>{desc}</p>

      <a href="/services" style={{
        fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
        letterSpacing: 2, textTransform: "uppercase", color: "#e8621a",
        textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
      }}>View Details →</a>
    </div>
  );
}
