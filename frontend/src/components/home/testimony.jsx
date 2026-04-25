import React from "react";

const testimonials = [
  { initials:"NF", name:"Nsanzimana Fabrice", role:"Software Engineer 🚀", date:"15 March 2025",
    text:"AbyTech has been a game-changer for my career. Their mentorship and resources helped me scale my skills to new heights!" },
  { initials:"NJ", name:"Nkaka Jean Doumour", role:"IT Manager 💡", date:"5 Feb 2025",
    text:"Working with AbyTech was an eye-opening experience. Their expertise and professional approach to IT solutions impressed me greatly." },
  { initials:"MG", name:"Mihigo Guillaume",   role:"Data Analyst 📊", date:"28 Jan 2025",
    text:"AbyTech provided powerful tools and insights that helped optimize our data processing. Highly recommend their services!" },
  { initials:"HP", name:"Habineza Patrick",   role:"Full Stack Developer 💻", date:"10 March 2025",
    text:"AbyTech transformed my approach to web and backend development. Their hands-on guidance was invaluable." },
  { initials:"RE", name:"Rugamba Eric",        role:"Cloud Engineer ☁️", date:"3 Feb 2025",
    text:"Their cloud solutions are top-notch! AbyTech helped us implement secure and scalable architectures." },
  { initials:"UG", name:"Umutoni Grace",       role:"UX/UI Designer 🎨", date:"18 Feb 2025",
    text:"Amazing experience! The design team at AbyTech has a keen eye for user experience and creativity." },
];

export default function Testimonials() {
  return (
    <section style={{ background: "#0a1e28", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 80px" }}>

        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: 5, textTransform: "uppercase", color: "#e8621a",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        }}>
          <span style={{ width: 28, height: 2, background: "#e8621a", display: "block" }}/>
          What Our Clients Say
        </div>
        <h2 style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,6vw,76px)",
          lineHeight: .88, letterSpacing: 2, color: "#fff", margin: 0,
        }}>
          REAL<br/><span style={{ color: "#e8621a" }}>STORIES</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, marginTop: 56 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: "#0d3040", border: "1px solid rgba(255,255,255,.07)",
              padding: "36px 28px", position: "relative", overflow: "hidden",
            }}>
              {/* big quote mark */}
              <div style={{
                position: "absolute", top: -10, left: 20,
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 100,
                color: "#e8621a", opacity: .1, lineHeight: 1, userSelect: "none",
              }}>"</div>

              <p style={{
                fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,.55)",
                lineHeight: 1.8, fontStyle: "italic", position: "relative", zIndex: 1,
                marginBottom: 20,
              }}>"{t.text}"</p>

              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", background: "#1a5c78",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#fff",
                }}>{t.initials}</div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginTop: 12, letterSpacing: 1 }}>{t.date}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
