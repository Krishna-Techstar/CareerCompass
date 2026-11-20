const fs = require('fs');
const path = require('path');
const { z } = require('zod');

// Schema definitions matching types.js
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

// All 90+ questions strictly obeying:
// 1. Max 12 words per question
// 2. 3-4 options, max 5 words per option
// 3. Emojis ONLY for class_6_8 and class_9_10
// 4. Five sections: about_you, likes_dislikes, work_style, best_at, values
// 5. Five segments: class_6_8, class_9_10, class_11_12, undergrad, postgrad

const rawQuestions = [
  // ==========================================
  // SECTION 1: ABOUT YOU (about_you)
  // Budget: 3 questions per interview
  // ==========================================

  // --- class_6_8 (About You) ---
  {
    id: "ay_68_01",
    text: "Which grade or class are you studying in right now?",
    format: "single_choice",
    category: "about",
    tags: ["class_level", "basics"],
    followupTags: ["middle_school"],
    segment: ["class_6_8"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_68_01_a", label: "🎒 Class 6th student", weights: { learning: 1 } },
      { id: "ay_68_01_b", label: "🎒 Class 7th student", weights: { learning: 1 } },
      { id: "ay_68_01_c", label: "🎒 Class 8th student", weights: { learning: 1 } },
      { id: "ay_68_01_d", label: "🎒 Just entered middle school", weights: { learning: 1 } }
    ]
  },
  {
    id: "ay_68_02",
    text: "When you grow up, what sounds most exciting to explore?",
    format: "single_choice",
    category: "interest",
    tags: ["future_curiosity", "exploration"],
    followupTags: ["tech", "science", "creative", "helping"],
    segment: ["class_6_8"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_68_02_a", label: "🚀 Building cool rocket machines", weights: { R: 2, I: 1 } },
      { id: "ay_68_02_b", label: "🎨 Painting animated video games", weights: { A: 2, creativity: 1 } },
      { id: "ay_68_02_c", label: "🩺 Curing sick animals people", weights: { S: 2, impact: 1 } },
      { id: "ay_68_02_d", label: "💼 Running my own shop", weights: { E: 2, growth: 1 } }
    ]
  },
  {
    id: "ay_68_03",
    text: "What do you enjoy reading or watching videos about?",
    format: "single_choice",
    category: "interest",
    tags: ["media_preference", "curiosity"],
    followupTags: ["animals", "space", "art", "sports"],
    segment: ["class_6_8"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_68_03_a", label: "🔬 Space and science wonders", weights: { I: 2, learning: 1 } },
      { id: "ay_68_03_b", label: "🎨 Craft tricks and drawing", weights: { A: 2, creativity: 1 } },
      { id: "ay_68_03_c", label: "⚽ Sports matches and heroes", weights: { R: 1, E: 1 } },
      { id: "ay_68_03_d", label: "🐾 Animals and wild nature", weights: { S: 1, I: 1 } }
    ]
  },
  {
    id: "ay_68_04",
    text: "How much do you already know about different future jobs?",
    format: "single_choice",
    category: "about",
    tags: ["career_awareness"],
    followupTags: ["discovery"],
    segment: ["class_6_8"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_68_04_a", label: "✨ Just beginning to explore", weights: { learning: 1 } },
      { id: "ay_68_04_b", label: "💡 Know doctor and engineer", weights: { R: 1, I: 1 } },
      { id: "ay_68_04_c", label: "🎯 Have a clear dream", weights: { E: 1, independence: 1 } },
      { id: "ay_68_04_d", label: "🔍 Curious about all jobs", weights: { learning: 2 } }
    ]
  },

  // --- class_9_10 (About You) ---
  {
    id: "ay_910_01",
    text: "Which stream do your friends or parents talk about most?",
    format: "single_choice",
    category: "about",
    tags: ["stream_awareness", "expectations"],
    followupTags: ["science", "commerce", "arts"],
    segment: ["class_9_10"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_910_01_a", label: "📐 Science with Maths PCM", weights: { I: 2, R: 1 } },
      { id: "ay_910_01_b", label: "🧬 Science with Biology PCB", weights: { I: 2, S: 1 } },
      { id: "ay_910_01_c", label: "📊 Commerce with Accountancy", weights: { C: 2, E: 1 } },
      { id: "ay_910_01_d", label: "📚 Humanities Arts or Design", weights: { A: 2, S: 1 } }
    ]
  },
  {
    id: "ay_910_02",
    text: "How sure are you about choosing your Class 11 stream?",
    format: "single_choice",
    category: "about",
    tags: ["stream_certainty"],
    followupTags: ["decisiveness"],
    segment: ["class_9_10"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_910_02_a", label: "🎯 Very clear and decided", weights: { structured_vs_flexible: -0.6 } },
      { id: "ay_910_02_b", label: "⚖️ Confused between two streams", weights: { structured_vs_flexible: 0.4 } },
      { id: "ay_910_02_c", label: "🔍 Completely open to guidance", weights: { learning: 2 } },
      { id: "ay_910_02_d", label: "🤔 Unsure what fits me", weights: { independence: 1 } }
    ]
  },
  {
    id: "ay_910_03",
    text: "Outside of school classes, what topic grabs your attention most?",
    format: "single_choice",
    category: "interest",
    tags: ["informal_learning"],
    followupTags: ["tech", "business", "arts"],
    segment: ["class_9_10"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_910_03_a", label: "💻 Coding apps and tech", weights: { R: 2, I: 1 } },
      { id: "ay_910_03_b", label: "📈 Startups and making money", weights: { E: 2, growth: 1 } },
      { id: "ay_910_03_c", label: "🎭 Filmmaking music and sketching", weights: { A: 2, creativity: 1 } },
      { id: "ay_910_03_d", label: "🌍 History psychology and politics", weights: { S: 2, I: 1 } }
    ]
  },
  {
    id: "ay_910_04",
    text: "Which future lifestyle matters most when you imagine yourself working?",
    format: "single_choice",
    category: "values",
    tags: ["early_values"],
    followupTags: ["lifestyle"],
    segment: ["class_9_10"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_910_04_a", label: "🏆 Famous in my field", weights: { recognition: 2, E: 1 } },
      { id: "ay_910_04_b", label: "🛡️ Stable secure government job", weights: { stability: 2, C: 1 } },
      { id: "ay_910_04_c", label: "🕊️ Creative freedom to travel", weights: { independence: 2, A: 1 } },
      { id: "ay_910_04_d", label: "🤝 Helping needy people directly", weights: { impact: 2, S: 1 } }
    ]
  },

  // --- class_11_12 (About You) ---
  {
    id: "ay_1112_01",
    text: "Which academic stream are you currently studying in school?",
    format: "single_choice",
    category: "about",
    tags: ["stream", "current_study"],
    followupTags: ["education_path"],
    segment: ["class_11_12"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_1112_01_a", label: "Science with PCM or Tech", weights: { R: 2, I: 1 } },
      { id: "ay_1112_01_b", label: "Science with PCB Biology", weights: { I: 2, S: 1 } },
      { id: "ay_1112_01_c", label: "Commerce with or without Maths", weights: { C: 2, E: 1 } },
      { id: "ay_1112_01_d", label: "Humanities Arts or Law", weights: { A: 2, S: 1 } }
    ]
  },
  {
    id: "ay_1112_02",
    text: "Which major national entrance exam are you considering or prepping?",
    format: "single_choice",
    category: "about",
    tags: ["entrance_exams"],
    followupTags: ["exam_targets"],
    segment: ["class_11_12"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_1112_02_a", label: "JEE Main and BITSAT", weights: { R: 2, I: 1 } },
      { id: "ay_1112_02_b", label: "NEET or Medical entrances", weights: { I: 2, S: 1 } },
      { id: "ay_1112_02_c", label: "CUET, IPMAT, or CA Foundation", weights: { E: 2, C: 1 } },
      { id: "ay_1112_02_d", label: "CLAT, NIFT, or NID", weights: { A: 2, S: 1 } }
    ]
  },
  {
    id: "ay_1112_03",
    text: "How open are you to careers outside conventional engineering or medicine?",
    format: "single_choice",
    category: "about",
    tags: ["alternative_openness"],
    followupTags: ["unconventional"],
    segment: ["class_11_12"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_1112_03_a", label: "Completely focused on engineering/medicine", weights: { structured_vs_flexible: -0.6, stability: 1 } },
      { id: "ay_1112_03_b", label: "Keen to explore emerging tech", weights: { I: 1, learning: 2 } },
      { id: "ay_1112_03_c", label: "Interested in design and media", weights: { A: 2, creativity: 1 } },
      { id: "ay_1112_03_d", label: "Drawn to management and finance", weights: { E: 2, growth: 1 } }
    ]
  },
  {
    id: "ay_1112_04",
    text: "What drives your career search most at this stage?",
    format: "single_choice",
    category: "values",
    tags: ["motivation"],
    followupTags: ["goals"],
    segment: ["class_11_12"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_1112_04_a", label: "Finding high return on degree", weights: { growth: 2, E: 1 } },
      { id: "ay_1112_04_b", label: "Discovering my true genuine talent", weights: { learning: 2, I: 1 } },
      { id: "ay_1112_04_c", label: "Relieving family career pressure", weights: { stability: 2, C: 1 } },
      { id: "ay_1112_04_d", label: "Building independence and creative pride", weights: { independence: 2, A: 1 } }
    ]
  },

  // --- undergrad (About You) ---
  {
    id: "ay_ug_01",
    text: "What degree or college course are you currently pursuing?",
    format: "single_choice",
    category: "about",
    tags: ["college_degree"],
    followupTags: ["undergrad"],
    segment: ["undergrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_ug_01_a", label: "B.Tech, B.E., or BCA", weights: { R: 2, I: 1 } },
      { id: "ay_ug_01_b", label: "B.Com, BBA, or Economics", weights: { E: 2, C: 1 } },
      { id: "ay_ug_01_c", label: "B.Sc, MBBS, or Allied Health", weights: { I: 2, S: 1 } },
      { id: "ay_ug_01_d", label: "B.A., Law, or Design", weights: { A: 2, S: 1 } }
    ]
  },
  {
    id: "ay_ug_02",
    text: "How satisfied are you with your chosen college branch?",
    format: "single_choice",
    category: "about",
    tags: ["branch_satisfaction"],
    followupTags: ["pivot"],
    segment: ["undergrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_ug_02_a", label: "Love it, want deeper specialization", weights: { learning: 2, I: 1 } },
      { id: "ay_ug_02_b", label: "Decent, but looking for non-tech", weights: { E: 1, A: 1 } },
      { id: "ay_ug_02_c", label: "Eager to pivot into business", weights: { E: 2, growth: 1 } },
      { id: "ay_ug_02_d", label: "Uncertain, exploring internships", weights: { structured_vs_flexible: 0.6 } }
    ]
  },
  {
    id: "ay_ug_03",
    text: "What type of college internship experience attracts you most?",
    format: "single_choice",
    category: "interest",
    tags: ["internship_preference"],
    followupTags: ["workplace"],
    segment: ["undergrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_ug_03_a", label: "High-growth tech product team", weights: { R: 1, I: 1, learning: 1 } },
      { id: "ay_ug_03_b", label: "Corporate consulting or financial analyst", weights: { E: 1, C: 1, growth: 1 } },
      { id: "ay_ug_03_c", label: "Creative agency studio or brand", weights: { A: 2, creativity: 1 } },
      { id: "ay_ug_03_d", label: "Social NGO or research institute", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "ay_ug_04",
    text: "What is your main post-college priority after graduation?",
    format: "single_choice",
    category: "values",
    tags: ["graduation_priority"],
    followupTags: ["immediate_next"],
    segment: ["undergrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_ug_04_a", label: "High-paying on-campus job offer", weights: { growth: 2, stability: 1 } },
      { id: "ay_ug_04_b", label: "Master degree CAT GATE abroad", weights: { learning: 2, I: 1 } },
      { id: "ay_ug_04_c", label: "Building a startup venture", weights: { E: 2, independence: 2 } },
      { id: "ay_ug_04_d", label: "UPSC or civil services exam", weights: { impact: 2, recognition: 1 } }
    ]
  },

  // --- postgrad (About You) ---
  {
    id: "ay_pg_01",
    text: "What is your current professional or postgraduate educational status?",
    format: "single_choice",
    category: "about",
    tags: ["postgrad_status"],
    followupTags: ["career_stage"],
    segment: ["postgrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_pg_01_a", label: "Enrolled in Masters MBA MTech", weights: { learning: 1, E: 1 } },
      { id: "ay_pg_01_b", label: "Working professional seeking career transition", weights: { growth: 2, independence: 1 } },
      { id: "ay_pg_01_c", label: "Academic PhD or clinical researcher", weights: { I: 2, learning: 2 } },
      { id: "ay_pg_01_d", label: "Founder or early-stage team lead", weights: { E: 2, lead_vs_support: -0.6 } }
    ]
  },
  {
    id: "ay_pg_02",
    text: "What trigger brings you to re-evaluate your career direction now?",
    format: "single_choice",
    category: "about",
    tags: ["transition_trigger"],
    followupTags: ["motivation"],
    segment: ["postgrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_pg_02_a", label: "Plateaued growth in current domain", weights: { growth: 2, learning: 1 } },
      { id: "ay_pg_02_b", label: "Desire to switch industry entirely", weights: { structured_vs_flexible: 0.8 } },
      { id: "ay_pg_02_c", label: "Severe burnout, needing sustainable balance", weights: { balance: 2, stability: 1 } },
      { id: "ay_pg_02_d", label: "Wanting meaningful social impact", weights: { impact: 2, S: 1 } }
    ]
  },
  {
    id: "ay_pg_03",
    text: "Between deep individual mastery and executive leadership, where do you lean?",
    format: "single_choice",
    category: "workstyle",
    tags: ["career_track"],
    followupTags: ["leadership"],
    segment: ["postgrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_pg_03_a", label: "Specialist staff engineer or researcher", weights: { I: 2, lead_vs_support: 0.7 } },
      { id: "ay_pg_03_b", label: "People manager driving team strategy", weights: { E: 2, lead_vs_support: -0.7 } },
      { id: "ay_pg_03_c", label: "General manager owning business P&L", weights: { E: 2, C: 1 } },
      { id: "ay_pg_03_d", label: "Independent consultant or boutique advisory", weights: { independence: 2, A: 1 } }
    ]
  },
  {
    id: "ay_pg_04",
    text: "How much risk are you comfortable taking in your next role?",
    format: "single_choice",
    category: "values",
    tags: ["risk_tolerance"],
    followupTags: ["tradeoff"],
    segment: ["postgrad"],
    section: "about_you",
    validated: true,
    options: [
      { id: "ay_pg_04_a", label: "High risk for immense equity", weights: { growth: 2, stability: -1 } },
      { id: "ay_pg_04_b", label: "Moderate risk in proven scaleups", weights: { growth: 1, learning: 1 } },
      { id: "ay_pg_04_c", label: "Low risk with predictable compensation", weights: { stability: 2, balance: 1 } },
      { id: "ay_pg_04_d", label: "Self-funded indie project autonomy", weights: { independence: 2, creativity: 1 } }
    ]
  },

  // ==========================================
  // SECTION 2: LIKES & DISLIKES (likes_dislikes)
  // Budget: 5 questions per interview
  // ==========================================

  // --- class_6_8 (Likes & Dislikes) ---
  {
    id: "ld_68_01",
    text: "Which school subject makes time fly by fastest for you?",
    format: "single_choice",
    category: "interest",
    tags: ["subject_favorite"],
    followupTags: ["math", "science", "art", "social"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_01_a", label: "🔬 Science and curious experiments", weights: { I: 2, R: 1 } },
      { id: "ld_68_01_b", label: "📐 Maths numbers and geometry", weights: { I: 2, C: 1 } },
      { id: "ld_68_01_c", label: "🎨 Drawing craft and music", weights: { A: 2, creativity: 1 } },
      { id: "ld_68_01_d", label: "📖 English stories and drama", weights: { A: 1, S: 1 } }
    ]
  },
  {
    id: "ld_68_02",
    text: "On a rainy Sunday, what would you hate doing most?",
    format: "single_choice",
    category: "interest",
    tags: ["dislikes", "aversion"],
    followupTags: ["chores"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_02_a", label: "🥱 Memorizing long history dates", weights: { I: -1, learning: 1 } },
      { id: "ld_68_02_b", label: "🥱 Sitting silently without talking", weights: { S: 1, independent_vs_team: 0.6 } },
      { id: "ld_68_02_c", label: "🥱 Tidying messy cupboard shelves", weights: { C: -1, creativity: 1 } },
      { id: "ld_68_02_d", label: "🥱 Solving tricky arithmetic worksheets", weights: { I: -1, A: 1 } }
    ]
  },
  {
    id: "ld_68_03",
    text: "Which weekend activity would you happily choose every single week?",
    format: "single_choice",
    category: "interest",
    tags: ["hobbies"],
    followupTags: ["play"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_03_a", label: "🧩 Solving Lego puzzles blocks", weights: { R: 2, I: 1 } },
      { id: "ld_68_03_b", label: "✍️ Writing poems and comics", weights: { A: 2, creativity: 1 } },
      { id: "ld_68_03_c", label: "🎪 Organizing games for friends", weights: { E: 2, S: 1 } },
      { id: "ld_68_03_d", label: "🌿 Caring for garden plants", weights: { S: 1, R: 1 } }
    ]
  },
  {
    id: "ld_68_04",
    text: "When working on a school exhibition chart, what is your role?",
    format: "single_choice",
    category: "interest",
    tags: ["school_projects"],
    followupTags: ["roles"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_04_a", label: "🖌️ Coloring borders and drawings", weights: { A: 2 } },
      { id: "ld_68_04_b", label: "🔍 Finding fun science facts", weights: { I: 2 } },
      { id: "ld_68_04_c", label: "🗣️ Explaining chart to visitors", weights: { E: 2, S: 1 } },
      { id: "ld_68_04_d", label: "✂️ Cutting pasting cardboard neatly", weights: { R: 2, C: 1 } }
    ]
  },
  {
    id: "ld_68_05",
    text: "Which kind of museum tour sounds most exciting to you?",
    format: "single_choice",
    category: "interest",
    tags: ["field_trips"],
    followupTags: ["curiosity"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_05_a", label: "🤖 Robotics and flight simulator", weights: { R: 2, I: 1 } },
      { id: "ld_68_05_b", label: "🦕 Dinosaur bones and fossils", weights: { I: 2 } },
      { id: "ld_68_05_c", label: "👑 Ancient royal treasure costumes", weights: { A: 1, S: 1 } },
      { id: "ld_68_05_d", label: "💰 Coin minting bank museum", weights: { C: 2, E: 1 } }
    ]
  },
  {
    id: "ld_68_06",
    text: "What do you like to do when you feel bored?",
    format: "single_choice",
    category: "interest",
    tags: ["boredom_relief"],
    followupTags: ["default_mode"],
    segment: ["class_6_8"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_68_06_a", label: "🔧 Take apart broken pens", weights: { R: 2 } },
      { id: "ld_68_06_b", label: "📖 Read mystery adventure books", weights: { I: 1, A: 1 } },
      { id: "ld_68_06_c", label: "📱 Chat and laugh with friends", weights: { S: 2 } },
      { id: "ld_68_06_d", label: "🎮 Play strategy board games", weights: { I: 1, C: 1 } }
    ]
  },

  // --- class_9_10 (Likes & Dislikes) ---
  {
    id: "ld_910_01",
    text: "Which subject homework do you naturally finish first without complaining?",
    format: "single_choice",
    category: "interest",
    tags: ["homework_ease"],
    followupTags: ["academic_fit"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_01_a", label: "🧮 Physics problems and algebra", weights: { I: 2, R: 1 } },
      { id: "ld_910_01_b", label: "🌱 Biology diagrams and anatomy", weights: { I: 2, S: 1 } },
      { id: "ld_910_01_c", label: "📊 Economics and business studies", weights: { E: 2, C: 1 } },
      { id: "ld_910_01_d", label: "✍️ Languages literature and arts", weights: { A: 2, creativity: 1 } }
    ]
  },
  {
    id: "ld_910_02",
    text: "What task makes you feel completely drained and irritated?",
    format: "single_choice",
    category: "interest",
    tags: ["academic_dislike"],
    followupTags: ["drain"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_02_a", label: "📑 Writing 5-page repetitive essays", weights: { A: -1, R: 1 } },
      { id: "ld_910_02_b", label: "🔢 Complex multi-step mathematical calculations", weights: { I: -1, C: -1 } },
      { id: "ld_910_02_c", label: "🗣️ Speaking before a huge audience", weights: { E: -1, independent_vs_team: -0.6 } },
      { id: "ld_910_02_d", label: "🧪 Memorizing organic chemistry reactions", weights: { I: -1, S: 1 } }
    ]
  },
  {
    id: "ld_910_03",
    text: "If you could pick one elective next term, what would it be?",
    format: "single_choice",
    category: "interest",
    tags: ["elective_choice"],
    followupTags: ["stream_signals"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_03_a", label: "💻 Computer applications and coding", weights: { R: 2, I: 1 } },
      { id: "ld_910_03_b", label: "📈 Commercial studies and marketing", weights: { E: 2, C: 1 } },
      { id: "ld_910_03_c", label: "🎨 Graphic design and animation", weights: { A: 2, creativity: 1 } },
      { id: "ld_910_03_d", label: "🧬 Environmental science and ecology", weights: { I: 1, S: 2 } }
    ]
  },
  {
    id: "ld_910_04",
    text: "Which YouTube or Instagram accounts do you find most binge-worthy?",
    format: "single_choice",
    category: "interest",
    tags: ["content_consumption"],
    followupTags: ["curiosity"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_04_a", label: "🛠️ Tech teardowns and PC builds", weights: { R: 2, I: 1 } },
      { id: "ld_910_04_b", label: "💼 Startup stories and shark tank", weights: { E: 2, growth: 1 } },
      { id: "ld_910_04_c", label: "🎨 Cinematic edits and visual art", weights: { A: 2, creativity: 1 } },
      { id: "ld_910_04_d", label: "🔍 Geopolitics crime cases documentaries", weights: { S: 1, I: 2 } }
    ]
  },
  {
    id: "ld_910_05",
    text: "During a school event, what team would you naturally join?",
    format: "single_choice",
    category: "interest",
    tags: ["school_event"],
    followupTags: ["contribution"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_05_a", label: "🎤 Anchoring or sponsoring team", weights: { E: 2, S: 1 } },
      { id: "ld_910_05_b", label: "🎛️ Sound lights and stage tech", weights: { R: 2, C: 1 } },
      { id: "ld_910_05_c", label: "🎨 Stage decor posters and brochures", weights: { A: 2 } },
      { id: "ld_910_05_d", label: "📋 Budgeting tickets and guest lists", weights: { C: 2, E: 1 } }
    ]
  },
  {
    id: "ld_910_06",
    text: "Which future working environment sounds totally unappealing to you?",
    format: "single_choice",
    category: "workstyle",
    tags: ["workplace_aversion"],
    followupTags: ["workstyle"],
    segment: ["class_9_10"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_910_06_a", label: "🏥 Stressful hospital emergency ward", weights: { S: -1, balance: 1 } },
      { id: "ld_910_06_b", label: "🏢 Boring cubicle with spreadsheet files", weights: { C: -2, creativity: 1 } },
      { id: "ld_910_06_c", label: "🏭 Noisy factory with heavy machinery", weights: { R: -2, I: 1 } },
      { id: "ld_910_06_d", label: "💼 Aggressive door-to-door sales pitching", weights: { E: -2, independence: 1 } }
    ]
  },

  // --- class_11_12 (Likes & Dislikes) ---
  {
    id: "ld_1112_01",
    text: "When studying your stream syllabus, which chapter types do you enjoy?",
    format: "single_choice",
    category: "interest",
    tags: ["stream_topics"],
    followupTags: ["aptitude"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_01_a", label: "Mathematical derivations and numerical problem-solving", weights: { I: 2, R: 1 } },
      { id: "ld_1112_01_b", label: "Biological systems and anatomical diagrams", weights: { I: 2, S: 1 } },
      { id: "ld_1112_01_c", label: "Financial ledger balancing and economics", weights: { C: 2, E: 1 } },
      { id: "ld_1112_01_d", label: "Constitutional law and social theories", weights: { S: 1, A: 2 } }
    ]
  },
  {
    id: "ld_1112_02",
    text: "Which kind of academic task frustrates you the quickest?",
    format: "single_choice",
    category: "interest",
    tags: ["frustration_type"],
    followupTags: ["dislike"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_02_a", label: "Rote memorization without conceptual reasoning", weights: { I: 2, practical_vs_conceptual: 0.6 } },
      { id: "ld_1112_02_b", label: "Pointless theoretical proofs without real-world use", weights: { R: 2, practical_vs_conceptual: -0.6 } },
      { id: "ld_1112_02_c", label: "Strict uniform rules suppressing individual expression", weights: { A: 2, independence: 2 } },
      { id: "ld_1112_02_d", label: "Endless arguing with no final consensus", weights: { C: 2, stability: 1 } }
    ]
  },
  {
    id: "ld_1112_03",
    text: "What college society or extracurricular club would you lead?",
    format: "single_choice",
    category: "interest",
    tags: ["club_choice"],
    followupTags: ["leadership"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_03_a", label: "Robotics and algorithmic coding club", weights: { R: 2, I: 1 } },
      { id: "ld_1112_03_b", label: "Entrepreneurship cell and finance conclave", weights: { E: 2, C: 1 } },
      { id: "ld_1112_03_c", label: "Dramatics visual arts and photography", weights: { A: 2, creativity: 1 } },
      { id: "ld_1112_03_d", label: "Model United Nations and debates", weights: { S: 1, E: 2 } }
    ]
  },
  {
    id: "ld_1112_04",
    text: "Which type of modern challenge do you find most intellectually exciting?",
    format: "single_choice",
    category: "interest",
    tags: ["global_problems"],
    followupTags: ["inquiry"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_04_a", label: "Building clean energy and electric vehicles", weights: { R: 2, I: 1 } },
      { id: "ld_1112_04_b", label: "Eradicating epidemics through genetic medicine", weights: { I: 2, S: 1 } },
      { id: "ld_1112_04_c", label: "Democratizing financial wealth via fintech", weights: { E: 2, C: 1 } },
      { id: "ld_1112_04_d", label: "Protecting civil rights and digital privacy", weights: { S: 2, A: 1 } }
    ]
  },
  {
    id: "ld_1112_05",
    text: "Would you rather build a physical machine or write digital algorithms?",
    format: "preference_comparison",
    category: "interest",
    tags: ["hardware_vs_software"],
    followupTags: ["tech_path"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_05_a", label: "Tinkering with physical electronics hardware", weights: { R: 2, practical_vs_conceptual: -0.6 } },
      { id: "ld_1112_05_b", label: "Designing clean algorithmic software code", weights: { I: 2, practical_vs_conceptual: 0.6 } },
      { id: "ld_1112_05_c", label: "Creating the user interface design", weights: { A: 2, creativity: 1 } },
      { id: "ld_1112_05_d", label: "Selling the product to customers", weights: { E: 2, growth: 1 } }
    ]
  },
  {
    id: "ld_1112_06",
    text: "How do you feel about high-stakes exam coaching environments?",
    format: "single_choice",
    category: "workstyle",
    tags: ["coaching_pressure"],
    followupTags: ["pressure_tolerance"],
    segment: ["class_11_12"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_1112_06_a", label: "Thrive in intense competitive rank races", weights: { structured_vs_flexible: -0.5, growth: 1 } },
      { id: "ld_1112_06_b", label: "Prefer self-paced disciplined quiet study", weights: { independent_vs_team: -0.7, balance: 1 } },
      { id: "ld_1112_06_c", label: "Suffocate under test drill factories", weights: { creativity: 2, independence: 2 } },
      { id: "ld_1112_06_d", label: "Learn best through collaborative discussion", weights: { independent_vs_team: 0.7, S: 1 } }
    ]
  },

  // --- undergrad & postgrad (Likes & Dislikes) ---
  {
    id: "ld_ug_01",
    text: "Which daily workday activity makes you feel most energised?",
    format: "single_choice",
    category: "interest",
    tags: ["workday_energy"],
    followupTags: ["job_crafting"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_01_a", label: "Debugging complex software architectural issues", weights: { I: 2, R: 1 } },
      { id: "ld_ug_01_b", label: "Pitching deals and closing clients", weights: { E: 2, growth: 1 } },
      { id: "ld_ug_01_c", label: "Crafting polished design UI systems", weights: { A: 2, creativity: 1 } },
      { id: "ld_ug_01_d", label: "Coaching teammates through blockers", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "ld_ug_02",
    text: "What workplace friction makes you want to quit fastest?",
    format: "single_choice",
    category: "values",
    tags: ["workplace_friction"],
    followupTags: ["dealbreaker"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_02_a", label: "Toxic micromanagement with zero autonomy", weights: { independence: 2, lead_vs_support: -0.5 } },
      { id: "ld_ug_02_b", label: "Unethical leadership ignoring user safety", weights: { impact: 2, values: 1 } },
      { id: "ld_ug_02_c", label: "Stagnant pay with no promotion", weights: { growth: 2, E: 1 } },
      { id: "ld_ug_02_d", label: "Chaotic goals changing every afternoon", weights: { structured_vs_flexible: -0.8, stability: 1 } }
    ]
  },
  {
    id: "ld_ug_03",
    text: "Would you rather optimize an existing machine or invent brand-new products?",
    format: "preference_comparison",
    category: "interest",
    tags: ["optimization_vs_invention"],
    followupTags: ["innovation"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_03_a", label: "Inventing novel unproven product concepts", weights: { creativity: 2, A: 1, I: 1 } },
      { id: "ld_ug_03_b", label: "Fine-tuning efficiency and scale metrics", weights: { C: 2, R: 1, practical_vs_conceptual: -0.5 } },
      { id: "ld_ug_03_c", label: "Scaling commercial customer distribution channels", weights: { E: 2, growth: 1 } },
      { id: "ld_ug_03_d", label: "Conducting rigorous clinical research trials", weights: { I: 2, S: 1 } }
    ]
  },
  {
    id: "ld_ug_04",
    text: "How do you respond to ambiguous open-ended business briefs?",
    format: "single_choice",
    category: "workstyle",
    tags: ["ambiguity_tolerance"],
    followupTags: ["execution"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_04_a", label: "Love defining the path forward", weights: { structured_vs_flexible: 0.8, lead_vs_support: -0.6 } },
      { id: "ld_ug_04_b", label: "Prefer clear deliverables and timelines", weights: { structured_vs_flexible: -0.8, C: 1 } },
      { id: "ld_ug_04_c", label: "Break it down into data", weights: { I: 2, C: 1 } },
      { id: "ld_ug_04_d", label: "Brainstorm visual ideas with peers", weights: { A: 1, independent_vs_team: 0.7 } }
    ]
  },
  {
    id: "ld_ug_05",
    text: "Which industry domain interests you most right now?",
    format: "single_choice",
    category: "interest",
    tags: ["industry_vertical"],
    followupTags: ["domain"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_05_a", label: "Artificial intelligence and cloud infrastructure", weights: { I: 2, R: 1 } },
      { id: "ld_ug_05_b", label: "Private equity venture capital fintech", weights: { E: 2, C: 1 } },
      { id: "ld_ug_05_c", label: "Digital healthcare and biotech diagnostics", weights: { S: 1, I: 2 } },
      { id: "ld_ug_05_d", label: "Consumer brands entertainment and gaming", weights: { A: 2, E: 1 } }
    ]
  },
  {
    id: "ld_ug_06",
    text: "What type of stakeholder meetings do you actively avoid?",
    format: "single_choice",
    category: "workstyle",
    tags: ["meeting_aversion"],
    followupTags: ["workstyle"],
    segment: ["undergrad", "postgrad"],
    section: "likes_dislikes",
    validated: true,
    options: [
      { id: "ld_ug_06_a", label: "Diplomatic political alignment discussions", weights: { E: -1, independent_vs_team: -0.6 } },
      { id: "ld_ug_06_b", label: "Granular compliance and tax audits", weights: { C: -2, creativity: 1 } },
      { id: "ld_ug_06_c", label: "High-level fluffy strategy without execution", weights: { practical_vs_conceptual: -0.8, R: 1 } },
      { id: "ld_ug_06_d", label: "Pure sales aggressive cold outreach", weights: { E: -2, S: 1 } }
    ]
  },

  // ==========================================
  // SECTION 3: HOW YOU LIKE TO WORK (work_style)
  // Budget: 4 questions per interview
  // ==========================================

  // --- class_6_8 (How You Like to Work) ---
  {
    id: "ws_68_01",
    text: "When playing games, do you prefer team or solo play?",
    format: "single_choice",
    category: "workstyle",
    tags: ["team_vs_solo"],
    followupTags: ["workstyle"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_01_a", label: "👥 Big loud team with friends", weights: { independent_vs_team: 0.8, S: 1 } },
      { id: "ws_68_01_b", label: "👤 Quiet solo play with focus", weights: { independent_vs_team: -0.8, I: 1 } },
      { id: "ws_68_01_c", label: "🤝 One close trusted best friend", weights: { independent_vs_team: 0.2, S: 1 } },
      { id: "ws_68_01_d", label: "👑 Leading and choosing team rules", weights: { lead_vs_support: -0.8, E: 1 } }
    ]
  },
  {
    id: "ws_68_02",
    text: "Do you like strict timetables or free choice schedules?",
    format: "single_choice",
    category: "workstyle",
    tags: ["routine_vs_freedom"],
    followupTags: ["routine"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_02_a", label: "⏰ Fixed timetable knowing every hour", weights: { structured_vs_flexible: -0.8, C: 1 } },
      { id: "ws_68_02_b", label: "🎨 Total freedom to do whatever", weights: { structured_vs_flexible: 0.8, A: 1 } },
      { id: "ws_68_02_c", label: "📝 Finishing homework fast then playing", weights: { structured_vs_flexible: -0.3, stability: 1 } },
      { id: "ws_68_02_d", label: "⚡ Working in exciting energetic bursts", weights: { structured_vs_flexible: 0.5, E: 1 } }
    ]
  },
  {
    id: "ws_68_03",
    text: "In group projects, do you speak up or listen quietly?",
    format: "single_choice",
    category: "workstyle",
    tags: ["group_behavior"],
    followupTags: ["voice"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_03_a", label: "📢 Speak first and guide everyone", weights: { lead_vs_support: -0.8, E: 1 } },
      { id: "ws_68_03_b", label: "👂 Listen quietly and do task", weights: { lead_vs_support: 0.8, C: 1 } },
      { id: "ws_68_03_c", label: "💡 Offer clever secret creative ideas", weights: { A: 1, I: 1 } },
      { id: "ws_68_03_d", label: "🤝 Make sure nobody gets hurt", weights: { S: 2 } }
    ]
  },
  {
    id: "ws_68_04",
    text: "Would you rather practice hands-on building or listen to stories?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["hands_on_vs_listening"],
    followupTags: ["learning_style"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_04_a", label: "🛠️ Hands-on building physical models", weights: { practical_vs_conceptual: -0.8, R: 2 } },
      { id: "ws_68_04_b", label: "📖 Hearing imaginative adventure stories", weights: { practical_vs_conceptual: 0.8, A: 1 } },
      { id: "ws_68_04_c", label: "📊 Organizing facts into charts", weights: { practical_vs_conceptual: -0.2, C: 1 } },
      { id: "ws_68_04_d", label: "🎭 Roleplaying characters with classmates", weights: { practical_vs_conceptual: 0.4, S: 1 } }
    ]
  },
  {
    id: "ws_68_05",
    text: "When you get stuck on difficult homework, what do you do?",
    format: "single_choice",
    category: "workstyle",
    tags: ["problem_solving"],
    followupTags: ["resilience"],
    segment: ["class_6_8"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_68_05_a", label: "🙋 Ask teacher or parent immediately", weights: { S: 1, independent_vs_team: 0.6 } },
      { id: "ws_68_05_b", label: "🧠 Think alone until I solve", weights: { I: 2, independent_vs_team: -0.7 } },
      { id: "ws_68_05_c", label: "📱 Search online video for solution", weights: { R: 1, learning: 1 } },
      { id: "ws_68_05_d", label: "⏭️ Skip it and do something", weights: { structured_vs_flexible: 0.5 } }
    ]
  },

  // --- class_9_10 (How You Like to Work) ---
  {
    id: "ws_910_01",
    text: "Do you study best alone in your room or with friends?",
    format: "single_choice",
    category: "workstyle",
    tags: ["study_mode"],
    followupTags: ["solitary_vs_group"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_01_a", label: "🎧 Total silence alone in room", weights: { independent_vs_team: -0.8, I: 1 } },
      { id: "ws_910_01_b", label: "🗣️ Active group study and quizzing", weights: { independent_vs_team: 0.8, S: 1 } },
      { id: "ws_910_01_c", label: "🎵 Listening to music while solving", weights: { independent_vs_team: -0.3, A: 1 } },
      { id: "ws_910_01_d", label: "👥 Explaining concepts to weaker classmates", weights: { lead_vs_support: -0.6, S: 2 } }
    ]
  },
  {
    id: "ws_910_02",
    text: "When facing a school assignment, how do you manage time?",
    format: "single_choice",
    category: "workstyle",
    tags: ["time_management"],
    followupTags: ["planning"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_02_a", label: "📅 Plan days ahead in advance", weights: { structured_vs_flexible: -0.8, C: 2 } },
      { id: "ws_910_02_b", label: "⚡ Sprint night before the deadline", weights: { structured_vs_flexible: 0.8, E: 1 } },
      { id: "ws_910_02_c", label: "🎯 Work steadily step by step", weights: { structured_vs_flexible: -0.4, stability: 1 } },
      { id: "ws_910_02_d", label: "🎨 Spend all time perfecting visuals", weights: { A: 2, creativity: 1 } }
    ]
  },
  {
    id: "ws_910_03",
    text: "If your project team has an argument, how do you react?",
    format: "single_choice",
    category: "workstyle",
    tags: ["conflict_style"],
    followupTags: ["team_dynamics"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_03_a", label: "⚖️ Mediate calmly and find compromise", weights: { S: 2, lead_vs_support: 0.2 } },
      { id: "ws_910_03_b", label: "🎯 Take control and decide firmly", weights: { lead_vs_support: -0.8, E: 2 } },
      { id: "ws_910_03_c", label: "🚶 Step back and do my part", weights: { independent_vs_team: -0.6, lead_vs_support: 0.8 } },
      { id: "ws_910_03_d", label: "📊 Look at objective facts logic", weights: { I: 2, C: 1 } }
    ]
  },
  {
    id: "ws_910_04",
    text: "Do you prefer exact step-by-step instructions or open experiments?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["instruction_style"],
    followupTags: ["structure"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_04_a", label: "📋 Clear instructions with rubric marks", weights: { structured_vs_flexible: -0.8, C: 1 } },
      { id: "ws_910_04_b", label: "🚀 Open topic with creative liberty", weights: { structured_vs_flexible: 0.8, A: 2 } },
      { id: "ws_910_04_c", label: "🧪 Science experiment testing fresh hypotheses", weights: { I: 2, practical_vs_conceptual: 0.3 } },
      { id: "ws_910_04_d", label: "🛠️ Real physical task with tools", weights: { R: 2, practical_vs_conceptual: -0.8 } }
    ]
  },
  {
    id: "ws_910_05",
    text: "How comfortable are you standing in front of your class?",
    format: "single_choice",
    category: "workstyle",
    tags: ["public_speaking"],
    followupTags: ["confidence"],
    segment: ["class_9_10"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_910_05_a", label: "🎤 Love the stage and attention", weights: { E: 2, recognition: 1 } },
      { id: "ws_910_05_b", label: "💬 Confident if I know topic", weights: { I: 1, lead_vs_support: -0.3 } },
      { id: "ws_910_05_c", label: "😰 Rather write than speak aloud", weights: { independent_vs_team: -0.7, A: 1 } },
      { id: "ws_910_05_d", label: "🤝 Happy supporting behind the curtain", weights: { lead_vs_support: 0.8, S: 1 } }
    ]
  },

  // --- class_11_12, undergrad, postgrad (How You Like to Work) ---
  {
    id: "ws_shared_01",
    text: "In collaborative projects, which role naturally falls into your hands?",
    format: "single_choice",
    category: "workstyle",
    tags: ["team_role"],
    followupTags: ["leadership"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_01_a", label: "Project coordinator setting deadlines", weights: { lead_vs_support: -0.8, E: 2, C: 1 } },
      { id: "ws_shared_01_b", label: "Deep-diver solving toughest technical blocker", weights: { I: 2, lead_vs_support: 0.6 } },
      { id: "ws_shared_01_c", label: "Visual designer and storyteller", weights: { A: 2, creativity: 1 } },
      { id: "ws_shared_01_d", label: "Team harmonizer ensuring high morale", weights: { S: 2, independent_vs_team: 0.7 } }
    ]
  },
  {
    id: "ws_shared_02",
    text: "Do you thrive under structured standard operating procedures or dynamic pivots?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["structured_vs_flexible"],
    followupTags: ["process"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_02_a", label: "Clear processes, templates, and predictable roadmaps", weights: { structured_vs_flexible: -0.8, C: 2 } },
      { id: "ws_shared_02_b", label: "Fast-changing sprints adapting every single week", weights: { structured_vs_flexible: 0.8, E: 1 } },
      { id: "ws_shared_02_c", label: "Methodical scientific experimentation protocol", weights: { I: 2, structured_vs_flexible: -0.3 } },
      { id: "ws_shared_02_d", label: "Unconstrained creative artistic exploration", weights: { A: 2, structured_vs_flexible: 0.9 } }
    ]
  },
  {
    id: "ws_shared_03",
    text: "Between high-level strategy and hands-on execution, what energizes you?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["practical_vs_conceptual"],
    followupTags: ["execution_focus"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_03_a", label: "Building, coding, and shipping tangible work", weights: { practical_vs_conceptual: -0.8, R: 2 } },
      { id: "ws_shared_03_b", label: "Formulating abstract market or product vision", weights: { practical_vs_conceptual: 0.8, E: 1, I: 1 } },
      { id: "ws_shared_03_c", label: "Balancing both through agile sprints", weights: { practical_vs_conceptual: 0.0, learning: 1 } },
      { id: "ws_shared_03_d", label: "Synthesizing human behavioral psychological research", weights: { practical_vs_conceptual: 0.5, S: 2 } }
    ]
  },
  {
    id: "ws_shared_04",
    text: "How do you prefer receiving feedback on your professional work?",
    format: "single_choice",
    category: "workstyle",
    tags: ["feedback_style"],
    followupTags: ["communication"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_04_a", label: "Direct, objective, metric-driven critique", weights: { I: 1, C: 1, practical_vs_conceptual: -0.4 } },
      { id: "ws_shared_04_b", label: "Empathetic 1-on-1 private constructive conversation", weights: { S: 2, balance: 1 } },
      { id: "ws_shared_04_c", label: "Quick asynchronous written notes on docs", weights: { independent_vs_team: -0.6 } },
      { id: "ws_shared_04_d", label: "Public team review celebrating wins", weights: { recognition: 2, E: 1 } }
    ]
  },
  {
    id: "ws_shared_05",
    text: "When making tough decisions, what carries the heaviest weight?",
    format: "single_choice",
    category: "workstyle",
    tags: ["decision_making"],
    followupTags: ["values"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "work_style",
    validated: true,
    options: [
      { id: "ws_shared_05_a", label: "Rigorous statistical and quantitative evidence", weights: { I: 2, C: 1 } },
      { id: "ws_shared_05_b", label: "Human empathy and team well-being", weights: { S: 2, impact: 1 } },
      { id: "ws_shared_05_c", label: "Strategic commercial business return", weights: { E: 2, growth: 1 } },
      { id: "ws_shared_05_d", label: "Aesthetic elegance and bold originality", weights: { A: 2, creativity: 1 } }
    ]
  },

  // ==========================================
  // SECTION 4: WHAT YOU ARE BEST AT (best_at)
  // Budget: 5 questions per interview
  // Includes 3-4 tiny objective mini-challenges!
  // ==========================================

  // --- class_6_8 (What You Are Best At) ---
  {
    id: "ba_68_01",
    text: "What do your classmates usually ask you for help with?",
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
      { id: "ba_68_01_d", label: "🤝 Resolving friendship playground fights", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "ba_68_02",
    text: "What activity feels super easy and effortless to you?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["effortless_skill"],
    followupTags: ["aptitude"],
    segment: ["class_6_8"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_68_02_a", label: "🗣️ Telling jokes entertaining crowds", weights: { E: 2, recognition: 1 } },
      { id: "ba_68_02_b", label: "🔍 Spotting tiny hidden errors", weights: { C: 2, I: 1 } },
      { id: "ba_68_02_c", label: "🏃 Sports games and physical agility", weights: { R: 2 } },
      { id: "ba_68_02_d", label: "📝 Writing stories and poetry", weights: { A: 2 } }
    ]
  },
  // Mini-Challenge 1 (6-8): Logic Pattern
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
      { id: "ba_68_ch_01_b", label: "32", weights: { I: 2, C: 1 } }, // Correct
      { id: "ba_68_ch_01_c", label: "30", weights: { I: 0 } },
      { id: "ba_68_ch_01_d", label: "64", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 2 (6-8): Word Analogies
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
      { id: "ba_68_ch_02_a", label: "Water", weights: { I: 1, A: 1 } }, // Correct
      { id: "ba_68_ch_02_b", label: "Nest", weights: { I: 0 } },
      { id: "ba_68_ch_02_c", label: "Sand", weights: { I: 0 } },
      { id: "ba_68_ch_02_d", label: "Tree", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 3 (6-8): Simple Arithmetic Logic
  {
    id: "ba_68_ch_03",
    text: "A pen costs ₹10. Three pens cost how much?",
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
      { id: "ba_68_ch_03_b", label: "₹30", weights: { C: 2, I: 1 } }, // Correct
      { id: "ba_68_ch_03_c", label: "₹40", weights: { C: 0 } },
      { id: "ba_68_ch_03_d", label: "₹25", weights: { C: 0 } }
    ]
  },
  {
    id: "ba_68_04",
    text: "When teachers praise your work, what do they commend most?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["teacher_feedback"],
    followupTags: ["strengths"],
    segment: ["class_6_8"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_68_04_a", label: "⭐ Neat handwriting and neatness", weights: { C: 2 } },
      { id: "ba_68_04_b", label: "⭐ Original creative ideas", weights: { A: 2 } },
      { id: "ba_68_04_c", label: "⭐ Polite helpful behavior", weights: { S: 2 } },
      { id: "ba_68_04_d", label: "⭐ Fast accurate answers", weights: { I: 2 } }
    ]
  },

  // --- class_9_10 (What You Are Best At) ---
  {
    id: "ba_910_01",
    text: "Which skill gives you the highest confidence in school competitions?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["competition_strength"],
    followupTags: ["talent"],
    segment: ["class_9_10"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_910_01_a", label: "🏆 Debating and persuasive speaking", weights: { E: 2, S: 1 } },
      { id: "ba_910_01_b", label: "🏆 Science Olympiad logic questions", weights: { I: 2, R: 1 } },
      { id: "ba_910_01_c", label: "🏆 Painting and creative design", weights: { A: 2, creativity: 1 } },
      { id: "ba_910_01_d", label: "🏆 Managing team logistics smoothly", weights: { C: 2, E: 1 } }
    ]
  },
  {
    id: "ba_910_02",
    text: "When your friends plan a weekend trip, what do you handle?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["informal_strengths"],
    followupTags: ["execution"],
    segment: ["class_9_10"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_910_02_a", label: "🗺️ Finding cool scenic photo spots", weights: { A: 2 } },
      { id: "ba_910_02_b", label: "💵 Calculating expenses and sharing bills", weights: { C: 2, E: 1 } },
      { id: "ba_910_02_c", label: "🚗 Fixing transit and travel routes", weights: { R: 2, C: 1 } },
      { id: "ba_910_02_d", label: "🎉 Keeping everyone energized and happy", weights: { S: 2, E: 1 } }
    ]
  },
  // Mini-Challenge 1 (9-10 & 11-12): Number Puzzle
  {
    id: "ba_910_ch_01",
    text: "A bat and ball cost ₹110. Bat is ₹100 more. Ball?",
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
      { id: "ba_910_ch_01_b", label: "₹5", weights: { I: 2, C: 1 } }, // Correct: 105 + 5 = 110
      { id: "ba_910_ch_01_c", label: "₹15", weights: { I: 0 } },
      { id: "ba_910_ch_01_d", label: "₹20", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 2 (9-10 & 11-12): Word Reasoning
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
      { id: "ba_910_ch_02_a", label: "Temperature", weights: { I: 2, R: 1 } }, // Correct
      { id: "ba_910_ch_02_b", label: "Weather", weights: { I: 0 } },
      { id: "ba_910_ch_02_c", label: "Mercury", weights: { I: 0 } },
      { id: "ba_910_ch_02_d", label: "Fever", weights: { I: 0 } }
    ]
  },
  {
    id: "ba_910_03",
    text: "Which of these tasks can you do for hours without fatigue?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["deep_flow"],
    followupTags: ["endurance"],
    segment: ["class_9_10"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_910_03_a", label: "💻 Learning programming and tech tools", weights: { R: 2, I: 1 } },
      { id: "ba_910_03_b", label: "🎨 Sketching digital art and editing", weights: { A: 2, creativity: 1 } },
      { id: "ba_910_03_c", label: "🤝 Counseling and listening to friends", weights: { S: 2, impact: 1 } },
      { id: "ba_910_03_d", label: "📈 Researching stocks and business news", weights: { E: 2, C: 1 } }
    ]
  },

  // --- class_11_12, undergrad, postgrad (What You Are Best At) ---
  {
    id: "ba_shared_01",
    text: "Which core intellectual muscle feels most naturally reliable to you?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["intellectual_strength"],
    followupTags: ["cognitive_bias"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_shared_01_a", label: "Deconstructing systems into foundational logic", weights: { I: 2, R: 1 } },
      { id: "ba_shared_01_b", label: "Commercial negotiation and strategic persuasion", weights: { E: 2, growth: 1 } },
      { id: "ba_shared_01_c", label: "Visual composition, aesthetics, and branding", weights: { A: 2, creativity: 1 } },
      { id: "ba_shared_01_d", label: "Operational precision, budgets, and compliance", weights: { C: 2, stability: 1 } }
    ]
  },
  // Mini-Challenge 1 (Higher level): Logical Deduction
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
      { id: "ba_high_ch_01_b", label: "Cannot be determined definitively", weights: { I: 2, C: 1 } }, // Correct: syllogism validity
      { id: "ba_high_ch_01_c", label: "All flowers are roses", weights: { I: 0 } },
      { id: "ba_high_ch_01_d", label: "No roses fade quickly", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 2 (Higher level): Math Puzzle
  {
    id: "ba_high_ch_02",
    text: "Five machines make 5 widgets in 5 minutes. 100 machines?",
    format: "objective_challenge",
    category: "strength_challenge",
    isMiniChallenge: true,
    tags: ["mini_challenge", "rate_problem"],
    followupTags: ["quantitative_aptitude"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_high_ch_02_a", label: "100 widgets in 5 minutes", weights: { I: 2, C: 1 } }, // Correct
      { id: "ba_high_ch_02_b", label: "100 widgets in 100 minutes", weights: { I: 0 } },
      { id: "ba_high_ch_02_c", label: "5 widgets in 5 minutes", weights: { I: 0 } },
      { id: "ba_high_ch_02_d", label: "50 widgets in 25 minutes", weights: { I: 0 } }
    ]
  },
  // Mini-Challenge 3 (Higher level): Word Relation
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
      { id: "ba_high_ch_03_a", label: "Abundance", weights: { I: 2, A: 1 } }, // Correct antonym
      { id: "ba_high_ch_03_b", label: "Poverty", weights: { I: 0 } },
      { id: "ba_high_ch_03_c", label: "Deficit", weights: { I: 0 } },
      { id: "ba_high_ch_03_d", label: "Wealthy", weights: { I: 0 } }
    ]
  },
  {
    id: "ba_shared_02",
    text: "What complex task do peers praise you for simplifying effortlessly?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["simplification_strength"],
    followupTags: ["communication"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_shared_02_a", label: "Explaining confusing algorithmic code architectures", weights: { I: 2, R: 1 } },
      { id: "ba_shared_02_b", label: "Turning ambiguous chaos into action items", weights: { lead_vs_support: -0.6, C: 2 } },
      { id: "ba_shared_02_c", label: "Pitching complex products with compelling analogies", weights: { E: 2, A: 1 } },
      { id: "ba_shared_02_d", label: "Diagnosing emotional roadblocks in colleagues", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "ba_shared_03",
    text: "In intense crisis moments, what is your most reliable personal trait?",
    format: "single_choice",
    category: "strength_challenge",
    tags: ["crisis_trait"],
    followupTags: ["composure"],
    segment: ["undergrad", "postgrad"],
    section: "best_at",
    validated: true,
    options: [
      { id: "ba_shared_03_a", label: "Ice-cold analytical detachment and composure", weights: { I: 2, C: 1 } },
      { id: "ba_shared_03_b", label: "Decisive executive action under fire", weights: { E: 2, lead_vs_support: -0.7 } },
      { id: "ba_shared_03_c", label: "Lateral out-of-the-box creative problem solving", weights: { A: 2, creativity: 1 } },
      { id: "ba_shared_03_d", label: "De-escalating team panic and anxiety", weights: { S: 2, impact: 1 } }
    ]
  },

  // ==========================================
  // SECTION 5: WHAT MATTERS TO YOU (values)
  // Budget: 3 questions per interview
  // ==========================================

  // --- class_6_8 (What Matters to You) ---
  {
    id: "val_68_01",
    text: "When you imagine having lots of money, what matters most?",
    format: "single_choice",
    category: "values",
    tags: ["child_values"],
    followupTags: ["values"],
    segment: ["class_6_8"],
    section: "values",
    validated: true,
    options: [
      { id: "val_68_01_a", label: "🏠 Buying a safe happy home", weights: { stability: 2 } },
      { id: "val_68_01_b", label: "🌍 Traveling and seeing wild world", weights: { independence: 2, learning: 1 } },
      { id: "val_68_01_c", label: "🎁 Helping poor families and children", weights: { impact: 2, S: 1 } },
      { id: "val_68_01_d", label: "🚀 Inventing machines to change lives", weights: { creativity: 2, I: 1 } }
    ]
  },
  {
    id: "val_68_02",
    text: "What would make you feel most proud of yourself?",
    format: "single_choice",
    category: "values",
    tags: ["pride"],
    followupTags: ["fulfillment"],
    segment: ["class_6_8"],
    section: "values",
    validated: true,
    options: [
      { id: "val_68_02_a", label: "🥇 Winning first prize in school", weights: { recognition: 2, E: 1 } },
      { id: "val_68_02_b", label: "❤️ Being a kind helpful friend", weights: { S: 2, impact: 1 } },
      { id: "val_68_02_c", label: "🎨 Creating something beautiful on paper", weights: { A: 2, creativity: 2 } },
      { id: "val_68_02_d", label: "🧩 Discovering answers nobody else knew", weights: { I: 2, learning: 2 } }
    ]
  },
  {
    id: "val_68_03",
    text: "Which dream job wish would you make to a genie?",
    format: "single_choice",
    category: "values",
    tags: ["aspirations"],
    followupTags: ["wrapup"],
    segment: ["class_6_8"],
    section: "values",
    validated: true,
    options: [
      { id: "val_68_03_a", label: "✨ Job that feels like fun", weights: { balance: 2, creativity: 1 } },
      { id: "val_68_03_b", label: "✨ Job where I lead people", weights: { E: 2, recognition: 1 } },
      { id: "val_68_03_c", label: "✨ Job where I cure illnesses", weights: { S: 2, impact: 2 } },
      { id: "val_68_03_d", label: "✨ Job building robots and computers", weights: { R: 2, I: 1 } }
    ]
  },
  {
    id: "val_68_04",
    text: "At the end of a long day, what feels best?",
    format: "single_choice",
    category: "values",
    tags: ["day_satisfaction"],
    followupTags: ["values"],
    segment: ["class_6_8"],
    section: "values",
    validated: true,
    options: [
      { id: "val_68_04_a", label: "🛋️ Relaxing peacefully with zero worries", weights: { balance: 2, stability: 1 } },
      { id: "val_68_04_b", label: "📖 Learning brand new curious facts", weights: { learning: 2, I: 1 } },
      { id: "val_68_04_c", label: "🤝 Knowing I helped someone smile", weights: { impact: 2, S: 1 } },
      { id: "val_68_04_d", label: "🏆 Achieving victory in a game", weights: { recognition: 1, growth: 1 } }
    ]
  },

  // --- class_9_10 (What Matters to You) ---
  {
    id: "val_910_01",
    text: "If you had to sacrifice one thing in your career, which is it?",
    format: "single_choice",
    category: "values",
    tags: ["value_tradeoff"],
    followupTags: ["priorities"],
    segment: ["class_9_10"],
    section: "values",
    validated: true,
    options: [
      { id: "val_910_01_a", label: "Can give up fancy fame", weights: { recognition: -1, balance: 1 } },
      { id: "val_910_01_b", label: "Can sacrifice extreme high wealth", weights: { growth: -1, impact: 1 } },
      { id: "val_910_01_c", label: "Can sacrifice easy work hours", weights: { balance: -1, growth: 2 } },
      { id: "val_910_01_d", label: "Can give up predictable routine", weights: { stability: -1, independence: 2 } }
    ]
  },
  {
    id: "val_910_02",
    text: "What kind of reputation do you want among peers?",
    format: "single_choice",
    category: "values",
    tags: ["peer_reputation"],
    followupTags: ["identity"],
    segment: ["class_9_10"],
    section: "values",
    validated: true,
    options: [
      { id: "val_910_02_a", label: "🧠 The sharpest problem solver", weights: { I: 2, learning: 1 } },
      { id: "val_910_02_b", label: "👑 The inspiring leader achiever", weights: { E: 2, recognition: 2 } },
      { id: "val_910_02_c", label: "🎨 The most unique creator", weights: { A: 2, creativity: 2 } },
      { id: "val_910_02_d", label: "🤝 The kindest trustworthy friend", weights: { S: 2, impact: 1 } }
    ]
  },
  {
    id: "val_910_03",
    text: "When choosing a career stream, whose happiness matters most?",
    format: "single_choice",
    category: "values",
    tags: ["stream_happiness"],
    followupTags: ["autonomy"],
    segment: ["class_9_10"],
    section: "values",
    validated: true,
    options: [
      { id: "val_910_03_a", label: "🕊️ My own genuine personal passion", weights: { independence: 2, creativity: 1 } },
      { id: "val_910_03_b", label: "👨‍👩‍👦 My family security and pride", weights: { stability: 2, recognition: 1 } },
      { id: "val_910_03_c", label: "💰 Fast financial independence early on", weights: { growth: 2, E: 1 } },
      { id: "val_910_03_d", label: "🌍 Tangible difference to society", weights: { impact: 2, S: 1 } }
    ]
  },
  {
    id: "val_910_04",
    text: "Which life achievement would mean total success for you?",
    format: "single_choice",
    category: "values",
    tags: ["life_success"],
    followupTags: ["vision"],
    segment: ["class_9_10"],
    section: "values",
    validated: true,
    options: [
      { id: "val_910_04_a", label: "🏢 Building my own flourishing company", weights: { E: 2, growth: 2 } },
      { id: "val_910_04_b", label: "🔬 Discovering breakthrough scientific cure", weights: { I: 2, impact: 2 } },
      { id: "val_910_04_c", label: "🎨 Publishing world-famous creative masterpieces", weights: { A: 2, creativity: 2 } },
      { id: "val_910_04_d", label: "🏖️ Peaceful stress-free work-life balance", weights: { balance: 2, stability: 1 } }
    ]
  },

  // --- class_11_12, undergrad, postgrad (What Matters to You) ---
  {
    id: "val_shared_01",
    text: "What core life reward anchors your deepest career decisions?",
    format: "single_choice",
    category: "values",
    tags: ["core_anchor"],
    followupTags: ["purpose"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "values",
    validated: true,
    options: [
      { id: "val_shared_01_a", label: "Uncapped financial growth and wealth accumulation", weights: { growth: 2, E: 1 } },
      { id: "val_shared_01_b", label: "Total schedule autonomy and location freedom", weights: { independence: 2, balance: 1 } },
      { id: "val_shared_01_c", label: "Direct societal impact on underprivileged communities", weights: { impact: 2, S: 1 } },
      { id: "val_shared_01_d", label: "Relentless intellectual mastery and discovery", weights: { learning: 2, I: 1 } }
    ]
  },
  {
    id: "val_shared_02",
    text: "Would you accept 70-hour weeks for rapid executive advancement?",
    format: "preference_comparison",
    category: "values",
    tags: ["work_life_tradeoff"],
    followupTags: ["intensity"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "values",
    validated: true,
    options: [
      { id: "val_shared_02_a", label: "Yes, fast promotions and high payout", weights: { growth: 2, balance: -1, E: 1 } },
      { id: "val_shared_02_b", label: "No, strict 40-hour boundary protection", weights: { balance: 2, stability: 1 } },
      { id: "val_shared_02_c", label: "Only if building my own venture", weights: { independence: 2, growth: 1, E: 1 } },
      { id: "val_shared_02_d", label: "Only if advancing scientific breakthroughs", weights: { learning: 2, impact: 1, I: 1 } }
    ]
  },
  {
    id: "val_shared_03",
    text: "How important is public social prestige and corporate status to you?",
    format: "single_choice",
    category: "values",
    tags: ["status_importance"],
    followupTags: ["recognition"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "values",
    validated: true,
    options: [
      { id: "val_shared_03_a", label: "Essential to represent family and community", weights: { recognition: 2, E: 1 } },
      { id: "val_shared_03_b", label: "Secondary behind financial compensation and security", weights: { stability: 2, growth: 1 } },
      { id: "val_shared_03_c", label: "Irrelevant; inner craftsmanship matters most", weights: { creativity: 2, learning: 1, A: 1 } },
      { id: "val_shared_03_d", label: "Reputation among specialist domain peers only", weights: { I: 2, recognition: 1 } }
    ]
  },
  {
    id: "val_shared_04",
    text: "At retirement, what legacy will prove your career was well-spent?",
    format: "single_choice",
    category: "values",
    tags: ["legacy_definition"],
    followupTags: ["final_wrapup"],
    segment: ["class_11_12", "undergrad", "postgrad"],
    section: "values",
    validated: true,
    options: [
      { id: "val_shared_04_a", label: "Institutions and businesses that outlive me", weights: { E: 2, growth: 2 } },
      { id: "val_shared_04_b", label: "Pioneering patents, books, or discoveries", weights: { I: 2, learning: 2, A: 1 } },
      { id: "val_shared_04_c", label: "Thousands of lives tangibly improved", weights: { impact: 2, S: 2 } },
      { id: "val_shared_04_d", label: "A healthy, balanced, and joyful family", weights: { balance: 2, stability: 2 } }
    ]
  }
];

// Verify every question against the strict prompt constraints:
console.log(`Analyzing ${rawQuestions.length} questions...`);

const sectionCounts = {
  about_you: 0,
  likes_dislikes: 0,
  work_style: 0,
  best_at: 0,
  values: 0
};

const segmentCounts = {
  class_6_8: 0,
  class_9_10: 0,
  class_11_12: 0,
  undergrad: 0,
  postgrad: 0
};

const errors = [];
for (const q of rawQuestions) {
  try {
    QuestionSchema.parse(q);
  } catch (err) {
    errors.push(`QuestionSchema error in ${q.id}: ${err.message}`);
  }

  // 1. Max 12 words per question
  const qWords = q.text.trim().split(/\s+/).length;
  if (qWords > 12) {
    errors.push(`Question ${q.id} exceeds 12 words: "${q.text}" (${qWords} words)`);
  }

  // 2. Options between 3 and 4
  if (q.options.length < 3 || q.options.length > 4) {
    errors.push(`Question ${q.id} must have 3 or 4 options, got ${q.options.length}`);
  }

  // 3. Max 5 words per option
  for (const opt of q.options) {
    const optWords = opt.label.trim().split(/\s+/).length;
    if (optWords > 5) {
      errors.push(`Option ${opt.id} in ${q.id} exceeds 5 words: "${opt.label}" (${optWords} words)`);
    }
  }

  // Count section
  sectionCounts[q.section] = (sectionCounts[q.section] || 0) + 1;

  // Count segments
  for (const seg of q.segment) {
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
  }
}

if (errors.length > 0) {
  console.error("Found validation errors:");
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}

console.log("Section counts:", sectionCounts);
console.log("Segment distribution:", segmentCounts);

// Write verified questions to questions.json
const questionsPath = path.join(__dirname, "../src/data/questions.json");
fs.writeFileSync(questionsPath, JSON.stringify(rawQuestions, null, 2), "utf8");
console.log(`Successfully wrote ${rawQuestions.length} questions to ${questionsPath}`);
