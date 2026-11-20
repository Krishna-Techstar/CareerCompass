const fs = require('fs');
const path = require('path');
const { z } = require('zod');

// Schema definitions mirroring src/lib/types.ts
const OptionWeightsSchema = z.record(z.string(), z.number());

const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  weights: OptionWeightsSchema,
});

const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  format: z.enum(["single_choice", "preference_comparison"]),
  options: z.array(QuestionOptionSchema).min(3).max(4),
  category: z.enum(["interest", "workstyle", "values", "situational"]),
  tags: z.array(z.string()),
  followupTags: z.array(z.string()),
  educationLevel: z.union([z.string(), z.array(z.string())]),
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
});

// 40 QUESTIONS:
// Exactly 14 interest, 8 workstyle, 8 values, 10 situational.
// First 5 (q01-q05) marked "universal" in tags.
const questions = [
  // --- UNIVERSAL QUESTIONS (First 5: q01 to q05) ---
  {
    id: "q01",
    text: "When you have an open weekend during college semester, which activity sounds most naturally energizing to you?",
    format: "single_choice",
    category: "interest",
    tags: ["universal", "energy", "broad_preference"],
    followupTags: ["tech", "business", "creative", "science"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q01_opt_a",
        label: "Building or tinkering with a functional project (coding a tool, fixing a gadget, sketching a prototype)",
        weights: { R: 2, I: 1, practical_vs_conceptual: -0.6, learning: 1 }
      },
      {
        id: "q01_opt_b",
        label: "Analyzing an intriguing trend or deep-dive topic (stock market moves, tech teardowns, case studies)",
        weights: { I: 2, E: 1, practical_vs_conceptual: 0.7, growth: 1 }
      },
      {
        id: "q01_opt_c",
        label: "Designing visual content, writing stories, or exploring aesthetic video/music creation",
        weights: { A: 2, creativity: 2, independence: 1 }
      },
      {
        id: "q01_opt_d",
        label: "Organizing an event, networking meetup, or volunteering with a student initiative group",
        weights: { S: 2, E: 1, independent_vs_team: 0.8, impact: 1 }
      }
    ]
  },
  {
    id: "q02",
    text: "Which type of challenge sounds most mentally engaging rather than exhausting?",
    format: "single_choice",
    category: "interest",
    tags: ["universal", "cognitive_style", "broad_preference"],
    followupTags: ["science", "business", "design+tech", "people"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q02_opt_a",
        label: "Debugging a convoluted systems glitch or proving a quantitative mathematical/computational model",
        weights: { I: 2, R: 1, learning: 2, practical_vs_conceptual: -0.7 }
      },
      {
        id: "q02_opt_b",
        label: "Negotiating, convincing stakeholders, or finding product-market fit under competitive constraints",
        weights: { E: 2, growth: 2, independent_vs_team: 0.7 }
      },
      {
        id: "q02_opt_c",
        label: "Unraveling human behavior, emotional drivers, and mentoring individuals through personal dilemmas",
        weights: { S: 2, A: 1, impact: 2, learning: 1 }
      },
      {
        id: "q02_opt_d",
        label: "Auditing complex records, finding compliance risks, or standardizing messy operational procedures",
        weights: { C: 2, stability: 2, structured_vs_flexible: -0.8 }
      }
    ]
  },
  {
    id: "q03",
    text: "If you were invited to deliver a 20-minute masterclass to high school juniors, what topic would you pick?",
    format: "single_choice",
    category: "interest",
    tags: ["universal", "knowledge_sharing", "broad_preference"],
    followupTags: ["tech", "business", "arts", "science"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q03_opt_a",
        label: "How computers and the internet actually work under the hood: From silicon logic to modern software",
        weights: { R: 1, I: 2, learning: 1 }
      },
      {
        id: "q03_opt_b",
        label: "How to build and market a brand that people fall in love with",
        weights: { E: 2, A: 1, growth: 1 }
      },
      {
        id: "q03_opt_c",
        label: "The science of human habits, mental well-being, and empathy in relationships",
        weights: { S: 2, I: 1, impact: 2 }
      },
      {
        id: "q03_opt_d",
        label: "Smart personal budgeting, compounding investments, and financial freedom principles",
        weights: { C: 2, E: 1, stability: 2 }
      }
    ]
  },
  {
    id: "q04",
    text: "When facing an unfamiliar, complex problem in college coursework or club projects, what is your first instinct?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["universal", "problem_solving", "workstyle"],
    followupTags: ["structured_vs_flexible", "independent_vs_team", "tech+business"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q04_opt_a",
        label: "Isolate myself to deeply research principles, read documentation, and master it solo",
        weights: { I: 2, independent_vs_team: -0.8, learning: 2 }
      },
      {
        id: "q04_opt_b",
        label: "Brainstorm with a peer group, debate perspectives, and divide the tasks collaboratively",
        weights: { S: 1, E: 1, independent_vs_team: 0.8, lead_vs_support: 0.4 }
      },
      {
        id: "q04_opt_c",
        label: "Seek out a proven framework, checklist, or expert template to execute systematically",
        weights: { C: 2, structured_vs_flexible: -0.8, stability: 1 }
      },
      {
        id: "q04_opt_d",
        label: "Experiment right away with rapid trial-and-error until something works empirically",
        weights: { R: 1, A: 1, structured_vs_flexible: 0.8, practical_vs_conceptual: -0.6 }
      }
    ]
  },
  {
    id: "q05",
    text: "What would make you feel that your initial 3 years after college graduation were truly successful?",
    format: "preference_comparison",
    category: "values",
    tags: ["universal", "success_definition", "values"],
    followupTags: ["growth", "stability", "impact", "creativity"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q05_opt_a",
        label: "High upward financial velocity and rapid title promotions in a fast-paced environment",
        weights: { E: 2, growth: 2, recognition: 2 }
      },
      {
        id: "q05_opt_b",
        label: "Mastery of rare technical, analytical, or clinical knowledge recognized by industry peers",
        weights: { I: 2, learning: 2, independence: 1 }
      },
      {
        id: "q05_opt_c",
        label: "Predictable job security, healthy working hours, and time for personal life and family",
        weights: { C: 1, stability: 2, balance: 2 }
      },
      {
        id: "q05_opt_d",
        label: "Visible, tangible improvement in people's lives or solving a real societal pain-point",
        weights: { S: 2, impact: 2, creativity: 1 }
      }
    ]
  },

  // --- REMAINING INTEREST QUESTIONS (q06 to q14 + 2 more = 11 questions. Total interest = 3 + 11 = 14) ---
  {
    id: "q06",
    text: "If you were offered a funded summer fellowship, which domain project would you pick?",
    format: "single_choice",
    category: "interest",
    tags: ["tech", "engineering", "interests"],
    followupTags: ["design+tech", "tech+business", "science"],
    educationLevel: "college_penultimate_final",
    validated: false,
    options: [
      {
        id: "q06_opt_a",
        label: "Developing an autonomous robotics platform or high-performance hardware computing unit",
        weights: { R: 2, I: 2, practical_vs_conceptual: -0.8 }
      },
      {
        id: "q06_opt_b",
        label: "Architecting a scalable cloud backend API and database infrastructure",
        weights: { I: 2, R: 1, C: 1, structured_vs_flexible: -0.5 }
      },
      {
        id: "q06_opt_c",
        label: "Conducting empirical bioinformatics research on genomics or drug resistance datasets",
        weights: { I: 2, learning: 2 }
      },
      {
        id: "q06_opt_d",
        label: "Building interactive digital product interfaces combining motion UI, 3D graphics, and user research",
        weights: { A: 2, R: 1, creativity: 2 }
      }
    ]
  },
  {
    id: "q07",
    text: "Which aspect of technology and business convergence fascinates you most?",
    format: "preference_comparison",
    category: "interest",
    tags: ["business", "tech", "tech+business"],
    followupTags: ["product_management", "entrepreneurship", "fintech"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q07_opt_a",
        label: "Defining product strategy: Deciding what features engineers build and aligning with customer market needs",
        weights: { E: 2, I: 1, lead_vs_support: -0.6, growth: 1 }
      },
      {
        id: "q07_opt_b",
        label: "Algorithmic trading & fintech: Modeling financial risk, options pricing, and capital allocation",
        weights: { C: 2, I: 2, practical_vs_conceptual: 0.6 }
      },
      {
        id: "q07_opt_c",
        label: "Writing clean, robust code that scales to tens of millions of concurrent requests",
        weights: { R: 2, I: 1, practical_vs_conceptual: -0.7 }
      },
      {
        id: "q07_opt_d",
        label: "Building digital growth funnels: Performance marketing, viral loops, and community management",
        weights: { E: 2, A: 1, independent_vs_team: 0.6 }
      }
    ]
  },
  {
    id: "q08",
    text: "When exploring human health and life sciences, where do your natural curiosities lie?",
    format: "single_choice",
    category: "interest",
    tags: ["science", "people", "biology+psychology"],
    followupTags: ["healthcare", "research", "clinical"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q08_opt_a",
        label: "Direct patient clinical care: Diagnosing medical symptoms, emergency triage, and surgical treatment",
        weights: { S: 2, R: 2, impact: 2, practical_vs_conceptual: -0.6 }
      },
      {
        id: "q08_opt_b",
        label: "Psychological counseling: Unraveling mental health trauma, cognitive behavioral therapy, and emotional healing",
        weights: { S: 2, I: 1, A: 1, impact: 2 }
      },
      {
        id: "q08_opt_c",
        label: "Wet-lab pharmaceutical innovation: Synthesizing molecular compounds and cell culture trials",
        weights: { I: 2, R: 1, learning: 2, independent_vs_team: -0.5 }
      },
      {
        id: "q08_opt_d",
        label: "Healthtech operations: Hospital administration, electronic health records, and public healthcare policies",
        weights: { C: 2, E: 1, structured_vs_flexible: -0.7 }
      }
    ]
  },
  {
    id: "q09",
    text: "In the realm of media, communication, and creative expression, what would you most enjoy delivering?",
    format: "single_choice",
    category: "interest",
    tags: ["creative", "people", "people+creative"],
    followupTags: ["journalism", "marketing", "content"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q09_opt_a",
        label: "Investigative journalism: Uncovering institutional corruption, on-ground reporting, and public truth",
        weights: { A: 2, I: 1, impact: 2, independence: 2 }
      },
      {
        id: "q09_opt_b",
        label: "Brand narrative & advertising: Crafting compelling campaigns that transform public perception",
        weights: { A: 2, E: 2, creativity: 2, recognition: 1 }
      },
      {
        id: "q09_opt_c",
        label: "Visual storytelling: Filmmaking, high-end animation, documentary editing, and graphic direction",
        weights: { A: 2, R: 1, creativity: 2, practical_vs_conceptual: -0.4 }
      },
      {
        id: "q09_opt_d",
        label: "Publishing & editing: Curating literary works, fact-checking manuscripts, and polishing long-form essays",
        weights: { C: 2, A: 1, structured_vs_flexible: -0.6 }
      }
    ]
  },
  {
    id: "q10",
    text: "When thinking about national policy, law, and social governance in India, what grabs your attention?",
    format: "single_choice",
    category: "interest",
    tags: ["governance", "law", "business+law"],
    followupTags: ["public_policy", "civil_services", "litigation"],
    educationLevel: "college_penultimate_final",
    validated: false,
    options: [
      {
        id: "q10_opt_a",
        label: "District administration & public policy execution: Mobilizing state resources to deliver grassroots change",
        weights: { E: 2, S: 2, impact: 2, lead_vs_support: -0.8 }
      },
      {
        id: "q10_opt_b",
        label: "Courtroom litigation: Analyzing statutes, cross-examining testimony, and defending rights before judges",
        weights: { I: 2, E: 1, independence: 2, practical_vs_conceptual: 0.5 }
      },
      {
        id: "q10_opt_c",
        label: "Corporate mergers & regulatory compliance: Drafting cross-border investment contracts and SEBI filings",
        weights: { C: 2, E: 1, structured_vs_flexible: -0.8, stability: 1 }
      },
      {
        id: "q10_opt_d",
        label: "Grassroots NGO leadership: Empowering rural education, climate resilience, and self-help groups",
        weights: { S: 2, impact: 2, growth: 1 }
      }
    ]
  },
  {
    id: "q11",
    text: "Which mathematical or analytical domain gives you the greatest sense of intellectual flow?",
    format: "single_choice",
    category: "interest",
    tags: ["science", "analytics", "data"],
    followupTags: ["data_science", "actuary", "finance"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q11_opt_a",
        label: "Predictive machine learning: Training neural networks, feature engineering, and statistical inference",
        weights: { I: 2, R: 1, practical_vs_conceptual: 0.7, learning: 2 }
      },
      {
        id: "q11_opt_b",
        label: "Actuarial probability & risk modeling: Calculating long-tail mortality, liability distributions, and insurance reserves",
        weights: { C: 2, I: 2, structured_vs_flexible: -0.9, stability: 2 }
      },
      {
        id: "q11_opt_c",
        label: "Corporate valuation & equity research: Discounted cash flows, EBITDA multiples, and balance sheet forensic analysis",
        weights: { C: 1, E: 2, practical_vs_conceptual: -0.3, growth: 2 }
      },
      {
        id: "q11_opt_d",
        label: "Pure mathematics and theoretical physics: Formulating proofs and discovering structural symmetries",
        weights: { I: 2, practical_vs_conceptual: 0.9, independence: 2 }
      }
    ]
  },
  {
    id: "q12",
    text: "If you were walking through a modern industrial factory or smart city, what would you examine first?",
    format: "single_choice",
    category: "interest",
    tags: ["engineering", "operations", "physical_systems"],
    followupTags: ["mechanical_engineering", "supply_chain", "architecture"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q12_opt_a",
        label: "The physical machinery, automated assembly robotics, kinematics, and CNC precision tooling",
        weights: { R: 2, practical_vs_conceptual: -0.9, structured_vs_flexible: -0.5 }
      },
      {
        id: "q12_opt_b",
        label: "The architectural layout, spatial flow, natural ventilation, and aesthetic structural harmony",
        weights: { A: 2, R: 1, creativity: 2 }
      },
      {
        id: "q12_opt_c",
        label: "The logistical supply chain: Warehouse automation, inventory velocity, and freight transit optimizations",
        weights: { C: 2, E: 1, structured_vs_flexible: -0.7 }
      },
      {
        id: "q12_opt_d",
        label: "The environmental sustainability footprint: Carbon recapture, zero-waste discharge, and green power grid",
        weights: { I: 1, S: 1, impact: 2, learning: 1 }
      }
    ]
  },
  {
    id: "q13",
    text: "When observing human talent, leadership, and organizational culture, which question intrigues you most?",
    format: "preference_comparison",
    category: "interest",
    tags: ["people", "business", "people+business"],
    followupTags: ["human_resources", "management", "psychology"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q13_opt_a",
        label: "How to identify high-potential leaders, design retention frameworks, and resolve toxic workplace friction",
        weights: { S: 2, E: 1, independent_vs_team: 0.8, impact: 1 }
      },
      {
        id: "q13_opt_b",
        label: "How to design executive incentive compensation formulas and KPI scorecards tied to EBITDA",
        weights: { C: 2, E: 1, practical_vs_conceptual: -0.4 }
      },
      {
        id: "q13_opt_c",
        label: "How to teach and mentor ambitious students to master complex concepts step-by-step",
        weights: { S: 2, I: 1, impact: 2, learning: 2 }
      },
      {
        id: "q13_opt_d",
        label: "How to run lean sprint ceremonies, remove developer blockers, and boost engineering velocity",
        weights: { E: 1, C: 1, structured_vs_flexible: 0.5 }
      }
    ]
  },
  {
    id: "q14",
    text: "Which creative-tech craft would you most love spending 100 hours learning from scratch?",
    format: "single_choice",
    category: "interest",
    tags: ["creative", "tech", "design+tech"],
    followupTags: ["ux_design", "frontend", "game_dev"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q14_opt_a",
        label: "Figma UI/UX design: Conducting usability heuristic tests, wireframing, and building micro-interactions",
        weights: { A: 2, I: 1, creativity: 2, practical_vs_conceptual: -0.3 }
      },
      {
        id: "q14_opt_b",
        label: "Cybersecurity penetration testing: Finding network vulnerabilities, buffer overflows, and ethical hacking",
        weights: { I: 2, R: 1, learning: 2, independent_vs_team: -0.6 }
      },
      {
        id: "q14_opt_c",
        label: "Game design & 3D world creation: Unreal Engine physics, environment modeling, and narrative storytelling",
        weights: { A: 2, R: 1, creativity: 2 }
      },
      {
        id: "q14_opt_d",
        label: "Applied econometrics: Regression discontinuity designs, causal inference on public survey datasets",
        weights: { I: 2, C: 1, practical_vs_conceptual: 0.7 }
      }
    ]
  },
  {
    id: "q15",
    text: "When exploring new technologies or scientific breakthroughs, which domain excites you to read articles about?",
    format: "single_choice",
    category: "interest",
    tags: ["interests", "science", "technology"],
    followupTags: ["biotech", "ai", "aerospace"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q15_opt_a",
        label: "Aerospace rocketry, commercial satellite constellations, and interplanetary propulsion",
        weights: { R: 2, I: 1, learning: 1 }
      },
      {
        id: "q15_opt_b",
        label: "CRISPR gene editing, synthetic biology, and clinical mRNA vaccines",
        weights: { I: 2, S: 1, learning: 2 }
      },
      {
        id: "q15_opt_c",
        label: "Decentralized crypto protocols, algorithmic stablecoins, and Web3 consensus mechanisms",
        weights: { E: 1, C: 1, I: 1 }
      },
      {
        id: "q15_opt_d",
        label: "Generative AI models generating photorealistic cinema and interactive conversational agents",
        weights: { A: 1, I: 2, creativity: 2 }
      }
    ]
  },
  {
    id: "q16",
    text: "When evaluating how you'd like to impact the Indian economy, which avenue aligns with your natural drive?",
    format: "single_choice",
    category: "interest",
    tags: ["interests", "macro_impact", "economy"],
    followupTags: ["entrepreneurship", "finance", "social_impact"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q16_opt_a",
        label: "Founding or scaling high-growth tech startups that export Indian IP globally",
        weights: { E: 2, growth: 2, lead_vs_support: -0.7 }
      },
      {
        id: "q16_opt_b",
        label: "Managing institutional capital, IPO listings, and strengthening Indian stock exchanges",
        weights: { C: 2, E: 1, growth: 1 }
      },
      {
        id: "q16_opt_c",
        label: "Elevating grassroots education and primary healthcare access across tier-3 towns and villages",
        weights: { S: 2, impact: 2 }
      },
      {
        id: "q16_opt_d",
        label: "Advancing indigenous defense systems, deep semiconductor fabrication, and heavy manufacturing",
        weights: { R: 2, I: 1, practical_vs_conceptual: -0.7 }
      }
    ]
  },

  // --- WORKSTYLE QUESTIONS (q17 to q23 + q04 = 8 questions total) ---
  {
    id: "q17",
    text: "Think about how you feel after 6 continuous hours of intense collaboration with a large team:",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["workstyle", "social_energy", "independent_vs_team"],
    followupTags: ["people", "focus"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q17_opt_a",
        label: "Thoroughly energized — bouncing ideas back-and-forth gives me momentum and sharper clarity",
        weights: { independent_vs_team: 0.9, E: 1, S: 1 }
      },
      {
        id: "q17_opt_b",
        label: "Moderately okay if discussions were focused on concrete progress, but I prefer smaller pair work",
        weights: { independent_vs_team: 0.1 }
      },
      {
        id: "q17_opt_c",
        label: "Completely depleted — my highest quality deep work happens when left alone with zero interruptions",
        weights: { independent_vs_team: -0.9, I: 1, independence: 1 }
      }
    ]
  },
  {
    id: "q18",
    text: "Which day-to-day work environment brings out your peak productivity?",
    format: "single_choice",
    category: "workstyle",
    tags: ["workstyle", "process_structure", "structured_vs_flexible"],
    followupTags: ["discipline", "startup_vs_corporate"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q18_opt_a",
        label: "Clear daily SOPs, unambiguous milestones, established rubrics, and predictable rhythms",
        weights: { structured_vs_flexible: -0.9, C: 2, stability: 1 }
      },
      {
        id: "q18_opt_b",
        label: "A loose weekly target with complete freedom over how, when, and where I achieve the end result",
        weights: { structured_vs_flexible: 0.8, independence: 2 }
      },
      {
        id: "q18_opt_c",
        label: "A dynamic environment where priorities shift daily based on live feedback, breaking alerts, or emergencies",
        weights: { structured_vs_flexible: 0.9, E: 1, growth: 1 }
      }
    ]
  },
  {
    id: "q19",
    text: "When learning or discussing an idea, what hooks your interest first?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["workstyle", "cognition", "practical_vs_conceptual"],
    followupTags: ["research", "engineering"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q19_opt_a",
        label: "The high-level theoretical framework, underlying philosophical principles, and abstract models",
        weights: { practical_vs_conceptual: 0.9, I: 2, learning: 1 }
      },
      {
        id: "q19_opt_b",
        label: "The immediate tangible application: 'How do I test this in reality, build a prototype, or make money from it?'",
        weights: { practical_vs_conceptual: -0.9, R: 1, E: 1 }
      },
      {
        id: "q19_opt_c",
        label: "A balanced middle: I need enough theory to understand the 'why', but quickly want to test the practical 'how'",
        weights: { practical_vs_conceptual: 0.0 }
      }
    ]
  },
  {
    id: "q20",
    text: "In a high-stakes project or group assignment, where do you naturally feel most effective?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["workstyle", "leadership", "lead_vs_support"],
    followupTags: ["management", "execution"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q20_opt_a",
        label: "Taking full command: Setting direction, delegating tasks, making the final calls, and owning accountability",
        weights: { lead_vs_support: -0.9, E: 2, recognition: 1 }
      },
      {
        id: "q20_opt_b",
        label: "Acting as the right-hand trusted specialist: Advising the leader, executing the critical components masterfully",
        weights: { lead_vs_support: 0.8, I: 1, C: 1 }
      },
      {
        id: "q20_opt_c",
        label: "Autonomous contributor: Hand me a well-defined slice of the problem, and judge me strictly on my output",
        weights: { lead_vs_support: 0.2, independent_vs_team: -0.7, independence: 2 }
      }
    ]
  },
  {
    id: "q21",
    text: "When a manager or professor gives you ambiguous, open-ended instructions ('Explore this area and come up with something'):",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["workstyle", "ambiguity", "structured_vs_flexible"],
    followupTags: ["creativity", "stability"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q21_opt_a",
        label: "I love it — ambiguity is an invitation to experiment, invent custom solutions, and surprise people",
        weights: { structured_vs_flexible: 0.9, creativity: 2, A: 1 }
      },
      {
        id: "q21_opt_b",
        label: "I find it counter-productive — I prefer asking clarifying questions until concrete boundaries are set",
        weights: { structured_vs_flexible: -0.8, C: 2, stability: 1 }
      },
      {
        id: "q21_opt_c",
        label: "I will quickly build a lightweight prototype to anchor their feedback and narrow down requirements",
        weights: { practical_vs_conceptual: -0.7, structured_vs_flexible: 0.2 }
      }
    ]
  },
  {
    id: "q22",
    text: "Which balance between specialization and generalist breadth appeals to you more over the next 5 years?",
    format: "preference_comparison",
    category: "workstyle",
    tags: ["workstyle", "career_breadth", "growth"],
    followupTags: ["tech+business", "specialist_vs_generalist"],
    educationLevel: "college_penultimate_final",
    validated: false,
    options: [
      {
        id: "q22_opt_a",
        label: "T-shaped deep specialist: Being the top 1% go-to authority in one niche technical or clinical vertical",
        weights: { I: 2, learning: 2, independent_vs_team: -0.4 }
      },
      {
        id: "q22_opt_b",
        label: "Versatile generalist: Connecting dots across marketing, tech, finance, and people to orchestrate the big picture",
        weights: { E: 2, growth: 2, lead_vs_support: -0.5 }
      },
      {
        id: "q22_opt_c",
        label: "Methodical practitioner: Mastering a regulated, established domain (like corporate taxation, civil engineering)",
        weights: { C: 2, stability: 2, structured_vs_flexible: -0.7 }
      }
    ]
  },
  {
    id: "q23",
    text: "When managing competing deadlines across multiple subjects or tasks, how do you operate?",
    format: "single_choice",
    category: "workstyle",
    tags: ["workstyle", "time_management", "structured_vs_flexible"],
    followupTags: ["execution", "discipline"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q23_opt_a",
        label: "Strict calendar blocking: Every hour planned days in advance with dedicated focus slots",
        weights: { structured_vs_flexible: -0.9, C: 2, stability: 1 }
      },
      {
        id: "q23_opt_b",
        label: "Flow-state bursts: Procrastinate or incubate until deadline pressure sparks an intense, focused sprint",
        weights: { structured_vs_flexible: 0.8, creativity: 1 }
      },
      {
        id: "q23_opt_c",
        label: "Prioritization triage: Identify the single most impactful item, complete it, and ruthlessly cut low-value items",
        weights: { E: 1, practical_vs_conceptual: -0.5, lead_vs_support: -0.4 }
      }
    ]
  },

  // --- VALUES QUESTIONS (q24 to q30 + q05 = 8 questions total) ---
  {
    id: "q24",
    text: "Imagine two job offers on Day 1 of campus placements. Which package would you accept?",
    format: "preference_comparison",
    category: "values",
    tags: ["values", "compensation", "stability_vs_growth"],
    followupTags: ["stability", "growth", "risk"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q24_opt_a",
        label: "Offer A: Top PSU / established MNC with ₹10 LPA guaranteed, fixed 9-to-5 hours, zero risk of layoffs",
        weights: { stability: 2, balance: 2, C: 1 }
      },
      {
        id: "q24_opt_b",
        label: "Offer B: Series-B funded high-growth startup with ₹18 LPA CTC (including ESOPs), 60-hour weeks, immense learning",
        weights: { growth: 2, learning: 2, E: 1 }
      },
      {
        id: "q24_opt_c",
        label: "Offer C: Bootstrapping an early-stage venture with friends on stipend, retaining full equity and autonomy",
        weights: { independence: 2, creativity: 2, growth: 1 }
      }
    ]
  },
  {
    id: "q25",
    text: "What represents your deepest relationship with 'Creativity' in your day-to-day work?",
    format: "single_choice",
    category: "values",
    tags: ["values", "creativity_definition", "creativity"],
    followupTags: ["design+tech", "arts"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q25_opt_a",
        label: "A non-negotiable core: I must originate novel concepts, visual styles, or unique artistic solutions",
        weights: { creativity: 2, A: 2, independence: 1 }
      },
      {
        id: "q25_opt_b",
        label: "Elegant problem-solving: Finding a clever, optimized engineering or algorithmic workaround",
        weights: { creativity: 1, learning: 2, I: 2 }
      },
      {
        id: "q25_opt_c",
        label: "Minor factor: I care much more about precision, execution speed, and measurable financial outcomes",
        weights: { creativity: -1, stability: 1, C: 1, E: 1 }
      }
    ]
  },
  {
    id: "q26",
    text: "How important is public recognition and status in your Indian family/social circle?",
    format: "preference_comparison",
    category: "values",
    tags: ["values", "prestige", "recognition"],
    followupTags: ["social_status", "civil_services"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q26_opt_a",
        label: "Very important: A prestigious title (IAS, IIM graduate, Google SDE, Doctor) commands immense respect and pride",
        weights: { recognition: 2, E: 1, C: 1 }
      },
      {
        id: "q26_opt_b",
        label: "Somewhat: I appreciate respect within my professional peer group, but family/public glamour doesn't drive me",
        weights: { recognition: 0.5, learning: 1 }
      },
      {
        id: "q26_opt_c",
        label: "Unimportant: I am motivated strictly by autonomy, personal curiosity, and lifestyle freedom",
        weights: { recognition: -1, independence: 2, balance: 1 }
      }
    ]
  },
  {
    id: "q27",
    text: "When considering 'Social Impact', which perspective resonates most authentically with you?",
    format: "single_choice",
    category: "values",
    tags: ["values", "social_impact", "impact"],
    followupTags: ["public_policy", "healthcare", "education"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q27_opt_a",
        label: "Essential purpose: I cannot stay motivated unless my daily hours directly alleviate suffering or empower communities",
        weights: { impact: 2, S: 2 }
      },
      {
        id: "q27_opt_b",
        label: "Systemic byproduct: Building scalable software, profitable businesses, or efficient logistics improves society naturally",
        weights: { impact: 1, growth: 2, E: 1 }
      },
      {
        id: "q27_opt_c",
        label: "Secondary priority: My primary focus is personal financial security and technical mastery first",
        weights: { impact: -0.5, stability: 2, learning: 1 }
      }
    ]
  },
  {
    id: "q28",
    text: "What does genuine 'Independence' mean to you in a career setting?",
    format: "single_choice",
    category: "values",
    tags: ["values", "autonomy", "independence"],
    followupTags: ["freelance", "entrepreneurship"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q28_opt_a",
        label: "Location and schedule freedom: Remote work, async communication, and working from anywhere in the world",
        weights: { independence: 2, balance: 1, structured_vs_flexible: 0.7 }
      },
      {
        id: "q28_opt_b",
        label: "Intellectual autonomy: Freedom to choose which research hypotheses, product bets, or clients to take on",
        weights: { independence: 2, learning: 1, I: 1 }
      },
      {
        id: "q28_opt_c",
        label: "Financial sovereignty: Earning enough to never have to say yes to projects I disagree with",
        weights: { independence: 1, growth: 2, E: 1 }
      },
      {
        id: "q28_opt_d",
        label: "I actually prefer structured guidance and clear leadership rather than lone-wolf autonomy",
        weights: { independence: -1, stability: 2, lead_vs_support: 0.8 }
      }
    ]
  },
  {
    id: "q29",
    text: "When personal health, relationships, and hobbies conflict with career progression, where is your line?",
    format: "preference_comparison",
    category: "values",
    tags: ["values", "work_life_balance", "balance"],
    followupTags: ["wellness", "lifestyle"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q29_opt_a",
        label: "Work-life balance is strictly sacred: I refuse to sacrifice my physical health or family time for corporate goals",
        weights: { balance: 2, stability: 1, growth: -0.5 }
      },
      {
        id: "q29_opt_b",
        label: "Sprint periods: I am happy to grind 70-hour weeks in my 20s for ambitious financial goals, with plans to balance later",
        weights: { balance: 0.2, growth: 2, recognition: 1 }
      },
      {
        id: "q29_opt_c",
        label: "Obsessive mission: My work is my identity and passion; boundaries feel artificial when doing what I love",
        weights: { balance: -1, growth: 2, learning: 2, independence: 1 }
      }
    ]
  },
  {
    id: "q30",
    text: "If you could pick one core legacy at age 45, which statement would you be proudest of?",
    format: "single_choice",
    category: "values",
    tags: ["values", "long_term_vision", "impact"],
    followupTags: ["growth", "recognition"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q30_opt_a",
        label: "'Built a ₹100 Crore enterprise or generated hundreds of high-quality jobs in India'",
        weights: { growth: 2, recognition: 2, E: 2 }
      },
      {
        id: "q30_opt_b",
        label: "'Mentored thousands of students or directly treated thousands of patients in need'",
        weights: { impact: 2, S: 2, learning: 1 }
      },
      {
        id: "q30_opt_c",
        label: "'Authored seminal scientific research or breakthrough patents that advanced the field'",
        weights: { learning: 2, I: 2, creativity: 1 }
      },
      {
        id: "q30_opt_d",
        label: "'Achieved complete financial freedom early, lived with peace, and nurtured a loving family'",
        weights: { stability: 2, balance: 2, independence: 1 }
      }
    ]
  },

  // --- SITUATIONAL & CHALLENGE TRADE-OFF QUESTIONS (q31 to q40, total 10) ---
  {
    id: "q31",
    text: "Trade-off scenario: You are offered an entry role at a Tier-1 Investment Bank or Global Strategy Consultancy with ₹25 LPA, but you must work 80 hours a week including weekends. Do you take it?",
    format: "preference_comparison",
    category: "situational",
    tags: ["situational", "long_hours_vs_salary", "trade_off"],
    followupTags: ["finance", "consulting", "balance"],
    educationLevel: "college_penultimate_final",
    validated: false,
    options: [
      {
        id: "q31_opt_a",
        label: "Absolutely yes: 2-3 years of intense grind for massive pedigree, fast wealth, and accelerated career trajectory is worth it",
        weights: { growth: 2, recognition: 1, balance: -1, E: 1 }
      },
      {
        id: "q31_opt_b",
        label: "No: 80 hours per week destroys mental and physical health; I'd rather take ₹12 LPA with sane working hours",
        weights: { balance: 2, stability: 1, growth: 0.2 }
      },
      {
        id: "q31_opt_c",
        label: "Only if the specific domain provides exceptional technical learning, not just making PowerPoint slides or spreadsheets",
        weights: { learning: 2, I: 1, balance: 0.5 }
      }
    ]
  },
  {
    id: "q32",
    text: "Risk & Uncertainty: Your campus placement offers a secure job at Infosys/TCS with ₹4.5 LPA, while a 4-person seed startup offers equity + ₹8 LPA, but they have only 9 months of cash runway. What do you choose?",
    format: "preference_comparison",
    category: "situational",
    tags: ["situational", "startup_vs_service", "uncertainty_vs_stability"],
    followupTags: ["tech+business", "risk"],
    educationLevel: "college_penultimate_final",
    validated: false,
    options: [
      {
        id: "q32_opt_a",
        label: "Join the startup: The steep learning curve, direct product ownership, and upside far outweigh the risk of failure",
        weights: { growth: 2, learning: 2, independence: 1, structured_vs_flexible: 0.8 }
      },
      {
        id: "q32_opt_b",
        label: "Join the established IT firm: Brand stability, job security, and steady bench opportunities match my risk profile",
        weights: { stability: 2, balance: 1, structured_vs_flexible: -0.7, C: 1 }
      },
      {
        id: "q32_opt_c",
        label: "Use the IT firm offer as a safety net while actively interviewing for high-paying product firms or government exams",
        weights: { stability: 1, growth: 1, E: 1 }
      }
    ]
  },
  {
    id: "q33",
    text: "Credit vs Impact: You built an analytical model that saved the team ₹50 Lakhs. During the executive all-hands, your team manager presents the findings and takes 90% of the public credit. How do you respond?",
    format: "single_choice",
    category: "situational",
    tags: ["situational", "corporate_politics", "recognition"],
    followupTags: ["lead_vs_support", "ethics"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q33_opt_a",
        label: "Deeply frustrated: I immediately schedule a private conversation to demand fair attribution and visibility",
        weights: { recognition: 2, lead_vs_support: -0.7, E: 1 }
      },
      {
        id: "q33_opt_b",
        label: "Unfazed: As long as my direct peers know I built it and my internal skills grow, public limelight is secondary",
        weights: { recognition: -0.5, learning: 2, lead_vs_support: 0.7 }
      },
      {
        id: "q33_opt_c",
        label: "Calculated strategy: I document my contributions in writing, publish an internal engineering case study, and route around them",
        weights: { practical_vs_conceptual: -0.4, independence: 2, E: 1 }
      }
    ]
  },
  {
    id: "q34",
    text: "Competitive exam dilemma: Your parents strongly urge you to take 2 drop years in Delhi/Prayagraj to prepare for UPSC Civil Services or State PSC. What is your honest stance?",
    format: "preference_comparison",
    category: "situational",
    tags: ["situational", "parental_expectations", "civil_services"],
    followupTags: ["governance", "career_risk"],
    educationLevel: "college_penultimate_final",
    validated: false,
    options: [
      {
        id: "q34_opt_a",
        label: "I am genuinely called to public service: I am ready to embrace the 0.1% selection rate for administrative impact and stature",
        weights: { impact: 2, recognition: 2, S: 1, E: 1 }
      },
      {
        id: "q34_opt_b",
        label: "Strong resistance: The multi-year opportunity cost and binary lottery risk scare me; I prefer private sector momentum",
        weights: { growth: 1, practical_vs_conceptual: -0.6, independence: 1 }
      },
      {
        id: "q34_opt_c",
        label: "Compromise: Work in corporate/tech for 2 years to build a financial cushion, then evaluate government exams with a backup plan",
        weights: { stability: 2, structured_vs_flexible: -0.6 }
      }
    ]
  },
  {
    id: "q35",
    text: "Technical mastery vs Management: 5 years into your career, you can either become a Principal Individual Contributor (writing deep architecture code) or an Engineering/Department Manager (handling budgets, hiring, and 1-on-1s). Which track do you choose?",
    format: "preference_comparison",
    category: "situational",
    tags: ["situational", "ic_vs_manager", "lead_vs_support"],
    followupTags: ["tech+business", "leadership"],
    educationLevel: "college_penultimate_final",
    validated: false,
    options: [
      {
        id: "q35_opt_a",
        label: "Management track: I enjoy mentoring people, strategic prioritization, cross-functional persuasion, and business impact",
        weights: { lead_vs_support: -0.8, E: 2, independent_vs_team: 0.8 }
      },
      {
        id: "q35_opt_b",
        label: "Individual Contributor track: I love getting my hands dirty with real technical architecture and hate endless meetings",
        weights: { lead_vs_support: 0.6, I: 2, R: 1, independent_vs_team: -0.7 }
      },
      {
        id: "q35_opt_c",
        label: "Product / Tech Strategy: A hybrid bridge role where I craft roadmaps without direct HR people-management responsibilities",
        weights: { practical_vs_conceptual: 0.4, creativity: 1, growth: 1 }
      }
    ]
  },
  {
    id: "q36",
    text: "Location and lifestyle trade-off: You receive a high-growth tech/consulting job requiring relocation to Bengaluru/Gurugram with steep living costs and traffic, versus a stable role in your hometown with family support. What decides your vote?",
    format: "preference_comparison",
    category: "situational",
    tags: ["situational", "metro_vs_hometown", "lifestyle"],
    followupTags: ["growth", "balance"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q36_opt_a",
        label: "Relocate immediately: Being in the beating heart of India's startup/corporate ecosystem multiplies serendipity and network",
        weights: { growth: 2, recognition: 1, E: 1 }
      },
      {
        id: "q36_opt_b",
        label: "Stay in hometown: Mental peace, proximity to family, zero commute fatigue, and higher savings matter far more",
        weights: { balance: 2, stability: 2, independence: -0.5 }
      },
      {
        id: "q36_opt_c",
        label: "Target remote roles only: I will optimize for international remote firms that pay in USD/EUR while living anywhere",
        weights: { independence: 2, growth: 1, structured_vs_flexible: 0.7 }
      }
    ]
  },
  {
    id: "q37",
    text: "Crisis handling: A major production system crashes or a client contract is threatened with cancellation due to an error on your team. How do you handle the next 24 hours?",
    format: "single_choice",
    category: "situational",
    tags: ["situational", "crisis_management", "resilience"],
    followupTags: ["leadership", "engineering"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q37_opt_a",
        label: "Take ownership publicly, initiate a war-room triage, coordinate clear client communications, and steer the ship",
        weights: { lead_vs_support: -0.9, E: 2, structured_vs_flexible: -0.4 }
      },
      {
        id: "q37_opt_b",
        label: "Dive into logs, database dumps, and code commits in complete silence until the root cause is patched and tested",
        weights: { practical_vs_conceptual: -0.8, I: 2, independent_vs_team: -0.6 }
      },
      {
        id: "q37_opt_c",
        label: "Conduct a blameless post-mortem framework: Analyze broken processes so the organizational vulnerability never recurs",
        weights: { C: 2, learning: 2, structured_vs_flexible: -0.7 }
      }
    ]
  },
  {
    id: "q38",
    text: "Moral & Purpose challenge: An ultra-lucrative tobacco, real-money gambling, or predatory lending company offers you double your current salary. What is your choice?",
    format: "preference_comparison",
    category: "situational",
    tags: ["situational", "ethics", "values_conflict"],
    followupTags: ["impact", "values"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q38_opt_a",
        label: "Outright rejection: I refuse to deploy my intellect toward products that exploit human addiction or vulnerability",
        weights: { impact: 2, S: 1, growth: -0.5 }
      },
      {
        id: "q38_opt_b",
        label: "Accept the offer: Early in my career, wealth accumulation and technical scaling experience take precedence; ethics are personal",
        weights: { growth: 2, practical_vs_conceptual: -0.5, impact: -1 }
      },
      {
        id: "q38_opt_c",
        label: "Accept strictly as a temporary stepping stone for 12 months, while actively hunting for an ethical Tier-1 firm",
        weights: { growth: 1, stability: 1, learning: 1 }
      }
    ]
  },
  {
    id: "q39",
    text: "Patience vs Velocity: Would you rather spend 5-7 years completing an MBBS + MD / PhD in clinical science to reach peak prestige, or begin earning ₹15 LPA at age 22 in software or sales?",
    format: "preference_comparison",
    category: "situational",
    tags: ["situational", "long_gestation_vs_quick_earning", "career_horizon"],
    followupTags: ["healthcare", "science", "growth"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q39_opt_a",
        label: "Long gestation is fine: Deep medical or scientific expertise commands lifelong unshakeable respect and recession-proof purpose",
        weights: { learning: 2, I: 2, S: 1, stability: 2 }
      },
      {
        id: "q39_opt_b",
        label: "Quick earning velocity: I want early financial independence, compounding investments in my 20s, and nimble career pivots",
        weights: { growth: 2, E: 1, practical_vs_conceptual: -0.6 }
      },
      {
        id: "q39_opt_c",
        label: "A balanced professional route: A 4-year degree (B.Tech, CA, or Law) offering solid early compensation with continuous upskilling",
        weights: { stability: 1, growth: 1, C: 1 }
      }
    ]
  },
  {
    id: "q40",
    text: "Work culture clash: Which working atmosphere would you find most unbearable to spend 40 hours a week in?",
    format: "preference_comparison",
    category: "situational",
    tags: ["situational", "culture_aversion", "workstyle"],
    followupTags: ["workstyle", "values"],
    educationLevel: "all",
    validated: false,
    options: [
      {
        id: "q40_opt_a",
        label: "A rigid, bureaucratic hierarchy where every tiny suggestion requires 5 levels of written managerial approval",
        weights: { structured_vs_flexible: 0.8, independence: 2, creativity: 1 }
      },
      {
        id: "q40_opt_b",
        label: "A chaotic, unstructured startup where goals change every 48 hours and nobody knows who is responsible for what",
        weights: { structured_vs_flexible: -0.9, stability: 2, C: 2 }
      },
      {
        id: "q40_opt_c",
        label: "A cut-throat, zero-sum political environment where colleagues undermine each other for year-end bonuses",
        weights: { balance: 2, S: 2, impact: 1 }
      }
    ]
  }
];

