import { z } from "zod";

// RIASEC dimensions
export const RIASEC_KEYS = ["R", "I", "A", "S", "E", "C"];

// Workstyle dimensions (-1 to +1)
export const WORKSTYLE_KEYS = [
  "independent_vs_team",
  "structured_vs_flexible",
  "practical_vs_conceptual",
  "lead_vs_support",
];

// Values
export const VALUE_KEYS = [
  "stability",
  "growth",
  "independence",
  "creativity",
  "impact",
  "recognition",
  "balance",
  "learning",
];

// Combined profile dimensions
export const ALL_PROFILE_KEYS = [
  ...RIASEC_KEYS,
  ...WORKSTYLE_KEYS,
  ...VALUE_KEYS,
];

// Audience Segments (Fix B)
export const SEGMENT_KEYS = [
  "class_6_8",
  "class_9_10",
  "class_11_12",
  "undergrad",
  "postgrad",
];

export const SEGMENT_LABELS = {
  class_6_8: "Middle School (Class 6 - 8)",
  class_9_10: "Secondary School (Class 9 - 10)",
  class_11_12: "Senior Secondary (Class 11 - 12)",
  undergrad: "Undergraduate / College",
  postgrad: "Postgraduate & Early Career",
};

// Interview Sections in fixed order (Fix B)
export const SECTION_KEYS = [
  "about_you",
  "likes_dislikes",
  "work_style",
  "best_at",
  "values",
];

export const SECTION_TITLES = {
  about_you: "About You",
  likes_dislikes: "Likes & Dislikes",
  work_style: "How You Like to Work",
  best_at: "What You Are Best At",
  values: "What Matters to You",
};

export const SECTION_BUDGETS = {
  about_you: 3,
  likes_dislikes: 5,
  work_style: 4,
  best_at: 5,
  values: 3,
};

export const TOTAL_QUESTION_BUDGET = Object.values(SECTION_BUDGETS).reduce(
  (acc, val) => acc + val,
  0
); // 20 questions

// Option weights: sparse map over the profile space
export const OptionWeightsSchema = z.record(z.string(), z.number());

// Question option schema
export const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  weights: OptionWeightsSchema,
});

// Question schema (Fix B: segment array and section string)
export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  format: z
    .enum(["single_choice", "preference_comparison", "objective_challenge"])
    .default("single_choice"),
  options: z.array(QuestionOptionSchema).min(3).max(4),
  category: z
    .enum(["interest", "workstyle", "values", "situational", "strength_challenge", "about"])
    .default("interest"),
  tags: z.array(z.string()).default([]),
  followupTags: z.array(z.string()).default([]),
  segment: z.array(z.string()),
  section: z.enum(["about_you", "likes_dislikes", "work_style", "best_at", "values"]),
  educationLevel: z.union([z.string(), z.array(z.string())]).optional(),
  isMiniChallenge: z.boolean().optional(),
  validated: z.boolean().default(false),
});

// Profile history item
export const ProfileHistoryItemSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
  probeType: z.string(),
  reason: z.string(),
});

// Evidence counts schema
export const EvidenceCountsSchema = z.record(z.string(), z.number());

// Student Profile schema (Fix B & C: segment, onboarding metadata, and sectionSummaries)
export const ProfileSchema = z.object({
  segment: z
    .enum(["class_6_8", "class_9_10", "class_11_12", "undergrad", "postgrad"])
    .default("undergrad"),
  name: z.string().optional(),
  age: z.number().nullable().optional(),
  streamOrCourse: z.string().optional(),
  parentalConsent: z.boolean().optional(),
  interests: z.record(z.string(), z.number()),
  workstyle: z.record(z.string(), z.number()),
  values: z.record(z.string(), z.number()),
  evidenceCounts: EvidenceCountsSchema,
  answeredIds: z.array(z.string()),
  history: z.array(ProfileHistoryItemSchema),
  sectionSummaries: z.record(z.string(), z.string()).optional(),
});

// Career definition matching Step 2 & Fix B specs
export const CareerSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  description: z.string(),
  vector: z.record(z.string(), z.number()),
  requiredDegrees: z.array(z.string()).default([]),
  entryPathways: z.array(z.string()).default([]),
  entranceExams: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  relatedCareerIds: z.array(z.string()).default([]),
  segments: z.array(z.string()).default(["undergrad", "postgrad"]),
  isDirection: z.boolean().optional(),
});

// Career Match Evidence
export const MatchEvidenceSchema = z.object({
  topContributors: z.array(z.string()),
  mismatches: z.array(z.string()),
});

