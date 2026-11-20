const fs = require("fs");
const path = require("path");
const { z } = require("zod");

// Helper to count words (excluding punctuation, trimming spaces)
function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).length;
}

// Zod schemas matching types.js
const OptionWeightsSchema = z.record(z.string(), z.number());
const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  weights: OptionWeightsSchema,
});
const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  format: z.enum(["single_choice", "preference_comparison", "objective_challenge"]),
  options: z.array(QuestionOptionSchema).min(3).max(4),
  category: z.enum(["interest", "workstyle", "values", "situational", "strength_challenge", "about"]),
  tags: z.array(z.string()),
  followupTags: z.array(z.string()),
  segment: z.array(z.string()),
  section: z.enum(["about_you", "likes_dislikes", "work_style", "best_at", "values"]),
  isMiniChallenge: z.boolean().optional(),
  validated: z.boolean(),
});

const CareerSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  description: z.string(),
  vector: z.record(z.string(), z.number()),
  requiredDegrees: z.array(z.string()),
  entryPathways: z.array(z.string()),
  entranceExams: z.array(z.string()),
  challenges: z.array(z.string()),
  relatedCareerIds: z.array(z.string()),
  segments: z.array(z.string()),
  isDirection: z.boolean().optional(),
});

// Build 92 high-quality questions
const questions = [
  // =========================================================================
  // SECTION 1: ABOUT YOU (about_you) - Budget: 3
  // =========================================================================

  // class_6_8 (About You)
  {
    id: "ay_68_01",
    text: "Which school class are you studying in right now?",
    format: "single_choice",
    category: "about",
    tags: ["class_level"],
    followupTags: ["middle_school"],
    segment: ["class_6_8"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_68_01_a", label: "🎒 Class 6", weights: { learning: 1 } },
      { id: "ay_68_01_b", label: "🎒 Class 7", weights: { learning: 1 } },
      { id: "ay_68_01_c", label: "🎒 Class 8", weights: { learning: 1 } },
      { id: "ay_68_01_d", label: "🎒 New middle schooler", weights: { learning: 1 } }
    ]
  },
  {
    id: "ay_68_02",
    text: "When you grow up, what sounds most exciting?",
    format: "single_choice",
    category: "interest",
    tags: ["future_curiosity"],
    followupTags: ["tech", "creative", "helping"],
    segment: ["class_6_8"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_68_02_a", label: "🚀 Building space rockets", weights: { R: 2, I: 1 } },
      { id: "ay_68_02_b", label: "🎨 Painting animated games", weights: { A: 2, creativity: 1 } },
      { id: "ay_68_02_c", label: "🩺 Curing sick patients", weights: { S: 2, impact: 1 } },
      { id: "ay_68_02_d", label: "💼 Running my shop", weights: { E: 2, growth: 1 } }
    ]
  },
  {
    id: "ay_68_03",
    text: "What do you enjoy reading or watching most?",
    format: "single_choice",
    category: "interest",
    tags: ["media_preference"],
    followupTags: ["science", "art", "nature"],
    segment: ["class_6_8"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_68_03_a", label: "🔬 Space science wonders", weights: { I: 2, learning: 1 } },
      { id: "ay_68_03_b", label: "🎨 Drawing craft tricks", weights: { A: 2, creativity: 1 } },
      { id: "ay_68_03_c", label: "⚽ Sports player stories", weights: { R: 1, E: 1 } },
      { id: "ay_68_03_d", label: "🐾 Wild animal adventures", weights: { S: 1, I: 1 } }
    ]
  },
  {
    id: "ay_68_04",
    text: "How much do you already know about future jobs?",
    format: "single_choice",
    category: "about",
    tags: ["career_awareness"],
    followupTags: ["discovery"],
    segment: ["class_6_8"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_68_04_a", label: "✨ Just starting exploration", weights: { learning: 1 } },
      { id: "ay_68_04_b", label: "💡 Know doctor engineer", weights: { R: 1, I: 1 } },
      { id: "ay_68_04_c", label: "🎯 Have clear dream", weights: { E: 1, independence: 1 } },
      { id: "ay_68_04_d", label: "🔍 Curious about all", weights: { learning: 2 } }
    ]
  },

  // class_9_10 (About You)
  {
    id: "ay_910_01",
    text: "Which Class 11 stream interests you most right now?",
    format: "single_choice",
    category: "about",
    tags: ["stream_awareness"],
    followupTags: ["science", "commerce", "arts"],
    segment: ["class_9_10"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_910_01_a", label: "📐 Science with Maths", weights: { I: 2, R: 1 } },
      { id: "ay_910_01_b", label: "🧬 Science with Biology", weights: { I: 2, S: 1 } },
      { id: "ay_910_01_c", label: "📊 Commerce and Accounts", weights: { C: 2, E: 1 } },
      { id: "ay_910_01_d", label: "📚 Humanities and Arts", weights: { A: 2, S: 1 } }
    ]
  },
  {
    id: "ay_910_02",
    text: "How sure are you about choosing your stream?",
    format: "single_choice",
    category: "about",
    tags: ["stream_certainty"],
    followupTags: ["decisiveness"],
    segment: ["class_9_10"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_910_02_a", label: "🎯 Very clear decided", weights: { structured_vs_flexible: -0.6 } },
      { id: "ay_910_02_b", label: "⚖️ Confused between two", weights: { structured_vs_flexible: 0.4 } },
      { id: "ay_910_02_c", label: "🔍 Open to guidance", weights: { learning: 2 } },
      { id: "ay_910_02_d", label: "🤔 Still completely unsure", weights: { independence: 1 } }
    ]
  },
  {
    id: "ay_910_03",
    text: "Outside school books, what topic grabs your curiosity most?",
    format: "single_choice",
    category: "interest",
    tags: ["informal_learning"],
    followupTags: ["tech", "business", "arts"],
    segment: ["class_9_10"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_910_03_a", label: "💻 Computer coding apps", weights: { R: 2, I: 1 } },
      { id: "ay_910_03_b", label: "📈 Business ideas startups", weights: { E: 2, growth: 1 } },
      { id: "ay_910_03_c", label: "🎭 Creative filmmaking music", weights: { A: 2, creativity: 1 } },
      { id: "ay_910_03_d", label: "🌍 Social issues politics", weights: { S: 2, I: 1 } }
    ]
  },
  {
    id: "ay_910_04",
    text: "Which future lifestyle matters most when you imagine working?",
    format: "single_choice",
    category: "values",
    tags: ["early_values"],
    followupTags: ["lifestyle"],
    segment: ["class_9_10"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_910_04_a", label: "🏆 Famous admired leader", weights: { recognition: 2, E: 1 } },
      { id: "ay_910_04_b", label: "🛡️ Stable secure life", weights: { stability: 2, C: 1 } },
      { id: "ay_910_04_c", label: "🕊️ Creative travel freedom", weights: { independence: 2, A: 1 } },
      { id: "ay_910_04_d", label: "🤝 Helping needy society", weights: { impact: 2, S: 1 } }
    ]
  },

  // class_11_12 (About You)
  {
    id: "ay_1112_01",
    text: "Which academic stream are you studying in school?",
    format: "single_choice",
    category: "about",
    tags: ["stream"],
    followupTags: ["current_study"],
    segment: ["class_11_12"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_1112_01_a", label: "Science with PCM", weights: { R: 2, I: 1 } },
      { id: "ay_1112_01_b", label: "Science with Biology", weights: { I: 2, S: 1 } },
      { id: "ay_1112_01_c", label: "Commerce with Maths", weights: { C: 2, E: 1 } },
      { id: "ay_1112_01_d", label: "Humanities or Arts", weights: { A: 2, S: 1 } }
    ]
  },
  {
    id: "ay_1112_02",
    text: "Which national entrance exam are you considering or prepping?",
    format: "single_choice",
    category: "about",
    tags: ["entrance_exams"],
    followupTags: ["exam_targets"],
    segment: ["class_11_12"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_1112_02_a", label: "JEE Main BITSAT", weights: { R: 2, I: 1 } },
      { id: "ay_1112_02_b", label: "NEET Medical entrances", weights: { I: 2, S: 1 } },
      { id: "ay_1112_02_c", label: "CUET IPMAT CA", weights: { E: 2, C: 1 } },
      { id: "ay_1112_02_d", label: "CLAT NID Design", weights: { A: 2, S: 1 } }
    ]
  },
  {
    id: "ay_1112_03",
    text: "How open are you to careers outside engineering medicine?",
    format: "single_choice",
    category: "about",
    tags: ["alternative_openness"],
    followupTags: ["unconventional"],
    segment: ["class_11_12"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_1112_03_a", label: "Fully focused engineering medicine", weights: { structured_vs_flexible: -0.6, stability: 1 } },
      { id: "ay_1112_03_b", label: "Excited for emerging tech", weights: { I: 1, learning: 2 } },
      { id: "ay_1112_03_c", label: "Drawn to design media", weights: { A: 2, creativity: 1 } },
      { id: "ay_1112_03_d", label: "Interested in finance management", weights: { E: 2, growth: 1 } }
    ]
  },
  {
    id: "ay_1112_04",
    text: "What drives your career discovery journey most right now?",
    format: "single_choice",
    category: "values",
    tags: ["motivation"],
    followupTags: ["goals"],
    segment: ["class_11_12"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_1112_04_a", label: "High financial earning potential", weights: { growth: 2, E: 1 } },
      { id: "ay_1112_04_b", label: "Finding my true talent", weights: { learning: 2, I: 1 } },
      { id: "ay_1112_04_c", label: "Long-term job stability security", weights: { stability: 2, C: 1 } },
      { id: "ay_1112_04_d", label: "Creative independence and autonomy", weights: { independence: 2, A: 1 } }
    ]
  },

  // undergrad (About You)
  {
    id: "ay_ug_01",
    text: "What college degree are you currently pursuing?",
    format: "single_choice",
    category: "about",
    tags: ["college_degree"],
    followupTags: ["undergrad"],
    segment: ["undergrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_ug_01_a", label: "BTech, BE, or BCA", weights: { R: 2, I: 1 } },
      { id: "ay_ug_01_b", label: "BCom, BBA, or Economics", weights: { E: 2, C: 1 } },
      { id: "ay_ug_01_c", label: "BSc, MBBS, Allied Health", weights: { I: 2, S: 1 } },
      { id: "ay_ug_01_d", label: "BA, Law, or Design", weights: { A: 2, S: 1 } }
    ]
  },
  {
    id: "ay_ug_02",
    text: "How satisfied are you with your college branch?",
    format: "single_choice",
    category: "about",
    tags: ["branch_satisfaction"],
    followupTags: ["pivot"],
    segment: ["undergrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_ug_02_a", label: "Love it, want specialization", weights: { learning: 2, I: 1 } },
      { id: "ay_ug_02_b", label: "Decent, exploring alternate paths", weights: { E: 1, A: 1 } },
      { id: "ay_ug_02_c", label: "Eager to pivot completely", weights: { E: 2, growth: 1 } },
      { id: "ay_ug_02_d", label: "Uncertain, seeking internship clarity", weights: { structured_vs_flexible: 0.6 } }
    ]
  },
  {
    id: "ay_ug_03",
    text: "Which college internship experience attracts you most?",
    format: "single_choice",
    category: "interest",
    tags: ["internship_preference"],
    followupTags: ["workplace"],
    segment: ["undergrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_ug_03_a", label: "Tech product engineering team", weights: { R: 1, I: 1, learning: 1 } },
      { id: "ay_ug_03_b", label: "Financial consulting corporate analyst", weights: { E: 1, C: 1, growth: 1 } },
      { id: "ay_ug_03_c", label: "Design studio creative agency", weights: { A: 2, creativity: 1 } },
      { id: "ay_ug_03_d", label: "Research institute policy thinktank", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "ay_ug_04",
    text: "What is your main post-college graduation priority?",
    format: "single_choice",
    category: "values",
    tags: ["graduation_priority"],
    followupTags: ["immediate_next"],
    segment: ["undergrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_ug_04_a", label: "High-paying campus placement offer", weights: { growth: 2, stability: 1 } },
      { id: "ay_ug_04_b", label: "Masters, CAT, or GATE", weights: { learning: 2, I: 1 } },
      { id: "ay_ug_04_c", label: "Starting an entrepreneur venture", weights: { E: 2, independence: 2 } },
      { id: "ay_ug_04_d", label: "UPSC or public services", weights: { impact: 2, recognition: 1 } }
    ]
  },

  // postgrad (About You)
  {
    id: "ay_pg_01",
    text: "What is your current postgraduate or work status?",
    format: "single_choice",
    category: "about",
    tags: ["postgrad_status"],
    followupTags: ["career_stage"],
    segment: ["postgrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_pg_01_a", label: "Enrolled in MBA Masters", weights: { learning: 1, E: 1 } },
      { id: "ay_pg_01_b", label: "Working professional planning transition", weights: { growth: 2, independence: 1 } },
      { id: "ay_pg_01_c", label: "Doctorate PhD research fellow", weights: { I: 2, learning: 2 } },
      { id: "ay_pg_01_d", label: "Founder or team lead", weights: { E: 2, lead_vs_support: -0.6 } }
    ]
  },
  {
    id: "ay_pg_02",
    text: "What trigger makes you evaluate your career direction?",
    format: "single_choice",
    category: "about",
    tags: ["transition_trigger"],
    followupTags: ["motivation"],
    segment: ["postgrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_pg_02_a", label: "Growth plateau in role", weights: { growth: 2, learning: 1 } },
      { id: "ay_pg_02_b", label: "Desire to switch industry", weights: { structured_vs_flexible: 0.8 } },
      { id: "ay_pg_02_c", label: "Burnout, needing balance", weights: { balance: 2, stability: 1 } },
      { id: "ay_pg_02_d", label: "Wanting meaningful social impact", weights: { impact: 2, S: 1 } }
    ]
  },
  {
    id: "ay_pg_03",
    text: "Between specialist mastery and executive management, you prefer:",
    format: "single_choice",
    category: "workstyle",
    tags: ["career_track"],
    followupTags: ["leadership"],
    segment: ["postgrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_pg_03_a", label: "Deep individual contributor specialist", weights: { I: 2, lead_vs_support: 0.7 } },
      { id: "ay_pg_03_b", label: "People manager driving teams", weights: { E: 2, lead_vs_support: -0.7 } },
      { id: "ay_pg_03_c", label: "Executive owning business metrics", weights: { E: 2, C: 1 } },
      { id: "ay_pg_03_d", label: "Boutique consultant or advisor", weights: { independence: 2, A: 1 } }
    ]
  },
  {
    id: "ay_pg_04",
    text: "How much risk can you take next?",
    format: "single_choice",
    category: "values",
    tags: ["risk_tolerance"],
    followupTags: ["tradeoff"],
    segment: ["postgrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_pg_04_a", label: "High risk high equity", weights: { growth: 2, stability: -1 } },
      { id: "ay_pg_04_b", label: "Moderate risk in scaleups", weights: { growth: 1, learning: 1 } },
      { id: "ay_pg_04_c", label: "Low risk predictable salary", weights: { stability: 2, balance: 1 } },
      { id: "ay_pg_04_d", label: "Self-funded solo autonomy", weights: { independence: 2, creativity: 1 } }
    ]
  },

  // =========================================================================
  // SECTION 2: LIKES & DISLIKES (likes_dislikes) - Budget: 5
  // =========================================================================

  // class_6_8 (Likes & Dislikes)
  {
    id: "ld_68_01",
    text: "Which school subject makes time fly fastest?",
    format: "single_choice",
    category: "interest",
    tags: ["subject_favorite"],
    followupTags: ["math", "science", "art"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_01_a", label: "🔬 Science lab experiments", weights: { I: 2, R: 1 } },
      { id: "ld_68_01_b", label: "📐 Maths numbers geometry", weights: { I: 2, C: 1 } },
      { id: "ld_68_01_c", label: "🎨 Drawing and music", weights: { A: 2, creativity: 1 } },
      { id: "ld_68_01_d", label: "📖 English story drama", weights: { A: 1, S: 1 } }
    ]
  },
  {
    id: "ld_68_02",
    text: "On a rainy holiday, what would you dislike?",
    format: "single_choice",
    category: "interest",
    tags: ["dislikes"],
    followupTags: ["aversion"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_02_a", label: "🥱 Memorizing history dates", weights: { I: -1, learning: 1 } },
      { id: "ld_68_02_b", label: "🥱 Sitting silently alone", weights: { S: 1, independent_vs_team: 0.6 } },
      { id: "ld_68_02_c", label: "🥱 Cleaning tidy shelves", weights: { C: -1, creativity: 1 } },
      { id: "ld_68_02_d", label: "🥱 Solving tricky worksheets", weights: { I: -1, A: 1 } }
    ]
  },
  {
    id: "ld_68_03",
    text: "Which weekend hobby brings you purest joy?",
    format: "single_choice",
    category: "interest",
    tags: ["hobbies"],
    followupTags: ["play"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_03_a", label: "🧩 Building Lego models", weights: { R: 2, I: 1 } },
      { id: "ld_68_03_b", label: "✍️ Drawing comic stories", weights: { A: 2, creativity: 1 } },
      { id: "ld_68_03_c", label: "🎪 Organizing fun games", weights: { E: 2, S: 1 } },
      { id: "ld_68_03_d", label: "🌿 Caring garden plants", weights: { S: 1, R: 1 } }
    ]
  },
  {
    id: "ld_68_04",
    text: "On a school exhibition chart, what is your role?",
    format: "single_choice",
    category: "interest",
    tags: ["school_projects"],
    followupTags: ["roles"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_04_a", label: "🖌️ Coloring drawings borders", weights: { A: 2 } },
      { id: "ld_68_04_b", label: "🔍 Finding science facts", weights: { I: 2 } },
      { id: "ld_68_04_c", label: "🗣️ Explaining to visitors", weights: { E: 2, S: 1 } },
      { id: "ld_68_04_d", label: "✂️ Cutting pasting cardboard", weights: { R: 2, C: 1 } }
    ]
  },
  {
    id: "ld_68_05",
    text: "Which museum hall sounds most fun to visit?",
    format: "single_choice",
    category: "interest",
    tags: ["field_trips"],
    followupTags: ["curiosity"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_05_a", label: "🤖 Robots flight simulator", weights: { R: 2, I: 1 } },
      { id: "ld_68_05_b", label: "🦕 Dinosaur fossil bones", weights: { I: 2 } },
      { id: "ld_68_05_c", label: "👑 Ancient royal costumes", weights: { A: 1, S: 1 } },
      { id: "ld_68_05_d", label: "💰 Coin bank history", weights: { C: 2, E: 1 } }
    ]
  },
  {
    id: "ld_68_06",
    text: "What do you do when feeling bored?",
    format: "single_choice",
    category: "interest",
    tags: ["boredom_relief"],
    followupTags: ["default_mode"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_06_a", label: "🔧 Dismantle broken pens", weights: { R: 2 } },
      { id: "ld_68_06_b", label: "📖 Read mystery comics", weights: { I: 1, A: 1 } },
      { id: "ld_68_06_c", label: "📱 Chat with friends", weights: { S: 2 } },
      { id: "ld_68_06_d", label: "🎮 Play strategy games", weights: { I: 1, C: 1 } }
    ]
  },

  // class_9_10 (Likes & Dislikes)
  {
    id: "ld_910_01",
    text: "Which homework task do you finish first?",
    format: "single_choice",
    category: "interest",
    tags: ["homework_ease"],
    followupTags: ["academic_fit"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_01_a", label: "🧮 Physics and algebra", weights: { I: 2, R: 1 } },
      { id: "ld_910_01_b", label: "🌱 Biology anatomy diagrams", weights: { I: 2, S: 1 } },
      { id: "ld_910_01_c", label: "📊 Economics commerce sheets", weights: { E: 2, C: 1 } },
      { id: "ld_910_01_d", label: "✍️ Languages and literature", weights: { A: 2, creativity: 1 } }
    ]
  },
  {
    id: "ld_910_02",
    text: "What academic task drains you fastest?",
    format: "single_choice",
    category: "interest",
    tags: ["academic_dislike"],
    followupTags: ["drain"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_02_a", label: "📑 Writing repetitive essays", weights: { A: -1, R: 1 } },
      { id: "ld_910_02_b", label: "🔢 Complex algebra steps", weights: { I: -1, C: -1 } },
      { id: "ld_910_02_c", label: "🗣️ Public stage speaking", weights: { E: -1, independent_vs_team: -0.6 } },
      { id: "ld_910_02_d", label: "🧪 Memorizing chemistry formulas", weights: { I: -1, S: 1 } }
    ]
  },
  {
    id: "ld_910_03",
    text: "If choosing an elective subject, which one wins?",
    format: "single_choice",
    category: "interest",
    tags: ["elective_choice"],
    followupTags: ["stream_signals"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_03_a", label: "💻 Computer coding basics", weights: { R: 2, I: 1 } },
      { id: "ld_910_03_b", label: "📈 Commercial studies marketing", weights: { E: 2, C: 1 } },
      { id: "ld_910_03_c", label: "🎨 Graphic design animation", weights: { A: 2, creativity: 1 } },
      { id: "ld_910_03_d", label: "🧬 Environmental sciences", weights: { I: 1, S: 2 } }
    ]
  },
  {
    id: "ld_910_04",
    text: "Which online content do you watch most?",
    format: "single_choice",
    category: "interest",
    tags: ["content_consumption"],
    followupTags: ["curiosity"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_04_a", label: "🛠️ Tech PC builds", weights: { R: 2, I: 1 } },
      { id: "ld_910_04_b", label: "💼 Startup business stories", weights: { E: 2, growth: 1 } },
      { id: "ld_910_04_c", label: "🎨 Cinematic visual edits", weights: { A: 2, creativity: 1 } },
      { id: "ld_910_04_d", label: "🔍 History crime documentaries", weights: { S: 1, I: 2 } }
    ]
  },
  {
    id: "ld_910_05",
    text: "During a school event, what team would you join?",
    format: "single_choice",
    category: "interest",
    tags: ["school_event"],
    followupTags: ["contribution"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_05_a", label: "🎤 Stage anchor host", weights: { E: 2, S: 1 } },
      { id: "ld_910_05_b", label: "🎛️ Stage sound lighting", weights: { R: 2, C: 1 } },
      { id: "ld_910_05_c", label: "🎨 Posters stage decor", weights: { A: 2 } },
      { id: "ld_910_05_d", label: "📋 Ticketing and budget", weights: { C: 2, E: 1 } }
    ]
  },
  {
    id: "ld_910_06",
    text: "Which future workplace sounds totally unappealing?",
    format: "single_choice",
    category: "workstyle",
    tags: ["workplace_aversion"],
    followupTags: ["workstyle"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_06_a", label: "🏥 Stressful hospital ward", weights: { S: -1, balance: 1 } },
      { id: "ld_910_06_b", label: "🏢 Repetitive data cubicle", weights: { C: -2, creativity: 1 } },
      { id: "ld_910_06_c", label: "🏭 Noisy machine factory", weights: { R: -2, I: 1 } },
      { id: "ld_910_06_d", label: "💼 Cold sales calling", weights: { E: -2, independence: 1 } }
    ]
  },

  // class_11_12 (Likes & Dislikes)
  {
    id: "ld_1112_01",
    text: "When studying your syllabus, which chapters feel exciting?",
    format: "single_choice",
    category: "interest",
    tags: ["stream_topics"],
    followupTags: ["aptitude"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_01_a", label: "Derivations and numerical proofs", weights: { I: 2, R: 1 } },
      { id: "ld_1112_01_b", label: "Biological systems physiology", weights: { I: 2, S: 1 } },
      { id: "ld_1112_01_c", label: "Financial accounting balances", weights: { C: 2, E: 1 } },
      { id: "ld_1112_01_d", label: "Constitutional and social theories", weights: { S: 1, A: 2 } }
    ]
  },
  {
    id: "ld_1112_02",
    text: "Which academic task frustrates you most?",
    format: "single_choice",
    category: "interest",
    tags: ["frustration_type"],
    followupTags: ["dislike"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_02_a", label: "Rote memorization without logic", weights: { I: 2, practical_vs_conceptual: 0.6 } },
      { id: "ld_1112_02_b", label: "Theories with zero application", weights: { R: 2, practical_vs_conceptual: -0.6 } },
      { id: "ld_1112_02_c", label: "Strict unbending arbitrary rules", weights: { A: 2, independence: 2 } },
      { id: "ld_1112_02_d", label: "Endless unstructured verbal debates", weights: { C: 2, stability: 1 } }
    ]
  },
  {
    id: "ld_1112_03",
    text: "Which college club would you lead?",
    format: "single_choice",
    category: "interest",
    tags: ["club_choice"],
    followupTags: ["leadership"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_03_a", label: "Robotics and algorithmic coding", weights: { R: 2, I: 1 } },
      { id: "ld_1112_03_b", label: "Entrepreneurship and stock trading", weights: { E: 2, C: 1 } },
      { id: "ld_1112_03_c", label: "Dramatics arts and media", weights: { A: 2, creativity: 1 } },
      { id: "ld_1112_03_d", label: "Model United Nations debates", weights: { S: 1, E: 2 } }
    ]
  },
  {
    id: "ld_1112_04",
    text: "Which global challenge sounds most fascinating to tackle?",
    format: "single_choice",
    category: "interest",
    tags: ["global_problems"],
    followupTags: ["inquiry"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_04_a", label: "Clean energy electric mobility", weights: { R: 2, I: 1 } },
      { id: "ld_1112_04_b", label: "Genetic therapies eradicating disease", weights: { I: 2, S: 1 } },
      { id: "ld_1112_04_c", label: "Democratizing wealth via fintech", weights: { E: 2, C: 1 } },
      { id: "ld_1112_04_d", label: "Protecting privacy civil rights", weights: { S: 2, A: 1 } }
    ]
  },
  {
    id: "ld_1112_05",
    text: "Would you rather engineer hardware or software code?",
    format: "preference_comparison",
    category: "interest",
    tags: ["hardware_vs_software"],
    followupTags: ["tech_path"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_05_a", label: "Hands-on physical hardware circuits", weights: { R: 2, practical_vs_conceptual: -0.6 } },
      { id: "ld_1112_05_b", label: "Algorithmic software logic systems", weights: { I: 2, practical_vs_conceptual: 0.6 } },
      { id: "ld_1112_05_c", label: "Interactive user experience design", weights: { A: 2, creativity: 1 } },
      { id: "ld_1112_05_d", label: "Pitching tech to buyers", weights: { E: 2, growth: 1 } }
    ]
  },
  {
    id: "ld_1112_06",
    text: "How do you feel about competitive coaching institutes?",
    format: "single_choice",
    category: "workstyle",
    tags: ["coaching_pressure"],
    followupTags: ["pressure_tolerance"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_06_a", label: "Thrive in high-rank races", weights: { structured_vs_flexible: -0.5, growth: 1 } },
      { id: "ld_1112_06_b", label: "Prefer disciplined solo study", weights: { independent_vs_team: -0.7, balance: 1 } },
      { id: "ld_1112_06_c", label: "Suffocate under formula memorization", weights: { creativity: 2, independence: 2 } },
      { id: "ld_1112_06_d", label: "Learn best in discussions", weights: { independent_vs_team: 0.7, S: 1 } }
    ]
  },

  // undergrad & postgrad (Likes & Dislikes)
  {
    id: "ld_ug_01",
    text: "Which professional activity energizes you most?",
    format: "single_choice",
    category: "interest",
    tags: ["workday_energy"],
    followupTags: ["job_crafting"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_01_a", label: "Debugging complex architecture code", weights: { I: 2, R: 1 } },
      { id: "ld_ug_01_b", label: "Pitching deals closing clients", weights: { E: 2, growth: 1 } },
      { id: "ld_ug_01_c", label: "Designing clean UI systems", weights: { A: 2, creativity: 1 } },
      { id: "ld_ug_01_d", label: "Mentoring colleagues through blockers", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "ld_ug_02",
    text: "What workplace environment makes you want to leave?",
    format: "single_choice",
    category: "values",
    tags: ["workplace_friction"],
    followupTags: ["dealbreaker"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_02_a", label: "Toxic micromanagement zero autonomy", weights: { independence: 2, lead_vs_support: -0.5 } },
      { id: "ld_ug_02_b", label: "Unethical leadership ignoring safety", weights: { impact: 2, values: 1 } },
      { id: "ld_ug_02_c", label: "Stagnant compensation no growth", weights: { growth: 2, E: 1 } },
      { id: "ld_ug_02_d", label: "Constantly shifting chaotic goals", weights: { structured_vs_flexible: -0.8, stability: 1 } }
    ]
  },
  {
    id: "ld_ug_03",
    text: "Would you rather invent new products or optimize existing?",
    format: "preference_comparison",
    category: "interest",
    tags: ["optimization_vs_invention"],
    followupTags: ["innovation"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_03_a", label: "Inventing novel unproven concepts", weights: { creativity: 2, A: 1, I: 1 } },
      { id: "ld_ug_03_b", label: "Optimizing scale and efficiency", weights: { C: 2, R: 1, practical_vs_conceptual: -0.5 } },
      { id: "ld_ug_03_c", label: "Scaling commercial sales channels", weights: { E: 2, growth: 1 } },
      { id: "ld_ug_03_d", label: "Conducting scientific research trials", weights: { I: 2, S: 1 } }
    ]
  },
  {
    id: "ld_ug_04",
    text: "How do you handle ambiguous open-ended project briefs?",
    format: "single_choice",
    category: "workstyle",
    tags: ["ambiguity_tolerance"],
    followupTags: ["execution"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_04_a", label: "Love setting own roadmap", weights: { structured_vs_flexible: 0.8, lead_vs_support: -0.6 } },
      { id: "ld_ug_04_b", label: "Prefer clear target specifications", weights: { structured_vs_flexible: -0.8, C: 1 } },
      { id: "ld_ug_04_c", label: "Break it into data", weights: { I: 2, C: 1 } },
      { id: "ld_ug_04_d", label: "Brainstorm visual ideas collaboratively", weights: { A: 1, independent_vs_team: 0.7 } }
    ]
  },
  {
    id: "ld_ug_05",
    text: "Which industry vertical interests you most?",
    format: "single_choice",
    category: "interest",
    tags: ["industry_vertical"],
    followupTags: ["domain"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_05_a", label: "AI systems and cloud", weights: { I: 2, R: 1 } },
      { id: "ld_ug_05_b", label: "Fintech private equity investments", weights: { E: 2, C: 1 } },
      { id: "ld_ug_05_c", label: "Biotech health and diagnostics", weights: { S: 1, I: 2 } },
      { id: "ld_ug_05_d", label: "Consumer brands media gaming", weights: { A: 2, E: 1 } }
    ]
  },
  {
    id: "ld_ug_06",
    text: "What meeting types do you actively avoid?",
    format: "single_choice",
    category: "workstyle",
    tags: ["meeting_aversion"],
    followupTags: ["workstyle"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_06_a", label: "Diplomatic political alignment sessions", weights: { E: -1, independent_vs_team: -0.6 } },
      { id: "ld_ug_06_b", label: "Compliance audit line checks", weights: { C: -2, creativity: 1 } },
      { id: "ld_ug_06_c", label: "Abstract theory without execution", weights: { practical_vs_conceptual: -0.8, R: 1 } },
      { id: "ld_ug_06_d", label: "Aggressive cold sales pitching", weights: { E: -2, S: 1 } }
    ]
  },

  // =========================================================================
  // SECTION 3: HOW YOU LIKE TO WORK (work_style) - Budget: 4
  // =========================================================================

  // class_6_8 (How You Like to Work)
  {
    id: "ws_68_01",
    text: "When playing games, do you prefer team or solo?",
    format: "single_choice",
    category: "workstyle",
    tags: ["team_vs_solo"],
    followupTags: ["workstyle"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_01_a", label: "👥 Loud team with friends", weights: { independent_vs_team: 0.8, S: 1 } },
      { id: "ws_68_01_b", label: "👤 Quiet solo deep focus", weights: { independent_vs_team: -0.8, I: 1 } },
      { id: "ws_68_01_c", label: "🤝 One close trusted friend", weights: { independent_vs_team: 0.2, S: 1 } },
      { id: "ws_68_01_d", label: "👑 Leading and deciding rules", weights: { lead_vs_support: -0.8, E: 1 } }
    ]
  },
  {
    id: "ws_68_02",
    text: "Do you like strict timetables or free schedules?",
    format: "single_choice",
    category: "workstyle",
    tags: ["routine_vs_freedom"],
    followupTags: ["routine"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_02_a", label: "⏰ Fixed predictable daily hours", weights: { structured_vs_flexible: -0.8, C: 1 } },
      { id: "ws_68_02_b", label: "🎨 Total open schedule freedom", weights: { structured_vs_flexible: 0.8, A: 1 } },
      { id: "ws_68_02_c", label: "📝 Finishing work then playing", weights: { structured_vs_flexible: -0.3, stability: 1 } },
      { id: "ws_68_02_d", label: "⚡ Energetic bursts of work", weights: { structured_vs_flexible: 0.5, E: 1 } }
    ]
  },
  {
    id: "ws_68_03",
    text: "In group activities, do you speak or listen quietly?",
    format: "single_choice",
    category: "workstyle",
    tags: ["group_behavior"],
    followupTags: ["voice"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_03_a", label: "📢 Guide and speak first", weights: { lead_vs_support: -0.8, E: 1 } },
      { id: "ws_68_03_b", label: "👂 Listen quietly and execute", weights: { lead_vs_support: 0.8, C: 1 } },
      { id: "ws_68_03_c", label: "💡 Offer unexpected clever ideas", weights: { A: 1, I: 1 } },
      { id: "ws_68_03_d", label: "🤝 Ensure everyone feels included", weights: { S: 2 } }
    ]
  },
  {
    id: "ws_68_04",
    text: "Would you rather build physical models or hear stories?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["hands_on_vs_listening"],
    followupTags: ["learning_style"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_04_a", label: "🛠️ Hands-on physical construction", weights: { practical_vs_conceptual: -0.8, R: 2 } },
      { id: "ws_68_04_b", label: "📖 Hearing imaginative adventure stories", weights: { practical_vs_conceptual: 0.8, A: 1 } },
      { id: "ws_68_04_c", label: "📊 Organizing facts into charts", weights: { practical_vs_conceptual: -0.2, C: 1 } },
      { id: "ws_68_04_d", label: "🎭 Acting roles with classmates", weights: { practical_vs_conceptual: 0.4, S: 1 } }
    ]
  },
  {
    id: "ws_68_05",
    text: "When stuck on difficult homework, how do you solve it?",
    format: "single_choice",
    category: "workstyle",
    tags: ["problem_solving"],
    followupTags: ["resilience"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_05_a", label: "🙋 Ask teacher or parent", weights: { S: 1, independent_vs_team: 0.6 } },
      { id: "ws_68_05_b", label: "🧠 Think alone until solved", weights: { I: 2, independent_vs_team: -0.7 } },
      { id: "ws_68_05_c", label: "📱 Search video guides online", weights: { R: 1, learning: 1 } },
      { id: "ws_68_05_d", label: "⏭️ Try another problem instead", weights: { structured_vs_flexible: 0.5 } }
    ]
  },

  // class_9_10 (How You Like to Work)
  {
    id: "ws_910_01",
    text: "Do you study best in silence or with friends?",
    format: "single_choice",
    category: "workstyle",
    tags: ["study_mode"],
    followupTags: ["solitary_vs_group"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_01_a", label: "🎧 Complete quiet solo focus", weights: { independent_vs_team: -0.8, I: 1 } },
      { id: "ws_910_01_b", label: "🗣️ Active lively group quizzing", weights: { independent_vs_team: 0.8, S: 1 } },
      { id: "ws_910_01_c", label: "🎵 Background music while working", weights: { independent_vs_team: -0.3, A: 1 } },
      { id: "ws_910_01_d", label: "👥 Explaining concepts to peers", weights: { lead_vs_support: -0.6, S: 2 } }
    ]
  },
  {
    id: "ws_910_02",
    text: "When facing a school assignment, how do you work?",
    format: "single_choice",
    category: "workstyle",
    tags: ["time_management"],
    followupTags: ["planning"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_02_a", label: "📅 Planned advance schedule", weights: { structured_vs_flexible: -0.8, C: 2 } },
      { id: "ws_910_02_b", label: "⚡ Energetic last-night sprint", weights: { structured_vs_flexible: 0.8, E: 1 } },
      { id: "ws_910_02_c", label: "🎯 Steady daily pacing", weights: { structured_vs_flexible: -0.4, stability: 1 } },
      { id: "ws_910_02_d", label: "🎨 Perfecting aesthetic design", weights: { A: 2, creativity: 1 } }
    ]
  },
  {
    id: "ws_910_03",
    text: "If project teammates argue, how do you handle it?",
    format: "single_choice",
    category: "workstyle",
    tags: ["conflict_style"],
    followupTags: ["team_dynamics"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_03_a", label: "⚖️ Mediate calmly for compromise", weights: { S: 2, lead_vs_support: 0.2 } },
      { id: "ws_910_03_b", label: "🎯 Decide firmly and direct", weights: { lead_vs_support: -0.8, E: 2 } },
      { id: "ws_910_03_c", label: "🚶 Step aside and execute", weights: { independent_vs_team: -0.6, lead_vs_support: 0.8 } },
      { id: "ws_910_03_d", label: "📊 Reference objective logic facts", weights: { I: 2, C: 1 } }
    ]
  },
  {
    id: "ws_910_04",
    text: "Do you prefer exact rubrics or creative freedom?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["instruction_style"],
    followupTags: ["structure"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_04_a", label: "📋 Clear grading criteria", weights: { structured_vs_flexible: -0.8, C: 1 } },
      { id: "ws_910_04_b", label: "🚀 Wide creative liberty", weights: { structured_vs_flexible: 0.8, A: 2 } },
      { id: "ws_910_04_c", label: "🧪 Testing new hypotheses", weights: { I: 2, practical_vs_conceptual: 0.3 } },
      { id: "ws_910_04_d", label: "🛠️ Real physical mechanics", weights: { R: 2, practical_vs_conceptual: -0.8 } }
    ]
  },
  {
    id: "ws_910_05",
    text: "How comfortable are you speaking before your whole class?",
    format: "single_choice",
    category: "workstyle",
    tags: ["public_speaking"],
    followupTags: ["confidence"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_05_a", label: "🎤 Love the stage energy", weights: { E: 2, recognition: 1 } },
      { id: "ws_910_05_b", label: "💬 Confident with prep", weights: { I: 1, lead_vs_support: -0.3 } },
      { id: "ws_910_05_c", label: "😰 Prefer written reports", weights: { independent_vs_team: -0.7, A: 1 } },
      { id: "ws_910_05_d", label: "🤝 Supportive behind the scenes", weights: { lead_vs_support: 0.8, S: 1 } }
    ]
  },

  // class_11_12, undergrad, postgrad (How You Like to Work)
  {
    id: "ws_shared_01",
    text: "In collaborative projects, which role naturally falls to you?",
    format: "single_choice",
    category: "workstyle",
    tags: ["team_role"],
    followupTags: ["leadership"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_01_a", label: "Setting roadmaps and milestones", weights: { lead_vs_support: -0.8, E: 2, C: 1 } },
      { id: "ws_shared_01_b", label: "Solving hardest technical blockers", weights: { I: 2, lead_vs_support: 0.6 } },
      { id: "ws_shared_01_c", label: "Storytelling and visual presentation", weights: { A: 2, creativity: 1 } },
      { id: "ws_shared_01_d", label: "Ensuring team harmony and morale", weights: { S: 2, independent_vs_team: 0.7 } }
    ]
  },
  {
    id: "ws_shared_02",
    text: "Do you thrive under strict protocols or dynamic shifts?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["structured_vs_flexible"],
    followupTags: ["process"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_02_a", label: "Predictable structured roadmaps", weights: { structured_vs_flexible: -0.8, C: 2 } },
      { id: "ws_shared_02_b", label: "Fast-changing adaptable sprints", weights: { structured_vs_flexible: 0.8, E: 1 } },
      { id: "ws_shared_02_c", label: "Methodical experimentation protocols", weights: { I: 2, structured_vs_flexible: -0.3 } },
      { id: "ws_shared_02_d", label: "Unconstrained creative exploration", weights: { A: 2, structured_vs_flexible: 0.9 } }
    ]
  },
  {
    id: "ws_shared_03",
    text: "Between conceptual strategy and hands-on execution, you choose:",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["practical_vs_conceptual"],
    followupTags: ["execution_focus"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_03_a", label: "Shipping tangible practical work", weights: { practical_vs_conceptual: -0.8, R: 2 } },
      { id: "ws_shared_03_b", label: "Formulating abstract high-level strategy", weights: { practical_vs_conceptual: 0.8, E: 1, I: 1 } },
      { id: "ws_shared_03_c", label: "Balancing both through sprints", weights: { practical_vs_conceptual: 0.0, learning: 1 } },
      { id: "ws_shared_03_d", label: "Researching human behavior psychology", weights: { practical_vs_conceptual: 0.5, S: 2 } }
    ]
  },
  {
    id: "ws_shared_04",
    text: "How do you prefer receiving feedback on your work?",
    format: "single_choice",
    category: "workstyle",
    tags: ["feedback_style"],
    followupTags: ["communication"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_04_a", label: "Direct metric-driven critique", weights: { I: 1, C: 1, practical_vs_conceptual: -0.4 } },
      { id: "ws_shared_04_b", label: "Empathetic constructive 1-on-1 discussion", weights: { S: 2, balance: 1 } },
      { id: "ws_shared_04_c", label: "Written asynchronous notes", weights: { independent_vs_team: -0.6 } },
      { id: "ws_shared_04_d", label: "Public celebration of wins", weights: { recognition: 2, E: 1 } }
    ]
  },
  {
    id: "ws_shared_05",
    text: "When making tough trade-offs, what anchors your judgment?",
    format: "single_choice",
    category: "workstyle",
    tags: ["decision_making"],
    followupTags: ["values"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_05_a", label: "Rigorous quantitative evidence", weights: { I: 2, C: 1 } },
      { id: "ws_shared_05_b", label: "Human team well-being", weights: { S: 2, impact: 1 } },
      { id: "ws_shared_05_c", label: "Strategic commercial return", weights: { E: 2, growth: 1 } },
      { id: "ws_shared_05_d", label: "Aesthetic elegance originality", weights: { A: 2, creativity: 1 } }
    ]
  },

  // =========================================================================
  // SECTION 4: WHAT YOU ARE BEST AT (best_at) - Budget: 5
  // Includes 4 Tiny Objective Mini-Challenges!
  // =========================================================================

  // class_6_8 (What You Are Best At)
  {
    id: "ba_68_01",
    text: "What do your classmates ask your help with?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["peer_strengths"],
    followupTags: ["natural_talents"],
    segment: ["class_6_8"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_68_01_a", label: "📐 Solving tricky math sums", weights: { I: 2, C: 1 } },
      { id: "ba_68_01_b", label: "🎨 Drawing posters and cards", weights: { A: 2, creativity: 1 } },
      { id: "ba_68_01_c", label: "💻 Fixing computer phone glitches", weights: { R: 2, I: 1 } },
      { id: "ba_68_01_d", label: "🤝 Resolving friendship fights", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "ba_68_02",
    text: "What activity feels effortless and natural to you?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["effortless_skill"],
    followupTags: ["aptitude"],
    segment: ["class_6_8"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_68_02_a", label: "🗣️ Entertaining friends with jokes", weights: { E: 2, recognition: 1 } },
      { id: "ba_68_02_b", label: "🔍 Finding hidden errors", weights: { C: 2, I: 1 } },
      { id: "ba_68_02_c", label: "🏃 Sports and physical games", weights: { R: 2 } },
      { id: "ba_68_02_d", label: "📝 Writing imaginative stories", weights: { A: 2 } }
    ]
  },
  // Mini-Challenge 1 (6-8 & 9-10): Logic Pattern
  {
    id: "ba_68_ch_01",
    text: "Number pattern: 2, 4, 8, 16. What comes next?",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "logic_pattern"],
    followupTags: ["math_aptitude"],
    segment: ["class_6_8", "class_9_10"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_68_ch_01_a", label: "24", weights: { I: 0 } },
      { id: "ba_68_ch_01_b", label: "32", weights: { I: 2, C: 1 } },
      { id: "ba_68_ch_01_c", label: "30", weights: { I: 0 } },
      { id: "ba_68_ch_01_d", label: "64", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 2 (6-8 & 9-10): Word Analogies
  {
    id: "ba_68_ch_02",
    text: "Bird is to Sky as Fish is to:",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "word_reasoning"],
    followupTags: ["verbal_aptitude"],
    segment: ["class_6_8", "class_9_10"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_68_ch_02_a", label: "Water", weights: { I: 1, A: 1 } },
      { id: "ba_68_ch_02_b", label: "Nest", weights: { I: 0 } },
      { id: "ba_68_ch_02_c", label: "Sand", weights: { I: 0 } },
      { id: "ba_68_ch_02_d", label: "Tree", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 3 (6-8): Simple Arithmetic Logic
  {
    id: "ba_68_ch_03",
    text: "A pen costs ₹10. Three pens cost:",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "number_puzzle"],
    followupTags: ["practical_math"],
    segment: ["class_6_8"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_68_ch_03_a", label: "₹20", weights: { C: 0 } },
      { id: "ba_68_ch_03_b", label: "₹30", weights: { C: 2, I: 1 } },
      { id: "ba_68_ch_03_c", label: "₹40", weights: { C: 0 } },
      { id: "ba_68_ch_03_d", label: "₹25", weights: { C: 0 } }
    ]
  },
  {
    id: "ba_68_04",
    text: "When teachers praise you, what do they mention?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["teacher_feedback"],
    followupTags: ["strengths"],
    segment: ["class_6_8"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_68_04_a", label: "⭐ Neat accurate homework", weights: { C: 2 } },
      { id: "ba_68_04_b", label: "⭐ Original creative ideas", weights: { A: 2 } },
      { id: "ba_68_04_c", label: "⭐ Kind helpful conduct", weights: { S: 2 } },
      { id: "ba_68_04_d", label: "⭐ Quick answers to questions", weights: { I: 2 } }
    ]
  },

  // class_9_10 (What You Are Best At)
  {
    id: "ba_910_01",
    text: "Which skill gives you confidence in school competitions?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["competition_strength"],
    followupTags: ["talent"],
    segment: ["class_9_10"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_910_01_a", label: "🏆 Debating persuasive speaking", weights: { E: 2, S: 1 } },
      { id: "ba_910_01_b", label: "🏆 Science Olympiad logic", weights: { I: 2, R: 1 } },
      { id: "ba_910_01_c", label: "🏆 Painting and design", weights: { A: 2, creativity: 1 } },
      { id: "ba_910_01_d", label: "🏆 Managing team logistics", weights: { C: 2, E: 1 } }
    ]
  },
  {
    id: "ba_910_02",
    text: "When friends plan outings, what task do you own?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["informal_strengths"],
    followupTags: ["execution"],
    segment: ["class_9_10"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_910_02_a", label: "🗺️ Finding scenic spots", weights: { A: 2 } },
      { id: "ba_910_02_b", label: "💵 Splitting expenses budgeting", weights: { C: 2, E: 1 } },
      { id: "ba_910_02_c", label: "🚗 Planning travel routes", weights: { R: 2, C: 1 } },
      { id: "ba_910_02_d", label: "🎉 Keeping everyone happy", weights: { S: 2, E: 1 } }
    ]
  },
  // Mini-Challenge 4 (9-10 & 11-12): Classic Cognitive Puzzle
  {
    id: "ba_910_ch_01",
    text: "Bat and ball cost ₹110. Bat is ₹100 more. Ball?",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "number_puzzle"],
    followupTags: ["cognitive_reflection"],
    segment: ["class_9_10", "class_11_12"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_910_ch_01_a", label: "₹10", weights: { I: 0 } },
      { id: "ba_910_ch_01_b", label: "₹5", weights: { I: 2, C: 1 } },
      { id: "ba_910_ch_01_c", label: "₹15", weights: { I: 0 } },
      { id: "ba_910_ch_01_d", label: "₹20", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 5 (9-10 & 11-12): Word Reasoning
  {
    id: "ba_910_ch_02",
    text: "Compass is to Navigation as Thermometer is to:",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "word_reasoning"],
    followupTags: ["verbal_logic"],
    segment: ["class_9_10", "class_11_12"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_910_ch_02_a", label: "Temperature", weights: { I: 2, R: 1 } },
      { id: "ba_910_ch_02_b", label: "Weather", weights: { I: 0 } },
      { id: "ba_910_ch_02_c", label: "Mercury", weights: { I: 0 } },
      { id: "ba_910_ch_02_d", label: "Fever", weights: { I: 0 } }
    ]
  },
  {
    id: "ba_910_03",
    text: "Which task can you do for hours without tiring?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["deep_flow"],
    followupTags: ["endurance"],
    segment: ["class_9_10"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_910_03_a", label: "💻 Learning coding tech tools", weights: { R: 2, I: 1 } },
      { id: "ba_910_03_b", label: "🎨 Sketching and video editing", weights: { A: 2, creativity: 1 } },
      { id: "ba_910_03_c", label: "🤝 Listening counseling friends", weights: { S: 2, impact: 1 } },
      { id: "ba_910_03_d", label: "📈 Reading business finance news", weights: { E: 2, C: 1 } }
    ]
  },

  // class_11_12, undergrad, postgrad (What You Are Best At)
  {
    id: "ba_shared_01",
    text: "Which intellectual muscle feels most naturally dependable?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["intellectual_strength"],
    followupTags: ["cognitive_bias"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_shared_01_a", label: "First-principles systems logic", weights: { I: 2, R: 1 } },
      { id: "ba_shared_01_b", label: "Strategic persuasion negotiation", weights: { E: 2, growth: 1 } },
      { id: "ba_shared_01_c", label: "Aesthetic branding composition", weights: { A: 2, creativity: 1 } },
      { id: "ba_shared_01_d", label: "Operational precision budgeting", weights: { C: 2, stability: 1 } }
    ]
  },
  // Mini-Challenge 6 (Higher Level): Deductive Logic
  {
    id: "ba_high_ch_01",
    text: "All roses are flowers. Some flowers fade quickly. Therefore:",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "logical_deduction"],
    followupTags: ["critical_thinking"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_high_ch_01_a", label: "Some roses fade quickly", weights: { I: 0 } },
      { id: "ba_high_ch_01_b", label: "Cannot be determined definitively", weights: { I: 2, C: 1 } },
      { id: "ba_high_ch_01_c", label: "All flowers are roses", weights: { I: 0 } },
      { id: "ba_high_ch_01_d", label: "No roses fade quickly", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 7 (Higher Level): Rate Math
  {
    id: "ba_high_ch_02",
    text: "5 machines make 5 widgets in 5 minutes. 100 machines?",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "rate_problem"],
    followupTags: ["quantitative_aptitude"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_high_ch_02_a", label: "100 widgets in 5 minutes", weights: { I: 2, C: 1 } },
      { id: "ba_high_ch_02_b", label: "100 widgets 100 minutes", weights: { I: 0 } },
      { id: "ba_high_ch_02_c", label: "5 widgets in 5 minutes", weights: { I: 0 } },
      { id: "ba_high_ch_02_d", label: "50 widgets 25 minutes", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 8 (Higher Level): Verbal Analogy
  {
    id: "ba_high_ch_03",
    text: "Ephemeral is to Permanent as Scarcity is to:",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "verbal_analogy"],
    followupTags: ["verbal_reasoning"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_high_ch_03_a", label: "Abundance", weights: { I: 2, A: 1 } },
      { id: "ba_high_ch_03_b", label: "Poverty", weights: { I: 0 } },
      { id: "ba_high_ch_03_c", label: "Deficit", weights: { I: 0 } },
      { id: "ba_high_ch_03_d", label: "Wealthy", weights: { I: 0 } }
    ]
  },
  {
    id: "ba_shared_02",
    text: "What difficult task do peers praise you for simplifying?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["simplification_strength"],
    followupTags: ["communication"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_shared_02_a", label: "Demystifying technical code logic", weights: { I: 2, R: 1 } },
      { id: "ba_shared_02_b", label: "Organizing chaos into actions", weights: { lead_vs_support: -0.6, C: 2 } },
      { id: "ba_shared_02_c", label: "Pitching products with analogies", weights: { E: 2, A: 1 } },
      { id: "ba_shared_02_d", label: "Resolving interpersonal roadblocks", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "ba_shared_03",
    text: "In intense crisis moments, what is your most reliable trait?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["crisis_trait"],
    followupTags: ["composure"],
    segment: ["undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_shared_03_a", label: "Analytical composure under stress", weights: { I: 2, C: 1 } },
      { id: "ba_shared_03_b", label: "Decisive executive action", weights: { E: 2, lead_vs_support: -0.7 } },
      { id: "ba_shared_03_c", label: "Creative lateral problem-solving", weights: { A: 2, creativity: 1 } },
      { id: "ba_shared_03_d", label: "De-escalating team panic", weights: { S: 2, impact: 1 } }
    ]
  },

  // =========================================================================
  // SECTION 5: WHAT MATTERS TO YOU (values) - Budget: 3
  // =========================================================================

  // class_6_8 (What Matters to You)
  {
    id: "val_68_01",
    text: "If you had lots of money, what matters most?",
    format: "single_choice",
    category: "values",
    tags: ["child_values"],
    followupTags: ["values"],
    segment: ["class_6_8"],
    section: "values",
    validated: true,
    options: [
      { id: "val_68_01_a", label: "🏠 Safe comfortable family home", weights: { stability: 2 } },
      { id: "val_68_01_b", label: "🌍 Traveling the wild world", weights: { independence: 2, learning: 1 } },
      { id: "val_68_01_c", label: "🎁 Helping poor children families", weights: { impact: 2, S: 1 } },
      { id: "val_68_01_d", label: "🚀 Inventing machines changing lives", weights: { creativity: 2, I: 1 } }
    ]
  },
  {
    id: "val_68_02",
    text: "What makes you feel most proud of yourself?",
    format: "single_choice",
    category: "values",
    tags: ["pride"],
    followupTags: ["fulfillment"],
    segment: ["class_6_8"],
    section: "values",
    validated: true,
    options: [
      { id: "val_68_02_a", label: "🥇 Winning first prize award", weights: { recognition: 2, E: 1 } },
      { id: "val_68_02_b", label: "❤️ Being loyal kind friend", weights: { S: 2, impact: 1 } },
      { id: "val_68_02_c", label: "🎨 Creating original art", weights: { A: 2, creativity: 2 } },
      { id: "val_68_02_d", label: "🧩 Discovering unsolved answers", weights: { I: 2, learning: 2 } }
    ]
  },
  {
    id: "val_68_03",
    text: "Which dream job wish would you make?",
    format: "single_choice",
    category: "values",
    tags: ["aspirations"],
    followupTags: ["wrapup"],
    segment: ["class_6_8"],
    section: "values",
    validated: true,
    options: [
      { id: "val_68_03_a", label: "✨ Fun exciting daily tasks", weights: { balance: 2, creativity: 1 } },
      { id: "val_68_03_b", label: "✨ Leading important projects", weights: { E: 2, recognition: 1 } },
      { id: "val_68_03_c", label: "✨ Curing people illnesses", weights: { S: 2, impact: 2 } },
      { id: "val_68_03_d", label: "✨ Building cool computers", weights: { R: 2, I: 1 } }
    ]
  },
  {
    id: "val_68_04",
    text: "At day's end, what brings you deepest satisfaction?",
    format: "single_choice",
    category: "values",
    tags: ["day_satisfaction"],
    followupTags: ["values"],
    segment: ["class_6_8"],
    section: "values",
    validated: true,
    options: [
      { id: "val_68_04_a", label: "🛋️ Peaceful worry-free rest", weights: { balance: 2, stability: 1 } },
      { id: "val_68_04_b", label: "📖 Learning curious new facts", weights: { learning: 2, I: 1 } },
      { id: "val_68_04_c", label: "🤝 Making someone smile warmly", weights: { impact: 2, S: 1 } },
      { id: "val_68_04_d", label: "🏆 Winning game challenges", weights: { recognition: 1, growth: 1 } }
    ]
  },

  // class_9_10 (What Matters to You)
  {
    id: "val_910_01",
    text: "Which single trade-off would you accept in career?",
    format: "single_choice",
    category: "values",
    tags: ["value_tradeoff"],
    followupTags: ["priorities"],
    segment: ["class_9_10"],
    section: "values",
    validated: true,
    options: [
      { id: "val_910_01_a", label: "Giving up public fame", weights: { recognition: -1, balance: 1 } },
      { id: "val_910_01_b", label: "Giving up huge wealth", weights: { growth: -1, impact: 1 } },
      { id: "val_910_01_c", label: "Giving up easy hours", weights: { balance: -1, growth: 2 } },
      { id: "val_910_01_d", label: "Giving up predictable routines", weights: { stability: -1, independence: 2 } }
    ]
  },
  {
    id: "val_910_02",
    text: "What reputation matters most to you among friends?",
    format: "single_choice",
    category: "values",
    tags: ["peer_reputation"],
    followupTags: ["identity"],
    segment: ["class_9_10"],
    section: "values",
    validated: true,
    options: [
      { id: "val_910_02_a", label: "🧠 Sharpest analytical thinker", weights: { I: 2, learning: 1 } },
      { id: "val_910_02_b", label: "👑 Inspiring natural leader", weights: { E: 2, recognition: 2 } },
      { id: "val_910_02_c", label: "🎨 Most creative original artist", weights: { A: 2, creativity: 2 } },
      { id: "val_910_02_d", label: "🤝 Most trustworthy loyal friend", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "val_910_03",
    text: "When picking a stream, whose happiness matters most?",
    format: "single_choice",
    category: "values",
    tags: ["stream_happiness"],
    followupTags: ["autonomy"],
    segment: ["class_9_10"],
    section: "values",
    validated: true,
    options: [
      { id: "val_910_03_a", label: "🕊️ My authentic personal passion", weights: { independence: 2, creativity: 1 } },
      { id: "val_910_03_b", label: "👨‍👩‍👦 Family security and pride", weights: { stability: 2, recognition: 1 } },
      { id: "val_910_03_c", label: "💰 Early financial self-reliance", weights: { growth: 2, E: 1 } },
      { id: "val_910_03_d", label: "🌍 Direct positive social impact", weights: { impact: 2, S: 1 } }
    ]
  },
  {
    id: "val_910_04",
    text: "Which achievement signifies complete success in life?",
    format: "single_choice",
    category: "values",
    tags: ["life_success"],
    followupTags: ["vision"],
    segment: ["class_9_10"],
    section: "values",
    validated: true,
    options: [
      { id: "val_910_04_a", label: "🏢 Building thriving business company", weights: { E: 2, growth: 2 } },
      { id: "val_910_04_b", label: "🔬 Discovering scientific medical cures", weights: { I: 2, impact: 2 } },
      { id: "val_910_04_c", label: "🎨 Producing celebrated artistic works", weights: { A: 2, creativity: 2 } },
      { id: "val_910_04_d", label: "🏖️ Peaceful stress-free work-life balance", weights: { balance: 2, stability: 1 } }
    ]
  },

  // class_11_12, undergrad, postgrad (What Matters to You)
  {
    id: "val_shared_01",
    text: "What life reward anchors your deepest career decisions?",
    format: "single_choice",
    category: "values",
    tags: ["core_anchor"],
    followupTags: ["purpose"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "values",
    validated: true,
    options: [
      { id: "val_shared_01_a", label: "Substantial uncapped financial upside", weights: { growth: 2, E: 1 } },
      { id: "val_shared_01_b", label: "Complete schedule location autonomy", weights: { independence: 2, balance: 1 } },
      { id: "val_shared_01_c", label: "Societal impact on communities", weights: { impact: 2, S: 1 } },
      { id: "val_shared_01_d", label: "Continuous intellectual discovery mastery", weights: { learning: 2, I: 1 } }
    ]
  },
  {
    id: "val_shared_02",
    text: "Would you accept 70-hour weeks for rapid promotions?",
    format: "preference_comparison",
    category: "values",
    tags: ["work_life_tradeoff"],
    followupTags: ["intensity"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "values",
    validated: true,
    options: [
      { id: "val_shared_02_a", label: "Yes, for accelerated executive trajectory", weights: { growth: 2, balance: -1, E: 1 } },
      { id: "val_shared_02_b", label: "No, strict work-life balance", weights: { balance: 2, stability: 1 } },
      { id: "val_shared_02_c", label: "Only if building startup", weights: { independence: 2, growth: 1, E: 1 } },
      { id: "val_shared_02_d", label: "Only for scientific breakthroughs", weights: { learning: 2, impact: 1, I: 1 } }
    ]
  },
  {
    id: "val_shared_03",
    text: "How important is public prestige and corporate status?",
    format: "single_choice",
    category: "values",
    tags: ["status_importance"],
    followupTags: ["recognition"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "values",
    validated: true,
    options: [
      { id: "val_shared_03_a", label: "Essential for social standing", weights: { recognition: 2, E: 1 } },
      { id: "val_shared_03_b", label: "Secondary to financial compensation", weights: { stability: 2, growth: 1 } },
      { id: "val_shared_03_c", label: "Irrelevant; inner mastery counts", weights: { creativity: 2, learning: 1, A: 1 } },
      { id: "val_shared_03_d", label: "Reputation among specialist peers", weights: { I: 2, recognition: 1 } }
    ]
  },
  {
    id: "val_shared_04",
    text: "At retirement, what legacy proves your career succeeded?",
    format: "single_choice",
    category: "values",
    tags: ["legacy_definition"],
    followupTags: ["final_wrapup"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "values",
    validated: true,
    options: [
      { id: "val_shared_04_a", label: "Enduring institutions and enterprises", weights: { E: 2, growth: 2 } },
      { id: "val_shared_04_b", label: "Breakthrough patents and books", weights: { I: 2, learning: 2, A: 1 } },
      { id: "val_shared_04_c", label: "Thousands of lives improved", weights: { impact: 2, S: 2 } },
      { id: "val_shared_04_d", label: "Balanced, healthy family life", weights: { balance: 2, stability: 2 } }
    ]
  }
];

// Validate all questions
console.log(`Checking ${questions.length} questions against strict rules...`);
const errList = [];
for (const q of questions) {
  try {
    QuestionSchema.parse(q);
  } catch (err) {
    errList.push(`Schema error in ${q.id}: ${err.message}`);
  }
  const qWords = countWords(q.text);
  if (qWords > 12) {
    errList.push(`Question ${q.id} exceeds 12 words (${qWords} words): "${q.text}"`);
  }
  if (q.options.length < 3 || q.options.length > 4) {
    errList.push(`Question ${q.id} must have 3-4 options.`);
  }
  for (const opt of q.options) {
    const optWords = countWords(opt.label);
    if (optWords > 5) {
      errList.push(`Option ${opt.id} in ${q.id} exceeds 5 words (${optWords} words): "${opt.label}"`);
    }
  }
}

if (errList.length > 0) {
  console.error("Errors found:");
  errList.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log(`ALL ${questions.length} QUESTIONS PASSED VALIDATION!`);

// Careers bank with segments and 7 dedicated stream directions for class_6_8 and class_9_10
const existingCareers = require("../src/data/careers.json");

// Update existing careers with segments: ["class_11_12", "undergrad", "postgrad"]
const updatedCareers = existingCareers
  .filter((c) => !c.id.startsWith("dir_"))
  .map((c) => ({
    ...c,
    segments: c.segments || ["class_11_12", "undergrad", "postgrad"],
    isDirection: false,
  }));

const streamDirections = [
  {
    id: "dir_pcm_tech",
    name: "Science (PCM): Engineering & Technology Direction",
    industry: "Foundational Science & Technology Direction",
    description: "Explores analytical problem-solving, computing systems, mechanics, and physical sciences. Recommended Class 11 stream: Physics, Chemistry, Mathematics (PCM).",
    vector: {
      R: 8, I: 9, A: 3, S: 2, E: 4, C: 6,
      independent_vs_team: -0.2, structured_vs_flexible: 0.1, practical_vs_conceptual: -0.3, lead_vs_support: 0.2,
      stability: 7, growth: 9, independence: 7, creativity: 6, impact: 6, recognition: 7, balance: 6, learning: 9
    },
    requiredDegrees: ["Class 11-12 Science (PCM)", "Future B.Tech / B.Sc / BCA Foundation"],
    entryPathways: ["Choose Science (PCM) in Class 11", "Build coding and math Olympiad fundamentals", "Explore hands-on robotics and tech projects"],
    entranceExams: ["NTSE", "Olympiads (IMO, NSO)", "Future JEE Main / CETs"],
    challenges: ["Demands rigorous abstract calculus and daily practice", "High competition in national technical exams"],
    relatedCareerIds: ["dir_pcmb_research", "dir_creative_design"],
    segments: ["class_6_8", "class_9_10"],
    isDirection: true
  },
  {
    id: "dir_pcb_health",
    name: "Science (PCB): Medicine & Life Sciences Direction",
    industry: "Life Sciences & Healthcare Direction",
    description: "Explores biological systems, human physiology, ecology, and compassionate patient care. Recommended Class 11 stream: Physics, Chemistry, Biology (PCB).",
    vector: {
      R: 4, I: 9, A: 2, S: 9, E: 3, C: 6,
      independent_vs_team: 0.4, structured_vs_flexible: -0.5, practical_vs_conceptual: -0.4, lead_vs_support: 0.2,
      stability: 9, growth: 7, independence: 5, creativity: 4, impact: 10, recognition: 8, balance: 4, learning: 9
    },
    requiredDegrees: ["Class 11-12 Science (PCB)", "Future MBBS / BDS / B.Sc Biotech"],
    entryPathways: ["Choose Science (PCB) in Class 11", "Strengthen biological botany and zoology concepts", "Participate in science exhibitions and ecology drives"],
    entranceExams: ["NTSE", "Biology Olympiads (NBO)", "Future NEET UG"],
    challenges: ["Extensive syllabus requiring deep memory retention", "Long academic runway before independent practice"],
    relatedCareerIds: ["dir_pcmb_research", "dir_arts_humanities"],
    segments: ["class_6_8", "class_9_10"],
    isDirection: true
  },
  {
    id: "dir_commerce_finance",
    name: "Commerce: Finance, Accounting & Business Direction",
    industry: "Commerce & Financial Systems Direction",
    description: "Focuses on commercial trade, financial markets, accountancy, banking, and wealth creation. Recommended Class 11 stream: Commerce with or without Mathematics.",
    vector: {
      R: 1, I: 5, A: 2, S: 3, E: 8, C: 9,
      independent_vs_team: 0.1, structured_vs_flexible: -0.7, practical_vs_conceptual: -0.5, lead_vs_support: 0.1,
      stability: 8, growth: 9, independence: 6, creativity: 3, impact: 5, recognition: 7, balance: 6, learning: 7
    },
    requiredDegrees: ["Class 11-12 Commerce (Accountancy, Economics)", "Future B.Com / BBA / CA Foundation"],
    entryPathways: ["Choose Commerce in Class 11", "Practice ledger accounting and financial math", "Read financial newspapers and follow company news"],
    entranceExams: ["CUET UG", "CA Foundation", "IPMAT"],
    challenges: ["Requires meticulous accuracy with numbers and balance sheets", "Regulatory compliance protocols must be learned"],
    relatedCareerIds: ["dir_management_enterprise", "dir_pcm_tech"],
    segments: ["class_6_8", "class_9_10"],
    isDirection: true
  },
  {
    id: "dir_arts_humanities",
    name: "Humanities: Law, Social Sciences & Media Direction",
    industry: "Humanities, Policy & Media Direction",
    description: "Centers on society, constitutional governance, legal systems, history, psychology, and public communication. Recommended Class 11 stream: Humanities / Arts.",
    vector: {
      R: 1, I: 7, A: 6, S: 8, E: 6, C: 4,
      independent_vs_team: 0.3, structured_vs_flexible: 0.4, practical_vs_conceptual: 0.5, lead_vs_support: -0.3,
      stability: 6, growth: 7, independence: 8, creativity: 7, impact: 9, recognition: 7, balance: 6, learning: 8
    },
    requiredDegrees: ["Class 11-12 Humanities (Pol Science, History, English)", "Future B.A. / B.A. LL.B / Journalism"],
    entryPathways: ["Choose Humanities in Class 11", "Participate in debating, MUNs, and creative writing", "Follow current affairs and constitutional issues"],
    entranceExams: ["CLAT", "CUET UG (Top Central Universities)"],
    challenges: ["Requires extensive reading, essay synthesis, and critical thinking", "Less linear job placements compared to engineering"],
    relatedCareerIds: ["dir_creative_design", "dir_management_enterprise"],
    segments: ["class_6_8", "class_9_10"],
    isDirection: true
  },
  {
    id: "dir_creative_design",
    name: "Design & Visual Arts: Creative Media & Fine Arts Direction",
    industry: "Creative Arts & Design Direction",
    description: "Fosters visual aesthetics, digital illustration, animation, storytelling, and industrial design. Open to any Class 11 stream with focus on creative portfolios.",
    vector: {
      R: 4, I: 4, A: 10, S: 4, E: 5, C: 2,
      independent_vs_team: -0.3, structured_vs_flexible: 0.9, practical_vs_conceptual: -0.2, lead_vs_support: 0.0,
      stability: 5, growth: 8, independence: 9, creativity: 10, impact: 6, recognition: 7, balance: 6, learning: 8
    },
    requiredDegrees: ["Class 11-12 Any Stream + Design Portfolio", "Future B.Des / BFA / Animation Degree"],
    entryPathways: ["Build sketchbooks, visual arts, and digital tools portfolio", "Enter school design competitions and digital media challenges"],
    entranceExams: ["UCEED", "NID DAT", "NIFT"],
    challenges: ["Subjective evaluations rather than binary right/wrong answers", "Requires continuous portfolio generation and creative endurance"],
    relatedCareerIds: ["dir_arts_humanities", "dir_pcm_tech"],
    segments: ["class_6_8", "class_9_10"],
    isDirection: true
  },
  {
    id: "dir_pcmb_research",
    name: "Pure Sciences (PCMB): Research & Innovation Direction",
    industry: "Scientific Research & Discovery Direction",
    description: "For students curious about both physical sciences and living systems, aiming for scientific research and interdisciplinary technologies.",
    vector: {
      R: 5, I: 10, A: 3, S: 4, E: 3, C: 6,
      independent_vs_team: -0.4, structured_vs_flexible: -0.2, practical_vs_conceptual: 0.7, lead_vs_support: 0.1,
      stability: 7, growth: 7, independence: 8, creativity: 6, impact: 8, recognition: 7, balance: 5, learning: 10
    },
    requiredDegrees: ["Class 11-12 Science (PCMB)", "Future BS-MS at IISc / IISER / NISER"],
    entryPathways: ["Take PCMB in Class 11", "Perform well in Olympiads and scientific competitions", "Read scientific research magazines"],
    entranceExams: ["IAT (IISER)", "NEST", "JEE Advanced"],
    challenges: ["Demanding double workload of Maths and Biology in 11th-12th", "Academic research demands patience and long publication cycles"],
    relatedCareerIds: ["dir_pcm_tech", "dir_pcb_health"],
    segments: ["class_6_8", "class_9_10"],
    isDirection: true
  },
  {
    id: "dir_management_enterprise",
    name: "Management & Leadership: Business & Public Policy Direction",
    industry: "Enterprise & Strategic Leadership Direction",
    description: "Focuses on leading teams, scaling business ventures, public administration, and organizational strategy. Compatible with Commerce, Humanities, or Science.",
    vector: {
      R: 2, I: 6, A: 4, S: 7, E: 10, C: 5,
      independent_vs_team: 0.8, structured_vs_flexible: 0.3, practical_vs_conceptual: -0.2, lead_vs_support: -0.9,
      stability: 6, growth: 10, independence: 7, creativity: 6, impact: 8, recognition: 9, balance: 5, learning: 8
    },
    requiredDegrees: ["Class 11-12 Any Stream", "Future IPM (IIMs) / BBA / BMS / Law"],
    entryPathways: ["Take school student council and leadership responsibilities", "Build communication, public speaking, and negotiation skills", "Read biographies of founders and leaders"],
    entranceExams: ["IPMAT (IIM Indore/Rohtak)", "CUET (DU BMS/BBA)"],
    challenges: ["Requires high emotional quotient, empathy, and resilience under pressure", "Competitive selection for premier management institutes"],
    relatedCareerIds: ["dir_commerce_finance", "dir_arts_humanities"],
    segments: ["class_6_8", "class_9_10"],
    isDirection: true
  }
];

const allCareers = [...streamDirections, ...updatedCareers];

// Validate all careers
for (const car of allCareers) {
  CareerSchema.parse(car);
}

// Write outputs
fs.writeFileSync(path.join(__dirname, "../src/data/questions.json"), JSON.stringify(questions, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "../src/data/careers.json"), JSON.stringify(allCareers, null, 2), "utf8");

console.log(`Saved ${questions.length} questions to src/data/questions.json`);
console.log(`Saved ${allCareers.length} careers (including ${streamDirections.length} stream directions) to src/data/careers.json`);
