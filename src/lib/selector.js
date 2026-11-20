import {
  RIASEC_KEYS,
  WORKSTYLE_KEYS,
  VALUE_KEYS,
  SECTION_KEYS,
  SECTION_TITLES,
  SECTION_BUDGETS,
  TOTAL_QUESTION_BUDGET,
} from "./types.js";
import { normalizedProfile, confidence } from "./profile.js";

// Mapping RIASEC dimensions to domain tags
const RIASEC_TAG_MAP = {
  R: ["tech", "engineering", "physical_systems", "hardware", "robotics", "mechanics"],
  I: ["tech", "science", "analytics", "data", "research", "learning", "math"],
  A: ["creative", "design", "arts", "design+tech", "people+creative", "media"],
  S: ["people", "healthcare", "education", "biology+psychology", "social_impact", "helping"],
  E: ["business", "tech+business", "governance", "entrepreneurship", "leadership", "finance"],
  C: ["finance", "operations", "business+law", "compliance", "data", "accounting"],
};

/**
 * Helper: gets top N interest keys from profile ordered by score descending.
 */
export function getTopInterests(profile, count = 2) {
  const norm = normalizedProfile(profile);
  const sorted = [...RIASEC_KEYS].sort((a, b) => {
    return (norm.interests[b] || 0) - (norm.interests[a] || 0);
  });
  return sorted.slice(0, count);
}

/**
 * Computes how many questions the student has answered in each of the 5 sections.
 */
export function getSectionCounts(profile, allQuestions = []) {
  const qMap = new Map((allQuestions || []).map((q) => [q.id, q]));
  const counts = {
    about_you: 0,
    likes_dislikes: 0,
    work_style: 0,
    best_at: 0,
    values: 0,
  };

  for (const qId of profile.answeredIds || []) {
    const q = qMap.get(qId);
    if (q && q.section && counts[q.section] !== undefined) {
      counts[q.section]++;
    }
  }

  return counts;
}

/**
 * Returns the current active section key in fixed order:
 * 1. about_you (budget 3)
 * 2. likes_dislikes (budget 5)
 * 3. work_style (budget 4)
 * 4. best_at (budget 5)
 * 5. values (budget 3)
 * Returns null if all 5 sections have exhausted their budgets.
 */
export function getCurrentSection(profile, allQuestions = []) {
  const counts = getSectionCounts(profile, allQuestions);
  for (const section of SECTION_KEYS) {
    if (counts[section] < (SECTION_BUDGETS[section] || 3)) {
      return section;
    }
  }
  return null;
}

/**
 * Returns section progress metadata for UI and API clients.
 */
export function getSectionProgress(profile, allQuestions = []) {
  const counts = getSectionCounts(profile, allQuestions);
  const currentSection = getCurrentSection(profile, allQuestions);

  if (!currentSection) {
    return {
      currentSection: "values",
      sectionTitle: SECTION_TITLES.values,
      sectionIndex: 5,
      totalSections: 5,
      answeredInSection: SECTION_BUDGETS.values,
      sectionBudget: SECTION_BUDGETS.values,
      totalAnswered: profile.answeredIds.length,
      totalBudget: TOTAL_QUESTION_BUDGET,
      isFinished: true,
    };
  }

  const sectionIndex = SECTION_KEYS.indexOf(currentSection) + 1;
  const answeredInSection = counts[currentSection] || 0;
  const sectionBudget = SECTION_BUDGETS[currentSection] || 3;

  return {
    currentSection,
    sectionTitle: SECTION_TITLES[currentSection],
    sectionIndex,
    totalSections: SECTION_KEYS.length,
    answeredInSection,
    sectionBudget,
    totalAnswered: profile.answeredIds.length,
    totalBudget: TOTAL_QUESTION_BUDGET,
    isFinished: false,
  };
}

/**
 * Detects cognitive or value contradictions in the student's profile.
 */
