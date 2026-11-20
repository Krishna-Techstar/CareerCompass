"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "../../components/ThemeContext.jsx";
import { useAuth } from "../../components/AuthContext.jsx";
import { createProfile } from "../../lib/profile.js";

const SEGMENT_CARDS = [
  {
    key: "class_6_8",
    title: "Class 6–8",
    stage: "Middle School",
    emoji: "🎒",
    desc: "Everyday hobbies, curiosity, and fun activities.",
    bgLight: "bg-amber-100",
    borderLight: "border-amber-400",
  },
  {
    key: "class_9_10",
    title: "Class 9–10",
    stage: "Secondary School",
    emoji: "📐",
    desc: "School subjects & stream directions (Science, Commerce, Arts).",
    bgLight: "bg-sky-100",
    borderLight: "border-sky-400",
  },
  {
    key: "class_11_12",
    title: "Class 11–12",
    stage: "Senior Secondary",
    emoji: "🎯",
    desc: "Entrance exams, degrees, and pathways beyond engineering/medicine.",
    bgLight: "bg-emerald-100",
    borderLight: "border-emerald-400",
  },
  {
    key: "undergrad",
    title: "Undergraduate",
    stage: "College / University",
    emoji: "🎓",
    desc: "Degrees, specialisations, internships, and real-world skill gaps.",
    bgLight: "bg-purple-100",
    borderLight: "border-purple-400",
  },
  {
    key: "postgrad",
    title: "Postgraduate",
    stage: "Masters / Early Career",
    emoji: "💼",
    desc: "Career switches, research vs industry, and leadership balance.",
    bgLight: "bg-rose-100",
    borderLight: "border-rose-400",
  },
];

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("undergrad");
  const [streamOrCourse, setStreamOrCourse] = useState("");
  const [parentalConsent, setParentalConsent] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill name from auth user or localStorage if present
  useEffect(() => {
    if (user?.profile?.name) {
      setName(user.profile.name);
    }
    if (user?.profile?.age) {
      setAge(String(user.profile.age));
    }
    if (user?.profile?.segment) {
      setSelectedSegment(user.profile.segment);
    }
    if (user?.profile?.stream || user?.profile?.streamOrCourse) {
      setStreamOrCourse(user.profile.stream || user.profile.streamOrCourse);
    }

    // Also check localStorage
    try {
      const savedMeta = localStorage.getItem("career_compass_onboarding");
      if (savedMeta) {
        const meta = JSON.parse(savedMeta);
        if (meta.name && !name) setName(meta.name);
        if (meta.age && !age) setAge(String(meta.age));
        if (meta.segment) setSelectedSegment(meta.segment);
        if (meta.streamOrCourse) setStreamOrCourse(meta.streamOrCourse);
        if (meta.parentalConsent) setParentalConsent(Boolean(meta.parentalConsent));
      }
    } catch (e) {}
  }, [user]);

  // Determine if under 18:
  // Either age input is < 18, or middle/secondary segments selected
  const numericAge = parseInt(age, 10);
  const isUnder18 =
    (Boolean(age) && !isNaN(numericAge) && numericAge < 18) ||
    selectedSegment === "class_6_8" ||
    selectedSegment === "class_9_10";

  // Is segment 11-12 or above (eligible for stream/course optional field)?
  const isSeniorOrHigher =
    selectedSegment === "class_11_12" ||
    selectedSegment === "undergrad" ||
    selectedSegment === "postgrad";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!selectedSegment) {
      setError("Please select the stage that best describes you.");
      return;
    }

    if (isUnder18 && !parentalConsent) {
      setError("Please confirm parental/guardian consent before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const onboardingData = {
        name: name.trim(),
        age: numericAge || null,
        segment: selectedSegment,
        streamOrCourse: streamOrCourse.trim(),
        parentalConsent: isUnder18 ? parentalConsent : true,
      };

      // 1. Save locally to localStorage
      localStorage.setItem("career_compass_onboarding", JSON.stringify(onboardingData));

      // 2. Initialize fresh profile for this segment
      const newProfile = createProfile(selectedSegment, {
        name: name.trim(),
        age: numericAge || null,
        streamOrCourse: streamOrCourse.trim(),
        parentalConsent: isUnder18 ? parentalConsent : true,
      });

      localStorage.setItem("career_compass_profile", JSON.stringify(newProfile));

      // 3. If user is logged in, sync with database
      if (user) {
        try {
          await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              age: numericAge || null,
              segment: selectedSegment,
              stream: streamOrCourse.trim(),
              streamOrCourse: streamOrCourse.trim(),
              parentalConsent: isUnder18 ? parentalConsent : true,
            }),
          });
        } catch (apiErr) {
          console.warn("Could not sync onboarding to remote profile:", apiErr);
        }
      }

      // 4. Redirect to assessment
      const returnTo = searchParams.get("returnTo") || "/assess";
      router.push(returnTo);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={`min-h-screen py-8 px-4 sm:px-6 transition-colors duration-200 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div className="mx-auto max-w-xl">
        {/* Top Header Card */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-lime-400 px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-lime-300 transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            ← Home
          </Link>
          <span className="rounded-xl border-2 border-black bg-pink-300 px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
            ⚡ Step 1: Personalize Discovery
          </span>
        </div>

        {/* Main Onboarding Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 transition-all ${
            isDark
              ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
              : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
          }`}
        >
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Tell us a bit about yourself
            </h1>
            <p className={`mt-1 text-xs sm:text-sm font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
              We tailor question vocabulary, scenarios, and entrance pathways directly to your educational level.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border-2 border-black bg-rose-400 p-3.5 text-black shadow-[3px_3px_0px_#000] flex items-center gap-2 text-xs font-black">
              <span className="text-base" aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name & Age (2-col or stacked) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-brutal w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
                  Age <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="45"
                  placeholder="e.g. 17"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input-brutal w-full text-sm"
                />
              </div>
            </div>

            {/* 5-Card Choice of Which Best Describes You */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black uppercase tracking-wider">
                  Which best describes you? <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-bold text-neutral-400">
                  Select 1
                </span>
              </div>

              <div className="space-y-2.5">
                {SEGMENT_CARDS.map((card) => {
                  const isSelected = selectedSegment === card.key;
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setSelectedSegment(card.key)}
                      className={`w-full text-left rounded-2xl border-2 p-3.5 transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? isDark
                            ? "border-lime-400 bg-neutral-900 shadow-[4px_4px_0px_#a3e635]"
                            : "border-black bg-lime-300 shadow-[4px_4px_0px_#000]"
                          : isDark
                          ? "border-neutral-800 bg-[#181818] hover:border-neutral-700 hover:bg-neutral-800"
                          : "border-black bg-neutral-50 hover:bg-neutral-100 shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-black text-xl shadow-[2px_2px_0px_#000] ${
                          isSelected ? "bg-white text-black" : "bg-neutral-200 text-black"
                        }`}
                      >
                        {card.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${isSelected && !isDark ? "text-black" : ""}`}>
                            {card.title}
                          </span>
                          <span
                            className={`rounded-md border border-black px-1.5 py-0.2 text-[10px] font-black uppercase ${
                              isDark ? "bg-neutral-800 text-neutral-300" : "bg-white text-neutral-700"
                            }`}
                          >
                            {card.stage}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 line-clamp-1 font-bold ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}>
                          {card.desc}
                        </p>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border-2 border-black flex items-center justify-center ${
                          isSelected ? "bg-lime-400 text-black font-black text-xs" : "bg-transparent"
                        }`}
                      >
                        {isSelected && "✓"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Stream / Course for 11-12+ */}
            {isSeniorOrHigher && (
              <div
                className={`rounded-2xl border-2 p-4 animate-in fade-in transition-all ${
                  isDark ? "border-neutral-800 bg-neutral-900" : "border-black bg-purple-50 shadow-[3px_3px_0px_#000]"
                }`}
              >
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
                  {selectedSegment === "class_11_12"
                    ? "Current Stream or Planned Stream (Optional)"
                    : selectedSegment === "undergrad"
                    ? "Your Major, Degree, or Course (Optional)"
                    : "Specialisation or Current Role (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={
                    selectedSegment === "class_11_12"
                      ? "e.g. Science (PCM), Science (PCB), Commerce with Math, Arts"
                      : selectedSegment === "undergrad"
                      ? "e.g. B.Tech Computer Science, B.Com, B.Sc Biotech, B.A."
                      : "e.g. MBA, M.Tech, Software Engineer, Consultant"
                  }
                  value={streamOrCourse}
                  onChange={(e) => setStreamOrCourse(e.target.value)}
                  className="input-brutal w-full text-sm"
                />
                <p className={`mt-1.5 text-[11px] font-bold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  We'll use this to calibrate specific entrance exams and postgraduate pathways.
                </p>
              </div>
            )}

            {/* Under 18 Parental Consent & Privacy Box */}
            {isUnder18 && (
              <div
                className={`rounded-2xl border-2 p-4 transition-all ${
                  isDark
                    ? "border-amber-500/60 bg-amber-950/30 text-amber-100"
                    : "border-black bg-amber-100 text-black shadow-[3px_3px_0px_#000]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="parentalConsentCheck"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-2 border-black accent-lime-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="parentalConsentCheck"
                      className="text-xs sm:text-sm font-black cursor-pointer select-none leading-snug block"
                    >
                      My parent or guardian agrees to my taking this exploratory session.
                    </label>

                    {/* Plain-language Privacy Note */}
                    <p
                      className={`mt-2 text-[11px] sm:text-xs font-bold leading-relaxed border-t pt-2 ${
                        isDark ? "border-amber-700/50 text-amber-200/90" : "border-black/30 text-neutral-800"
                      }`}
                    >
                      🔒 <strong>Privacy note:</strong> We collect no phone numbers, passwords, tracking cookies, or public records. Your responses are exploratory, RIASEC-informed, and used solely to recommend educational and career directions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-2xl border-2.5 border-black py-4 text-center text-sm sm:text-base font-black tracking-wide text-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isSubmitting ? "bg-neutral-400 cursor-wait" : "bg-lime-400 hover:bg-lime-300 shadow-[4px_4px_0px_#000]"
                }`}
              >
                {isSubmitting ? "Preparing Your Session..." : "Continue to Assessment →"}
              </button>

              <p className="mt-3 text-center text-[11px] font-bold text-neutral-400">
                ⚡ 5 Sections • 20 Questions • ~6–8 mins • Zero Ad Tracking
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="rounded-3xl border-2 border-neutral-700 bg-neutral-900 p-8 text-center max-w-sm">
            <div className="animate-spin text-3xl mb-3">🧭</div>
            <p className="text-sm font-black">Loading onboarding...</p>
          </div>
        </main>
      }
    >
      <OnboardingForm />
    </Suspense>
  );
}
