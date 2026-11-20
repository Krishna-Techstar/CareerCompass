"use client";

import Link from "next/link";
import { useTheme } from "../components/ThemeContext.jsx";

export default function NotFound() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen flex items-center justify-center p-6 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div
        className={`max-w-md w-full rounded-3xl p-8 text-center transition-all ${
          isDark
            ? "border-2 border-neutral-700 bg-[#121212] shadow-[6px_6px_0px_#000]"
            : "border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
        }`}
      >
        <span className="inline-block rounded-xl border-2 border-black bg-pink-300 px-3 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] mb-4">
          404 • Not Found
        </span>
        <h1 className="text-3xl font-black mb-2">Lost on the path?</h1>
        <p className={`text-sm font-bold mb-6 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
          The page or section you are looking for doesn't exist or was moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className={`rounded-xl border-2 border-black px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
              isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-100 text-black hover:bg-neutral-200"
            }`}
          >
            ← Back Home
          </Link>
          <Link
            href="/assess"
            className="rounded-xl border-2 border-black bg-lime-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000] hover:bg-lime-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            Start Assessment →
          </Link>
        </div>
      </div>
    </main>
  );
}
