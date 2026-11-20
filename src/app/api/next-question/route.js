import { NextResponse } from "next/server";
import questionsData from "@/data/questions.json";
import { createProfile, applyAnswer } from "@/lib/profile.js";
import {
  getCandidates,
  fallbackPick,
  shouldStop,
  getSectionCounts,
  getCurrentSection,
  getSectionProgress,
} from "@/lib/selector.js";
import { selectNextQuestionWithGemini, generateSectionSummaryWithGemini } from "@/lib/gemini.js";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit.js";
import { SECTION_BUDGETS, TOTAL_QUESTION_BUDGET } from "@/lib/types.js";

const questions = questionsData;
const questionMap = new Map(questions.map((q) => [q.id, q]));

export async function POST(req) {
  try {
    // 1. In-memory per-IP rate limiting (45 reqs / min)
    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 45, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    // 2. Max body size check (max 100KB)
    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > 100 * 1024) {
      return NextResponse.json(
        { error: "Payload too large. Maximum body size is 100KB." },
        { status: 413 }
      );
    }

    const body = await req.json().catch(() => ({}));
    let { profile, lastAnswer, segment } = body;

    // Initialize profile if missing
    if (!profile) {
      profile = createProfile(segment || "undergrad");
    } else if (segment && !profile.segment) {
      profile.segment = segment;
    }

    // Ensure sectionSummaries dictionary exists on profile
    if (!profile.sectionSummaries) {
      profile.sectionSummaries = {};
    }

    const prevCounts = getSectionCounts(profile, questions);
    let completedSectionSummary = null;

    // 3. Update profile with last answer
    if (lastAnswer && lastAnswer.questionId && lastAnswer.optionId) {
      const q = questionMap.get(lastAnswer.questionId);
      if (q) {
        profile = applyAnswer(
          profile,
          q,
          lastAnswer.optionId,
          lastAnswer.probeType || "adaptive",
          lastAnswer.reason || ""
        );

        // Check if this answer completed a section
        const newCounts = getSectionCounts(profile, questions);
        const answeredSection = q.section;
        const budget = SECTION_BUDGETS[answeredSection] || 3;

        if (
          prevCounts[answeredSection] < budget &&
          newCounts[answeredSection] >= budget
        ) {
          // Section just completed! Generate one-line summary
          const summaryText = await generateSectionSummaryWithGemini(profile, answeredSection);
          profile.sectionSummaries[answeredSection] = summaryText;
          completedSectionSummary = {
            section: answeredSection,
            summary: summaryText,
          };
        }
      }
    }

    const sectionProgress = getSectionProgress(profile, questions);
    const progress = {
      current: profile.answeredIds.length,
      min: TOTAL_QUESTION_BUDGET,
      max: TOTAL_QUESTION_BUDGET,
      total: TOTAL_QUESTION_BUDGET,
    };

    // 4. If shouldStop return { done: true, profile }
    if (shouldStop(profile, questions)) {
      return NextResponse.json({
        done: true,
        profile,
        progress,
        section: sectionProgress,
        sectionSummary: completedSectionSummary,
      });
    }

    // 5. Get candidate questions (8 max) from current section & segment
    const candidates = getCandidates(profile, questions, 8);
    if (!candidates || candidates.length === 0) {
      return NextResponse.json({
        done: true,
        profile,
        progress,
        section: sectionProgress,
        sectionSummary: completedSectionSummary,
      });
    }

    // 6. Call Gemini with compact prompt
    let geminiRes = null;
    try {
      geminiRes = await selectNextQuestionWithGemini(profile, candidates);
    } catch (e) {
      geminiRes = null;
    }

    let question = null;
    let probeType = "deep";
    let reason = "";
    let path = "fallback";

    // 7. Match selected candidate
    if (geminiRes && geminiRes.questionId) {
      const matched = candidates.find((c) => c.question.id === geminiRes.questionId);
      if (matched) {
        question = matched.question;
        probeType = geminiRes.probeType || matched.probeType;
        reason = geminiRes.reason;
        path = "llm";
        console.log(`[NextQuestion] path: llm -> ${question.id} (section: ${question.section})`);
      }
    }

    // 8. Fallback: on any failure, timeout, or missing key
    if (!question) {
      const fallback = fallbackPick(candidates, profile.history);
      question = fallback.question;
      probeType = fallback.probeType;
      reason = fallback.reason || "Exploring this area to discover your authentic career fit.";
      path = "fallback";
      console.log(`[NextQuestion] path: fallback -> ${question.id} (section: ${question.section})`);
    }

    return NextResponse.json({
      question,
      probeType,
      reason,
      profile,
      progress,
      section: sectionProgress,
      sectionSummary: completedSectionSummary,
      path,
    });
  } catch (error) {
    console.error("[NextQuestion] error in cycle:", error?.message);
    const fallbackQuestion = questions[0];
    const safeProfile = createProfile();
    return NextResponse.json({
      question: fallbackQuestion,
      probeType: "universal",
      reason: "Exploring your profile to discover your authentic career fit.",
      profile: safeProfile,
      progress: { current: 0, min: 20, max: 20, total: 20 },
      section: {
        currentSection: "about_you",
        sectionTitle: "About You",
        sectionIndex: 1,
        totalSections: 5,
        answeredInSection: 0,
        sectionBudget: 3,
        totalAnswered: 0,
        totalBudget: 20,
        isFinished: false,
      },
      sectionSummary: null,
      path: "fallback",
    });
  }
}
