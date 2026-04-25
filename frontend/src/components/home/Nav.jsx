import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { ORG, TEAL, bb, bc } from "../../utils/homeConstants";
import LogoSVG from "./LogoSVG";

const NAV_LINKS = [
  ["About Us",     "#about"],
  ["Our Services", "#services"],
  ["Solutions",    "#solutions"],
  ["Training",     "#workshop"],
  ["News",         "#news"],
  ["Contact",      "/contact-us"],
];

export default function Nav() {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const textMuted = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const navBg     = isDark ? "rgba(7,20,24,0.95)"   : "rgba(245,239,230,0.97)";
  const menuBg    = isDark ? "#071418"               : "#f5efe6";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setMenuOpen(false);

  const handleLink = (e, href) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    close();
    if (location.pathname === "/") {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 350);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] h-[72px] flex items-center justify-between px-5 sm:px-8 lg:px-16 transition-all duration-300"
      style={{
        background: navBg,
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.07)"}`,
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,.18)" : "none",
      }}
    >
      {/* Logo */}
      <a href="/"  className="flex items-center gap-3 no-underline">
        <LogoSVG />
        <span style={{ ...bb(22, { letterSpacing: 3, color: isDark ? "#fff" : "#071418", lineHeight: 1 }) }}>
          ABY<span style={{ color: ORG }}>TECH</span> HUB
        </span>
      </a>

      {/* Desktop links */}
      <ul className="hidden lg:flex items-center gap-7 list-none m-0 p-0">
        {NAV_LINKS.map(([label, href]) => (
          <li key={label}>
            <a href={href} onClick={e => handleLink(e, href)} className="nav-link no-underline"
              style={{ ...bc(12, 600, { letterSpacing: 2, textTransform: "uppercase", color: textMuted }) }}>
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="relative flex items-center p-[3px] rounded-xl border-none cursor-pointer shrink-0"
          style={{ width: 44, height: 24, background: isDark ? TEAL : "#c4baae", transition: "background .3s" }}>
          <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center"
            style={{ transform: isDark ? "translateX(0)" : "translateX(20px)", transition: "transform .3s" }}>
            {isDark ? <Moon size={10} color="#555" /> : <Sun size={10} color="#e8621a" />}
          </div>
        </button>

        {/* CTA — hidden on very small screens */}
        <a href="#hire" className="btn-primary hidden sm:inline-block no-underline"
          style={{ ...bb(13, { letterSpacing: 2, color: "#fff" }), background: ORG, padding: "9px 20px", borderRadius: 4 }}>
          Join Our Talent
        </a>

        {/* Hamburger — mobile only */}
        <button className="lg:hidden p-2 rounded border-none bg-transparent cursor-pointer"
          style={{ color: isDark ? "#fff" : "#071418" }}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 right-0 flex flex-col py-4 px-5 gap-1 z-50"
          style={{ background: menuBg, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.07)"}` }}>
          {NAV_LINKS.map(([label, href]) => (
            <a key={label} href={href} onClick={e => handleLink(e, href)}
              className="no-underline py-3 border-b"
              style={{ ...bc(13, 600, { letterSpacing: 2, textTransform: "uppercase", color: textMuted }), borderColor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)" }}>
              {label}
            </a>
          ))}
          <a href="#hire" onClick={close} className="btn-primary inline-block mt-3 text-center no-underline"
            style={{ ...bb(14, { letterSpacing: 2, color: "#fff" }), background: ORG, padding: "11px 24px", borderRadius: 4 }}>
            Join Our Talent
          </a>
        </div>
      )}
    </nav>
  );
}
