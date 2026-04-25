import { createContext, useContext, useState, useEffect } from "react";

const HomeThemeContext = createContext(null);

export function HomeThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  useEffect(() => {
    const t = setTimeout(() => {
      const els = document.querySelectorAll(".at-reveal");
      const io = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("at-visible"); }),
        { threshold: 0.1 }
      );
      els.forEach(el => io.observe(el));
      return () => io.disconnect();
    }, 100);
    return () => clearTimeout(t);
  }, [theme]);

  return (
    <HomeThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </HomeThemeContext.Provider>
  );
}

export function useHomeTheme() {
  return useContext(HomeThemeContext);
}
