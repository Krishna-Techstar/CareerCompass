"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createProfile, normalizedProfile } from "../../lib/profile.js";
import { useTheme } from "../../components/ThemeContext.jsx";
import { createClient } from "../../lib/supabase/client.js";
import { DEMO_PROFILE } from "../../lib/demoData.js";
import {
  SECTION_KEYS,
  SECTION_TITLES,
  SECTION_BUDGETS,
  TOTAL_QUESTION_BUDGET,
  SEGMENT_KEYS,
  SEGMENT_LABELS,
} from "../../lib/types.js";

const RIASEC_CONFIG = [
  { key: "R", name: "Realistic", label: "Practical & Physical", color: "bg-sky-400" },
  { key: "I", name: "Investigative", label: "Analytical & Logic", color: "bg-lime-400" },
  { key: "A", name: "Artistic", label: "Creative & Design", color: "bg-pink-300" },
  { key: "S", name: "Social", label: "Empathetic & Helping", color: "bg-purple-300" },
  { key: "E", name: "Enterprising", label: "Leadership & Growth", color: "bg-orange-300" },
  { key: "C", name: "Conventional", label: "Structured & Systems", color: "bg-teal-300" },
];

const SECTIONS_LIST = [
  { id: "about_you", title: "About You", icon: "👤", budget: 3 },
  { id: "likes_dislikes", title: "Likes & Dislikes", icon: "❤️", budget: 5 },
  { id: "work_style", title: "Work Style", icon: "⚡", budget: 4 },
  { id: "best_at", title: "What You're Best At", icon: "🎯", budget: 5 },
  { id: "values", title: "What Matters", icon: "🌟", budget: 3 },
];

const SEGMENT_OPTIONS = [
  { key: "class_6_8", label: "Class 6 - 8", sub: "Middle School", icon: "🎒" },
  { key: "class_9_10", label: "Class 9 - 10", sub: "Secondary School", icon: "🏫" },
  { key: "class_11_12", label: "Class 11 - 12", sub: "Senior Secondary", icon: "📚" },
  { key: "undergrad", label: "Undergraduate", sub: "College / Degree", icon: "🎓" },
  { key: "postgrad", label: "Postgrad / Pro", sub: "Masters & Early Career", icon: "💼" },
];

function AssessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryAssessmentId = searchParams.get("assessmentId");
  const isDemo = searchParams.get("demo") === "1";

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [assessmentId, setAssessmentId] = useState(queryAssessmentId || null);
  const [profile, setProfile] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [probeType, setProbeType] = useState("universal");
  const [reason, setReason] = useState("");
  const [emergingInterest, setEmergingInterest] = useState("");
  const [sectionData, setSectionData] = useState({
    currentSection: "about_you",
    sectionTitle: "About You",
    sectionIndex: 1,
    totalSections: 5,
    answeredInSection: 0,
    sectionBudget: 3,
    totalAnswered: 0,
    totalBudget: 20,
    isFinished: false,
  });
  const [sectionSummaryBanner, setSectionSummaryBanner] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [showSegmentPicker, setShowSegmentPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [aiPath, setAiPath] = useState("fallback");
  const [, startTransition] = useTransition();

  // Load profile from Supabase or localStorage on mount
  useEffect(() => {
    let isMounted = true;

    async function initAssessment() {
      // Fast-path: Pitch Demo Mode (?demo=1) with 18 questions pre-filled
      if (isDemo) {
        const demoPreProfile = {
          ...DEMO_PROFILE,
          answeredIds: DEMO_PROFILE.answeredIds.slice(0, 18),
          history: DEMO_PROFILE.history.slice(0, 18),
        };
        setProfile(demoPreProfile);
        setSelectedSegment(demoPreProfile.segment);
        setAssessmentId("demo-live-session");
        fetchNextQuestion(demoPreProfile, null, demoPreProfile.segment, "demo-live-session");
        return;
      }

      const supabase = createClient();
      let activeAid = queryAssessmentId;

      // 1. If an assessmentId was specified in the URL, load from Supabase
      if (queryAssessmentId) {
        try {
          const { data: row } = await supabase
            .from("assessments")
            .select("*")
            .eq("id", queryAssessmentId)
            .single();

          if (row && row.profile && isMounted) {
            setAssessmentId(row.id);
            setProfile(row.profile);
            setSelectedSegment(row.segment);
            try {
              localStorage.setItem("career_compass_profile", JSON.stringify(row.profile));
            } catch (e) {}
            fetchNextQuestion(row.profile, null, row.segment, row.id);
            return;
          }
        } catch (e) {
          console.warn("[Assess] Could not load specified assessment:", e);
        }
      }

      // 2. Otherwise load profile from localStorage
      let savedProfile = null;
      try {
        const raw = localStorage.getItem("career_compass_profile");
        if (raw) savedProfile = JSON.parse(raw);
      } catch (e) {
        console.warn("Could not read profile from localStorage:", e);
      }

      if (!savedProfile || !savedProfile.segment) {
        // Forward to onboarding screen to pick segment, name & consent
        router.push("/onboarding?returnTo=/assess");
        return;
      }

      if (!isMounted) return;
      setProfile(savedProfile);
      if (savedProfile.segment) {
        setSelectedSegment(savedProfile.segment);
      }

      // 3. If user is logged in and no assessment row exists, create an in_progress record
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newRow } = await supabase
            .from("assessments")
            .insert({
              user_id: user.id,
              segment: savedProfile.segment || "undergrad",
              answers: savedProfile.history || [],
              profile: savedProfile,
              status: "in_progress",
            })
            .select()
            .single();

          if (newRow && isMounted) {
            activeAid = newRow.id;
            setAssessmentId(newRow.id);
          }
        }
      } catch (err) {
        console.warn("[Assess] Could not create in_progress row in Supabase:", err);
      }

      fetchNextQuestion(savedProfile, null, savedProfile.segment, activeAid);
    }

    initAssessment();

    return () => {
      isMounted = false;
    };
  }, [queryAssessmentId, router]);

  function handleSegmentSelect(segKey) {
    setSelectedSegment(segKey);
    setShowSegmentPicker(false);

    let baseProfile = profile;
    if (!baseProfile) {
      baseProfile = createProfile(segKey);
    } else {
      baseProfile = { ...baseProfile, segment: segKey };
    }

    setProfile(baseProfile);
    try {
      localStorage.setItem("career_compass_profile", JSON.stringify(baseProfile));
    } catch (e) {}

    fetchNextQuestion(baseProfile, null, segKey, assessmentId);
  }

  async function fetchNextQuestion(profilePayload, lastAnswerPayload, segmentOverride, currentAssessmentId) {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedOptionId(null);

    const seg = segmentOverride || profilePayload?.segment || selectedSegment || "undergrad";
    const aid = currentAssessmentId || assessmentId;

    try {
      const res = await fetch("/api/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profilePayload,
          lastAnswer: lastAnswerPayload,
          segment: seg,
        }),
      });

      if (!res.ok) {
        throw new Error(`API responded with ${res.status}`);
      }

      const data = await res.json();

      // If assessment is finished
      if (data.done) {
        if (data.profile) {
          localStorage.setItem("career_compass_profile", JSON.stringify(data.profile));
        }

        // Save progress to Supabase
        if (aid) {
          try {
            const supabase = createClient();
            await supabase
              .from("assessments")
              .update({
                answers: data.profile?.history || [],
                profile: data.profile,
                segment: data.profile?.segment || seg,
                status: "in_progress",
                updated_at: new Date().toISOString(),
              })
              .eq("id", aid);
          } catch (e) {
            console.warn("[Assess] Could not update assessment on completion:", e);
          }
        }

        startTransition(() => {
          router.push(isDemo ? "/results?demo=1" : `/results${aid ? `?assessmentId=${aid}` : ""}`);
        });
        return;
      }

      // Check for section completion summary
      if (data.sectionSummary) {
        setSectionSummaryBanner(data.sectionSummary);
      }

      // Update state and localStorage
      if (data.profile) {
        setProfile(data.profile);
        localStorage.setItem("career_compass_profile", JSON.stringify(data.profile));

        // Persist to Supabase after every answer
        if (aid) {
          try {
            const supabase = createClient();
            await supabase
              .from("assessments")
              .update({
                answers: data.profile?.history || [],
                profile: data.profile,
                segment: data.profile?.segment || seg,
                status: "in_progress",
                updated_at: new Date().toISOString(),
              })
              .eq("id", aid);
          } catch (e) {
            console.warn("[Assess] Progress update to Supabase failed:", e);
          }
        } else {
          // If user is authenticated but aid wasn't created yet, create it now
          try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: newRow } = await supabase
                .from("assessments")
                .insert({
                  user_id: user.id,
                  segment: data.profile?.segment || seg,
                  answers: data.profile?.history || [],
                  profile: data.profile,
                  status: "in_progress",
                })
                .select()
                .single();

              if (newRow) {
                setAssessmentId(newRow.id);
              }
            }
          } catch (e) {
            console.warn("[Assess] Insert new in_progress row failed:", e);
          }
        }
      }

      if (data.question) setCurrentQuestion(data.question);
      if (data.probeType) setProbeType(data.probeType);
      if (data.reason) setReason(data.reason);
      if (data.section) setSectionData(data.section);
      if (data.emergingInterest) setEmergingInterest(data.emergingInterest);
      if (data.path) setAiPath(data.path);
    } catch (err) {
      console.error("Error in next-question cycle:", err);
      setErrorMessage("Connection timed out. Click below to retry without losing progress.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleOptionSelect(optionId) {
    if (isLoading || selectedOptionId) return;
    setSelectedOptionId(optionId);

    const answerPayload = {
      questionId: currentQuestion.id,
      optionId,
      probeType,
      reason,
    };

    setTimeout(() => {
      fetchNextQuestion(profile, answerPayload, null, assessmentId);
    }, 280);
  }

  function handleRestart() {
    if (confirm("Reset current assessment and start a new discovery session?")) {
      try {
        localStorage.removeItem("career_compass_profile");
      } catch (e) {}
      setProfile(null);
      setAssessmentId(null);
      setSelectedSegment(null);
      setCurrentQuestion(null);
      setSectionSummaryBanner(null);
      setShowSegmentPicker(true);
    }
  }

  // Calculate live normalized profile scores
  const norm = profile ? normalizedProfile(profile) : null;

  // Compute top 3 emerging interests
  const sortedInterests = norm
    ? [...RIASEC_CONFIG]
        .map((dim) => ({ ...dim, score: norm.interests[dim.key] || 0 }))
        .sort((a, b) => b.score - a.score)
    : [];

  const top3 = sortedInterests.slice(0, 3).filter((item) => item.score > 0);

  // Probe badge styling
  const probeBadgeStyle = {
    deep: "bg-lime-400 text-black border-2 border-black",
    cross: "bg-purple-300 text-black border-2 border-black",
    challenge: "bg-orange-300 text-black border-2 border-black",
    universal: "bg-sky-300 text-black border-2 border-black",
  }[probeType] || "bg-lime-400 text-black border-2 border-black";

  // Segment Selection Screen
  if (showSegmentPicker && (!profile || profile.answeredIds.length === 0)) {
    return (
      <main
        className={`min-h-screen py-12 px-4 transition-colors duration-200 ${
          isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
        }`}
      >
        <div className="mx-auto max-w-2xl">
          <div
            className={`rounded-3xl p-6 sm:p-10 transition-all ${
              isDark
                ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
                : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
            }`}
          >
            <div className="mb-6 text-center">
              <span className="rounded-xl border-2 border-black bg-lime-400 px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                Step 0: Audience Calibration
              </span>
              <h1 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight">
                Select Your Educational Level
              </h1>
              <p
                className={`mt-2 text-xs sm:text-sm font-bold ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                Questions adapt automatically to your vocabulary, syllabus, and career decisions.
              </p>
            </div>

            <div className="space-y-3">
              {SEGMENT_OPTIONS.map((seg) => (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => handleSegmentSelect(seg.key)}
                  className={`w-full flex items-center justify-between rounded-2xl border-2.5 border-black p-4 text-left transition-all hover:-translate-y-0.5 active:translate-y-0.5 ${
                    isDark
                      ? "bg-neutral-900 hover:bg-neutral-800 text-white shadow-[4px_4px_0px_#000]"
                      : "bg-white hover:bg-neutral-50 text-black shadow-[4px_4px_0px_#000]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">{seg.icon}</span>
                    <div>
                      <div className="text-sm font-black">{seg.label}</div>
                      <div className={`text-xs font-bold ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                        {seg.sub}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-lime-400">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const answeredCount = profile ? profile.answeredIds.length : 0;
  const progressPct = Math.min(100, Math.round((answeredCount / 20) * 100));

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-6 transition-colors duration-200 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div className="mx-auto max-w-3xl">
        {/* ================= PITCH DEMO BANNER (?demo=1) ================= */}
        {isDemo && (
          <div className="mb-6 rounded-2xl border-2.5 border-black bg-yellow-300 p-4 text-black shadow-[4px_4px_0px_#000] animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    Pitch Demo Mode Active (?demo=1)
                  </span>
                  <span className="text-xs font-bold text-neutral-800">
                    18 questions pre-filled. Answer the final 2 questions live to demonstrate the AI interview completion!
                  </span>
                </div>
              </div>
              <Link
                href="/results?demo=1"
                className="inline-flex items-center rounded-xl border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-neutral-50"
              >
                Skip to Report →
              </Link>
            </div>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`rounded-xl border-2 px-3 py-1 text-xs font-black uppercase transition-all ${
                isDark
                  ? "border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white"
                  : "border-black bg-white text-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              ← Dashboard
            </Link>
            <span
              className={`rounded-xl border border-black px-2.5 py-1 text-[11px] font-black uppercase ${
                isDark ? "bg-neutral-800 text-neutral-300" : "bg-purple-200 text-black"
              }`}
            >
              🎓 {SEGMENT_LABELS[selectedSegment] || selectedSegment || "Undergraduate"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSegmentPicker(true)}
              className={`rounded-xl border px-2.5 py-1 text-[11px] font-black uppercase transition-colors ${
                isDark
                  ? "border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white"
                  : "border-neutral-400 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Change Segment
            </button>
            <button
              onClick={handleRestart}
              className={`rounded-xl border px-2.5 py-1 text-[11px] font-black uppercase transition-colors ${
                isDark
                  ? "border-neutral-700 text-neutral-400 hover:text-rose-400"
                  : "border-neutral-400 text-neutral-500 hover:text-rose-600"
              }`}
            >
              Restart
            </button>
          </div>
        </div>

        {/* 5-Section Stepper Header */}
        <div
          className={`mb-6 rounded-2xl p-4 transition-all ${
            isDark
              ? "border-2 border-neutral-700 bg-[#141414] shadow-[4px_4px_0px_#000]"
              : "border-2.5 border-black bg-white shadow-[4px_4px_0px_#000]"
          }`}
        >
          <div className="flex items-center justify-between mb-3 text-xs font-black uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-black bg-lime-400 px-2 py-0.5 text-black">
                Section {sectionData.sectionIndex} of {sectionData.totalSections}
              </span>
              <span className={isDark ? "text-white" : "text-black"}>
                {sectionData.sectionTitle}
              </span>
            </div>
            <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
              Question {sectionData.totalAnswered + 1} of {sectionData.totalBudget}
            </span>
          </div>

          {/* Stepper bar with 5 sections */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {SECTIONS_LIST.map((sec, idx) => {
              const currentIdx = sectionData.sectionIndex - 1;
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              let stepColor = isDark ? "bg-neutral-800 text-neutral-500" : "bg-neutral-200 text-neutral-500";
              if (isPast) stepColor = "bg-emerald-400 text-black";
              if (isCurrent) stepColor = "bg-lime-400 text-black";

              return (
                <div key={sec.id} className="flex flex-col gap-1">
                  <div
                    className={`h-2 sm:h-2.5 rounded-full border border-black transition-all ${
                      isPast
                        ? "bg-emerald-400"
                        : isCurrent
                        ? "bg-lime-400 ring-2 ring-lime-400 ring-offset-1"
                        : isDark
                        ? "bg-neutral-800"
                        : "bg-neutral-200"
                    }`}
                  />
                  <div className="flex items-center justify-between text-[10px] font-black uppercase truncate">
                    <span className="hidden sm:inline truncate">{sec.title}</span>
                    <span className="sm:hidden">{sec.icon}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section Progress details */}
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
            <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
              Section Progress: {sectionData.answeredInSection} / {sectionData.sectionBudget} questions
            </span>
            <span className="text-lime-500 font-black">
              Overall: {progressPct}%
            </span>
          </div>
        </div>

        {/* Section Completion Summary Banner */}
        {sectionSummaryBanner && (
          <div
            className={`mb-6 rounded-2xl border-2.5 border-black p-4 animate-in fade-in transition-all ${
              isDark
                ? "bg-neutral-900 text-white shadow-[4px_4px_0px_#000]"
                : "bg-yellow-100 text-black shadow-[4px_4px_0px_#000]"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <div className="text-xs font-black uppercase tracking-wider text-lime-400">
                  Section Insight
                </div>
                <p className="mt-1 text-xs sm:text-sm font-bold leading-relaxed">
                  {sectionSummaryBanner}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSectionSummaryBanner(null)}
                className="text-xs font-black opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Question Card */}
        {isLoading && !currentQuestion ? (
          <div
            className={`rounded-3xl p-12 text-center transition-all ${
              isDark
                ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
                : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
            }`}
          >
            <div className="animate-spin text-4xl mb-4">🧭</div>
            <h2 className="text-lg font-black tracking-tight">Calibrating Next Question...</h2>
            <p className={`mt-1 text-xs font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              Adapting to your previous response.
            </p>
          </div>
        ) : errorMessage ? (
          <div
            className={`rounded-3xl p-8 text-center transition-all ${
              isDark
                ? "border-2 border-rose-800 bg-[#181212] shadow-[8px_8px_0px_#000]"
                : "border-3 border-rose-600 bg-rose-50 shadow-[8px_8px_0px_#000]"
            }`}
          >
            <span className="text-3xl">⚠️</span>
            <h2 className="mt-2 text-lg font-black text-rose-500">Notice</h2>
            <p className="mt-1 text-xs font-bold">{errorMessage}</p>
            <button
              onClick={() => fetchNextQuestion(profile, null, selectedSegment, assessmentId)}
              className="mt-4 rounded-xl border-2 border-black bg-lime-400 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:bg-lime-300"
            >
              Continue Assessment
            </button>
          </div>
        ) : currentQuestion ? (
          <div
            className={`rounded-3xl p-6 sm:p-8 transition-all ${
              isDark
                ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
                : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
            }`}
          >
            {/* Question Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span
                className={`rounded-xl px-2.5 py-1 text-xs font-black uppercase tracking-wider ${probeBadgeStyle}`}
              >
                {probeType === "deep" && "🔍 Deep Probe"}
                {probeType === "cross" && "🔀 Cross-Check"}
                {probeType === "challenge" && "⚡ Strength Challenge"}
                {probeType === "universal" && "🧭 Universal"}
              </span>

              {reason && (
                <span
                  className={`text-[11px] font-bold line-clamp-1 max-w-xs ${
                    isDark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                  title={reason}
                >
                  {reason}
                </span>
              )}
            </div>

            {/* Question Prompt */}
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug mb-6">
              {currentQuestion.prompt}
            </h2>

            {/* Options Grid */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={isLoading || Boolean(selectedOptionId)}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`w-full flex items-center justify-between rounded-2xl border-2.5 border-black p-4 text-left font-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                      isSelected
                        ? "bg-lime-400 text-black shadow-[2px_2px_0px_#000] scale-[0.99]"
                        : isDark
                        ? "bg-[#1a1a1a] text-white hover:bg-[#222222] shadow-[4px_4px_0px_#000]"
                        : "bg-white text-black hover:bg-neutral-50 shadow-[4px_4px_0px_#000]"
                    }`}
                  >
                    <span className="text-sm sm:text-base leading-snug">
                      {option.text}
                    </span>
                    <span
                      className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-black text-xs font-black ${
                        isSelected
                          ? "bg-black text-white"
                          : isDark
                          ? "bg-neutral-800 text-neutral-400"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {isSelected ? "✓" : "→"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Live Top Interests Preview Bar */}
        {top3.length > 0 && (
          <div
            className={`mt-6 rounded-2xl p-4 transition-all ${
              isDark
                ? "border-2 border-neutral-800 bg-[#111111]"
                : "border-2 border-black bg-neutral-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Emerging Career Inclinations
              </span>
              <span className="text-[11px] font-bold text-neutral-400">
                Live RIASEC Alignment
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {top3.map((dim) => (
                <span
                  key={dim.key}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-black px-2.5 py-1 text-xs font-black text-black ${dim.color}`}
                >
                  <span>{dim.name}</span>
                  <span className="text-[10px] opacity-75">
                    ({Math.round(dim.score)}%)
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assessment UI Footer with AI Engine Badge */}
        <div
          className={`mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs font-bold ${
            isDark ? "border-neutral-800 text-neutral-400" : "border-neutral-300 text-neutral-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>Interview Engine:</span>
            {aiPath === "llm" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-emerald-400 px-3 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
                AI live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-amber-300 px-3 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                <span className="h-2 w-2 rounded-full bg-black" />
                Fallback mode
              </span>
            )}
            <span className="text-[11px] opacity-75">
              ({aiPath === "llm" ? "Gemini LLM dynamic section selection" : "Deterministic section selector active"})
            </span>
          </div>

          <div className="text-[11px] opacity-80">
            5 Sections • 20 Adaptive Questions • Session Autosaved
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-center font-black">
          <div className="animate-spin text-3xl mb-3">🧭</div>
          <p>Loading discovery assessment...</p>
        </div>
      }
    >
      <AssessContent />
    </Suspense>
  );
}
