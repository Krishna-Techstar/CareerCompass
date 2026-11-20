"use client";

import Link from "next/link";
import { useTheme } from "../components/ThemeContext.jsx";

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen px-4 py-8 sm:px-8 sm:py-12 transition-colors duration-200 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div className="mx-auto max-w-5xl">
        {/* ================= HERO SECTION ================= */}
        <section
          aria-labelledby="hero-heading"
          className={`relative mb-14 rounded-3xl p-6 sm:p-12 transition-all ${
            isDark
              ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
              : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
          }`}
        >
          {/* Floating Sticker Badges */}
          <div
            className="absolute -top-4 -right-2 sm:-top-5 sm:right-8 rotate-2"
            aria-hidden="true"
          >
            <span className="inline-block rounded-xl border-2 border-black bg-lime-400 px-3.5 py-1 text-xs sm:text-sm font-black tracking-wider uppercase text-black shadow-[3px_3px_0px_#000]">
              ✨ 0% Multiple Guess
            </span>
          </div>

          <div
            className="absolute -bottom-4 -left-2 sm:-bottom-5 sm:left-8 -rotate-2"
            aria-hidden="true"
          >
            <span className="inline-block rounded-xl border-2 border-black bg-pink-300 px-3.5 py-1 text-xs font-black tracking-wider uppercase text-black shadow-[3px_3px_0px_#000]">
              🇮🇳 Real Indian Realities
            </span>
          </div>

          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-purple-300 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000]">
              <span aria-hidden="true">⚡</span> Adaptive Assessment Engine
            </div>

            <h1
              id="hero-heading"
              className={`text-4xl font-black tracking-tight sm:text-6xl leading-[1.08] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Not a career test. A journey of discovery.
            </h1>

            <p
              className={`mt-5 text-base sm:text-lg font-bold leading-relaxed ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              Most career tests force Indian students through 50 repetitive questions and predictably conclude you should become a software engineer. Career Compass is different: every answer dynamically shapes the next probe, testing cross-domain boundaries and real trade-offs between stability, salary, and genuine curiosity.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/assess"
                className={`inline-flex items-center justify-center rounded-2xl border-2.5 border-black bg-lime-400 px-8 py-4 text-base font-black tracking-wide text-black transition-all active:translate-x-0.5 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
                  isDark
                    ? "shadow-[4px_4px_0px_#fff] hover:bg-lime-300"
                    : "shadow-[4px_4px_0px_#000] hover:bg-lime-300"
                }`}
              >
                Start discovery →
              </Link>
              <Link
                href="/auth?mode=signup"
                className={`inline-flex items-center justify-center rounded-2xl border-2.5 border-black px-6 py-4 text-sm font-black tracking-wide transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isDark
                    ? "bg-neutral-900 text-white hover:bg-neutral-800 shadow-[4px_4px_0px_#fff]"
                    : "bg-white text-black hover:bg-neutral-100 shadow-[4px_4px_0px_#000]"
                }`}
              >
                👤 Sign In / Sign Up
              </Link>
              <div
                className={`text-xs font-bold ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                ⚡ ~6–8 mins • Free Profile Save
              </div>
            </div>

            {/* One-line Privacy Note */}
            <div
              className={`mt-6 border-t pt-4 text-xs font-bold flex items-center gap-2 ${
                isDark
                  ? "border-neutral-800 text-neutral-400"
                  : "border-neutral-200 text-neutral-600"
              }`}
            >
              <span className="text-lime-400 font-black text-sm" aria-hidden="true">
                🔒
              </span>
              <span>
                Zero database. Zero tracking. Your session state lives exclusively in your browser.
              </span>
            </div>
          </div>
        </section>

        {/* ================= 3-STEP HOW IT WORKS SECTION ================= */}
        <section aria-labelledby="how-it-works-heading" className="mb-14">
          <div className="mb-8 text-center sm:text-left">
            <span className="rounded-md border-2 border-black bg-sky-300 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000]">
              The Workflow
            </span>
            <h2
              id="how-it-works-heading"
              className={`mt-2 text-2xl sm:text-3xl font-black ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              How It Works: In 3 Adaptive Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Step 1 */}
            <div
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                isDark
                  ? "border-2 border-neutral-700 bg-[#121212] shadow-[5px_5px_0px_#000]"
                  : "border-2.5 border-black bg-white shadow-[5px_5px_0px_#000]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-lime-400 text-lg font-black text-black shadow-[2px_2px_0px_#000]">
                    01
                  </span>
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase ${
                      isDark
                        ? "border-neutral-700 bg-neutral-900 text-neutral-300"
                        : "border-neutral-300 bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    Turns 1–5
                  </span>
                </div>
                <h3
                  className={`text-lg font-black ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Broad Universal Foundation
                </h3>
                <p
                  className={`mt-2 text-xs font-bold leading-relaxed ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  Calibrates your baseline across 6 RIASEC interest vectors, 4 workstyle polarities, and core values before any branching occurs.
                </p>
              </div>
              <div
                className={`mt-6 border-t pt-3 ${
                  isDark ? "border-neutral-800" : "border-neutral-200"
                }`}
              >
                <span className="text-[11px] font-black text-lime-400 uppercase">
                  ✓ Establishes unbiased baseline
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                isDark
                  ? "border-2 border-neutral-700 bg-[#121212] shadow-[5px_5px_0px_#000]"
                  : "border-2.5 border-black bg-white shadow-[5px_5px_0px_#000]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-purple-300 text-lg font-black text-black shadow-[2px_2px_0px_#000]">
                    02
                  </span>
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase ${
                      isDark
                        ? "border-neutral-700 bg-neutral-900 text-neutral-300"
                        : "border-neutral-300 bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    Turns 6–22
                  </span>
                </div>
                <h3
                  className={`text-lg font-black ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Adaptive AI-Guided Probing
                </h3>
                <p
                  className={`mt-2 text-xs font-bold leading-relaxed ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  Gemini AI dynamically selects the optimal question: <em>Deep</em> interest tests, <em>Cross-domain</em> intersections (e.g., Tech + Business), or <em>Challenge</em> trade-offs.
                </p>
              </div>
              <div
                className={`mt-6 border-t pt-3 ${
                  isDark ? "border-neutral-800" : "border-neutral-200"
                }`}
              >
                <span className="text-[11px] font-black text-purple-400 uppercase">
                  ✓ Dynamic information gain
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                isDark
                  ? "border-2 border-neutral-700 bg-[#121212] shadow-[5px_5px_0px_#000]"
                  : "border-2.5 border-black bg-white shadow-[5px_5px_0px_#000]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-orange-300 text-lg font-black text-black shadow-[2px_2px_0px_#000]">
                    03
                  </span>
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase ${
                      isDark
                        ? "border-neutral-700 bg-neutral-900 text-neutral-300"
                        : "border-neutral-300 bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    Final Synthesis
                  </span>
                </div>
                <h3
                  className={`text-lg font-black ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Deterministic Match & Report
                </h3>
                <p
                  className={`mt-2 text-xs font-bold leading-relaxed ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  18-dimensional cosine similarity maps your profile against 25 curated Indian career pathways with transparent evidence, entrance exams, and honest downsides.
                </p>
              </div>
              <div
                className={`mt-6 border-t pt-3 ${
                  isDark ? "border-neutral-800" : "border-neutral-200"
                }`}
              >
                <span className="text-[11px] font-black text-orange-400 uppercase">
                  ✓ Pure math, zero LLM hallucination
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SHORT SECTION ON ADAPTIVE QUESTIONING ================= */}
        <section
          aria-labelledby="adaptive-questioning-heading"
          className={`mb-14 rounded-3xl p-6 sm:p-10 transition-all ${
            isDark
              ? "border-2 border-neutral-700 bg-[#151515] shadow-[6px_6px_0px_#000]"
              : "border-2.5 border-black bg-white shadow-[6px_6px_0px_#000]"
          }`}
        >
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="max-w-xl">
              <span className="rounded-md border-2 border-black bg-pink-300 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000]">
                Methodology
              </span>
              <h2
                id="adaptive-questioning-heading"
                className={`mt-3 text-2xl sm:text-3xl font-black ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                Why Adaptive Questioning Matters
              </h2>
              <p
                className={`mt-3 text-sm font-bold leading-relaxed ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Conventional career questionnaires use fixed 50-item lists where later questions are answered when your brain is tired. They treat questions in isolation, failing to probe contradictions (e.g., wanting high leadership while craving solitary deep work).
              </p>
              <p
                className={`mt-3 text-sm font-bold leading-relaxed ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Career Compass uses a dynamic probe loop: every time you answer, the system updates your multidimensional profile vector, measures uncertainty across all dimensions, and sends an intelligent probe to verify or falsify emerging interests. If your interest ranking stabilizes, the interview finishes early—respecting your time.
              </p>
            </div>

            <div className="w-full md:w-auto flex-1 flex flex-col gap-3">
              <div
                className={`rounded-2xl p-4 transition-all ${
                  isDark
                    ? "border-2 border-neutral-800 bg-neutral-900 shadow-[3px_3px_0px_#000]"
                    : "border-2 border-black bg-neutral-50 shadow-[3px_3px_0px_#000]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded border border-black bg-lime-400 px-2 py-0.5 text-[10px] font-black text-black">
                    DEEP PROBE
                  </span>
                  <span
                    className={`text-xs font-black ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    Targeted Depth
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Tests how far your primary interest extends when work becomes rigorous.
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 transition-all ${
                  isDark
                    ? "border-2 border-neutral-800 bg-neutral-900 shadow-[3px_3px_0px_#000]"
                    : "border-2 border-black bg-neutral-50 shadow-[3px_3px_0px_#000]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded border border-black bg-purple-300 px-2 py-0.5 text-[10px] font-black text-black">
                    CROSS PROBE
                  </span>
                  <span
                    className={`text-xs font-black ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    Domain Hybridization
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Discovers untapped career hybrids like Product Management (Tech + Business) or Biotech.
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 transition-all ${
                  isDark
                    ? "border-2 border-neutral-800 bg-neutral-900 shadow-[3px_3px_0px_#000]"
                    : "border-2 border-black bg-neutral-50 shadow-[3px_3px_0px_#000]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded border border-black bg-orange-300 px-2 py-0.5 text-[10px] font-black text-black">
                    CHALLENGE PROBE
                  </span>
                  <span
                    className={`text-xs font-black ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    Realistic Trade-Offs
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Forces honest trade-offs: 70-hour startup sprints vs government job security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BOTTOM CTA BANNER ================= */}
        <section
          aria-labelledby="cta-heading"
          className="rounded-3xl border-3 border-black bg-lime-400 p-6 sm:p-10 text-black shadow-[6px_6px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <span className="inline-block rounded-md border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-2">
              Ready in 7 minutes
            </span>
            <h2 id="cta-heading" className="text-2xl sm:text-3xl font-black">
              Uncover your true career alignment today.
            </h2>
            <p className="text-xs sm:text-sm font-bold text-neutral-900 mt-1">
              Deterministic 18D RIASEC cosine matching. Curated for the realities of Indian college students.
            </p>
          </div>
          <Link
            href="/assess"
            className="whitespace-nowrap rounded-2xl border-2.5 border-black bg-black px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0px_#fff] hover:bg-neutral-900 active:translate-x-0.5 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none transition-all"
          >
            Start discovery →
          </Link>
        </section>
      </div>
    </main>
  );
}
