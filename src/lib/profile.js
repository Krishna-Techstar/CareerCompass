import {
  RIASEC_KEYS,
  WORKSTYLE_KEYS,
  VALUE_KEYS,
  ALL_PROFILE_KEYS,
} from "./types.js";

/**
 * Creates an empty, initial student profile with zero evidence and neutral values.
 */
export function createProfile(segment = "undergrad", metadata = {}) {
  const interests = {};
  for (const k of RIASEC_KEYS) {
    interests[k] = 0;
  }

  const workstyle = {};
  for (const k of WORKSTYLE_KEYS) {
    workstyle[k] = 0;
  }

  const values = {};
  for (const k of VALUE_KEYS) {
    values[k] = 0;
  }

  const evidenceCounts = {};
  for (const k of ALL_PROFILE_KEYS) {
    evidenceCounts[k] = 0;
  }

  return {
    segment, // "class_6_8", "class_9_10", "class_11_12", "undergrad", "postgrad"
    name: metadata.name || "",
    age: metadata.age || null,
    streamOrCourse: metadata.streamOrCourse || "",
    parentalConsent: Boolean(metadata.parentalConsent),
    interests,
    workstyle,
    values,
    evidenceCounts,
    answeredIds: [],
    history: [],
    sectionSummaries: {},
  };
}

/**
 * Pure function: applies a user's answer to the profile, adding weights,
 * incrementing evidence counts, and recording history.
 */
export function applyAnswer(
  profile,
  question,
  optionId,
  probeType = "direct",
  reason = ""
) {
  const option = question.options.find((opt) => opt.id === optionId);
  if (!option) {
    throw new Error(`Option with id '${optionId}' not found in question '${question.id}'`);
  }

  const newInterests = { ...profile.interests };
  const newWorkstyle = { ...profile.workstyle };
  const newValues = { ...profile.values };
  const newEvidenceCounts = { ...profile.evidenceCounts };

  // Apply sparse weights
  for (const [key, weight] of Object.entries(option.weights)) {
    if (typeof weight !== "number") continue;

    if (RIASEC_KEYS.includes(key)) {
      newInterests[key] = (newInterests[key] || 0) + weight;
      newEvidenceCounts[key] = (newEvidenceCounts[key] || 0) + 1;
    } else if (WORKSTYLE_KEYS.includes(key)) {
      newWorkstyle[key] = (newWorkstyle[key] || 0) + weight;
      newEvidenceCounts[key] = (newEvidenceCounts[key] || 0) + 1;
    } else if (VALUE_KEYS.includes(key)) {
      newValues[key] = (newValues[key] || 0) + weight;
      newEvidenceCounts[key] = (newEvidenceCounts[key] || 0) + 1;
    }
  }

  const newAnsweredIds = profile.answeredIds.includes(question.id)
    ? [...profile.answeredIds]
    : [...profile.answeredIds, question.id];

  const newHistory = [
    ...profile.history,
    {
      questionId: question.id,
      optionId,
      probeType,
      reason,
    },
  ];

  return {
    ...profile,
    segment: profile.segment || "undergrad",
    interests: newInterests,
    workstyle: newWorkstyle,
    values: newValues,
    evidenceCounts: newEvidenceCounts,
    answeredIds: newAnsweredIds,
    history: newHistory,
    sectionSummaries: { ...(profile.sectionSummaries || {}) },
  };
}

/**
 * Pure function: normalizes raw profile scores so they directly align
 * with career vector dimensions:
 * - Interests: scaled to [0, 10] relative to peak interest
 * - Workstyle: averaged over evidence count and clamped to [-1.0, 1.0]
 * - Values: non-negative and scaled to [0, 10] relative to peak value
 */
export function normalizedProfile(profile) {
  // Normalize interests to [0, 10]
  const normInterests = {};
  let maxInterest = 0;
  for (const k of RIASEC_KEYS) {
    const val = profile.interests[k] || 0;
    if (val > maxInterest) maxInterest = val;
  }

  for (const k of RIASEC_KEYS) {
    const raw = profile.interests[k] || 0;
    normInterests[k] =
      maxInterest > 0
        ? Math.round((Math.max(0, raw) / maxInterest) * 10 * 10) / 10
        : 0;
  }

  // Normalize workstyle: mean over responses, clamped to [-1, 1]
  const normWorkstyle = {};
  for (const k of WORKSTYLE_KEYS) {
    const count = profile.evidenceCounts[k] || 0;
    const raw = profile.workstyle[k] || 0;
    if (count > 0) {
      const avg = raw / count;
      normWorkstyle[k] = Math.round(Math.max(-1, Math.min(1, avg)) * 100) / 100;
    } else {
      normWorkstyle[k] = 0;
    }
  }

  // Normalize values: scaled to [0, 10]
  const normValues = {};
  let maxValue = 0;
  for (const k of VALUE_KEYS) {
    const val = profile.values[k] || 0;
    if (val > maxValue) maxValue = val;
  }

  for (const k of VALUE_KEYS) {
    const raw = profile.values[k] || 0;
    normValues[k] =
      maxValue > 0
        ? Math.round((Math.max(0, raw) / maxValue) * 10 * 10) / 10
        : 0;
  }

  return {
    interests: normInterests,
    workstyle: normWorkstyle,
    values: normValues,
    evidenceCounts: { ...profile.evidenceCounts },
    answeredIds: [...profile.answeredIds],
    history: [...profile.history],
  };
}

/**
 * Pure function: computes confidence (0.0 to 1.0) per profile dimension
 * based on the number of evidence points gathered.
 * 3+ pieces of evidence yields full 1.0 confidence.
 */
export function confidence(profile) {
  const result = {};

  for (const k of ALL_PROFILE_KEYS) {
    const count = profile.evidenceCounts[k] || 0;
    const conf = Math.min(1.0, count / 3);
    result[k] = Math.round(conf * 100) / 100;
  }

  return result;
}