// 25 CAREERS
const careers = [
  {
    id: "software_engineer",
    name: "Software Engineer / SDE",
    industry: "Information Technology & Software",
    description: "Designs, codes, and maintains scalable software applications, distributed microservices, and platforms solving complex computational problems.",
    vector: {
      R: 6, I: 9, A: 3, S: 2, E: 3, C: 6,
      independent_vs_team: -0.3,
      structured_vs_flexible: 0.2,
      practical_vs_conceptual: -0.4,
      lead_vs_support: 0.3,
      stability: 7, growth: 9, independence: 8, creativity: 6, impact: 6, recognition: 7, balance: 6, learning: 9
    },
    requiredDegrees: ["B.Tech / B.E. in Computer Science, IT, or related engineering branch", "BCA + MCA"],
    entryPathways: [
      "On-campus placement drives with DSA and coding tests",
      "Competitive programming platforms (LeetCode, Codeforces) and open-source contributions",
      "Off-campus tech hackathons and product internships"
    ],
    entranceExams: ["JEE Main", "JEE Advanced", "BITSAT", "State Engineering CETs", "GATE CS"],
    challenges: [
      "Rapid technology obsolescence requiring continuous after-hours upskilling",
      "Sedentary desk work causing screen fatigue and physical strain",
      "High competition for top-tier product firms and occasional layoff cycles"
    ],
    relatedCareerIds: ["data_scientist", "cybersecurity_analyst", "product_manager"]
  },
  {
    id: "product_manager",
    name: "Product Manager (PM)",
    industry: "Technology & Digital Products",
    description: "Sits at the intersection of business, engineering, and user experience to define product vision, build roadmaps, and ship high-impact features.",
    vector: {
      R: 2, I: 7, A: 5, S: 6, E: 9, C: 6,
      independent_vs_team: 0.8,
      structured_vs_flexible: 0.6,
      practical_vs_conceptual: 0.2,
      lead_vs_support: -0.8,
      stability: 6, growth: 9, independence: 7, creativity: 8, impact: 8, recognition: 8, balance: 5, learning: 8
    },
    requiredDegrees: ["B.Tech / B.E. + MBA from Tier-1 institution", "Undergraduate degree with demonstrated Associate PM experience"],
    entryPathways: [
      "Associate Product Manager (APM) cohorts at tech startups/unicorns",
      "Campus recruitment post-MBA (IIMs, ISB, XLRI)",
      "Internal transition from software engineering, data analysis, or UX design"
    ],
    entranceExams: ["CAT", "XAT", "GMAT"],
    challenges: [
      "Accountability without formal authority: must convince cross-functional teams without managing them directly",
      "High cognitive context-switching between analytics, design reviews, and executive politics",
      "Constant pressure when product metrics fail to hit quarterly targets"
    ],
    relatedCareerIds: ["software_engineer", "ux_designer", "management_consultant"]
  },
  {
    id: "data_scientist",
    name: "Data Scientist / AI Engineer",
    industry: "Artificial Intelligence & Analytics",
    description: "Extracts predictive insights from structured and unstructured data using machine learning algorithms, deep learning models, and statistical inference.",
    vector: {
      R: 4, I: 10, A: 3, S: 2, E: 4, C: 7,
      independent_vs_team: -0.4,
      structured_vs_flexible: 0.3,
      practical_vs_conceptual: 0.6,
      lead_vs_support: 0.4,
      stability: 7, growth: 9, independence: 8, creativity: 6, impact: 7, recognition: 7, balance: 6, learning: 10
    },
    requiredDegrees: ["B.Tech / M.Tech in CS, Data Science, or AI", "M.Sc. in Statistics / Mathematics / Econometrics"],
    entryPathways: [
      "Data Analyst / Business Intelligence role transitioning to ML engineer",
      "Kaggle competitions, GitHub portfolio of predictive models, and research pre-prints",
      "Specialized AI/ML master's programs with industry research internships"
    ],
    entranceExams: ["GATE CS / Data Science", "JEE Main", "JAM (Joint Admission test for Masters)"],
    challenges: [
      "A large fraction of time is spent on tedious data cleaning and messy pipeline troubleshooting",
      "Hype cycle disconnect: stakeholders expecting magical results from incomplete enterprise datasets",
      "Extremely fast-moving research landscape (GenAI, LLMs, vision transformers)"
    ],
    relatedCareerIds: ["software_engineer", "actuary", "investment_analyst"]
  },
  {
    id: "ux_designer",
    name: "UI/UX Product Designer",
    industry: "Design & Creative Technology",
    description: "Crafts intuitive, delightful, and accessible digital user experiences through user research, wireframing, interactive prototyping, and design systems.",
    vector: {
      R: 3, I: 6, A: 10, S: 6, E: 5, C: 4,
      independent_vs_team: 0.4,
      structured_vs_flexible: 0.7,
      practical_vs_conceptual: 0.1,
      lead_vs_support: -0.2,
      stability: 6, growth: 8, independence: 8, creativity: 10, impact: 7, recognition: 7, balance: 7, learning: 8
    },
    requiredDegrees: ["B.Des / M.Des from NID, IITs (IDC), or recognized design schools", "Any degree with a compelling design portfolio"],
    entryPathways: [
      "Portfolio-driven entry with Figma case studies demonstrating end-to-end design thinking",
      "National Institute of Design / IDC IIT placements",
      "Internships at design agencies and consumer tech startups"
    ],
    entranceExams: ["UCEED", "CEED", "NID DAT"],
    challenges: [
      "Subjective design critiques and frequent executive pushback",
      "Engineers occasionally making design compromises due to delivery deadlines",
      "Must constantly prove business ROI of aesthetic choices and user empathy"
    ],
    relatedCareerIds: ["product_manager", "architect", "marketing_manager"]
  },
  {
    id: "doctor",
    name: "Medical Doctor / Physician",
    industry: "Healthcare & Clinical Medicine",
    description: "Diagnoses illnesses, prescribes treatments, administers patient care, and performs life-saving clinical procedures in hospitals and clinics.",
    vector: {
      R: 7, I: 9, A: 2, S: 10, E: 5, C: 6,
      independent_vs_team: 0.3,
      structured_vs_flexible: -0.7,
      practical_vs_conceptual: -0.7,
      lead_vs_support: -0.6,
      stability: 9, growth: 7, independence: 6, creativity: 3, impact: 10, recognition: 10, balance: 3, learning: 9
    },
    requiredDegrees: ["MBBS (5.5 years including mandatory internship)", "MD / MS / DNB specialization (3 years)"],
    entryPathways: [
      "Cracking NEET UG for government/private medical college seats",
      "Junior residency during post-graduation followed by senior residency / super-specialization",
      "Hospital clinical practice or private clinic establishment"
    ],
    entranceExams: ["NEET UG", "NEET PG", "INI-CET"],
    challenges: [
      "Grueling 5.5 to 10+ year gestation period before achieving respectable financial stability",
      "High stress, sleep deprivation during 36-hour emergency duties, and emotional trauma",
      "Risk of violence against doctors in hospital emergency wards in India"
    ],
    relatedCareerIds: ["clinical_psychologist", "biotech_researcher"]
  },
  {
    id: "clinical_psychologist",
    name: "Clinical Psychologist / Psychotherapist",
    industry: "Mental Health & Behavioral Sciences",
    description: "Assesses, diagnoses, and treats mental illness, emotional disorders, and behavioral challenges through evidence-based psychotherapy and psychological testing.",
    vector: {
      R: 1, I: 8, A: 4, S: 10, E: 4, C: 4,
      independent_vs_team: -0.6,
      structured_vs_flexible: 0.3,
      practical_vs_conceptual: 0.5,
      lead_vs_support: -0.1,
      stability: 7, growth: 7, independence: 8, creativity: 5, impact: 9, recognition: 6, balance: 7, learning: 8
    },
    requiredDegrees: ["B.A. / B.Sc. in Psychology", "M.A. / M.Sc. in Psychology + M.Phil in Clinical Psychology (RCI approved) / Psy.D."],
    entryPathways: [
      "Clearing RCI-approved M.Phil clinical psychology entrance exams (NIMHANS, CIP)",
      "Supervised hospital internships in psychiatric wards",
      "Independent private practice, digital mental health platforms, or university counseling"
    ],
    entranceExams: ["NIMHANS Entrance Exam", "CUET PG", "CIP Ranchi Entrance"],
    challenges: [
      "Vicarious traumatization and mental fatigue from absorbing patients' deep emotional suffering",
      "Continuing societal stigma around therapy and mental healthcare in tier-2/3 Indian cities",
      "RCI licensing hurdles and low initial earnings during early supervised practice"
    ],
    relatedCareerIds: ["doctor", "teacher_educator", "human_resources_director"]
  },
  {
    id: "biotech_researcher",
    name: "Biotechnology / Bioinformatics Scientist",
    industry: "Life Sciences & Research",
    description: "Conducts advanced molecular biology, genomics, and bioprocess experiments to engineer new pharmaceuticals, agricultural crops, and diagnostic kits.",
    vector: {
      R: 6, I: 10, A: 2, S: 4, E: 3, C: 6,
      independent_vs_team: -0.5,
      structured_vs_flexible: -0.4,
      practical_vs_conceptual: 0.4,
      lead_vs_support: 0.3,
      stability: 7, growth: 7, independence: 8, creativity: 6, impact: 8, recognition: 7, balance: 6, learning: 10
    },
    requiredDegrees: ["B.Tech / B.Sc. in Biotechnology / Biochemistry", "M.Tech / M.Sc. + Ph.D. in Life Sciences or Computational Biology"],
    entryPathways: [
      "CSIR-NET JRF qualified research fellowship in CSIR/DBT national labs",
      "R&D scientist roles in biopharma companies (Biocon, Serum Institute, Dr. Reddy's)",
      "Post-doctoral international research fellowships"
    ],
    entranceExams: ["CSIR UGC NET", "GATE BT", "GAT-B", "IIT JAM"],
    challenges: [
      "Lengthy Ph.D. timelines (4 to 6 years) with relatively modest stipends in India",
      "High experimental failure rate where months of wet-lab work can yield null results",
      "Limited private R&D expenditure in India compared to US/Europe"
    ],
    relatedCareerIds: ["doctor", "data_scientist", "environmental_scientist"]
  },
  {
    id: "chartered_accountant",
    name: "Chartered Accountant (CA)",
    industry: "Finance, Audit & Taxation",
    description: "Audits corporate financial statements, advises on complex direct/indirect taxation, ensures regulatory compliance, and guides financial structuring.",
    vector: {
      R: 2, I: 7, A: 1, S: 4, E: 8, C: 10,
      independent_vs_team: -0.2,
      structured_vs_flexible: -0.9,
      practical_vs_conceptual: -0.6,
      lead_vs_support: 0.1,
      stability: 9, growth: 8, independence: 8, creativity: 2, impact: 6, recognition: 9, balance: 5, learning: 7
    },
    requiredDegrees: ["ICAI Chartered Accountancy Qualification (Foundation, Intermediate, Final + 2-3 years Articleship)", "B.Com (optional but common)"],
    entryPathways: [
      "Direct entry or post-12th registration with the Institute of Chartered Accountants of India (ICAI)",
      "Articleship training at Big 4 (Deloitte, PwC, EY, KPMG) or mid-sized audit firms",
      "Corporate finance roles or independent CA practice"
    ],
    entranceExams: ["CA Foundation", "CA Intermediate", "CA Final"],
    challenges: [
      "Notoriously low pass percentage (often single-digit to 15%) causing repeated attempts and mental stress",
      "Grueling tax audit and filing seasons with 70+ hour work weeks and weekend commitments",
      "Heavy legal accountability where signing faulty audits carries severe regulatory penalties"
    ],
    relatedCareerIds: ["investment_analyst", "corporate_lawyer", "actuary"]
  },
  {
    id: "investment_analyst",
    name: "Investment Banker / Equity Analyst",
    industry: "Banking & Financial Services",
    description: "Evaluates companies, builds financial models, assesses mergers and acquisitions, and recommends stock buy/sell ratings for institutional investors.",
    vector: {
      R: 2, I: 8, A: 2, S: 3, E: 9, C: 8,
      independent_vs_team: 0.3,
      structured_vs_flexible: -0.5,
      practical_vs_conceptual: -0.3,
      lead_vs_support: -0.4,
      stability: 6, growth: 10, independence: 6, creativity: 3, impact: 6, recognition: 9, balance: 3, learning: 8
    },
    requiredDegrees: ["B.Tech / B.Com from top-tier colleges + MBA Finance (IIMs/ISB)", "CFA (Chartered Financial Analyst) charterholder"],
    entryPathways: [
      "Front-office campus placements from IIM A/B/C or top DU colleges (SRCC)",
      "Boutique equity research firms and wealth management firms",
      "Clearing CFA Level 1/2 alongside investment banking internships"
    ],
    entranceExams: ["CAT", "CFA Levels 1-3"],
    challenges: [
      "Notorious 80-90 hour work weeks with weekend work and unpredictable client emergency decks",
      "Extreme performance pressure where compensation is heavily skewed toward volatile annual bonuses",
      "High attrition and burnout rate within the first 3 years"
    ],
    relatedCareerIds: ["chartered_accountant", "management_consultant", "actuary"]
  },
  {
    id: "entrepreneur",
    name: "Startup Founder / Entrepreneur",
    industry: "Business & Innovation",
    description: "Identifies high-potential market inefficiencies, conceptualizes a solution, recruits a founding team, raises venture capital, and builds a sustainable enterprise.",
    vector: {
      R: 3, I: 6, A: 6, S: 6, E: 10, C: 4,
      independent_vs_team: 0.6,
      structured_vs_flexible: 1.0,
      practical_vs_conceptual: -0.2,
      lead_vs_support: -1.0,
      stability: 2, growth: 10, independence: 10, creativity: 9, impact: 9, recognition: 9, balance: 2, learning: 9
    },
    requiredDegrees: ["No formal degree strictly required; engineering or business background helpful"],
    entryPathways: [
      "Bootstrapping a digital or physical product during college",
      "Incubators and accelerator programs (Y Combinator, Antler, Surge)",
      "Spin-off venture after working in high-growth startups or corporate innovation"
    ],
    entranceExams: ["None (Market validation is the sole examination)"],
    challenges: [
      "Over 90% failure rate; constant risk of bankruptcy and zero income during initial years",
      "Relentless psychological stress, founder loneliness, and responsibility for employees' livelihoods",
      "Zero boundary between work and personal life"
    ],
    relatedCareerIds: ["product_manager", "management_consultant", "marketing_manager"]
  },
  {
    id: "civil_services_officer",
    name: "Civil Services Officer (IAS / IPS / IFS)",
    industry: "Government & Public Administration",
    description: "Administers government districts, maintains law and order, coordinates public welfare policies, and represents Indian diplomatic interests globally.",
    vector: {
      R: 4, I: 7, A: 2, S: 9, E: 9, C: 7,
      independent_vs_team: 0.7,
      structured_vs_flexible: -0.6,
      practical_vs_conceptual: -0.4,
      lead_vs_support: -0.9,
      stability: 10, growth: 6, independence: 5, creativity: 3, impact: 10, recognition: 10, balance: 4, learning: 7
    },
    requiredDegrees: ["Any Bachelor's degree from a recognized university"],
    entryPathways: [
      "Clearing the 3-stage UPSC Civil Services Examination (Prelims, Mains, Personality Test)",
      "State Public Service Commissions (State PCS examinations)",
      "Lateral entry into specialized joint-secretary posts (limited)"
    ],
    entranceExams: ["UPSC CSE (Civil Services Exam)", "State PSCs"],
    challenges: [
      "Extreme exam competition (fewer than 1,000 selected out of ~10 lakh aspirants annually)",
      "Frequent political interference, bureaucratic inertia, and sudden transfers across remote locations",
      "Fixed government pay scales that lag far behind private sector executive compensation"
    ],
    relatedCareerIds: ["corporate_lawyer", "social_entrepreneur_ngo", "teacher_educator"]
  },
  {
    id: "teacher_educator",
    name: "College Professor / Educator",
    industry: "Higher Education & Academia",
    description: "Teaches undergraduate and postgraduate students, designs curriculum, guides Ph.D. dissertations, and conducts academic peer-reviewed research.",
    vector: {
      R: 1, I: 9, A: 4, S: 10, E: 5, C: 6,
      independent_vs_team: 0.2,
      structured_vs_flexible: -0.3,
      practical_vs_conceptual: 0.7,
      lead_vs_support: -0.5,
      stability: 9, growth: 6, independence: 8, creativity: 6, impact: 9, recognition: 7, balance: 8, learning: 10
    },
    requiredDegrees: ["Master's degree in relevant discipline + Ph.D. for university professorship", "UGC NET / CSIR NET qualification"],
    entryPathways: [
      "Clearing UGC-NET / SET followed by Assistant Professor recruitments",
      "Completing doctorate with Scopus/SCI journal publications",
      "Online educational platforms (EdTech masterclasses, YouTube educator channels)"
    ],
    entranceExams: ["UGC NET", "CSIR NET", "State SET"],
    challenges: [
      "Ad-hoc / guest lecturer exploitation with poor job security before obtaining permanent tenure",
      "Bureaucracy and slow promotion criteria governed by rigid academic API scorecards",
      "Demotivated student cohorts and heavy administrative non-teaching duties"
    ],
    relatedCareerIds: ["clinical_psychologist", "biotech_researcher", "journalist"]
  },
  {
    id: "journalist",
    name: "Investigative Journalist / Media Reporter",
    industry: "Media, Publishing & News",
    description: "Investigates breaking news events, interviews sources, verifies facts on the ground, and produces analytical articles and video reports for the public.",
    vector: {
      R: 3, I: 8, A: 9, S: 7, E: 6, C: 4,
      independent_vs_team: -0.4,
      structured_vs_flexible: 0.7,
      practical_vs_conceptual: 0.2,
      lead_vs_support: -0.3,
      stability: 4, growth: 6, independence: 9, creativity: 8, impact: 9, recognition: 8, balance: 4, learning: 8
    },
    requiredDegrees: ["B.A. / M.A. in Journalism & Mass Communication, English, or Political Science"],
    entryPathways: [
      "Internships at national newspapers, digital news portals (The Print, Scroll), and wire agencies (PTI, ANI)",
      "Indian Institute of Mass Communication (IIMC) or ACJ Chennai diploma",
      "Substack newsletters, independent video journalism, and podcasting"
    ],
    entranceExams: ["IIMC Entrance Exam", "ACJ Entrance Exam", "CUET PG"],
    challenges: [
      "Low starting salaries in mainstream Indian newsrooms compared to corporate content marketing",
      "Hostile reporting environments, trolling, and legal threats or defamation suits from influential entities",
      "24/7 news cycle demanding urgent travel and irregular work hours"
    ],
    relatedCareerIds: ["corporate_lawyer", "marketing_manager", "teacher_educator"]
  },
  {
    id: "mechanical_engineer",
    name: "Mechanical / Robotics Systems Engineer",
    industry: "Manufacturing, Automotive & Robotics",
    description: "Designs mechanical components, thermodynamic systems, industrial robots, and automated production machinery using CAD/CAE tools.",
    vector: {
      R: 10, I: 7, A: 2, S: 2, E: 3, C: 6,
      independent_vs_team: 0.3,
      structured_vs_flexible: -0.6,
      practical_vs_conceptual: -0.8,
      lead_vs_support: 0.2,
      stability: 8, growth: 7, independence: 6, creativity: 5, impact: 7, recognition: 6, balance: 6, learning: 7
    },
    requiredDegrees: ["B.Tech / B.E. in Mechanical Engineering, Mechatronics, or Production Engineering"],
    entryPathways: [
      "Core manufacturing campus placements (Tata Motors, Mahindra, L&T, Maruti Suzuki)",
      "GATE Mechanical for PSU engineer posts (IOCL, ONGC, BHEL, ISRO)",
      "Specialized CAD/CAM modeling certifications and electric vehicle (EV) startups"
    ],
    entranceExams: ["JEE Main", "JEE Advanced", "GATE ME"],
    challenges: [
      "Initial campus placement salaries in core mechanical lag behind software/IT counterparts",
      "Often posted at remote factory shop floors, manufacturing plants, or construction sites",
      "Physical hazards and high compliance liability in industrial automation"
    ],
    relatedCareerIds: ["architect", "software_engineer", "commercial_pilot"]
  },
  {
    id: "corporate_lawyer",
    name: "Corporate Lawyer / Legal Counsel",
    industry: "Legal Services & Corporate Law",
    description: "Structures business transactions, conducts legal due diligence, drafts commercial contracts, and ensures compliance with statutory laws.",
    vector: {
      R: 1, I: 8, A: 3, S: 4, E: 9, C: 9,
      independent_vs_team: -0.2,
      structured_vs_flexible: -0.8,
      practical_vs_conceptual: 0.3,
      lead_vs_support: -0.5,
      stability: 8, growth: 9, independence: 8, creativity: 4, impact: 6, recognition: 9, balance: 4, learning: 8
    },
    requiredDegrees: ["5-year integrated B.A. LL.B / B.B.A. LL.B or 3-year LL.B post-graduation", "Bar Council of India (BCI) enrollment"],
    entryPathways: [
      "Campus placements from National Law Universities (NLUs) into Tier-1 law firms (AZB, CAM, SAM, Khaitan)",
      "In-house legal teams at tech conglomerates and financial institutions",
      "Apprenticeship under senior high court / supreme court advocates"
    ],
    entranceExams: ["CLAT (Common Law Admission Test)", "AILET", "All India Bar Examination (AIBE)"],
    challenges: [
      "Extreme billing-hour expectations (70-80 hours/week) during major M&A transactions",
      "Immense volume of dense contractual reading, redlining, and meticulous proofreading",
      "Heavy pedigree bias favoring top NLU graduates for premium corporate law firms"
    ],
    relatedCareerIds: ["chartered_accountant", "civil_services_officer", "investment_analyst"]
  },
  {
    id: "marketing_manager",
    name: "Marketing Manager / Brand Strategist",
    industry: "FMCG, Consumer Tech & E-commerce",
    description: "Builds customer acquisition strategies, oversees creative brand campaigns, manages multi-crore advertising budgets, and analyzes market share growth.",
    vector: {
      R: 1, I: 6, A: 8, S: 7, E: 10, C: 5,
      independent_vs_team: 0.7,
      structured_vs_flexible: 0.6,
      practical_vs_conceptual: -0.2,
      lead_vs_support: -0.7,
      stability: 6, growth: 9, independence: 7, creativity: 9, impact: 7, recognition: 8, balance: 6, learning: 7
    },
    requiredDegrees: ["BBA / B.Com / B.Tech + MBA in Marketing (Tier-1 or Tier-2 B-School)"],
    entryPathways: [
      "Management Trainee programs at top FMCG companies (HUL, ITC, Nestlé) or consumer tech apps (Zomato, Swiggy)",
      "Growth marketing specialist roles in D2C startups",
      "Performance marketing and creative advertising agency experience"
    ],
    entranceExams: ["CAT", "XAT", "SNAP", "NMAT"],
    challenges: [
      "Ruthless accountability to daily CAC (Customer Acquisition Cost) and ROAS (Return on Ad Spend) metrics",
      "Fickle consumer attention spans demanding non-stop creative reinvention",
      "Frequent misalignment between brand creative aspirations and finance quarterly budgets"
    ],
    relatedCareerIds: ["product_manager", "ux_designer", "journalist"]
  },
  {
    id: "management_consultant",
    name: "Management / Strategy Consultant",
    industry: "Management Consulting & Advisory",
    description: "Advises CEOs and board members on market entry, operational restructuring, cost rationalization, and digital transformations.",
    vector: {
      R: 2, I: 9, A: 3, S: 6, E: 10, C: 7,
      independent_vs_team: 0.7,
      structured_vs_flexible: 0.4,
      practical_vs_conceptual: 0.5,
      lead_vs_support: -0.7,
      stability: 7, growth: 10, independence: 6, creativity: 6, impact: 8, recognition: 9, balance: 3, learning: 9
    },
    requiredDegrees: ["Undergraduate degree from IIT/BITS/SRCC + MBA from IIM A/B/C or ISB"],
    entryPathways: [
      "Direct campus hire into MBB (McKinsey, BCG, Bain) or Tier-2 strategy houses (Kearney, Oliver Wyman)",
      "Big 4 consulting arms (Strategy&, Parthenon, Monitor Deloitte)",
      "Lateral hire with deep domain knowledge in logistics, healthcare, or energy"
    ],
    entranceExams: ["CAT", "GMAT"],
    challenges: [
      "Non-stop domestic and international travel living out of hotel rooms Monday through Thursday",
      "High burnout rate and 'up-or-out' promotion policy within 24 months",
      "Frustration when clients pay millions for recommendations but fail to execute them"
    ],
    relatedCareerIds: ["product_manager", "investment_analyst", "entrepreneur"]
  },
  {
    id: "cybersecurity_analyst",
    name: "Cybersecurity Analyst / Ethical Hacker",
    industry: "Information Security & Defense",
    description: "Safeguards enterprise computer networks, audits zero-day vulnerabilities, performs simulated red-team attacks, and mitigates ransomware breaches.",
    vector: {
      R: 6, I: 10, A: 2, S: 2, E: 3, C: 8,
      independent_vs_team: -0.6,
      structured_vs_flexible: -0.4,
      practical_vs_conceptual: -0.6,
      lead_vs_support: 0.3,
      stability: 8, growth: 9, independence: 8, creativity: 5, impact: 8, recognition: 7, balance: 6, learning: 9
    },
    requiredDegrees: ["B.Tech / B.E. in CS / IT / Cyber Security or BCA/MCA"],
    entryPathways: [
      "Industry certifications: CEH, CompTIA Security+, OSCP (Offensive Security Certified Professional)",
      "Bug bounty platforms (HackerOne, Bugcrowd) and CTF (Capture the Flag) ranking",
      "SOC (Security Operations Center) monitoring roles transitioning to penetration testing"
    ],
    entranceExams: ["GATE CS", "JEE Main"],
    challenges: [
      "On-call emergency escalation when breaches occur at 3 AM on weekends",
      "Perpetual cat-and-mouse game against evolving state-sponsored and criminal hacker syndicates",
      "Strict compliance overhead and documentation of audit trails"
    ],
    relatedCareerIds: ["software_engineer", "data_scientist"]
  },
  {
    id: "environmental_scientist",
    name: "Environmental Scientist / Sustainability Lead",
    industry: "Renewable Energy & Climate Tech",
    description: "Analyzes ecological data, designs carbon offset methodologies, guides corporate ESG compliance, and advises on climate resilience programs.",
    vector: {
      R: 6, I: 9, A: 3, S: 8, E: 4, C: 6,
      independent_vs_team: -0.2,
      structured_vs_flexible: 0.1,
      practical_vs_conceptual: 0.4,
      lead_vs_support: -0.1,
      stability: 7, growth: 8, independence: 7, creativity: 5, impact: 10, recognition: 6, balance: 7, learning: 8
    },
    requiredDegrees: ["B.Sc. / B.Tech in Environmental Science / Chemical / Civil Engineering", "M.Sc. / M.Tech in Sustainability Management or Ecology"],
    entryPathways: [
      "Corporate ESG (Environmental, Social & Governance) auditing teams in multinational firms",
      "Renewable energy developers (Solar, Wind, Green Hydrogen)",
      "United Nations (UNEP, UNDP), TERI, and international climate think-tanks"
    ],
    entranceExams: ["UGC NET Environmental Sciences", "GATE Environmental Science & Engineering (ES)"],
    challenges: [
      "Corporate 'greenwashing' where sustainability suggestions are treated as PR checklists",
      "Slower initial salary growth compared to mainstream tech and finance tracks in India",
      "Field inspections in physically demanding remote terrains"
    ],
    relatedCareerIds: ["biotech_researcher", "civil_services_officer", "social_entrepreneur_ngo"]
  },
  {
    id: "commercial_pilot",
    name: "Commercial Airline Pilot",
    industry: "Aviation & Aerospace",
    description: "Operates passenger and cargo aircraft safely across domestic and international flight corridors, managing navigation, weather telemetry, and cockpit crews.",
    vector: {
      R: 10, I: 6, A: 1, S: 4, E: 5, C: 9,
      independent_vs_team: 0.5,
      structured_vs_flexible: -1.0,
      practical_vs_conceptual: -0.9,
      lead_vs_support: -0.8,
      stability: 8, growth: 6, independence: 6, creativity: 1, impact: 6, recognition: 9, balance: 4, learning: 6
    },
    requiredDegrees: ["10+2 with Physics and Mathematics", "Commercial Pilot License (CPL) from DGCA-approved flying school"],
    entryPathways: [
      "Cadet Pilot Programs with major Indian airlines (IndiGo, Air India)",
      "200 hours flight training at flying club + DGCA theoretical examinations",
      "Type rating on Airbus A320 or Boeing 737 platforms"
    ],
    entranceExams: ["DGCA CPL Exams", "Airline Cadet Selection assessments (WOMBAT, psychometrics)"],
    challenges: [
      "Massive upfront training cost (₹50 Lakh to ₹1 Crore) before earning a single rupee",
      "Rigid biannual medical exams where minor eyesight or heart anomalies can terminate one's career",
      "Severe jet lag, circadian disruption, and long layovers away from home"
    ],
    relatedCareerIds: ["mechanical_engineer"]
  },
  {
    id: "architect",
    name: "Architect & Spatial Designer",
    industry: "Architecture, Real Estate & Urban Planning",
    description: "Conceives architectural plans, structural aesthetics, and functional interior spaces, coordinating engineering schematics and municipal approvals.",
    vector: {
      R: 7, I: 6, A: 10, S: 4, E: 5, C: 6,
      independent_vs_team: 0.3,
      structured_vs_flexible: 0.3,
      practical_vs_conceptual: -0.3,
      lead_vs_support: -0.4,
      stability: 7, growth: 7, independence: 8, creativity: 10, impact: 7, recognition: 8, balance: 6, learning: 7
    },
    requiredDegrees: ["B.Arch (5-year Council of Architecture approved program)"],
    entryPathways: [
      "NATA / JEE Main Paper 2 rank for admission to SPA (School of Planning & Architecture), CEPT, or NITs",
      "Apprenticeship at prominent architectural design studios",
      "Establishing an independent architectural consultancy firm"
    ],
    entranceExams: ["NATA (National Aptitude Test in Architecture)", "JEE Main Paper 2"],
    challenges: [
      "Very low starting stipends for junior architects during the first 3 years in India",
      "Frustrating compromises caused by real-estate developers cutting costs or client aesthetic interference",
      "Complex municipal sanctioning, bribery, and local zoning bylaws"
    ],
    relatedCareerIds: ["ux_designer", "mechanical_engineer"]
  },
  {
    id: "supply_chain_manager",
    name: "Supply Chain & Operations Manager",
    industry: "E-Commerce, Logistics & Retail",
    description: "Optimizes end-to-end procurement, warehouse inventory, order fulfillment, and last-mile delivery networks to ensure speed and cost efficiency.",
    vector: {
      R: 5, I: 6, A: 1, S: 4, E: 8, C: 9,
      independent_vs_team: 0.6,
      structured_vs_flexible: -0.8,
      practical_vs_conceptual: -0.7,
      lead_vs_support: -0.6,
      stability: 8, growth: 8, independence: 5, creativity: 3, impact: 7, recognition: 6, balance: 5, learning: 7
    },
    requiredDegrees: ["B.Tech / B.Com + MBA in Operations / Supply Chain Management (NITIE / IIMs)"],
    entryPathways: [
      "Operations management trainee roles at e-commerce giants (Amazon, Flipkart, Delhivery)",
      "Manufacturing plant logistics at FMCG corporations",
      "Supply chain planning software consulting (SAP, Blue Yonder)"
    ],
    entranceExams: ["CAT", "GATE"],
    challenges: [
      "High-pressure environment during festive e-commerce sales (Big Billion Days) with 24/7 escalation shifts",
      "Warehouse facilities are frequently located in industrial outskirts far from city centers",
      "Managing frontline ground laborers, union negotiations, and transportation strikes"
    ],
    relatedCareerIds: ["mechanical_engineer", "management_consultant"]
  },
  {
    id: "human_resources_director",
    name: "HR Business Partner / Talent Director",
    industry: "Human Resources & Organizational Behavior",
    description: "Aligns human capital with business strategy, oversees leadership hiring, drives organizational culture, and manages employee relations and executive rewards.",
    vector: {
      R: 1, I: 5, A: 4, S: 10, E: 8, C: 7,
      independent_vs_team: 0.8,
      structured_vs_flexible: -0.4,
      practical_vs_conceptual: 0.2,
      lead_vs_support: -0.4,
      stability: 8, growth: 7, independence: 6, creativity: 5, impact: 8, recognition: 7, balance: 7, learning: 7
    },
    requiredDegrees: ["MBA / PGDM in Human Resources from premier institutes (XLRI, TISS, MDI, SCMHRD)"],
    entryPathways: [
      "Campus placement through premier HR programs into corporate HR leadership cohorts",
      "Specialized executive search and headhunting boutique firms",
      "People operations roles in tech startups"
    ],
    entranceExams: ["XAT", "CAT", "CUET PG"],
    challenges: [
      "Often positioned as the bearer of bad news (managing layoffs, performance warnings, and salary cuts)",
      "Balancing employee welfare empathy with ruthless executive board financial mandates",
      "Struggle to earn credibility as a revenue-generating partner rather than a bureaucratic cost center"
    ],
    relatedCareerIds: ["clinical_psychologist", "management_consultant", "marketing_manager"]
  },
  {
    id: "social_entrepreneur_ngo",
    name: "Development Sector / NGO Program Director",
    industry: "Social Impact & Non-Profit Organizations",
    description: "Directs large-scale humanitarian programs, manages philanthropic grants, executes rural development initiatives, and measures poverty eradication impact.",
    vector: {
      R: 3, I: 7, A: 4, S: 10, E: 8, C: 6,
      independent_vs_team: 0.6,
      structured_vs_flexible: 0.3,
      practical_vs_conceptual: -0.1,
      lead_vs_support: -0.8,
      stability: 5, growth: 6, independence: 8, creativity: 6, impact: 10, recognition: 7, balance: 6, learning: 8
    },
    requiredDegrees: ["Master's in Social Work (MSW) or Development Studies (TISS, Azim Premji University, IRMA)"],
    entryPathways: [
      "Fellowships (Teach For India, Gandhi Fellowship, Prime Minister's Rural Development Fellowship)",
      "Program coordinator roles in philanthropic foundations (Gates Foundation, Tata Trusts, Dasra)",
      "Founding a grassroots non-profit or section-8 company"
    ],
    entranceExams: ["TISS-NET / CUET PG", "Azim Premji University National Entrance"],
    challenges: [
      "Constant financial vulnerability dependent on uncertain donor grants and CSR budget cycles",
      "Emotional fatigue witnessing poverty, injustice, and systemic state corruption first-hand",
      "Lower financial compensation compared to corporate private sector peers"
    ],
    relatedCareerIds: ["civil_services_officer", "teacher_educator", "environmental_scientist"]
  },
  {
    id: "actuary",
    name: "Actuary & Risk Specialist",
    industry: "Insurance, Pensions & Quantitative Risk",
    description: "Uses advanced probability, financial mathematics, and stochastic calculus to price insurance policies, evaluate disaster risk, and ensure solvency.",
    vector: {
      R: 2, I: 10, A: 1, S: 2, E: 5, C: 10,
      independent_vs_team: -0.5,
      structured_vs_flexible: -1.0,
      practical_vs_conceptual: 0.8,
      lead_vs_support: 0.2,
      stability: 10, growth: 8, independence: 8, creativity: 2, impact: 6, recognition: 9, balance: 7, learning: 9
    },
    requiredDegrees: ["B.Sc. / B.Math in Mathematics / Statistics / Actuarial Science", "Fellowship / Associateship of IAI (Institute of Actuaries of India) or IFoA (UK)"],
    entryPathways: [
      "Clearing ACET (Actuarial Common Entrance Test) and core mathematical exam papers (CS1, CM1)",
      "Actuarial analyst trainee roles in life insurance, general insurance, and reinsurance firms (Swiss Re, Munich Re)",
      "Pensions and financial risk consulting (Willis Towers Watson, Mercer, Aon)"
    ],
    entranceExams: ["ACET (IAI)", "IFoA Exam Series"],
    challenges: [
      "Demanding series of 13-15 rigorous professional examinations often taking 5 to 8 years to fully pass",
      "Working full-time while studying 20+ hours per week for upcoming exam sessions",
      "Work is predominantly solitary and heavy on complex statistical modeling with little client interaction"
    ],
    relatedCareerIds: ["data_scientist", "chartered_accountant", "investment_analyst"]
  }
];

