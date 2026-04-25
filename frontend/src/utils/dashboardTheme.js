import { useTheme } from "../context/ThemeContext";

export function useDashboardTheme() {
  const { isDark, toggleTheme } = useTheme();
  return {
    isDark,
    toggleTheme,
    bg:     isDark ? "#071418"                   : "#f5efe6",
    bg2:    isDark ? "#0a1e28"                   : "#ede5da",
    bg3:    isDark ? "#0d3040"                   : "#ddd5c8",
    textC:  isDark ? "#ffffff"                   : "#071418",
    text2:  isDark ? "rgba(255,255,255,.55)"     : "rgba(7,20,24,.6)",
    text3:  isDark ? "rgba(255,255,255,.25)"     : "rgba(7,20,24,.3)",
    border: isDark ? "rgba(255,255,255,.07)"     : "rgba(0,0,0,.08)",
  };
}
