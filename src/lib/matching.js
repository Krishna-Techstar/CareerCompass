import {
  RIASEC_KEYS,
  WORKSTYLE_KEYS,
  VALUE_KEYS,
} from "./types.js";
import { normalizedProfile } from "./profile.js";

const DIMENSION_LABELS = {
  R: "Hands-on, technical systems execution (Realistic)",
  I: "Deep analytical & scientific inquiry (Investigative)",
  A: "Creative, aesthetic & artistic design (Artistic)",
  S: "Mentorship, people support & social empathy (Social)",
  E: "Leadership, business growth & persuasion (Enterprising)",
  C: "Structured systems, precision & compliance (Conventional)",
  independent_vs_team: "Team collaboration vs solitary focus",
  structured_vs_flexible: "Structured processes vs flexible ambiguity",
  practical_vs_conceptual: "Practical execution vs conceptual theory",
  lead_vs_support: "Directing leadership vs specialist execution",
  stability: "Job security & long-term stability",
  growth: "Fast financial & upward career progression",
  independence: "Autonomy & schedule flexibility",
  creativity: "Original innovation & expressive freedom",
  impact: "Direct societal & community welfare",
  recognition: "Public prestige & social status",
  balance: "Sustainable work-life balance",
  learning: "Continuous mastery & steep learning curve",
};

function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] ?? 0) * (b[i] ?? 0);
  }
  return sum;
}

function magnitude(a) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const val = a[i] ?? 0;
    sum += val * val;
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(a, b) {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0.5; // neutral fallback
  const cos = dotProduct(a, b) / (magA * magB);
  return Math.max(-1, Math.min(1, cos));
}

/**
 * Pure function: matches the student profile against a list of careers
 * using weighted cosine similarity:
 * - Interests: 0.40
 * - Workstyle: 0.25
 * - Values: 0.25
 * - Aptitude: 0.10 (reserved baseline)
 *
 * Returns the top 6 careers ordered by deterministic fitIndex (0 to 100).
 * Never uses or refers to probability.
 */
export function matchCareers(profile, careers) {
  const norm = normalizedProfile(profile);
  const segment = profile.segment || "undergrad";

  // Filter careers/directions relevant to the student's segment
  const eligibleCareers = (careers || []).filter((c) => {
    if (!c.segments || !Array.isArray(c.segments) || c.segments.length === 0) {
      return true;
    }
    return c.segments.includes(segment);
  });

  const targetCareers = eligibleCareers.length > 0 ? eligibleCareers : careers;

  // Build student vectors
  const studentInterestsVec = RIASEC_KEYS.map((k) => norm.interests[k] || 0);
  const studentWorkstyleVec = WORKSTYLE_KEYS.map((k) => norm.workstyle[k] || 0);
  const studentValuesVec = VALUE_KEYS.map((k) => norm.values[k] || 0);

  const scoredCareers = targetCareers.map((career) => {
    const careerInterestsVec = RIASEC_KEYS.map((k) => career.vector[k] || 0);
    const careerWorkstyleVec = WORKSTYLE_KEYS.map((k) => career.vector[k] || 0);
    const careerValuesVec = VALUE_KEYS.map((k) => career.vector[k] || 0);

    // 1. Interests Cosine Similarity (0.0 to 1.0)
    const rawInterestCos = cosineSimilarity(studentInterestsVec, careerInterestsVec);
    const interestMatch = Math.max(0, Math.min(1, rawInterestCos));

    // 2. Workstyle Cosine Similarity (shifted from [-1, 1] to [0.0, 1.0])
    const rawWorkstyleCos = cosineSimilarity(studentWorkstyleVec, careerWorkstyleVec);
    const workstyleMatch = Math.max(0, Math.min(1, (rawWorkstyleCos + 1) / 2));

    // 3. Values Cosine Similarity (0.0 to 1.0)
    const rawValuesCos = cosineSimilarity(studentValuesVec, careerValuesVec);
    const valueMatch = Math.max(0, Math.min(1, rawValuesCos));

    // 4. Aptitude reserved baseline (0.10 weight)
    const aptitudeMatch = 0.9;

    // Weighted composite similarity
    const compositeSimilarity =
      0.4 * interestMatch +
      0.25 * workstyleMatch +
      0.25 * valueMatch +
      0.1 * aptitudeMatch;

    // Deterministic fitIndex from 0 to 100
    const fitIndex = Math.min(99, Math.max(1, Math.round(compositeSimilarity * 100)));

    // Compute evidence: top contributors and mismatches across all 18 dimensions
    const dimensionAnalytics = [];

    // Analyze Interests
    for (const k of RIASEC_KEYS) {
      const sVal = norm.interests[k] || 0;
      const cVal = career.vector[k] || 0;
      const gap = Math.abs(sVal - cVal) / 10;
      const alignment = 1 - gap;
      const contribution = (sVal / 10) * (cVal / 10) * alignment;
      dimensionAnalytics.push({
        dim: k,
        label: DIMENSION_LABELS[k] || k,
        contribution,
        gap,
        studentVal: sVal,
        careerVal: cVal,
      });
    }

    // Analyze Workstyle
    for (const k of WORKSTYLE_KEYS) {
      const sVal = norm.workstyle[k] || 0;
      const cVal = career.vector[k] || 0;
      const gap = Math.abs(sVal - cVal) / 2; // max possible gap is 2
      const alignment = 1 - gap;
      const contribution = Math.max(0, sVal * cVal) * alignment;
      dimensionAnalytics.push({
        dim: k,
        label: DIMENSION_LABELS[k] || k,
        contribution,
        gap,
        studentVal: sVal,
        careerVal: cVal,
      });
    }

    // Analyze Values
    for (const k of VALUE_KEYS) {
      const sVal = norm.values[k] || 0;
      const cVal = career.vector[k] || 0;
      const gap = Math.abs(sVal - cVal) / 10;
      const alignment = 1 - gap;
      const contribution = (sVal / 10) * (cVal / 10) * alignment;
      dimensionAnalytics.push({
        dim: k,
        label: DIMENSION_LABELS[k] || k,
        contribution,
        gap,
        studentVal: sVal,
        careerVal: cVal,
      });
    }

    // Top 3 contributing dimensions
    dimensionAnalytics.sort((a, b) => b.contribution - a.contribution);
    const topContributors = dimensionAnalytics.slice(0, 3).map((item) => {
      return `Strong alignment: ${item.label}`;
    });

    // 1-2 biggest mismatches (highest gap)
    dimensionAnalytics.sort((a, b) => b.gap - a.gap);
    const mismatches = dimensionAnalytics.slice(0, 2).map((item) => {
      const direction =
        item.studentVal > item.careerVal
          ? "higher student priority than required"
          : "higher career requirement than indicated";
      return `Potential friction: ${item.label} (${direction})`;
    });

    return {
      career,
      fitIndex,
      overallScore: fitIndex,
      interestMatch: Math.round(interestMatch * 100),
      workstyleMatch: Math.round(workstyleMatch * 100),
      valueMatch: Math.round(valueMatch * 100),
      evidence: {
        topContributors,
        mismatches,
      },
    };
  });

  // Sort descending by fitIndex and return top 6
  scoredCareers.sort((a, b) => b.fitIndex - a.fitIndex);
  return scoredCareers.slice(0, 6);
}
