"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { isDark } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const displayName = user?.profile?.name
    ? user.profile.name.split(" ")[0]
    : user?.email
    ? user.email.split("@")[0]
    : "Profile";

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 border-b-2.5 px-4 py-3 sm:px-8 ${
        isDark
          ? "bg-black border-neutral-800 text-white"
          : "bg-white border-black text-black"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black font-black text-xl transition-transform group-hover:rotate-6 ${
              isDark
                ? "bg-lime-400 text-black shadow-[2px_2px_0px_#fff]"
                : "bg-brutal-lime text-black shadow-brutal-sm"
            }`}
          >
            🧭
          </div>
          <div className="flex flex-col">
            <span
              className={`text-lg sm:text-xl font-black tracking-tight ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              CAREER COMPASS
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                isDark ? "text-neutral-400" : "text-slate-500"
              }`}
            >
              Adaptive AI Discovery
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span
            className={`hidden xl:inline-flex items-center rounded-full border-2 px-3 py-0.5 text-xs font-black uppercase tracking-wider rotate-[-1deg] ${
              isDark
                ? "border-neutral-700 bg-neutral-900 text-neutral-300"
                : "border-black bg-brutal-purple text-black shadow-brutal-sm"
            }`}
          >
            🇮🇳 Indian Context
          </span>

          {/* User Profile / Dashboard or Sign In & Sign Up Links */}
          {authLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-xl bg-neutral-800" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isDark
                    ? "bg-purple-300 text-black shadow-[2px_2px_0px_#fff]"
                    : "bg-purple-300 text-black shadow-brutal-sm"
                }`}
              >
                <span>📊</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/profile"
                className={`inline-flex items-center gap-1 rounded-xl border-2 border-black px-2.5 py-1.5 text-xs font-black tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isDark
                    ? "bg-white text-black shadow-[2px_2px_0px_#fff]"
                    : "bg-white text-black shadow-brutal-sm"
                }`}
                title="Profile settings"
              >
                <span>👤</span>
                <span className="max-w-[80px] truncate">{displayName}</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`inline-flex items-center rounded-xl border-2 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isDark
                    ? "border-neutral-700 bg-neutral-900 text-white hover:border-white shadow-[2px_2px_0px_#fff]"
                    : "border-black bg-white text-black hover:bg-neutral-50 shadow-brutal-sm"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`hidden sm:inline-flex items-center rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-wider text-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isDark
                    ? "bg-yellow-400 hover:bg-yellow-300 shadow-[2px_2px_0px_#fff]"
                    : "bg-yellow-300 hover:bg-yellow-200 shadow-brutal-sm"
                }`}
              >
                Sign Up ✨
              </Link>
            </div>
          )}

          {/* Prominent Segmented Theme Switcher */}
          <ThemeToggle />

          {/* CTA Link if not on assessment page */}
          {pathname !== "/assess" && (
            <Link
              href="/assess"
              className={`inline-flex items-center rounded-xl border-2 border-black px-3 sm:px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isDark
                  ? "bg-lime-400 shadow-[3px_3px_0px_#fff] hover:bg-lime-300"
                  : "bg-brutal-lime shadow-brutal-sm hover:bg-lime-200"
              }`}
            >
              <span className="hidden sm:inline">Start Session →</span>
              <span className="sm:hidden">Start →</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
