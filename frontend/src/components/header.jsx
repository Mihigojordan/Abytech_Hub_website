import { useTheme } from "../context/ThemeContext";
import { ORG, TEAL, bb, bc } from "../utils/homeConstants";
import headerBg from "../assets/untitled folder/image8.jpeg";

export default function Header({ title, path }) {
  const { isDark } = useTheme();
  const bg     = isDark ? "#0a1e28" : "#ede5da";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.55)";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";

  return (
    <div className="relative overflow-hidden flex flex-col justify-end pt-[72px] min-h-[40vh] sm:min-h-[48vh]"
      style={{ background: bg }}>

      {/* Background photo */}
      <img src={headerBg} alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ opacity: isDark ? .13 : .09 }} />

      {/* Diagonal slash decorations */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: ORG, clipPath: "polygon(62% 0%,74% 0%,58% 100%,46% 100%)", opacity: .7 }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: TEAL, clipPath: "polygon(66% 0%,70% 0%,54% 100%,50% 100%)", opacity: .55 }} />

      {/* Dot grid — top right */}
      <div className="absolute top-12 right-16 hidden lg:block pointer-events-none"
        style={{
          width: 120, height: 120,
          backgroundImage: `radial-gradient(circle,${isDark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.1)"} 1.5px,transparent 1.5px)`,
          backgroundSize: "16px 16px",
        }} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.005) 3px,rgba(255,255,255,.005) 4px)" }} />

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full px-5 sm:px-10 lg:px-20 pb-10 pt-8">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4"
          style={{ ...bc(10, 700, { letterSpacing: 5, textTransform: "uppercase", color: ORG }) }}>
          <div className="w-6 h-[2px] shrink-0" style={{ background: ORG }} />
          ABYTECH HUB
        </div>

        {/* Title */}
        <h1 style={{ ...bb("clamp(40px,7vw,80px)", { lineHeight: .9, letterSpacing: 3, color: textC }) }}>
          {title.toUpperCase()}
        </h1>

        {/* Breadcrumb strip */}
        <div className="flex items-center gap-2 mt-6 pt-5" style={{ borderTop: `1px solid ${border}` }}>
          <a href="/" style={{ ...bc(11, 700, { letterSpacing: 2, textTransform: "uppercase", color: ORG, textDecoration: "none" }) }}>
            Home
          </a>
          <span style={{ ...bc(11, 400, { color: text2, letterSpacing: 1 }) }}>/</span>
          <span style={{ ...bc(11, 600, { letterSpacing: 2, textTransform: "uppercase", color: text2 }) }}>
            {path}
          </span>
        </div>
      </div>
    </div>
  );
}