// Career Match Result
export const MatchResultSchema = z.object({
  career: CareerSchema,
  fitIndex: z.number(), // Deterministic 0-100 score (never a probability)
  overallScore: z.number().optional(), // Alias for fitIndex
  interestMatch: z.number().optional(),
  workstyleMatch: z.number().optional(),
  valueMatch: z.number().optional(),
  evidence: MatchEvidenceSchema,
  topStrengths: z.array(z.string()).optional(),
  growthAreas: z.array(z.string()).optional(),
});

// Gemini Selection Schema (Step 5, Tolerant Validation with Coercion & Trimming)
export const GeminiSelectionSchema = z
  .object({
    questionId: z.coerce.string().trim(),
    probeType: z
      .preprocess(
        (val) => String(val || "").trim().toLowerCase(),
        z.enum(["deep", "cross", "challenge", "universal"]).or(z.string())
      )
      .default("deep"),
    reason: z
      .coerce.string()
      .trim()
      .min(1)
      .default("Exploring how this connects to your authentic career alignment."),
    emergingInterest: z.coerce.string().trim().optional(),
  })
  .passthrough();

export const GrokSelectionSchema = GeminiSelectionSchema;

// Gemini Report Schema (Step 7, Tolerant Validation with Coercion & Trimming)
export const CareerExplanationSchema = z
  .object({
    careerId: z.coerce.string().trim(),
    why: z.coerce.string().trim().default("Strong baseline compatibility."),
    watchOut: z
      .coerce.string()
      .trim()
      .default("Demands continuous dedication and personal adaptation."),
  })
  .passthrough();

export const ReportSchema = z
  .object({
    summary: z.coerce.string().trim(),
    strengths: z
      .preprocess(
        (val) =>
          Array.isArray(val)
            ? val.map((v) => String(v).trim()).filter(Boolean)
            : [String(val || "").trim()].filter(Boolean),
        z.array(z.string())
      )
      .default([]),
    workStyle: z
      .coerce.string()
      .trim()
      .default("Balanced between independent focus and cross-functional team initiatives."),
    values: z
      .coerce.string()
      .trim()
      .default("Anchored in sustainable career growth and purposeful engagement."),
    careerExplanations: z.array(CareerExplanationSchema).default([]),
    unsureAbout: z
      .preprocess(
        (val) =>
          Array.isArray(val)
            ? val.map((v) => String(v).trim()).filter(Boolean)
            : [String(val || "").trim()].filter(Boolean),
        z.array(z.string())
      )
      .default([]),
    nextSteps: z
      .preprocess(
        (val) =>
          Array.isArray(val)
            ? val.map((v) => String(v).trim()).filter(Boolean)
            : [String(val || "").trim()].filter(Boolean),
        z.array(z.string())
      )
      .default([]),
  })
  .passthrough();

// User Address Schema
export const UserAddressSchema = z
  .object({
    city: z.coerce.string().trim().default(""),
    state: z.coerce.string().trim().default(""),
    pincode: z.coerce.string().trim().default(""),
    country: z.coerce.string().trim().default("India"),
  })
  .passthrough();

// User Profile Schema
export const UserProfileSchema = z
  .object({
    name: z.coerce.string().trim().default(""),
    age: z
      .preprocess(
        (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
        z.number().nullable()
      )
      .default(null),
    segment: z.coerce.string().trim().optional(),
    streamOrCourse: z.coerce.string().trim().optional(),
    parentalConsent: z.boolean().optional(),
    classLevel: z.coerce.string().trim().default(""),
    highestEducation: z.coerce.string().trim().default(""),
    institution: z.coerce.string().trim().default(""),
    stream: z.coerce.string().trim().default(""),
    address: UserAddressSchema.optional(),
    city: z.coerce.string().trim().optional(),
    state: z.coerce.string().trim().optional(),
    pincode: z.coerce.string().trim().optional(),
    country: z.coerce.string().trim().optional(),
    aspirations: z.coerce.string().trim().default(""),
  })
  .passthrough();

// Sign Up Schema
export const SignUpSchema = z
  .object({
    email: z.string().trim().email("Please provide a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    name: z.coerce.string().trim().optional(),
    age: z
      .preprocess(
        (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
        z.number().nullable()
      )
      .optional(),
    classLevel: z.coerce.string().trim().optional(),
    highestEducation: z.coerce.string().trim().optional(),
    institution: z.coerce.string().trim().optional(),
    stream: z.coerce.string().trim().optional(),
    city: z.coerce.string().trim().optional(),
    state: z.coerce.string().trim().optional(),
    pincode: z.coerce.string().trim().optional(),
    country: z.coerce.string().trim().optional(),
    aspirations: z.coerce.string().trim().optional(),
  })
  .passthrough();

// Sign In Schema
export const SignInSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required."),
  })
  .passthrough();

