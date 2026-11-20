"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext.jsx";
import { useTheme } from "../../components/ThemeContext.jsx";

function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error("[Reset Password Error]", err);
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
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
            href="/login"
            className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-lime-400 px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-lime-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            ← Back to Login
          </Link>
          <span className="rounded-xl border-2 border-black bg-sky-300 px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
            🔑 Password Recovery
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
            <h1 className="text-3xl font-black tracking-tight">Reset Password</h1>
            <p className={`mt-1 text-xs sm:text-sm font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Enter your email address and we will send you a secure link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border-2 border-black bg-rose-400 p-3.5 text-black shadow-[3px_3px_0px_#000] flex items-center gap-2 text-xs font-black">
              <span className="text-base" aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-black bg-emerald-400 p-4 text-black shadow-[3px_3px_0px_#000] text-xs font-black">
                <span className="text-base" aria-hidden="true">📬</span>
                <p className="mt-1">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full inline-block text-center rounded-2xl border-2.5 border-black bg-lime-400 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000] hover:bg-lime-300 transition-all"
              >
                Return to Sign In →
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl border-2.5 border-black py-3.5 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  loading ? "bg-neutral-400 cursor-wait" : "bg-lime-400 hover:bg-lime-300 shadow-[3px_3px_0px_#000]"
                }`}
              >
                {loading ? "Sending Reset Link..." : "Send Reset Link →"}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className={`mt-6 border-t pt-4 text-center text-xs font-bold ${isDark ? "border-neutral-800" : "border-neutral-200"}`}>
            <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
              Remembered your password?{" "}
            </span>
            <Link
              href="/login"
              className="font-black underline text-lime-400 hover:text-lime-300"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="rounded-3xl border-2 border-neutral-700 bg-neutral-900 p-8 text-center max-w-sm">
            <div className="animate-spin text-3xl mb-3">🧭</div>
            <p className="text-sm font-black">Loading password recovery...</p>
          </div>
        </main>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
