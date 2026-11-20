"use client";

import { useTheme } from "./ThemeContext.jsx";

export default function FloatingThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside
      aria-label="Theme switcher widget"
      className="fixed bottom-5 right-5 z-50 print:hidden"
    >
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={`group flex items-center gap-2.5 rounded-2xl border-2.5 border-black px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
          isDark
            ? "bg-lime-400 text-black shadow-[4px_4px_0px_#fff] hover:bg-lime-300"
            : "bg-black text-white shadow-[4px_4px_0px_#000] hover:bg-neutral-800"
        }`}
      >
        <span
          className="text-base group-hover:rotate-12 transition-transform"
          aria-hidden="true"
        >
          {isDark ? "☀️" : "🌙"}
        </span>
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      </button>
    </aside>
  );
}
