import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ORG, TEAL, bb, bc, ba } from "../utils/homeConstants";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const bg     = isDark ? "#071418" : "#f5efe6";
  const bg2    = isDark ? "#0a1e28" : "#ede5da";
  const textC  = isDark ? "#fff"    : "#071418";
  const text2  = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const border = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: bg }}>

      {/* Diagonal slash decorations */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: ORG, clipPath: "polygon(62% 0%,74% 0%,58% 100%,46% 100%)", opacity: .12 }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: TEAL, clipPath: "polygon(66% 0%,70% 0%,54% 100%,50% 100%)", opacity: .1 }} />

      {/* Dot grid */}
      <div className="absolute top-16 right-16 hidden lg:block pointer-events-none"
        style={{
          width: 160, height: 160,
          backgroundImage: `radial-gradient(circle,${isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)"} 1.5px,transparent 1.5px)`,
          backgroundSize: "18px 18px",
        }} />
      <div className="absolute bottom-16 left-16 hidden lg:block pointer-events-none"
        style={{
          width: 120, height: 120,
          backgroundImage: `radial-gradient(circle,${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"} 1.5px,transparent 1.5px)`,
          backgroundSize: "16px 16px",
        }} />

      {/* Content */}
      <div className="relative z-10 text-center px-5 sm:px-10 max-w-[680px]">

        {/* Section label */}
        <div className="flex items-center justify-center gap-3 mb-6"
          style={{ ...bc(10, 700, { letterSpacing: 5, textTransform: "uppercase", color: ORG }) }}>
          <div className="w-6 h-[2px]" style={{ background: ORG }} />
          ABYTECH HUB
          <div className="w-6 h-[2px]" style={{ background: ORG }} />
        </div>

        {/* Big 404 */}
        <div className="relative inline-block mb-2">
          <div style={{ ...bb("clamp(140px,22vw,240px)", { color: ORG, lineHeight: 1, letterSpacing: 4, opacity: .15 }) }}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ ...bb("clamp(140px,22vw,240px)", { color: isDark ? "rgba(255,255,255,.07)" : "rgba(7,20,24,.06)", lineHeight: 1, letterSpacing: 4 }) }}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ ...bb("clamp(140px,22vw,240px)", { color: textC, lineHeight: 1, letterSpacing: 4 }) }}>
              404
            </span>
          </div>
        </div>

        <h1 className="mb-4" style={{ ...bb("clamp(36px,6vw,64px)", { lineHeight: .9, letterSpacing: 2, color: textC }) }}>
          PAGE NOT<br /><span style={{ color: ORG }}>FOUND</span>
        </h1>

        <p className="mb-10 mx-auto max-w-[480px]"
          style={{ ...ba(15, 300, { color: text2, lineHeight: 1.82 }) }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Divider */}
        <div className="w-16 h-[2px] mx-auto mb-10" style={{ background: ORG }} />

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 cursor-pointer border-none"
            style={{
              ...bb(14, { letterSpacing: 2, color: textC }),
              background: isDark ? "rgba(255,255,255,.06)" : "rgba(7,20,24,.06)",
              border: `1px solid ${border}`,
              padding: "13px 28px",
              borderRadius: 4,
            }}>
            <ArrowLeft size={15} />
            Go Back
          </button>
          <a href="/" className="flex items-center gap-2 no-underline btn-primary"
            style={{
              ...bb(14, { letterSpacing: 2, color: "#fff" }),
              background: ORG,
              padding: "13px 28px",
              borderRadius: 4,
              boxShadow: "0 6px 24px rgba(232,98,26,.32)",
            }}>
            <Home size={15} />
            Home
          </a>
        </div>

        {/* Bottom meta */}
        <div className="mt-14 pt-8 flex items-center justify-center gap-3"
          style={{ borderTop: `1px solid ${border}` }}>
          <span style={{ ...bc(10, 700, { letterSpacing: 4, textTransform: "uppercase", color: text2 }) }}>
            Error 404
          </span>
          <span style={{ color: border }}>·</span>
          <span style={{ ...bc(10, 400, { letterSpacing: 2, color: text2 }) }}>
            abytechhub.com
          </span>
        </div>
      </div>
    </div>
  );
}
