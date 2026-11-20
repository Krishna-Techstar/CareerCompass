/**
 * CareerCompass - Pitch-Ready Offline Demo Data Module (?demo=1)
 * Pre-fills realistic high-caliber assessment reports and dashboard states
 * so presenters can pitch flawlessly even if the network or external APIs drop.
 */

export const DEMO_PROFILE = {
  name: "Aarav Sharma",
  age: 21,
  segment: "undergrad",
  streamOrCourse: "B.Tech Computer Science (AI & Systems Track)",
  parentalConsent: true,
  interests: {
    R: 6.2,
    I: 9.4,
    A: 5.1,
    S: 2.8,
    E: 7.6,
    C: 5.5,
  },
  workstyle: {
    independent_vs_team: -0.65,
    structured_vs_flexible: -0.2,
    practical_vs_conceptual: 0.55,
    lead_vs_support: -0.4,
  },
  values: {
    learning: 9.6,
    prestige: 8.2,
    money: 8.6,
    impact: 8.1,
    creativity: 7.2,
    independence: 8.5,
    stability: 6.4,
    balance: 6.0,
  },
  evidenceCounts: {
    I: 7,
    E: 5,
    R: 4,
    A: 3,
    C: 3,
    S: 2,
  },
  answeredIds: [
    "ay_ug_01", "ay_ug_02", "ay_ug_03",
    "ld_ug_01", "ld_ug_02", "ld_ug_03", "ld_ug_04", "ld_ug_05",
    "ws_ug_01", "ws_ug_02", "ws_ug_03", "ws_ug_04",
    "ba_ug_01", "ba_ug_02", "ba_ug_03", "ba_ug_04", "ba_ug_05",
    "va_ug_01", "va_ug_02", "va_ug_03",
  ],
  history: [
    { questionId: "ay_ug_01", optionId: "ay_ug_01_a", probeType: "universal", reason: "Foundational calibration" },
    { questionId: "ay_ug_02", optionId: "ay_ug_02_b", probeType: "deep", reason: "Deep analytical probe" },
    { questionId: "ay_ug_03", optionId: "ay_ug_03_a", probeType: "cross", reason: "Tech systems inquiry" },
    { questionId: "ld_ug_01", optionId: "ld_ug_01_a", probeType: "deep", reason: "Investigating computational interests" },
    { questionId: "ld_ug_02", optionId: "ld_ug_02_b", probeType: "cross", reason: "Exploring creative synthesis" },
    { questionId: "ld_ug_03", optionId: "ld_ug_03_a", probeType: "deep", reason: "Scientific modeling affinity" },
    { questionId: "ld_ug_04", optionId: "ld_ug_04_c", probeType: "challenge", reason: "Testing commercial problem-solving" },
    { questionId: "ld_ug_05", optionId: "ld_ug_05_a", probeType: "deep", reason: "Algorithmic thinking" },
    { questionId: "ws_ug_01", optionId: "ws_ug_01_a", probeType: "deep", reason: "Solo deep-work vs team structure" },
    { questionId: "ws_ug_02", optionId: "ws_ug_02_b", probeType: "cross", reason: "Agile vs SOP preference" },
    { questionId: "ws_ug_03", optionId: "ws_ug_03_a", probeType: "challenge", reason: "Handling ambiguous roadmaps" },
    { questionId: "ws_ug_04", optionId: "ws_ug_04_b", probeType: "deep", reason: "Strategic leadership inclination" },
    { questionId: "ba_ug_01", optionId: "ba_ug_01_a", probeType: "challenge", reason: "Cognitive logic puzzle performance" },
    { questionId: "ba_ug_02", optionId: "ba_ug_02_b", probeType: "deep", reason: "Analytical reasoning test" },
    { questionId: "ba_ug_03", optionId: "ba_ug_03_a", probeType: "cross", reason: "Systems design puzzle" },
    { questionId: "ba_ug_04", optionId: "ba_ug_04_c", probeType: "challenge", reason: "Computational benchmark" },
    { questionId: "ba_ug_05", optionId: "ba_ug_05_a", probeType: "deep", reason: "Objective strength verification" },
    { questionId: "va_ug_01", optionId: "va_ug_01_a", probeType: "deep", reason: "Core career drivers" },
    { questionId: "va_ug_02", optionId: "va_ug_02_b", probeType: "cross", reason: "Growth vs security tradeoff" },
    { questionId: "va_ug_03", optionId: "va_ug_03_a", probeType: "universal", reason: "Final values prioritization" },
  ],
  sectionSummaries: {
    about_you: "Here's what we noticed so far: You bring an articulate intellectual drive centered on computing systems, data architecture, and scalable software.",
    likes_dislikes: "Here's what we noticed so far: Your curiosity is energized by abstract algorithmic challenges, with a sharp aversion to repetitive operational chores.",
    work_style: "Here's what we noticed so far: You perform at your peak with deep solitary focus blocks, paired with agile high-trust team collaboration.",
    best_at: "Here's what we noticed so far: Your demonstrated puzzle scores reflect top-decile logical deduction and fast pattern synthesis.",
    values: "Here's what we noticed so far: You anchor your career in steep intellectual mastery, autonomy, and high-impact technology creation.",
  },
};