// Validation checks
console.log(`Checking questions: Total = ${questions.length}`);
if (questions.length !== 40) {
  throw new Error(`Expected 40 questions, found ${questions.length}`);
}

const catCounts = { interest: 0, workstyle: 0, values: 0, situational: 0 };
questions.forEach((q, idx) => {
  catCounts[q.category] = (catCounts[q.category] || 0) + 1;
  QuestionSchema.parse(q);
  if (idx < 5 && !q.tags.includes("universal")) {
    throw new Error(`Question ${q.id} (index ${idx}) must have 'universal' in tags`);
  }
});

console.log("Question categories:", catCounts);
if (catCounts.interest !== 14 || catCounts.workstyle !== 8 || catCounts.values !== 8 || catCounts.situational !== 10) {
  throw new Error(`Category counts mismatch! Expected: 14 interest, 8 workstyle, 8 values, 10 situational. Found: ${JSON.stringify(catCounts)}`);
}

console.log(`Checking careers: Total = ${careers.length}`);
if (careers.length !== 25) {
  throw new Error(`Expected 25 careers, found ${careers.length}`);
}

careers.forEach((c) => {
  CareerSchema.parse(c);
});

// Write to files
const outDir = path.join(__dirname, '..', 'src', 'data');
fs.writeFileSync(path.join(outDir, 'questions.json'), JSON.stringify(questions, null, 2), 'utf-8');
fs.writeFileSync(path.join(outDir, 'careers.json'), JSON.stringify(careers, null, 2), 'utf-8');

console.log("Successfully generated and validated questions.json and careers.json!");
