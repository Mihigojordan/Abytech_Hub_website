import {
  TrendingUp, Shield, Zap, Cloud, Headphones, Link2,
  Globe, Code2, BookOpen,
  Sun, Terminal, GitPullRequest, Rocket, Layers, CheckCircle2,
} from "lucide-react";

/* ── COLORS ─────────────────────────────────────────────── */
export const ORG  = "#e8621a";
export const TEAL = "#1a5c78";

/* ── FONT HELPERS ────────────────────────────────────────── */
export const bb = (sz, extra = {}) => ({ fontFamily: "'Bebas Neue',sans-serif", fontSize: sz, ...extra });
export const bc = (sz, wt = 400, extra = {}) => ({ fontFamily: "'Barlow Condensed',sans-serif", fontSize: sz, fontWeight: wt, ...extra });
export const ba = (sz, wt = 400, extra = {}) => ({ fontFamily: "'Barlow',sans-serif", fontSize: sz, fontWeight: wt, ...extra });

/* ── GLOBAL CSS ──────────────────────────────────────────── */
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;500;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; overflow-x: hidden; }

  @keyframes atUp     { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }
  @keyframes marquee  { from { transform:translateX(0) }               to { transform:translateX(-50%) } }
  @keyframes fadeIn   { from { opacity:0 }                             to { opacity:1 } }

  .at-reveal { opacity:0; transform:translateY(26px); transition: opacity .75s ease, transform .75s ease; }
  .at-visible { opacity:1 !important; transform:translateY(0) !important; }
  .at-d1 { transition-delay:.12s; }
  .at-d2 { transition-delay:.22s; }
  .at-d3 { transition-delay:.32s; }
  .at-d4 { transition-delay:.42s; }

  .marquee-track { display:flex; gap:48px; animation:marquee 30s linear infinite; width:max-content; }
  .marquee-track:hover { animation-play-state:paused; }

  .nav-link { transition: color .2s !important; }
  .nav-link:hover { color: #e8621a !important; }

  .svc-bar { transform: scaleX(0); transform-origin: left; transition: transform .35s ease; }
  .svc-card:hover .svc-bar { transform: scaleX(1) !important; }
  .svc-card { transition: background .25s, border-color .25s; }

  .news-card { transition: border-color .2s, transform .2s; }
  .news-card:hover { border-color: #e8621a !important; transform: translateY(-4px); }

  .partner-chip { transition: border-color .2s; }
  .partner-chip:hover { border-color: #e8621a !important; }

  .ws-mod { transition: background .2s; }
  .hire-step-num { transition: background .2s; }

  .footer-link { transition: color .2s; }
  .footer-link:hover { color: #e8621a !important; }

  .btn-primary { transition: background .2s, transform .15s, box-shadow .2s; }
  .btn-primary:hover { background: #ff7930 !important; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(232,98,26,.45) !important; }

  .btn-white { transition: background .2s, color .2s; }
  .btn-white:hover { background: rgba(255,255,255,.88) !important; }

  .sol-card { transition: background .25s, transform .2s; }
  .sol-card:hover { transform: translateY(-3px); }

  .ps-step { transition: background .2s; }
  .ps-step:hover { background: rgba(255,255,255,.06) !important; }
`;

/* ── DATA ────────────────────────────────────────────────── */
export const PARTNERS = [
  "Shopify","TechRwanda","Irembo","KLab","AfricaTech",
  "RDB","Andela","DigitalHub","CloudAfrica","InnoTech",
];

export const SERVICES = [
  { num:"01", title:"Analytics",   Icon:TrendingUp, desc:"Real-time data insights driving business decisions. Transform raw data into actionable intelligence with our advanced analytics platform." },
  { num:"02", title:"Security",    Icon:Shield,     desc:"Enterprise-grade security with multi-layer infrastructure, end-to-end encryption, and proactive threat detection." },
  { num:"03", title:"Automation",  Icon:Zap,        desc:"Intelligent automation streamlining your workflows. Automate repetitive tasks with AI-powered operations at scale." },
  { num:"04", title:"Cloud",       Icon:Cloud,      desc:"Scalable cloud infrastructure built for growth. Deploy, scale, and manage applications effortlessly in the cloud." },
  { num:"05", title:"Support",     Icon:Headphones, desc:"24/7 expert support keeping your systems running. Round-the-clock help from our certified technical specialists." },
  { num:"06", title:"Integration", Icon:Link2,      desc:"Seamless API-first integration with all your favourite tools and platforms, unified in one powerful ecosystem." },
];

export const SOLUTIONS = [
  { num:"01", Icon:Globe,    title:"Web Development",    desc:"Building modern, responsive applications using React, JavaScript, and related frameworks to create high-impact digital products." },
  { num:"02", Icon:Code2,    title:"Software Solutions", desc:"Delivering cutting-edge software solutions that drive businesses forward and transform ideas into impactful digital experiences." },
  { num:"03", Icon:BookOpen, title:"IT Training",        desc:"Empowering local talent through coding workshops and digital skills programs, supporting Rwanda's growing tech ecosystem." },
];

export const PROCESS = [
  { num:"01", title:"Get Started",  desc:"Begin your journey with our expert-driven process, ensuring a smooth and seamless onboarding experience." },
  { num:"02", title:"Requirements", desc:"We gather detailed requirements to fully understand your goals, timeline, and technical needs." },
  { num:"03", title:"Strategy",     desc:"Planning and strategy phase where architecture, design, and milestones are defined clearly." },
  { num:"04", title:"Development",  desc:"Agile execution — we build, test, iterate, and ship with full transparency throughout." },
  { num:"05", title:"Deployment",   desc:"Launch and ongoing support to ensure your solution runs smoothly and scales with you." },
];

export const WORKSHOP_MODS = [
  { Icon: Sun,           title: "Opening Circle",        sub: "Introductions and setting expectations" },
  { Icon: Terminal,      title: "Dev Environment Setup", sub: "Configuring IDEs, tools, and best practices" },
  { Icon: GitPullRequest,title: "Code Review Session",   sub: "Learning effective code review techniques" },
  { Icon: Rocket,        title: "Development Sprint",    sub: "Build a real-world application module" },
  { Icon: Layers,        title: "Architecture Talks",    sub: "Team presentations and technical discussions" },
  { Icon: CheckCircle2,  title: "Closing Circle",        sub: "Recap, Q&A, and networking" },
];

export const TESTIMONIALS = [
  { initials:"NF", name:"Nsanzimana Fabrice", role:"Software Engineer 🚀",    date:"15 March 2025", text:"AbyTech has been a game-changer for my career. Their mentorship and resources helped me scale my skills to new heights!" },
  { initials:"NJ", name:"Nkaka Jean Doumour", role:"IT Manager 💡",           date:"5 Feb 2025",    text:"Working with AbyTech was an eye-opening experience. Their expertise and professional approach to IT solutions impressed me greatly." },
  { initials:"MG", name:"Mihigo Guillaume",   role:"Data Analyst 📊",         date:"28 Jan 2025",   text:"AbyTech provided powerful tools and insights that helped optimize our data processing. Highly recommend their services!" },
  { initials:"HP", name:"Habineza Patrick",   role:"Full Stack Developer 💻", date:"10 March 2025", text:"AbyTech transformed my approach to web and backend development. Their hands-on guidance was invaluable." },
  { initials:"RE", name:"Rugamba Eric",        role:"Cloud Engineer ☁️",       date:"3 Feb 2025",    text:"Their cloud solutions are top-notch! AbyTech helped us implement secure and scalable architectures." },
  { initials:"UG", name:"Umutoni Grace",       role:"UX/UI Designer 🎨",       date:"18 Feb 2025",   text:"Amazing experience! The design team at AbyTech has a keen eye for user experience and creativity." },
];

export const NEWS_ITEMS = [
  { abbr:"ATF", tag:"#Technology", date:"Nov 6, 2024",  title:"Africa Tech Forum 2024: Showcasing Innovation and Market Opportunities in Kigali", desc:"Exploring the latest innovations and market opportunities at the Africa Tech Forum 2024 held in Kigali.", img:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&q=80" },
  { abbr:"AHS", tag:"#Healthcare", date:"Oct 13, 2024", title:"Africa HealthTech Summit 2024: Digital Transformation in Healthcare",                 desc:"Kigali Convention Center hosted this groundbreaking digital healthcare transformation summit.",                img:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80" },
  { abbr:"TT",  tag:"#Technology", date:"Sep 28, 2024", title:"Tech Talks with Irembo: AI, Engineering, and Cybersecurity in Focus",                   desc:"Kigali tech community gathers to discuss cutting-edge AI solutions and cybersecurity challenges.",              img:"https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=700&q=80" },
];

export const initials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