export function detectContradiction(profile) {
  const norm = normalizedProfile(profile);

  const isStrongIndependent = (norm.workstyle.independent_vs_team || 0) <= -0.5;
  const isStrongLeader = (norm.workstyle.lead_vs_support || 0) <= -0.5;

  if (isStrongIndependent && isStrongLeader) {
    return {
      hasContradiction: true,
      type: "independence_vs_leadership",
      message: "Strong solitary independent workstyle paired with strong command/leadership drive",
      clarifyingQuestionIds: ["ws_shared_01", "ws_shared_03"],
    };
  }

  const isHighStability = (norm.values.stability || 0) >= 7.0;
  const isHighEnterprising = (norm.interests.E || 0) >= 7.0;

  if (isHighStability && isHighEnterprising) {
    return {
      hasContradiction: true,
      type: "stability_vs_entrepreneurship",
      message: "High demand for job stability & security paired with high venture entrepreneurship drive",
      clarifyingQuestionIds: ["val_shared_01", "val_shared_02"],
    };
  }

  return {
    hasContradiction: false,
    type: null,
    message: null,
    clarifyingQuestionIds: [],
  };
}

/**
 * Deterministic stopping rule (Fix B):
 * Stops when all 5 sections have exhausted their budgets (20 questions total),
 * or getCurrentSection returns null.
 */
export function shouldStop(profile, allQuestions = []) {
  if (profile.answeredIds.length >= TOTAL_QUESTION_BUDGET) {
    return true;
  }

  const currentSection = getCurrentSection(profile, allQuestions);
  return currentSection === null;
}

/**
 * Returns candidate questions (default 8) for the next probe:
 * - MUST ONLY draw from the current section and current segment.
 * - Within the section, it stays adaptive (deep, cross, challenge).
 * - In Section 4 (best_at), prioritizes mini-challenges.
 */
