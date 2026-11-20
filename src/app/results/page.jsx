"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { normalizedProfile } from "../../lib/profile.js";
import { useTheme } from "../../components/ThemeContext.jsx";
import { createClient } from "../../lib/supabase/client.js";
import { DEMO_REPORT_DATA, DEMO_PROFILE } from "../../lib/demoData.js";

const RIASEC_META = {
  R: { name: "Realistic", label: "Practical & Physical Systems", color: "bg-sky-400" },
  I: { name: "Investigative", label: "Analytical & Scientific Inquiry", color: "bg-lime-400" },
  A: { name: "Artistic", label: "Creative & Conceptual Design", color: "bg-pink-300" },
  S: { name: "Social", label: "Mentoring & Human Connection", color: "bg-purple-300" },
  E: { name: "Enterprising", label: "Leadership & Commercial Drive", color: "bg-orange-300" },
  C: { name: "Conventional", label: "Structured & Operational Accuracy", color: "bg-teal-300" },
};

const WORKSTYLE_LABELS = {
  independent_vs_team: {
    negative: "Solitary Deep Focus",
    positive: "Collaborative Team Work",
  },
  structured_vs_flexible: {
    negative: "Structured SOPs & Clear Roadmaps",
    positive: "Flexible & Agile Exploration",
  },
  practical_vs_conceptual: {
    negative: "Hands-on Practical Execution",
    positive: "Abstract & Conceptual Theory",
  },
  lead_vs_support: {
    negative: "Command & Strategic Direction",
    positive: "Trusted Specialist Contributor",
  },
};

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryAssessmentId = searchParams.get("assessmentId");
  const isDemo = searchParams.get("demo") === "1";

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [assessmentId, setAssessmentId] = useState(queryAssessmentId || null);
  const [profile, setProfile] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Pitch Demo Mode (?demo=1): Instant pre-filled saved report for pitch presentations
    if (isDemo) {
      setProfile(DEMO_PROFILE);
      setReportData(DEMO_REPORT_DATA);
      setIsLoading(false);
      return;
    }

    async function loadResults() {
      const supabase = createClient();
      let user = null;
      try {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
      } catch (e) {}

      // 1. If an assessmentId was provided, attempt to load from Supabase
      if (queryAssessmentId) {
        try {
          const { data: row } = await supabase
            .from("assessments")
            .select("*")
            .eq("id", queryAssessmentId)
            .single();

          if (row && isMounted) {
            setProfile(row.profile);
            setAssessmentId(row.id);

            // If report is already completed and saved
            if (row.status === "completed" && row.report) {
              const rep = row.report.report ? row.report : { report: row.report, matches: row.report.matches || [] };
              setReportData(rep);
              setIsLoading(false);
              return;
            }

            // If not yet completed or report missing, generate report now
            if (row.profile) {
              fetchReport(row.profile, row.id, user);
              return;
            }
          }
        } catch (e) {
          console.warn("[Results] Error loading assessment from Supabase:", e);
        }
      }

      // 2. Otherwise load profile from localStorage
      let savedProfile = null;
      try {
        const raw = localStorage.getItem("career_compass_profile");
        if (raw) savedProfile = JSON.parse(raw);
      } catch (e) {
        console.warn("Could not load profile from localStorage:", e);
      }

      if (!savedProfile || !savedProfile.answeredIds || savedProfile.answeredIds.length === 0) {
        router.push("/assess");
        return;
      }

      if (!isMounted) return;
      setProfile(savedProfile);
      fetchReport(savedProfile, queryAssessmentId, user);
    }

    loadResults();

    return () => {
      isMounted = false;
    };
  }, [queryAssessmentId, router]);

  async function fetchReport(profileToAnalyze, currentAid, currentUser) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileToAnalyze }),
      });

      if (!res.ok) {
        throw new Error(`Report generation failed (${res.status})`);
      }

      const data = await res.json();
      setReportData(data);

      // Persist completed report to Supabase
      try {
        const supabase = createClient();
        if (currentAid) {
          await supabase
            .from("assessments")
            .update({
              report: data,
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("id", currentAid);
        } else if (currentUser) {
          const { data: newRow } = await supabase
            .from("assessments")
            .insert({
              user_id: currentUser.id,
              segment: profileToAnalyze.segment || "undergrad",
              answers: profileToAnalyze.history || [],
              profile: profileToAnalyze,
              report: data,
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (newRow) {
            setAssessmentId(newRow.id);
          }
        }
      } catch (dbErr) {
        console.warn("[Results] Failed to save completed report to Supabase:", dbErr);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Unable to generate full report. Please retry.");
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleRestart() {
    try {
      localStorage.removeItem("career_compass_profile");
    } catch (e) {}
    router.push("/assess");
  }

  const norm = profile ? normalizedProfile(profile) : null;
  const report = reportData?.report;
  const matches = reportData?.matches || [];
  const isEarlySegment =
    profile?.segment === "class_6_8" || profile?.segment === "class_9_10";

  return (
    <div
      className={`min-h-screen py-10 px-4 sm:px-8 transition-colors duration-200 print:bg-white print:text-black print:p-0 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div className="mx-auto max-w-5xl">
        {/* Top Actions & Breadcrumb Bar (Hidden on print) */}
        <div
          className={`mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4 print:hidden ${
            isDark ? "border-neutral-800" : "border-neutral-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border-2 border-black bg-lime-400 px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none hover:bg-lime-300"
            >
              ← Home
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1 text-xs font-black uppercase transition-all ${
                isDark
                  ? "border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white"
                  : "border-black bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-neutral-50"
              }`}
            >
              🧭 Dashboard
            </Link>
            <span
              className={`text-xs font-bold ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Assessment Complete • {profile?.answeredIds?.length || 0} Questions Answered
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              aria-label="Print report or save as PDF"
              className={`rounded-xl border-2 border-black px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black transition-all active:translate-x-0.5 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none ${
                isDark
                  ? "bg-white shadow-[3px_3px_0px_#fff] hover:bg-neutral-100"
                  : "bg-white shadow-brutal-sm hover:bg-neutral-50"
              }`}
            >
              🖨️ Print / Save PDF
            </button>
            <button
              onClick={handleRestart}
              aria-label="Restart assessment from beginning"
              className={`rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-colors ${
                isDark
                  ? "border-neutral-700 bg-neutral-900 text-rose-300 hover:border-rose-400 hover:text-white"
                  : "border-black bg-white text-rose-600 hover:bg-rose-50 shadow-brutal-sm"
              }`}
            >
              Restart
            </button>
          </div>
        </div>

        {/* ================= PITCH DEMO BANNER (?demo=1) ================= */}
        {isDemo && (
          <div className="mb-6 rounded-2xl border-2.5 border-black bg-lime-300 p-4 sm:p-5 text-black shadow-[4px_4px_0px_#000] animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-xl shadow-[2px_2px_0px_#000]">
                  🚀
                </span>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider">
                    Pitch Demo Mode Active (?demo=1)
                  </div>
                  <p className="text-xs font-bold text-neutral-800">
                    Pre-filled report for {DEMO_PROFILE.name} ({DEMO_PROFILE.streamOrCourse}). Zero API latency, 100% offline-ready.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard?demo=1"
                  className="inline-flex items-center rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-neutral-50 transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  Demo Dashboard →
                </Link>
                <Link
                  href="/assess?demo=1"
                  className="inline-flex items-center rounded-xl border-2 border-black bg-yellow-300 px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-yellow-200 transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  Live QA Demo ⚡
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ================= HERO HEADER ================= */}
        <div
          className={`relative mb-10 rounded-3xl p-6 sm:p-10 transition-all print:border-black print:shadow-none print:p-4 ${
            isDark
              ? "border-2 border-neutral-700 bg-[#121212] shadow-[6px_6px_0px_#000]"
              : "border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
          }`}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl border-2 border-black bg-purple-300 px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
            <span>🎯</span> Exploratory Discovery Report
          </div>

          <h1
            className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Your Exploratory Career Pathways
          </h1>

          <p
            className={`mt-3 max-w-2xl text-xs sm:text-sm font-bold leading-relaxed ${
              isDark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            Synthesized from your 20 responses across RIASEC interests, work style, strengths, and personal values. Designed to prompt thoughtful exploration rather than narrow your choices prematurely.
          </p>

          {/* AI / Deterministic Path Badge */}
          <div className="mt-4 flex items-center gap-2 print:hidden">
            <span className="text-xs font-bold opacity-75">Generated via:</span>
            {reportData?.path === "llm" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-emerald-400 px-2.5 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                AI Live (Gemini)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-amber-300 px-2.5 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                Deterministic Engine
              </span>
            )}
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div
            className={`rounded-3xl p-16 text-center transition-all ${
              isDark
                ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
                : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
            }`}
          >
            <div className="animate-spin text-4xl mb-4">🧭</div>
            <h2 className="text-xl font-black tracking-tight">Synthesizing Your Report...</h2>
            <p className={`mt-2 text-xs sm:text-sm font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Matching your RIASEC profile against 30+ Indian career pathways and generating personalized insights.
            </p>
          </div>
        ) : error ? (
          <div
            className={`rounded-3xl p-8 text-center transition-all ${
              isDark
                ? "border-2 border-rose-800 bg-[#181212] shadow-[8px_8px_0px_#000]"
                : "border-3 border-rose-600 bg-rose-50 shadow-[8px_8px_0px_#000]"
            }`}
          >
            <span className="text-3xl">⚠️</span>
            <h2 className="mt-2 text-lg font-black text-rose-500">Generation Failed</h2>
            <p className="mt-1 text-xs font-bold">{error}</p>
            <button
              onClick={() => fetchReport(profile, assessmentId)}
              className="mt-4 rounded-xl border-2 border-black bg-lime-400 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000]"
            >
              Retry Report Generation
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ================= SUMMARY SECTION ================= */}
            {report?.summary && (
              <div
                className={`rounded-3xl p-6 sm:p-8 transition-all print:border-black print:shadow-none ${
                  isDark
                    ? "border-2 border-neutral-700 bg-[#141414] shadow-[6px_6px_0px_#000]"
                    : "border-3 border-black bg-lime-50 shadow-[6px_6px_0px_#000]"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-lg border-2 border-black bg-lime-400 px-2 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                    Executive Summary
                  </span>
                </div>
                <p
                  className={`text-sm sm:text-base font-bold leading-relaxed ${
                    isDark ? "text-neutral-200" : "text-neutral-900"
                  }`}
                >
                  {report.summary}
                </p>
              </div>
            )}

            {/* ================= RIASEC PROFILE SECTION ================= */}
            <div
              className={`rounded-3xl p-6 sm:p-8 transition-all print:border-black print:shadow-none ${
                isDark
                  ? "border-2 border-neutral-700 bg-[#121212] shadow-[6px_6px_0px_#000]"
                  : "border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
              }`}
            >
              <div className="mb-6">
                <span className="rounded-lg border-2 border-black bg-sky-300 px-2 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                  Interest Architecture
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight">
                  Your RIASEC Interest Profile
                </h2>
                <p className={`mt-1 text-xs font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Normalized 0-100% scores across the six Holland occupational interest domains.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(RIASEC_META).map(([code, meta]) => {
                  const score = Math.round(norm?.interests[code] || 0);
                  return (
                    <div
                      key={code}
                      className={`rounded-2xl border-2 border-black p-4 transition-all ${
                        isDark ? "bg-[#181818]" : "bg-neutral-50 shadow-[3px_3px_0px_#000]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`rounded-lg border border-black px-2 py-0.5 text-xs font-black text-black ${meta.color}`}>
                          {code} - {meta.name}
                        </span>
                        <span className="text-base font-black">{score}%</span>
                      </div>
                      <div className="h-2.5 rounded-full border border-black bg-neutral-200 overflow-hidden">
                        <div
                          className={`h-full ${meta.color}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className={`mt-2 text-[11px] font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                        {meta.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= TOP 6 CAREER MATCHES ================= */}
            <div
              className={`rounded-3xl p-6 sm:p-8 transition-all print:border-black print:shadow-none ${
                isDark
                  ? "border-2 border-neutral-700 bg-[#121212] shadow-[6px_6px_0px_#000]"
                  : "border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
              }`}
            >
              <div className="mb-6">
                <span className="rounded-lg border-2 border-black bg-lime-400 px-2 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                  Deterministic Fit Scores
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight">
                  Top Recommended Career Pathways
                </h2>
                <p className={`mt-1 text-xs font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Ranked by our multidimensional cosine & Euclidean match engine with evidence tracking.
                </p>
              </div>

              <div className="space-y-6">
                {matches.map((item, idx) => {
                  const career = item.career;
                  const explanation = report?.careerExplanations?.find(
                    (e) => e.careerId === career.id
                  );

                  return (
                    <div
                      key={career.id}
                      className={`rounded-2xl border-2.5 border-black p-5 sm:p-6 transition-all ${
                        isDark ? "bg-[#181818] shadow-[4px_4px_0px_#000]" : "bg-white shadow-[4px_4px_0px_#000]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-yellow-300 text-sm font-black text-black">
                            #{idx + 1}
                          </span>
                          <div>
                            <h3 className="text-lg sm:text-xl font-black tracking-tight">
                              {career.name}
                            </h3>
                            <span className={`text-xs font-bold ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                              {career.industry}
                            </span>
                          </div>
                        </div>

                        {/* Fit Score Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-neutral-400">
                            Fit Index:
                          </span>
                          <span className="rounded-xl border-2 border-black bg-lime-400 px-3 py-1 text-sm font-black text-black shadow-[2px_2px_0px_#000]">
                            {item.fitIndex}/100
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-4 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                        {career.description}
                      </p>

                      {/* AI-Generated Personalized Rationales */}
                      {explanation && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className={`rounded-xl border-2 border-black p-3 ${isDark ? "bg-[#1e231e]" : "bg-emerald-50"}`}>
                            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-600 mb-1">
                              <span>✓</span> Why It Fits You
                            </div>
                            <p className="text-xs font-bold leading-relaxed">
                              {explanation.why}
                            </p>
                          </div>

                          <div className={`rounded-xl border-2 border-black p-3 ${isDark ? "bg-[#251e1e]" : "bg-rose-50"}`}>
                            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-rose-600 mb-1">
                              <span>⚠️</span> What To Watch Out For
                            </div>
                            <p className="text-xs font-bold leading-relaxed">
                              {explanation.watchOut}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Pathways & Degrees (Hidden for early school segments) */}
                      {!isEarlySegment && career.entryPathways && career.entryPathways.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-neutral-700">
                          <span className="text-[11px] font-black uppercase text-neutral-400">
                            Typical Pathways:
                          </span>
                          {career.entryPathways.map((path, pIdx) => (
                            <span
                              key={pIdx}
                              className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                                isDark
                                  ? "border-neutral-700 bg-neutral-900 text-neutral-300"
                                  : "border-neutral-300 bg-neutral-100 text-neutral-800"
                              }`}
                            >
                              {path}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= STRENGTHS & WORKSTYLE ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div
                className={`rounded-3xl p-6 sm:p-8 transition-all print:border-black print:shadow-none ${
                  isDark
                    ? "border-2 border-neutral-700 bg-[#121212] shadow-[6px_6px_0px_#000]"
                    : "border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
                }`}
              >
                <span className="rounded-lg border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                  Demonstrated Strengths
                </span>
                <h3 className="mt-3 text-lg sm:text-xl font-black tracking-tight mb-4">
                  Core Superpowers
                </h3>
                <div className="space-y-2.5">
                  {(report?.strengths || []).map((strength, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-start gap-2.5 rounded-xl border border-black bg-neutral-50 p-3 text-black"
                    >
                      <span className="text-base">⚡</span>
                      <span className="text-xs font-bold leading-relaxed">
                        {strength}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Style & Values */}
              <div
                className={`rounded-3xl p-6 sm:p-8 transition-all print:border-black print:shadow-none ${
                  isDark
                    ? "border-2 border-neutral-700 bg-[#121212] shadow-[6px_6px_0px_#000]"
                    : "border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
                }`}
              >
                <span className="rounded-lg border-2 border-black bg-pink-300 px-2 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                  Working Style
                </span>
                <h3 className="mt-3 text-lg sm:text-xl font-black tracking-tight mb-4">
                  Ideal Environment & Values
                </h3>

                <div className="space-y-4">
                  {report?.workStyle && (
                    <div className="rounded-xl border border-black bg-neutral-50 p-3.5 text-black">
                      <div className="text-[11px] font-black uppercase text-neutral-500 mb-1">
                        Collaboration & Autonomy
                      </div>
                      <p className="text-xs font-bold leading-relaxed">
                        {report.workStyle}
                      </p>
                    </div>
                  )}

                  {report?.values && (
                    <div className="rounded-xl border border-black bg-neutral-50 p-3.5 text-black">
                      <div className="text-[11px] font-black uppercase text-neutral-500 mb-1">
                        Core Values & Anchor
                      </div>
                      <p className="text-xs font-bold leading-relaxed">
                        {report.values}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= ACTIONABLE NEXT STEPS ================= */}
            {report?.nextSteps && report.nextSteps.length > 0 && (
              <div
                className={`rounded-3xl p-6 sm:p-8 transition-all print:border-black print:shadow-none ${
                  isDark
                    ? "border-2 border-neutral-700 bg-[#141414] shadow-[6px_6px_0px_#000]"
                    : "border-3 border-black bg-purple-50 shadow-[6px_6px_0px_#000]"
                }`}
              >
                <div className="mb-4">
                  <span className="rounded-lg border-2 border-black bg-purple-300 px-2 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                    Actionable Roadmap
                  </span>
                  <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight">
                    Next Exploratory Milestones
                  </h2>
                  <p className={`mt-1 text-xs font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Suggested low-stakes experiments and questions to ask mentors next.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.nextSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border-2 border-black bg-white p-4 shadow-[2px_2px_0px_#000] text-black"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-black bg-lime-400 text-xs font-black">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Academic Disclaimer */}
            <div
              className={`rounded-2xl border p-5 text-center text-xs font-bold ${
                isDark
                  ? "border-neutral-800 bg-neutral-950 text-neutral-400"
                  : "border-neutral-300 bg-neutral-100 text-neutral-600"
              }`}
            >
              <p
                className={`font-black uppercase tracking-wider mb-1 ${
                  isDark ? "text-neutral-300" : "text-black"
                }`}
              >
                ⚠️ Academic & Exploratory Disclaimer
              </p>
              <p className="max-w-2xl mx-auto leading-relaxed">
                This assessment is <strong>exploratory, RIASEC-informed, and not a validated psychometric test</strong>. Never treat any single recommendation as an absolute imperative. Results are engineered to stimulate self-reflection and prompt real-world conversations with mentors, professors, and industry professionals.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-center font-black">
          <div className="animate-spin text-3xl mb-3">🧭</div>
          <p>Loading your career report...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
