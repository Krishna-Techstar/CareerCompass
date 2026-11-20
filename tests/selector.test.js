import { describe, it, expect } from "vitest";
import questionsData from "../src/data/questions.json";
import { createProfile, applyAnswer } from "../src/lib/profile.js";
import {
  getCandidates,
  fallbackPick,
  shouldStop,
  detectContradiction,
  getSectionCounts,
  getCurrentSection,
  getSectionProgress,
} from "../src/lib/selector.js";
import {
  SECTION_KEYS,
  SECTION_BUDGETS,
  TOTAL_QUESTION_BUDGET,
  SEGMENT_KEYS,
} from "../src/lib/types.js";

const questions = questionsData;
const qMap = new Map(questions.map((q) => [q.id, q]));

describe("Selector Engine - Fix B (5 Segments & 5 Sections)", () => {
  // Test 1: Only draws from current section and segment
  it("Test 1: Only draws candidates matching current segment and current section", () => {
    // A. Middle school segment (class_6_8)
    const profile68 = createProfile("class_6_8");
    expect(profile68.segment).toBe("class_6_8");

    const cands68 = getCandidates(profile68, questions, 8);
    expect(cands68.length).toBeGreaterThan(0);
    cands68.forEach((cand) => {
      expect(cand.question.section).toBe("about_you");
      expect(cand.question.segment).toContain("class_6_8");
    });

    // B. Undergrad segment
    const profileUG = createProfile("undergrad");
    const candsUG = getCandidates(profileUG, questions, 8);
    expect(candsUG.length).toBeGreaterThan(0);
    candsUG.forEach((cand) => {
      expect(cand.question.section).toBe("about_you");
      expect(cand.question.segment).toContain("undergrad");
    });
  });

  // Test 2: Section progression and exact budgets
  it("Test 2: Advances strictly through 5 sections adhering to individual budgets (3, 5, 4, 5, 3)", () => {
    let profile = createProfile("undergrad");

    // Section 1: about_you (budget: 3)
    for (let i = 0; i < 3; i++) {
      expect(getCurrentSection(profile, questions)).toBe("about_you");
      const cands = getCandidates(profile, questions, 8);
      expect(cands.length).toBeGreaterThan(0);
      const chosen = cands[0].question;
      expect(chosen.section).toBe("about_you");
      profile = applyAnswer(profile, chosen, chosen.options[0].id);
    }
    expect(getSectionCounts(profile, questions).about_you).toBe(3);

    // Section 2: likes_dislikes (budget: 5)
    for (let i = 0; i < 5; i++) {
      expect(getCurrentSection(profile, questions)).toBe("likes_dislikes");
      const cands = getCandidates(profile, questions, 8);
      const chosen = cands[0].question;
      expect(chosen.section).toBe("likes_dislikes");
      profile = applyAnswer(profile, chosen, chosen.options[0].id);
    }
    expect(getSectionCounts(profile, questions).likes_dislikes).toBe(5);

    // Section 3: work_style (budget: 4)
    for (let i = 0; i < 4; i++) {
      expect(getCurrentSection(profile, questions)).toBe("work_style");
      const cands = getCandidates(profile, questions, 8);
      const chosen = cands[0].question;
      expect(chosen.section).toBe("work_style");
      profile = applyAnswer(profile, chosen, chosen.options[0].id);
    }
    expect(getSectionCounts(profile, questions).work_style).toBe(4);

    // Section 4: best_at (budget: 5)
    for (let i = 0; i < 5; i++) {
      expect(getCurrentSection(profile, questions)).toBe("best_at");
      const cands = getCandidates(profile, questions, 8);
      const chosen = cands[0].question;
      expect(chosen.section).toBe("best_at");
      profile = applyAnswer(profile, chosen, chosen.options[0].id);
    }
    expect(getSectionCounts(profile, questions).best_at).toBe(5);

    // Section 5: values (budget: 3)
    for (let i = 0; i < 3; i++) {
      expect(getCurrentSection(profile, questions)).toBe("values");
      const cands = getCandidates(profile, questions, 8);
      const chosen = cands[0].question;
      expect(chosen.section).toBe("values");
      profile = applyAnswer(profile, chosen, chosen.options[0].id);
    }
    expect(getSectionCounts(profile, questions).values).toBe(3);

    // All 20 questions answered!
    expect(profile.answeredIds.length).toBe(TOTAL_QUESTION_BUDGET);
    expect(getCurrentSection(profile, questions)).toBeNull();
    expect(shouldStop(profile, questions)).toBe(true);

    const progress = getSectionProgress(profile, questions);
    expect(progress.isFinished).toBe(true);
    expect(progress.totalAnswered).toBe(20);
  });

  // Test 3: Section 4 (best_at) includes objective mini-challenges
  it("Test 3: Section 4 ('best_at') surfaces objective mini-challenges (logic, numbers, words)", () => {
    // Fill out first 3 sections (3 + 5 + 4 = 12 answers)
    let profile = createProfile("class_9_10");
    const ugQuestions = questions.filter((q) => q.segment.includes("class_9_10"));

    const ayQs = ugQuestions.filter((q) => q.section === "about_you").slice(0, 3);
    ayQs.forEach((q) => { profile = applyAnswer(profile, q, q.options[0].id); });

    const ldQs = ugQuestions.filter((q) => q.section === "likes_dislikes").slice(0, 5);
    ldQs.forEach((q) => { profile = applyAnswer(profile, q, q.options[0].id); });

    const wsQs = ugQuestions.filter((q) => q.section === "work_style").slice(0, 4);
    wsQs.forEach((q) => { profile = applyAnswer(profile, q, q.options[0].id); });

    expect(getCurrentSection(profile, questions)).toBe("best_at");

    // Fetch candidates in Section 4
    const candidates = getCandidates(profile, questions, 8);
    expect(candidates.length).toBeGreaterThan(0);

    const hasMiniChallenge = candidates.some(
      (c) => c.question.isMiniChallenge || c.question.format === "objective_challenge"
    );
    expect(hasMiniChallenge).toBe(true);
  });

  // Test 4: Never repeats any question in answeredIds
  it("Test 4: Never repeats any question already in answeredIds", () => {
    let profile = createProfile("class_11_12");
    const sample = questions.filter((q) => q.segment.includes("class_11_12")).slice(0, 5);

    sample.forEach((q) => {
      profile = applyAnswer(profile, q, q.options[0].id);
    });

    const candidates = getCandidates(profile, questions, 8);
    candidates.forEach((cand) => {
      expect(profile.answeredIds).not.toContain(cand.question.id);
    });
  });

  // Test 5: Fallback rotation and contradiction detection
  it("Test 5: Detects contradictions and rotates fallbackPick", () => {
    const sampleCandidates = [
      { question: { id: "c_deep" }, probeType: "deep" },
      { question: { id: "c_cross" }, probeType: "cross" },
      { question: { id: "c_challenge" }, probeType: "challenge" },
    ];

    const pick1 = fallbackPick(sampleCandidates, [{ probeType: "deep" }]);
    expect(pick1.probeType).toBe("cross");

    const pick2 = fallbackPick(sampleCandidates, [{ probeType: "cross" }]);
    expect(pick2.probeType).toBe("challenge");

    const pick3 = fallbackPick(sampleCandidates, [{ probeType: "challenge" }]);
    expect(pick3.probeType).toBe("deep");
  });
});
