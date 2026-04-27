import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("abytech-theme") ?? "light"
  );
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // persist + keep Tailwind dark-mode class in sync + update PWA theme meta tags
  useEffect(() => {
    localStorage.setItem("abytech-theme", theme);
    document.documentElement.classList.toggle("dark", isDark);

    const themeColor = isDark ? "#071418" : "#e8621a";
    ["theme-color", "msapplication-TileColor", "msapplication-navbutton-color"].forEach((name) => {
      const meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) meta.setAttribute("content", themeColor);
    });
  }, [theme, isDark]);

  useEffect(() => {
    const reveal = () => {
      document.querySelectorAll(".at-reveal:not(.at-visible)").forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect();
        if (top < window.innerHeight && bottom > 0) {
          el.classList.add("at-visible");
        }
      });
    };

    // run once after paint so all elements are in the DOM
    const t = setTimeout(reveal, 80);
    window.addEventListener("scroll", reveal, { passive: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", reveal);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
