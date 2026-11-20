"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext.jsx";
import { useTheme } from "../../components/ThemeContext.jsx";
import { createClient } from "../../lib/supabase/client.js";
import { SEGMENT_LABELS } from "../../lib/types.js";
import { DEMO_USER, DEMO_DASHBOARD_ASSESSMENTS } from "../../lib/demoData.js";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";

  const { user, loading: authLoading, signOut } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const supabase = createClient();

  const fetchAssessments = useCallback(async () => {
    if (!user?.id || !supabase?.from) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[Dashboard] Could not fetch assessments:", error.message);
      } else {
        setAssessments(data || []);
      }
    } catch (err) {
      console.error("[Dashboard] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (isDemo) {
      setAssessments(DEMO_DASHBOARD_ASSESSMENTS);
      setLoading(false);
      return;
    }

    if (!authLoading && !user) {
      router.push("/login?redirectTo=/dashboard");
      return;
    }

    if (user) {
      fetchAssessments();
    }
  }, [user, authLoading, router, fetchAssessments, isDemo]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("[SignOut Error]", err);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError(null);

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete account.");
      }

      // Clear local browser storage
      try {
        localStorage.removeItem("career_compass_profile");
        localStorage.removeItem("career_compass_onboarding");
        localStorage.removeItem("career_compass_assessment_id");
      } catch (e) {}

      await signOut();
      router.push("/");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account. Please try again.");
      setDeletingAccount(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!confirm("Are you sure you want to remove this assessment?")) return;

    try {
      await supabase.from("assessments").delete().eq("id", assessmentId);
      setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
    } catch (err) {
      console.error("[Delete Assessment]", err);
    }
  };

  const activeUser = isDemo ? DEMO_USER : user;
  const displayName = activeUser?.profile?.name || activeUser?.user_metadata?.full_name || activeUser?.email?.split("@")[0] || "Student";
  const userSegment = activeUser?.profile?.segment || "undergrad";

  return (
    <main
      className={`min-h-screen py-8 px-4 sm:px-8 transition-colors duration-200 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div className="mx-auto max-w-5xl">
        {/* ================= PITCH DEMO BANNER (?demo=1) ================= */}
        {isDemo && (
          <div className="mb-6 rounded-2xl border-2.5 border-black bg-amber-300 p-4 sm:p-5 text-black shadow-[4px_4px_0px_#000] animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-xl shadow-[2px_2px_0px_#000]">
                  ⚡
                </span>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider">
                    Pitch Demo Mode Active (?demo=1)
                  </div>
                  <p className="text-xs font-bold text-neutral-800">
                    Pre-loaded assessment dashboard for live pitch presentations. Click &quot;Open Report&quot; below for instant results.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/results?demo=1"
                  className="inline-flex items-center rounded-xl border-2 border-black bg-lime-400 px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-lime-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  View Demo Report →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ================= TOP HERO CARD ================= */}
        <div
          className={`mb-8 rounded-3xl p-6 sm:p-8 transition-all ${
            isDark
              ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
              : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-xl border-2 border-black bg-lime-400 px-3 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                  👤 Student Dashboard
                </span>
                <span
                  className={`rounded-xl border border-black px-2.5 py-0.5 text-[11px] font-black uppercase ${
                    isDark ? "bg-neutral-800 text-neutral-300" : "bg-purple-200 text-black"
                  }`}
                >
                  {SEGMENT_LABELS[userSegment] || userSegment}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Welcome back, {displayName} 👋
              </h1>
              <p className={`mt-1 text-xs sm:text-sm font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Track your career discovery progress, resume sessions, and review analytical reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-2xl border-2.5 border-black bg-lime-400 px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000] hover:bg-lime-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                + Start New Assessment
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className={`inline-flex items-center justify-center rounded-2xl border-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isDark
                    ? "border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white"
                    : "border-black bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_#000]"
                }`}
              >
                Logout 🚪
              </button>
            </div>
          </div>
        </div>

        {/* ================= ASSESSMENTS LIST SECTION ================= */}
        <section aria-labelledby="assessments-heading" className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 id="assessments-heading" className="text-xl sm:text-2xl font-black tracking-tight">
              Your Assessments ({assessments.length})
            </h2>
          </div>

          {loading ? (
            <div
              className={`rounded-3xl p-12 text-center border-2 ${
                isDark ? "border-neutral-800 bg-[#141414]" : "border-black bg-white shadow-[4px_4px_0px_#000]"
              }`}
            >
              <div className="animate-spin text-3xl mb-3">🧭</div>
              <p className="text-sm font-black">Loading your assessments...</p>
            </div>
          ) : assessments.length === 0 ? (
            /* Empty State */
            <div
              className={`rounded-3xl p-8 sm:p-12 text-center border-2 ${
                isDark ? "border-neutral-800 bg-[#121212]" : "border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
              }`}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-black bg-yellow-300 text-3xl shadow-[3px_3px_0px_#000]">
                ✨
              </div>
              <h3 className="text-xl font-black mb-1">No assessments completed yet</h3>
              <p className={`max-w-md mx-auto text-xs sm:text-sm font-bold mb-6 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Discover your top Indian career pathways and directions through our 20-question adaptive assessment.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center rounded-2xl border-2.5 border-black bg-lime-400 px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000] hover:bg-lime-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                Start First Assessment →
              </Link>
            </div>
          ) : (
            /* Assessments Cards Grid */
            <div className="grid grid-cols-1 gap-4">
              {assessments.map((item) => {
                const isCompleted = item.status === "completed";
                const createdDate = new Date(item.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Extract top 3 careers from report or matches
                const rep = item.report?.report || item.report;
                const reportMatches = rep?.careerExplanations || [];
                const matches = item.report?.matches || [];

                const topCareersList = [];
                if (Array.isArray(matches) && matches.length > 0) {
                  matches.slice(0, 3).forEach((m) => {
                    if (m?.career?.name) topCareersList.push(m.career.name);
                    else if (m?.career?.id) topCareersList.push(m.career.id.replace(/_/g, " "));
                  });
                }
                if (topCareersList.length === 0 && Array.isArray(reportMatches)) {
                  reportMatches.slice(0, 3).forEach((e) => {
                    if (e.careerId) topCareersList.push(e.careerId.replace(/_/g, " "));
                  });
                }

                const answeredCount = Array.isArray(item.answers) ? item.answers.length : 0;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-5 sm:p-6 transition-all ${
                      isDark
                        ? "border-2 border-neutral-800 bg-[#161616] hover:border-neutral-700 shadow-[4px_4px_0px_#000]"
                        : "border-2.5 border-black bg-white shadow-[4px_4px_0px_#000]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`rounded-lg border border-black px-2 py-0.5 text-[11px] font-black uppercase ${
                              isCompleted ? "bg-emerald-400 text-black" : "bg-amber-300 text-black"
                            }`}
                          >
                            {isCompleted ? "✅ Completed" : `⚡ In Progress (${answeredCount}/20)`}
                          </span>
                          <span
                            className={`rounded-lg border border-black px-2 py-0.5 text-[11px] font-black uppercase ${
                              isDark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-800"
                            }`}
                          >
                            {SEGMENT_LABELS[item.segment] || item.segment}
                          </span>
                          <span className="text-xs font-bold text-neutral-400">
                            {createdDate}
                          </span>
                        </div>

                        {/* Top 3 careers badges */}
                        {isCompleted && topCareersList.length > 0 && (
                          <div className="mt-2.5 mb-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                              Top Careers:
                            </span>
                            {topCareersList.map((careerTitle, cIdx) => (
                              <span
                                key={cIdx}
                                className="inline-flex items-center rounded-lg border border-black bg-lime-300 px-2 py-0.5 text-[11px] font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000]"
                              >
                                🎯 {careerTitle}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Summary preview */}
                        {isCompleted && rep?.summary && (
                          <p className={`text-xs font-bold line-clamp-2 max-w-2xl mt-1.5 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                            {rep.summary}
                          </p>
                        )}

                        {!isCompleted && (
                          <p className={`text-xs font-bold mt-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                            Your progress is saved. Click "Resume" to continue your session from Question {answeredCount + 1}.
                          </p>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {isCompleted ? (
                          <Link
                            href={isDemo ? "/results?demo=1" : `/results?assessmentId=${item.id}`}
                            className="inline-flex items-center rounded-xl border-2 border-black bg-lime-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:bg-lime-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
                          >
                            Open Report →
                          </Link>
                        ) : (
                          <Link
                            href={isDemo ? "/assess?demo=1" : `/assess?assessmentId=${item.id}`}
                            className="inline-flex items-center rounded-xl border-2 border-black bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000] hover:bg-amber-200 transition-all active:translate-x-0.5 active:translate-y-0.5"
                          >
                            Resume ⚡
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteAssessment(item.id)}
                          title="Delete assessment"
                          className={`rounded-xl border-2 border-black p-2 text-xs font-black transition-all hover:bg-rose-400 hover:text-black ${
                            isDark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= DANGER ZONE: ACCOUNT DELETION ================= */}
        <section
          aria-labelledby="danger-heading"
          className={`rounded-3xl p-6 sm:p-8 border-2 transition-all ${
            isDark ? "border-rose-950/60 bg-rose-950/20 text-white" : "border-rose-300 bg-rose-50 text-black"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="danger-heading" className="text-lg font-black text-rose-500">
                Danger Zone: Account & Data Management
              </h2>
              <p className={`mt-1 text-xs font-bold max-w-xl ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Permanently delete your user profile, saved assessments, and all associated RIASEC data. This action is irreversible.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center rounded-xl border-2 border-black bg-rose-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_#000] hover:bg-rose-600 transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Delete my account and data
            </button>
          </div>
        </section>

        {/* ================= CONFIRMATION MODAL ================= */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div
              className={`w-full max-w-md rounded-3xl p-6 sm:p-8 transition-all ${
                isDark
                  ? "border-2 border-neutral-700 bg-[#161616] text-white shadow-[8px_8px_0px_#000]"
                  : "border-3 border-black bg-white text-black shadow-[8px_8px_0px_#000]"
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">⚠️</span>
                <h3 className="text-xl font-black">Delete Account Permanently?</h3>
              </div>

              <p className={`text-xs sm:text-sm font-bold mb-6 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                This will permanently delete your login, educational profile, and all saved assessment progress and career reports.
              </p>

              {deleteError && (
                <div className="mb-4 rounded-xl border-2 border-black bg-rose-400 p-3 text-black text-xs font-black">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingAccount}
                  className={`rounded-xl border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                    isDark ? "bg-neutral-800 text-white" : "bg-neutral-100 text-black hover:bg-neutral-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="rounded-xl border-2 border-black bg-rose-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_#000] hover:bg-rose-600 transition-all"
                >
                  {deletingAccount ? "Deleting..." : "Yes, Delete Everything"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="rounded-3xl border-2 border-neutral-700 bg-neutral-900 p-8 text-center max-w-sm">
            <div className="animate-spin text-3xl mb-3">🧭</div>
            <p className="text-sm font-black">Loading dashboard...</p>
          </div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
