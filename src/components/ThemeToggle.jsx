"use client";

import { useTheme } from "./ThemeContext.jsx";

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      role="group"
      aria-label="Color theme selector"
      className={`inline-flex items-center rounded-xl border-2 p-1 transition-colors ${
        isDark
          ? "border-neutral-700 bg-neutral-900 shadow-[2px_2px_0px_#fff]"
          : "border-black bg-neutral-100 shadow-[2px_2px_0px_#000]"
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider transition-all ${
          isDark
            ? "border-2 border-black bg-lime-400 text-black shadow-[1.5px_1.5px_0px_#000]"
            : "text-neutral-600 hover:text-black"
        }`}
      >
        <span>🌙</span>
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider transition-all ${
          !isDark
            ? "border-2 border-black bg-white text-black shadow-[1.5px_1.5px_0px_#000]"
            : "text-neutral-400 hover:text-white"
        }`}
      >
        <span>☀️</span>
        <span className="hidden sm:inline">Light</span>
      </button>
    </div>
  );
}