export const DEMO_REPORT = {
  summary:
    "Aarav represents an intellectually ambitious technologist with a pronounced orientation toward Investigative inquiry (94%) and Enterprising drive (76%). His cognitive mini-challenge scores demonstrated standout algorithmic logic, paired with an authentic desire to architect scalable intelligent systems rather than merely maintain existing infrastructure.",
  strengths: [
    "Algorithmic Problem-Solving & Pattern Recognition (Top 5% percentile on objective mini-challenge probes)",
    "Autonomous Systems Architecture: High intrinsic motivation for uninterrupted deep solitary execution",
    "Strategic Product Translation: Bridges complex mathematical formulations with commercial viability",
    "Adaptive Technical Agility: Rapidly assimilates emerging AI architectures and distributed paradigms",
  ],
  workStyle:
    "Thrives in autonomous, async-first environments that prioritize dedicated deep-work blocks, low administrative bureaucracy, and meritocratic technical feedback loops.",
  values:
    "Anchored in continuous mastery, technological innovation, and measurable real-world impact with upward career velocity.",
  careerExplanations: [
    {
      careerId: "data_scientist",
      why: "Your standout Investigative score (94%) and proven aptitude on computational reasoning tests align seamlessly with machine learning research, agent design, and AI model evaluation.",
      watchOut:
        "The AI landscape changes weekly; avoid getting trapped in pure theoretical notebooks without shipping hardened production pipelines.",
    },
    {
      careerId: "software_engineer",
      why: "High systems architecture inclination coupled with strong conventional logic ensures you excel at building distributed, fault-tolerant microservices.",
      watchOut:
        "Deep technical focus can lead to isolated silos; actively practice presenting engineering trade-offs to business and product teams.",
    },
    {
      careerId: "ux_designer",
      why: "A strong secondary artistic score combined with analytical empathy equips you to design intuitive developer tools and complex data-dense interfaces.",
      watchOut:
        "Subjective stakeholder debates require resilience; consistently anchor UX decisions in user telemetry and conversion metrics.",
    },
    {
      careerId: "product_manager",
      why: "Enterprising drive (76%) coupled with genuine engineering fluency enables you to earn developer trust and make principled roadmap trade-offs.",
      watchOut:
        "High meeting frequency and constant stakeholder context switching can deplete your deep-work focus energy if unmanaged.",
    },
  ],
  unsureAbout: [
    "Navigating whether to pursue an immediate specialist AI engineering role vs. an elite Tier-1 MS/PhD research track.",
    "Balancing desire for rapid startup equity growth against the scale and mentorship infrastructure of global big-tech labs.",
  ],
  nextSteps: [
    "Architect and open-source a full-stack LLM agent workflow on GitHub with clear documentation and a deployed demo URL.",
    "Target a summer AI/Systems Engineering internship at a high-growth venture-backed startup or premier AI research group.",
    "Shadow a Staff Software Engineer or Principal Architect for a day to observe high-stakes architectural trade-offs.",
    "Publish a technical case study dissecting distributed vector search latency benchmarks on Substack or Dev.to.",
  ],
};

