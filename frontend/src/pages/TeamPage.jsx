import { useEffect, useRef } from "react";
import { Mail, ArrowRight, Users, Linkedin, Github } from "lucide-react";
import Header from "../components/header";
import { useTheme } from "../context/ThemeContext";
import { ORG, TEAL, bb, bc, ba } from "../utils/homeConstants";

import Image1 from "../assets/mihi.jpg";
import Image2 from "../assets/honore.jpg";
import Image3 from "../assets/serge.png";
import Image4 from "../assets/sadiki.jpg";
import Image5 from "../assets/kibasha.jpeg";
import Image6 from "../assets/niyigena.jpeg";
import Image7 from "../assets/fabrice.jpg";
import Image8 from "../assets/david.jpeg";

const TEAM = [
  {
    id: 1,
    name: "Sadiki Rukara",
    position: "C.E.O & Founder",
    dept: "Leadership",
    image: Image4,
  },
  {
    id: 2,
    name: "Mihigo Prince Jordan",
    position: "Visionary Leader",
    dept: "Leadership",
    image: Image1,
  },
  {
    id: 5,
    name: "Kibasha Nsinzi Francois",
    position: "Senior Software Engineer",
    dept: "Engineering",
    image: Image5,
  },
  {
    id: 3,
    name: "Ishimwe Serge",
    position: "UI/UX Designer & Frontend Developer",
    dept: "Design",
    image: Image3,
  },
  {
    id: 4,
    name: "Hirwa Mihigo Honore",
    position: "DevOps & Backend Developer",
    dept: "Engineering",
    image: Image2,
  },
  {
    id: 6,
    name: "Niyigena Egina",
    position: "Frontend Developer",
    dept: "Engineering",
    image: Image6,
  },
  {
    id: 7,
    name: "Nsanzimana Fabrice",
    position: "UI/UX Designer",
    dept: "Design",
    image: Image7,
  },
  {
    id: 8,
    name: "Ndayiringiye David",
    position: "Full Stack Developer",
    dept: "Engineering",
    image: Image8,
  },
];

const DEPT_COLORS = {
  Leadership: ORG,
  Engineering: TEAL,
  Design: "#7c3aed",
};

