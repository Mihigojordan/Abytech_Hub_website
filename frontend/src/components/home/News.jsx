import React from "react";

const news = [
  {
    bg: "#1a5c78",
    abbr: "ATF",
    tag: "#Technology",
    date: "Nov 6, 2024",
    title: "Africa Tech Forum 2024: Showcasing Innovation and Market Opportunities in Kigali",
    desc: "Exploring the latest innovations and market opportunities at the Africa Tech Forum 2024 held in Kigali.",
  },
  {
    bg: "#0d3040",
    abbr: "AHS",
    tag: "#Healthcare",
    date: "Oct 13, 2024",
    title: "Africa HealthTech Summit 2024: Digital Transformation in Healthcare",
    desc: "Kigali Convention Center hosted this groundbreaking digital healthcare transformation summit.",
  },
  {
    bg: "#1a3a2a",
    abbr: "TT",
    tag: "#Technology",
    date: "Sep 28, 2024",
    title: "Tech Talks with Irembo: AI, Engineering, and Cybersecurity in Focus",
    desc: "Kigali tech community gathers to discuss cutting-edge AI solutions and cybersecurity challenges.",
  },
];

export default function News() {
  return (
    <section style={{ background: "#0d3040", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 80px" }}>

        {/* label */}
        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: 5, textTransform: "uppercase", color: "#e8621a",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        }}>
          <span style={{ width: 28, height: 2, background: "#e8621a", display: "block" }} />
          Daily News
        </div>

        {/* heading */}
        <h2 style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: "clamp(48px,6vw,76px)",
          lineHeight: 0.88, letterSpacing: 2, color: "#fff", margin: 0,
        }}>
          NEWS &amp;<br /><span style={{ color: "#e8621a" }}>INSIGHTS</span>
        </h2>

        {/* cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: 2, marginTop: 56,
        }}>
          {news.map((n, i) => (
            <NewsCard key={i} {...n} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsCard({ bg, abbr, tag, date, title, desc }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#0d3040",
        border: `1px solid ${hover ? "#e8621a" : "rgba(255,255,255,.07)"}`,
        overflow: "hidden", transition: "border-color .2s",
      }}
    >
      {/* image placeholder */}
      <div style={{
        height: 180, background: bg, position: "relative",
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg,rgba(26,92,120,.8),rgba(232,98,26,.4))",
        }} />
        {/* diagonal slash */}
        <div style={{
          position: "absolute", inset: 0, background: "#e8621a",
          clipPath: "polygon(60% 0%,80% 0%,56% 100%,36% 100%)", opacity: .3,
        }} />
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: 48,
          color: "rgba(255,255,255,.15)", position: "relative", zIndex: 2, letterSpacing: 3,
        }}>{abbr}</div>
      </div>

      {/* body */}
      <div style={{ padding: "24px 24px 28px" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)",
          borderRadius: 3, padding: "3px 10px",
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700,
          letterSpacing: 2, textTransform: "uppercase", color: "#e8621a", marginBottom: 12,
        }}>{tag}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", letterSpacing: 1, marginBottom: 8 }}>{date}</div>
        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700,
          letterSpacing: .5, color: "#fff", lineHeight: 1.3, marginBottom: 10,
        }}>{title}</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", lineHeight: 1.7 }}>{desc}</p>
      </div>
    </div>
  );
}
