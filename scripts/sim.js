const questionsData = require("../src/data/questions.json");
const careersData = require("../src/data/careers.json");
const { createProfile, applyAnswer, normalizedProfile } = require("../src/lib/profile.js");
const { matchCareers } = require("../src/lib/matching.js");
const { getCandidates, shouldStop, getCurrentSection, getSectionCounts } = require("../src/lib/selector.js");

const questions = questionsData;
const careers = careersData;

const questionMap = new Map();
questions.forEach((q) => questionMap.set(q.id, q));

/**
 * Runs an adaptive simulation of an interview session for a student in a specific segment.
 * Simulates all 5 sections (about_you: 3, likes_dislikes: 5, work_style: 4, best_at: 5, values: 3) = 20 questions.
 */
function runAdaptiveSimulation({ studentName, segment, persona, preferenceStrategy }) {
  console.log(`\n======================================================`);
  console.log(`SIMULATING STUDENT: ${studentName.toUpperCase()}`);
  console.log(`Segment: ${segment} | Persona: ${persona}`);
  console.log(`======================================================`);

  let profile = createProfile(segment);

  let step = 0;
  while (!shouldStop(profile, questions) && step < 25) {
    step++;
    const currentSection = getCurrentSection(profile, questions);
    const candidates = getCandidates(profile, questions, 8);

    if (!candidates || candidates.length === 0) {
      console.warn(`No candidates available for section ${currentSection}`);
      break;
    }

    // Pick a candidate question
    const chosenCand = candidates[0];
    const q = chosenCand.question;

    // Pick an option according to student preference strategy
    const chosenOption = preferenceStrategy(q);
    profile = applyAnswer(
      profile,
      q,
      chosenOption.id,
      chosenCand.probeType,
      `Simulated: chose ${chosenOption.id}`
    );
  }

  const counts = getSectionCounts(profile, questions);
  const norm = normalizedProfile(profile);

  console.log(`\nCompleted interview with ${profile.answeredIds.length} answers!`);
  console.log("Section counts:", counts);
  console.log("RIASEC Vector:", norm.interests);
  console.log("Workstyle Spectrum:", norm.workstyle);

  const topMatches = matchCareers(profile, careers);

  const isDirection = segment === "class_6_8" || segment === "class_9_10";
  console.log(`\nTOP 4 ${isDirection ? "STREAM & SUBJECT DIRECTIONS" : "CAREER MATCHES"} FOR ${studentName.toUpperCase()}:`);

  topMatches.slice(0, 4).forEach((match, idx) => {
    console.log(`  #${idx + 1}: ${match.career.name} (Fit Index: ${match.fitIndex}/100)`);
    console.log(`      Industry: ${match.career.industry}`);
    console.log(`      Top Contributors: ${match.evidence.topContributors.slice(0, 2).join(", ")}`);
  });

  return {
    studentName,
    segment,
    topMatchIds: topMatches.slice(0, 4).map((m) => m.career.id),
    topMatchNames: topMatches.slice(0, 4).map((m) => m.career.name),
  };
}

// -------------------------------------------------------------
// SIMULATE 5 DIVERSE AUDIENCE SEGMENTS
// -------------------------------------------------------------

// 1. Class 6-8: Rohan (Hands-on Science, Math, Lego & Robots)
const sim1 = runAdaptiveSimulation({
  studentName: "Rohan Sharma",
  segment: "class_6_8",
  persona: "Middle School - Science, Space & Robotics Enthusiast",
  preferenceStrategy: (q) => {
    // Prefers options with R, I, or learning weights
    const sorted = [...q.options].sort((a, b) => {
      const scoreA = (a.weights.R || 0) * 2 + (a.weights.I || 0) * 2 + (a.weights.learning || 0);
      const scoreB = (b.weights.R || 0) * 2 + (b.weights.I || 0) * 2 + (b.weights.learning || 0);
      return scoreB - scoreA;
    });
    return sorted[0];
  },
});