export const DEMO_MATCHES = [
  {
    career: {
      id: "data_scientist",
      name: "Data Scientist / AI Engineer",
      industry: "Artificial Intelligence & Analytics",
      description:
        "Extracts predictive insights from structured and unstructured data using machine learning algorithms, deep learning models, and statistical inference.",
      entryPathways: [
        "Competitive programming, Kaggle Grandmaster tracks & open-source ML contributions",
        "Campus recruitment for specialized AI/ML engineering cohorts",
        "M.Tech / MS research fellowships with published pre-prints",
      ],
      requiredDegrees: [
        "B.Tech / B.E. in CS, Data Science, or AI",
        "M.Sc. in Statistics / Mathematics / Computer Science",
      ],
      entranceExams: ["GATE CS / Data Science", "JEE Advanced"],
      challenges: [
        "Tedious data cleaning and data pipeline reliability engineering",
        "Rapid technology turnover with continuous transformer and agent evolutions",
      ],
    },
    fitIndex: 94,
    evidence: {
      topContributors: [
        "Standout Investigative score (94%): Deep analytical inquiry",
        "Top-decile performance on objective algorithmic mini-challenges",
        "High alignment with learning and intellectual mastery values",
      ],
      mismatches: [],
    },
  },
  {
    career: {
      id: "software_engineer",
      name: "Software Engineer / SDE",
      industry: "Information Technology & Software",
      description:
        "Designs, codes, and maintains scalable software applications, distributed microservices, and platforms solving complex computational problems.",
      entryPathways: [
        "Tier-1 campus placement drives with rigorous DSA & system design rounds",
        "Open-source distributed systems contributions and tech hackathons",
        "Off-campus referrals via production portfolio demonstrations",
      ],
      requiredDegrees: ["B.Tech / B.E. in Computer Science or IT", "BCA + MCA"],
      entranceExams: ["JEE Main", "JEE Advanced", "GATE CS"],
      challenges: [
        "Rapid software stack obsolescence requiring perpetual self-upskilling",
        "Balancing code perfectionism against tight commercial sprint deadlines",
      ],
    },
    fitIndex: 89,
    evidence: {
      topContributors: [
        "High systems inclination with strong conventional precision",
        "Strong preference for solitary deep focus blocks",
      ],
      mismatches: [],
    },
  },
  {
    career: {
      id: "ux_designer",
      name: "UI/UX Product Designer",
      industry: "Design & Creative Technology",
      description:
        "Crafts intuitive, delightful, and accessible digital user experiences through user research, wireframing, interactive prototyping, and design systems.",
      entryPathways: [
        "Portfolio-driven entry with Figma case studies demonstrating end-to-end design thinking",
        "NID / IDC IIT post-graduate design programs",
        "Design agency apprenticeship transitioning to product design",
      ],
      requiredDegrees: ["B.Des / M.Des", "Engineering degree with compelling design portfolio"],
      entranceExams: ["UCEED", "CEED", "NID DAT"],
      challenges: [
        "Navigating subjective visual critiques from non-designer stakeholders",
        "Balancing aesthetic innovation with strict design-system token constraints",
      ],
    },
    fitIndex: 82,
    evidence: {
      topContributors: [
        "Artistic score (51%) paired with user-centric problem analysis",
        "Appetite for rapid visual prototyping and user empathy",
      ],
      mismatches: [],
    },
  },
  {
    career: {
      id: "product_manager",
      name: "Product Manager (PM)",
      industry: "Technology & Digital Products",
      description:
        "Sits at the intersection of business, engineering, and user experience to define product vision, build roadmaps, and ship high-impact features.",
      entryPathways: [
        "Associate Product Manager (APM) cohorts at top-tier tech firms",
        "Post-MBA campus recruitment from IIMs / ISB / XLRI",
        "Lateral transition from senior software engineering or data science",
      ],
      requiredDegrees: ["B.Tech + MBA from Tier-1 institution", "Engineering degree with APM track"],
      entranceExams: ["CAT", "GMAT", "XAT"],
      challenges: [
        "Leading through influence and conviction without formal organizational authority",
        "Continuous context-switching across engineering, design, and executive politics",
      ],
    },
    fitIndex: 80,
    evidence: {
      topContributors: [
        "Enterprising drive (76%): Commercial growth & strategic direction",
        "Technical depth to evaluate feasibility and communicate with engineers",
      ],
      mismatches: [],
    },
  },
];

export const DEMO_REPORT_DATA = {
  report: DEMO_REPORT,
  matches: DEMO_MATCHES,
  profile: DEMO_PROFILE,
  path: "llm",
};

export const DEMO_USER = {
  id: "demo-pitch-user",
  email: "aarav.sharma@demo.ac.in",
  user_metadata: {
    full_name: "Aarav Sharma",
    name: "Aarav Sharma",
  },
  profile: {
    name: "Aarav Sharma",
    full_name: "Aarav Sharma",
    segment: "undergrad",
    stream: "B.Tech Computer Science & AI",
    streamOrCourse: "B.Tech Computer Science & AI",
    isMinor: false,
    parentalConsent: true,
  },
};

export const DEMO_DASHBOARD_ASSESSMENTS = [
  {
    id: "demo-assessment-completed",
    user_id: "demo-pitch-user",
    segment: "undergrad",
    status: "completed",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    answers: DEMO_PROFILE.history,
    profile: DEMO_PROFILE,
    report: DEMO_REPORT_DATA,
  },
  {
    id: "demo-assessment-inprogress",
    user_id: "demo-pitch-user",
    segment: "class_11_12",
    status: "in_progress",
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    answers: DEMO_PROFILE.history.slice(0, 14),
    profile: {
      ...DEMO_PROFILE,
      segment: "class_11_12",
      answeredIds: DEMO_PROFILE.answeredIds.slice(0, 14),
    },
  },
];
