"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext.jsx";
import { useTheme } from "../../components/ThemeContext.jsx";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      router.push(redirectTo);
    } catch (err) {
      console.error("[Login Error]", err);
      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please verify your credentials.");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please check your email and verify your address before signing in.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle(redirectTo);
    } catch (err) {
      console.error("[Google OAuth Error]", err);
      setError(err.message || "Failed to initialize Google login.");
      setGoogleLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen py-10 px-4 sm:px-6 transition-colors duration-200 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div className="mx-auto max-w-md">
        {/* Top Header Card */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-lime-400 px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-lime-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            ← Home
          </Link>
          <span className="rounded-xl border-2 border-black bg-purple-300 px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
            🔒 Supabase Auth
          </span>
        </div>

        {/* Card Container */}
        <div
          className={`rounded-3xl p-6 sm:p-8 transition-all ${
            isDark
              ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
              : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
          }`}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tight">Sign In</h1>
            <p className={`mt-1 text-xs sm:text-sm font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Access your saved assessments, reports, and career directions.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border-2 border-black bg-rose-400 p-3.5 text-black shadow-[3px_3px_0px_#000] flex items-center gap-2 text-xs font-black">
              <span className="text-base" aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className={`w-full flex items-center justify-center gap-3 rounded-2xl border-2.5 border-black py-3 px-4 text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
              isDark ? "bg-white hover:bg-neutral-100 shadow-[3px_3px_0px_#fff]" : "bg-white hover:bg-neutral-50 shadow-[3px_3px_0px_#000]"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className={`h-[2px] flex-1 ${isDark ? "bg-neutral-800" : "bg-neutral-300"}`} />
            <span className="text-[11px] font-black uppercase text-neutral-400">or with email</span>
            <div className={`h-[2px] flex-1 ${isDark ? "bg-neutral-800" : "bg-neutral-300"}`} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="student@college.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-brutal w-full text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className={`text-[11px] font-black underline hover:opacity-80 ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-brutal w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl border-2.5 border-black py-3.5 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                loading ? "bg-neutral-400 cursor-wait" : "bg-lime-400 hover:bg-lime-300 shadow-[3px_3px_0px_#000]"
              }`}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className={`mt-6 border-t pt-4 text-center text-xs font-bold ${isDark ? "border-neutral-800" : "border-neutral-200"}`}>
            <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
              Don't have an account yet?{" "}
            </span>
            <Link
              href="/signup"
              className="font-black underline text-lime-400 hover:text-lime-300"
            >
              Create free account
            </Link>
          </div>

          {/* Pitch Demo Instant Mode */}
          <div className="mt-5 pt-4 border-t border-neutral-800 text-center">
            <Link
              href="/results?demo=1"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-neutral-300 hover:text-lime-400 hover:border-lime-400 transition-colors"
            >
              <span>🚀</span> Presenter Pitch Demo Mode (?demo=1)
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="rounded-3xl border-2 border-neutral-700 bg-neutral-900 p-8 text-center max-w-sm">
            <div className="animate-spin text-3xl mb-3">🧭</div>
            <p className="text-sm font-black">Loading sign in...</p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
