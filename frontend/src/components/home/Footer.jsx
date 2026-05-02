import { useTheme } from "../../context/ThemeContext";
import { ORG, TEAL, bb, bc, ba } from "../../utils/homeConstants";

const COLS = [
  { title: "Company",  links: [["About Us","#about"],["Solutions","#solutions"],["Our Process","#process"],["News","#news"]] },
  { title: "Services", links: [["Web Development","#services"],["Software Solutions","#services"],["IT Training","#workshop"],["Hire Developers","#hire"]] },
  { title: "Contact",  links: [["abytechhub.com","https://abytechhub.com/"],["Get In Touch","#hire"],["Join Our Talent","#hire"]] },
];

export default function Footer() {
  const { isDark } = useTheme();

  const bg        = isDark ? "#030c0f"              : "#1a1a2e";
  const logoColor = "#fff";
  const headColor = isDark ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.65)";
  const linkColor = isDark ? "rgba(255,255,255,.65)" : "rgba(255,255,255,.55)";
  const descColor = isDark ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.45)";
  const metaColor = isDark ? "rgba(255,255,255,.38)" : "rgba(255,255,255,.32)";
  const divider   = isDark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.1)";

  return (
    <footer style={{ background: bg }}>
      <div className=" mx-auto px-5 sm:px-10 lg:px-20 pt-16 lg:pt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-14">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <div style={{ ...bb(26, { letterSpacing: 4, color: logoColor }) }}>
              ABY<span style={{ color: ORG }}>TECH</span> HUB
            </div>
            <p className="mt-3 max-w-[280px]"
              style={{ ...ba(13, 300, { color: descColor, lineHeight: 1.82 }) }}>
              Building technology. Powering innovation. Creating scalable solutions for a digital world.
            </p>
          </div>

          {COLS.map(({ title, links }) => (
            <div key={title}>
              <h4 className="mb-5" style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: "uppercase", color: headColor }) }}>
                {title}
              </h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="footer-link no-underline"
                      style={{ ...ba(13, 400, { color: linkColor }) }}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className=" mx-auto px-5 sm:px-10 lg:px-20 mt-14 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ borderTop: `1px solid ${divider}` }}>
        <div style={{ ...ba(11, 400, { color: metaColor, letterSpacing: 1 }) }}>
          © 2026 Abytech Hub LTD — All Rights Reserved by Abytech Hub Team
        </div>
        <div style={{ ...ba(11, 400, { color: metaColor, letterSpacing: 1 }) }}>KIGALI, RWANDA</div>
      </div>
      <div className="h-[5px]" style={{ background: `linear-gradient(90deg,${TEAL} 0%,${ORG} 100%)` }} />
    </footer>
  );
}