/* ── Scroll-reveal hook ─────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll(".at-reveal").forEach((node) =>
            node.classList.add("at-visible")
          );
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Team card ──────────────────────────────────────────── */
function MemberCard({ member, index, isDark }) {
  const bg2    = isDark ? "#0a1e28" : "#ede5da";
  const cardBg = isDark ? "#0d3040" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3  = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";
  const deptColor = DEPT_COLORS[member.dept] ?? ORG;
  const delay = `at-d${Math.min(index % 4, 4)}`;
  const email = member.name.toLowerCase().replace(/\s+/g, "") + "@abytechhub.com";

  return (
    <div
      className={`at-reveal ${index > 0 ? delay : ""} group relative overflow-hidden`}
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        transition: "border-color .25s, transform .25s, box-shadow .25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = deptColor;
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,.14)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = border;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top accent bar */}
      <div
        className="svc-bar absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: deptColor }}
      />

      {/* Image area */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${isDark ? "rgba(7,20,24,.85)" : "rgba(7,20,24,.6)"} 0%, transparent 55%)`,
          }}
        />
        {/* Dept badge */}
        <div
          className="absolute top-3 left-3 px-3 py-1"
          style={{
            background: deptColor,
            ...bc(9, 700, { letterSpacing: 3, textTransform: "uppercase", color: "#fff" }),
          }}
        >
          {member.dept}
        </div>
        {/* Number */}
        <div
          className="absolute bottom-3 right-4 pointer-events-none select-none"
          style={{ ...bb(64, { color: "#fff", opacity: 0.12, lineHeight: 1 }) }}
        >
          {String(member.id).padStart(2, "0")}
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <h3
          style={{
            ...bc(20, 800, { color: textC, letterSpacing: 0.5, margin: "0 0 4px" }),
          }}
        >
          {member.name.toUpperCase()}
        </h3>
        <p
          style={{
            ...ba(13, 400, { color: text2, margin: "0 0 20px", lineHeight: 1.5 }),
          }}
        >
          {member.position}
        </p>

        {/* Email row */}
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2 no-underline group/link"
          style={{
            ...ba(12, 400, { color: text3 }),
            paddingTop: 16,
            borderTop: `1px solid ${border}`,
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = deptColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = text3)}
        >
          <Mail size={13} />
          <span className="truncate">{email}</span>
          <ArrowRight
            size={12}
            className="ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0"
          />
        </a>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function TeamPage() {
  const { isDark } = useTheme();
  const revealRef  = useReveal();

  const bg     = isDark ? "#071418" : "#f5efe6";
  const bg2    = isDark ? "#0a1e28" : "#ede5da";
  const cardBg = isDark ? "#0d3040" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3  = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";

  useEffect(() => {
    document.documentElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* Trigger reveal on mount for above-fold cards */
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll(".at-reveal").forEach((el) =>
        el.classList.add("at-visible")
      );
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const leadership  = TEAM.filter((m) => m.dept === "Leadership");
  const engineering = TEAM.filter((m) => m.dept === "Engineering");
  const design      = TEAM.filter((m) => m.dept === "Design");

  return (
    <div style={{ background: bg }}>
      <Header title="Our Team" path="Our Team" />

      {/* ── INTRO STRIP ──────────────────────────────────── */}
      <div style={{ background: bg2 }}>
        <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-20">
          <div
            className="flex items-center gap-3 mb-4"
            style={{
              ...bc(10, 700, {
                letterSpacing: 5,
                textTransform: "uppercase",
                color: ORG,
              }),
            }}
          >
            <div className="w-6 h-[2px]" style={{ background: ORG }} />
            The People Behind Abytech
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2
              className="at-reveal"
              style={{
                ...bb("clamp(38px,6vw,66px)", {
                  lineHeight: 0.9,
                  letterSpacing: 2,
                  color: textC,
                  margin: 0,
                }),
              }}
            >
              MEET THE TEAM<br />
              <span style={{ color: ORG }}>DRIVING INNOVATION</span>
            </h2>

            <p
              className="at-reveal at-d1"
              style={{
                ...ba(15, 300, {
                  color: text2,
                  lineHeight: 1.8,
                  maxWidth: 420,
                  margin: 0,
                }),
              }}
            >
              A diverse group of engineers, designers, and leaders united by a
              single mission — building technology that makes a difference.
            </p>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 mt-12"
            ref={revealRef}
          >
            {[
              { num: "8+",   label: "Team Members"   },
              { num: "3+",   label: "Years Active"   },
              { num: "20+",  label: "Projects Shipped"},
              { num: "24/7", label: "Support"        },
            ].map(({ num, label }, i) => (
              <div
                key={label}
                className={`at-reveal ${i > 0 ? `at-d${i}` : ""} p-7 relative overflow-hidden group`}
                style={{ background: cardBg, border: `1px solid ${border}` }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark ? "#0f2636" : "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = cardBg)
                }
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
                  style={{ background: ORG }}
                />
                <div
                  style={{
                    ...bb("clamp(36px,5vw,52px)", { color: ORG, lineHeight: 1 }),
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    ...bc(11, 700, {
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      color: text3,
                      marginTop: 6,
                    }),
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LEADERSHIP ───────────────────────────────────── */}
      <div style={{ background: bg }}>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
          <SectionHeading
            label="Leadership"
            title="VISIONARIES &"
            accent="DECISION MAKERS"
            color={ORG}
            textC={textC}
            text3={text3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 mt-10">
            {leadership.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>

      {/* ── ENGINEERING ──────────────────────────────────── */}
      <div style={{ background: bg2 }}>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
          <SectionHeading
            label="Engineering"
            title="BUILDERS &"
            accent="PROBLEM SOLVERS"
            color={TEAL}
            textC={textC}
            text3={text3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 mt-10">
            {engineering.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>

      {/* ── DESIGN ───────────────────────────────────────── */}
      <div style={{ background: bg }}>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
          <SectionHeading
            label="Design"
            title="CREATORS &"
            accent="EXPERIENCE CRAFTERS"
            color="#7c3aed"
            textC={textC}
            text3={text3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 mt-10">
            {design.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA STRIP ────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: TEAL }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: ORG,
            clipPath: "polygon(0 0,18% 0,6% 100%,0 100%)",
            opacity: 0.25,
          }}
        />
        <div className="mx-auto px-5 sm:px-10 lg:px-20 py-14 relative z-[2]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3
                style={{
                  ...bb("clamp(28px,4vw,48px)", {
                    letterSpacing: 2,
                    color: "#fff",
                    lineHeight: 0.9,
                  }),
                }}
              >
                WANT TO JOIN THE TEAM?
              </h3>
              <p
                className="mt-3"
                style={{
                  ...ba(14, 300, {
                    color: "rgba(255,255,255,.65)",
                    lineHeight: 1.7,
                  }),
                }}
              >
                We're always looking for talented people to grow with us.
              </p>
            </div>
            <a
              href="/#hire"
              className="btn-white shrink-0 inline-block no-underline"
              style={{
                ...bb(15, { letterSpacing: 2, color: "#071418" }),
                background: "#fff",
                padding: "13px 32px",
                borderRadius: 4,
              }}
            >
              Apply Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section heading helper ─────────────────────────────── */
function SectionHeading({ label, title, accent, color, textC, text3 }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div
          className="flex items-center gap-3 mb-4"
          style={{
            ...bc(10, 700, {
              letterSpacing: 5,
              textTransform: "uppercase",
              color,
            }),
          }}
        >
          <div className="w-6 h-[2px]" style={{ background: color }} />
          {label}
        </div>
        <h2
          className="at-reveal"
          style={{
            ...bb("clamp(32px,5vw,56px)", {
              lineHeight: 0.9,
              letterSpacing: 2,
              color: textC,
              margin: 0,
            }),
          }}
        >
          {title}
          <br />
          <span style={{ color }}>{accent}</span>
        </h2>
      </div>
      <div
        className="at-reveal at-d1 w-12 h-12 flex items-center justify-center shrink-0"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}40`,
        }}
      >
        <Users size={20} color={color} />
      </div>
    </div>
  );
}