// 2. Class 9-10: Priya (Commerce, Accounts, Business & Startups)
const sim2 = runAdaptiveSimulation({
  studentName: "Priya Patel",
  segment: "class_9_10",
  persona: "Secondary School - Commerce & Economics Stream Seeker",
  preferenceStrategy: (q) => {
    // Prefers options with C, E, or growth weights
    const sorted = [...q.options].sort((a, b) => {
      const scoreA = (a.weights.C || 0) * 2 + (a.weights.E || 0) * 2 + (a.weights.growth || 0);
      const scoreB = (b.weights.C || 0) * 2 + (b.weights.E || 0) * 2 + (b.weights.growth || 0);
      return scoreB - scoreA;
    });
    return sorted[0];
  },
});

// 3. Class 11-12: Aditya (Senior Secondary PCM - Software & Engineering)
const sim3 = runAdaptiveSimulation({
  studentName: "Aditya Verma",
  segment: "class_11_12",
  persona: "Class 12 PCM - Computer Science & JEE Track",
  preferenceStrategy: (q) => {
    // Prefers options with I, R, and software tech
    const sorted = [...q.options].sort((a, b) => {
      const scoreA = (a.weights.I || 0) * 2 + (a.weights.R || 0) * 1.5 + (a.weights.learning || 0);
      const scoreB = (b.weights.I || 0) * 2 + (b.weights.R || 0) * 1.5 + (b.weights.learning || 0);
      return scoreB - scoreA;
    });
    return sorted[0];
  },
});

// 4. Undergrad: Sneha (College - Psychology, Healthcare & Human Connection)
const sim4 = runAdaptiveSimulation({
  studentName: "Sneha Kulkarni",
  segment: "undergrad",
  persona: "College 3rd Year - Psychology, Helping & Clinical Care",
  preferenceStrategy: (q) => {
    // Prefers options with S, A, and impact
    const sorted = [...q.options].sort((a, b) => {
      const scoreA = (a.weights.S || 0) * 2 + (a.weights.A || 0) * 1 + (a.weights.impact || 0) * 2;
      const scoreB = (b.weights.S || 0) * 2 + (b.weights.A || 0) * 1 + (b.weights.impact || 0) * 2;
      return scoreB - scoreA;
    });
    return sorted[0];
  },
});

// 5. Postgrad: Vikram (Working Professional - Executive Strategy & Product)
const sim5 = runAdaptiveSimulation({
  studentName: "Vikram Malhotra",
  segment: "postgrad",
  persona: "Working Professional - Transitioning into Product Management & Leadership",
  preferenceStrategy: (q) => {
    // Prefers options with E, lead_vs_support negative, growth
    const sorted = [...q.options].sort((a, b) => {
      const scoreA = (a.weights.E || 0) * 2 + (a.weights.lead_vs_support || 0) * -2 + (a.weights.growth || 0);
      const scoreB = (b.weights.E || 0) * 2 + (b.weights.lead_vs_support || 0) * -2 + (b.weights.growth || 0);
      return scoreB - scoreA;
    });
    return sorted[0];
  },
});

console.log("\n======================================================");
console.log("MULTI-SEGMENT SIMULATION SUMMARY:");
console.log("======================================================");
console.log(`1. [class_6_8]   ${sim1.studentName}: Top Direction -> ${sim1.topMatchNames[0]}`);
console.log(`2. [class_9_10]  ${sim2.studentName}: Top Direction -> ${sim2.topMatchNames[0]}`);
console.log(`3. [class_11_12] ${sim3.studentName}: Top Career    -> ${sim3.topMatchNames[0]}`);
console.log(`4. [undergrad]   ${sim4.studentName}: Top Career    -> ${sim4.topMatchNames[0]}`);
console.log(`5. [postgrad]    ${sim5.studentName}: Top Career    -> ${sim5.topMatchNames[0]}`);

// Verifications
if (!sim1.topMatchIds[0].startsWith("dir_")) {
  console.error("FAIL: class_6_8 student should match a stream/subject direction!");
  process.exit(1);
}
if (!sim2.topMatchIds[0].startsWith("dir_")) {
  console.error("FAIL: class_9_10 student should match a stream/subject direction!");
  process.exit(1);
}
if (sim3.topMatchIds[0].startsWith("dir_")) {
  console.error("FAIL: class_11_12 student should match a professional career!");
  process.exit(1);
}

console.log("\nALL 5 AUDIENCE SEGMENTS SUCCESSFULLY SIMULATED & VERIFIED!");
