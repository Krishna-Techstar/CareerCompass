"use client";

import Link from "next/link";
import { useTheme } from "./ThemeContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer
      className={`border-t-2.5 px-6 py-8 text-center text-xs font-bold transition-colors ${
        isDark
          ? "border-neutral-800 bg-black text-neutral-400"
          : "border-black bg-white text-neutral-700"
      }`}
    >
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p>© 2026 Career Compass. Built for Indian College Students.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-[11px] font-black uppercase">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/assess" className="hover:underline">Assessment</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/login" className="hover:underline">Sign In</Link>
            <Link href="/signup" className="hover:underline">Sign Up</Link>
            <Link href="/results?demo=1" className="opacity-70 hover:opacity-100 text-lime-500 hover:underline">🚀 Pitch Demo (?demo=1)</Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Mode Selector in Footer */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Theme:</span>
            <ThemeToggle />
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 font-black text-[11px] ${
              isDark
                ? "border-black bg-lime-400 text-black shadow-[2px_2px_0px_#fff]"
                : "border-black bg-brutal-yellow text-black shadow-brutal-sm"
            }`}
          >
            <span>⚡</span> 18D Cosine Engine & Gemini AI
          </div>
        </div>
      </div>
    </footer>
  );
}