export function getCandidates(profile, questions = [], n = 8) {
  const segment = profile.segment || "undergrad";
  const currentSection = getCurrentSection(profile, questions);

  if (!currentSection) {
    return [];
  }

  const answeredSet = new Set(profile.answeredIds || []);

  // Filter only from the current section and current segment
  let eligibleQuestions = questions.filter((q) => {
    if (answeredSet.has(q.id)) return false;
    if (q.section !== currentSection) return false;
    if (!Array.isArray(q.segment)) return false;
    return q.segment.includes(segment);
  });

  // Fallback: if no segment-specific question remains, draw from any question in this section
  if (eligibleQuestions.length === 0) {
    eligibleQuestions = questions.filter(
      (q) => !answeredSet.has(q.id) && q.section === currentSection
    );
  }

  if (eligibleQuestions.length === 0) {
    return [];
  }

  // Adaptive classification within the section
  const topInterests = getTopInterests(profile, 2);
  const primaryInterest = topInterests[0] || "I";
  const secondaryInterest = topInterests[1] || "E";

  const primaryTags = RIASEC_TAG_MAP[primaryInterest] || [];
  const secondaryTags = RIASEC_TAG_MAP[secondaryInterest] || [];
  const topDomainTags = [...new Set([...primaryTags, ...secondaryTags])];

  const conf = confidence(profile);

  function calculateInfoGain(q) {
    let gain = 0;
    for (const opt of q.options) {
      for (const dim of Object.keys(opt.weights)) {
        const dimConf = conf[dim] ?? 0;
        gain += 1 - dimConf;
      }
    }
    return gain;
  }

  // 1. "challenge" pool: mini-challenges (Section 4) or contrasting dimensions / trade-offs
  const challengePool = eligibleQuestions
    .filter((q) => q.isMiniChallenge || q.format === "objective_challenge" || q.category === "situational")
    .map((q) => {
      let score = calculateInfoGain(q);
      if (q.isMiniChallenge) score += 10; // High priority for objective demonstration
      return { question: q, probeType: "challenge", score };
    })
    .sort((a, b) => b.score - a.score);

  // 2. "cross" pool: questions exploring alternative domains or cross-cutting links
  const crossPool = eligibleQuestions
    .filter((q) => {
      if (q.isMiniChallenge || q.format === "objective_challenge") return false;
      return !q.tags.some((t) => topDomainTags.includes(t));
    })
    .map((q) => {
      const score = calculateInfoGain(q);
      return { question: q, probeType: "cross", score };
    })
    .sort((a, b) => b.score - a.score);

  // 3. "deep" pool: questions aligning directly with top interest dimensions
  const deepPool = eligibleQuestions
    .filter((q) => {
      if (q.isMiniChallenge || q.format === "objective_challenge") return false;
      return (
        q.tags.some((t) => topDomainTags.includes(t)) ||
        q.options.some((opt) => (opt.weights[primaryInterest] || 0) > 0 || (opt.weights[secondaryInterest] || 0) > 0)
      );
    })
    .map((q) => {
      const score = calculateInfoGain(q);
      return { question: q, probeType: "deep", score };
    })
    .sort((a, b) => b.score - a.score);

  const candidates = [];
  const selectedIds = new Set();

  function addCandidate(cand) {
    if (!cand || selectedIds.has(cand.question.id)) return false;
    selectedIds.add(cand.question.id);
    candidates.push({
      question: cand.question,
      probeType: cand.probeType,
      reason: `Adaptive ${cand.probeType} probe for ${SECTION_TITLES[currentSection]} (${primaryInterest}/${secondaryInterest})`,
    });
    return true;
  }

  // If in section 4 (best_at), ensure at least 1 mini-challenge is added first
  if (currentSection === "best_at" && challengePool.length > 0) {
    addCandidate(challengePool[0]);
  }

  // Add at least 1-2 from each pool if available
  if (deepPool.length > 0) deepPool.slice(0, 2).forEach(addCandidate);
  if (crossPool.length > 0) crossPool.slice(0, 2).forEach(addCandidate);
  if (challengePool.length > 0) challengePool.slice(0, 2).forEach(addCandidate);

  // Fill up to n from remaining sorted by score
  const remaining = [...deepPool, ...crossPool, ...challengePool]
    .filter((c) => !selectedIds.has(c.question.id))
    .sort((a, b) => b.score - a.score);

  for (const cand of remaining) {
    if (candidates.length >= n) break;
    addCandidate(cand);
  }

  // If still below n, add any remaining eligible questions
  for (const q of eligibleQuestions) {
    if (candidates.length >= n) break;
    if (!selectedIds.has(q.id)) {
      addCandidate({
        question: q,
        probeType: q.isMiniChallenge ? "challenge" : "deep",
      });
    }
  }

  return candidates.slice(0, n);
}

/**
 * Deterministic fallback selector:
 * Rotates between "deep" -> "cross" -> "challenge" based on history.
 */
export function fallbackPick(candidates, history = []) {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  let lastType = null;
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (h && h.probeType && ["deep", "cross", "challenge"].includes(h.probeType)) {
      lastType = h.probeType;
      break;
    }
  }

  const rotation = {
    deep: "cross",
    cross: "challenge",
    challenge: "deep",
  };

  const targetType = lastType ? rotation[lastType] || "deep" : "deep";

  const match = candidates.find((c) => c.probeType === targetType);
  if (match) {
    return {
      question: match.question,
      probeType: match.probeType,
      reason: `Adaptive rotation: selected ${match.probeType} probe for section discovery.`,
    };
  }

  const nextTarget = rotation[targetType];
  const nextMatch = candidates.find((c) => c.probeType === nextTarget);
  if (nextMatch) {
    return {
      question: nextMatch.question,
      probeType: nextMatch.probeType,
      reason: `Adaptive rotation: selected ${nextMatch.probeType} probe for section discovery.`,
    };
  }

  const first = candidates[0];
  return {
    question: first.question,
    probeType: first.probeType,
    reason: `Adaptive selection: prioritized ${first.probeType} candidate for section discovery.`,
  };
}
