import { describe, it, expect } from "vitest";
import questionsData from "../src/data/questions.json";
import careersData from "../src/data/careers.json";
import { createProfile, applyAnswer, normalizedProfile } from "../src/lib/profile.js";
import {
  getCandidates,
  fallbackPick,
  shouldStop,
  getSectionCounts,
  getCurrentSection,
  getSectionProgress,
} from "../src/lib/selector.js";
import { matchCareers } from "../src/lib/matching.js";
import { generateDeterministicReport, generateDeterministicSectionSummary } from "../src/lib/gemini.js";
import { SECTION_BUDGETS, TOTAL_QUESTION_BUDGET, SEGMENT_KEYS } from "../src/lib/types.js";
import {
  DEMO_PROFILE,
  DEMO_REPORT,
  DEMO_MATCHES,
  DEMO_REPORT_DATA,
  DEMO_DASHBOARD_ASSESSMENTS,
} from "../src/lib/demoData.js";
import { createUser, getUserByEmail, createSession, getUserBySession } from "../src/lib/db.js";
import { hashPassword, verifyPassword } from "../src/lib/auth.js";

const questions = questionsData;
const careers = careersData;
const questionMap = new Map(questions.map((q) => [q.id, q]));

describe("Fix E: Full End-to-End Regression Test Suite", () => {
  // =========================================================================
  // 1. SIGNUP & SIGNIN REGRESSION
  // =========================================================================
  describe("1. Auth Regression: Signup, Password Hash, Session & Signin", () => {
    const testEmail = `regression_${Date.now()}@test.ac.in`;
    const testPassword = "SecurePassword123!";
    const testName = "Aditi Deshmukh";

    it("creates a new user with hashed password and initial profile", () => {
      const user = createUser({
        email: testEmail,
        password: testPassword,
        profile: {
          name: testName,
          segment: "undergrad",
          stream: "Computer Engineering",
        },
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.profile.name).toBe(testName);
      expect(user.passwordHash).not.toBe(testPassword);
    });

    it("verifies user password and creates valid session token", () => {
      const user = getUserByEmail(testEmail);
      expect(user).toBeDefined();

      const isValid = verifyPassword(testPassword, user.passwordHash, user.salt);
      expect(isValid).toBe(true);

      const isInvalid = verifyPassword("WrongPassword!", user.passwordHash, user.salt);
      expect(isInvalid).toBe(false);

      const token = createSession(user.id);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const sessionUser = getUserBySession(token);
      expect(sessionUser).toBeDefined();
      expect(sessionUser.id).toBe(user.id);
      expect(sessionUser.email).toBe(testEmail);
    });
  });

  // =========================================================================
  // 2. 5 AUDIENCE SEGMENTS ONBOARDING REGRESSION
  // =========================================================================
  describe("2. Onboarding Regression: All 5 Educational Segments", () => {
    const testSegments = [
      {
        segment: "class_6_8",
        name: "Aarav Middle",
        age: 12,
        isMinor: true,
        parentalConsent: true,
        streamOrCourse: "",
      },
      {
        segment: "class_9_10",
        name: "Diya Secondary",
        age: 15,
        isMinor: true,
        parentalConsent: true,
        streamOrCourse: "",
      },
      {
        segment: "class_11_12",
        name: "Karan Senior",
        age: 17,
        isMinor: true,
        parentalConsent: true,
        streamOrCourse: "Science (PCM)",
      },
      {
        segment: "undergrad",
        name: "Sneha College",
        age: 20,
        isMinor: false,
        parentalConsent: true,
        streamOrCourse: "B.Tech Computer Science",
      },
      {
        segment: "postgrad",
        name: "Rahul Pro",
        age: 26,
        isMinor: false,
        parentalConsent: true,
        streamOrCourse: "MBA / Product Strategy",
      },
    ];

    testSegments.forEach((tc) => {
      it(`initializes profile cleanly for segment '${tc.segment}'`, () => {
        expect(SEGMENT_KEYS).toContain(tc.segment);

        const profile = createProfile(tc.segment, {
          name: tc.name,
          age: tc.age,
          streamOrCourse: tc.streamOrCourse,
          parentalConsent: tc.parentalConsent,
        });

        expect(profile.segment).toBe(tc.segment);
        expect(profile.name).toBe(tc.name);
        expect(profile.age).toBe(tc.age);
        expect(profile.answeredIds).toEqual([]);
        expect(profile.history).toEqual([]);
        expect(profile.evidenceCounts).toBeDefined();

        // Check minor flags
        if (tc.isMinor) {
          expect(profile.parentalConsent).toBe(true);
        }
      });
    });
  });

  // =========================================================================
  // 3. FULL 20-QUESTION INTERVIEW CYCLE FOR ALL 5 SEGMENTS
  // =========================================================================
  describe("3. Assessment Cycle Regression: 5 Sections & 20-Question Budget", () => {
    const segments = ["class_6_8", "class_9_10", "class_11_12", "undergrad", "postgrad"];

    segments.forEach((seg) => {
      it(`completes entire 20-question adaptive assessment for '${seg}'`, () => {
        let profile = createProfile(seg);
        const expectedOrder = ["about_you", "likes_dislikes", "work_style", "best_at", "values"];
        const sectionTransitionSummaries = [];

        let step = 0;
        while (!shouldStop(profile, questions) && step < 25) {
          step++;
          const curSec = getCurrentSection(profile, questions);
          const progress = getSectionProgress(profile, questions);

          expect(expectedOrder).toContain(curSec);

          const candidates = getCandidates(profile, questions, 8);
          expect(candidates.length).toBeGreaterThan(0);

          // All candidates must belong to the active section and match the segment
          candidates.forEach((cand) => {
            expect(cand.question.section).toBe(curSec);
            expect(
              cand.question.segment.includes(seg) || cand.question.segment.includes("shared")
            ).toBe(true);
          });

          // Pick candidate and choose an option
          const chosen = candidates[0];
          const chosenOption = chosen.question.options[0];
          expect(chosenOption).toBeDefined();

          profile = applyAnswer(
            profile,
            chosen.question,
            chosenOption.id,
            chosen.probeType,
            "Regression test answer"
          );

          // Check if section just completed
          const newCounts = getSectionCounts(profile, questions);
          const budget = SECTION_BUDGETS[curSec];
          if (newCounts[curSec] === budget) {
            const summary = generateDeterministicSectionSummary(profile, curSec);
            expect(summary).toContain("Here's what we noticed so far:");
            sectionTransitionSummaries.push({ section: curSec, summary });
          }
        }

        // Must answer exactly 20 questions
        expect(profile.answeredIds.length).toBe(TOTAL_QUESTION_BUDGET);
        expect(shouldStop(profile, questions)).toBe(true);

        // Verify section counts match budgets exactly
        const finalCounts = getSectionCounts(profile, questions);
        expect(finalCounts.about_you).toBe(3);
        expect(finalCounts.likes_dislikes).toBe(5);
        expect(finalCounts.work_style).toBe(4);
        expect(finalCounts.best_at).toBe(5);
        expect(finalCounts.values).toBe(3);

        // Verify all 5 section summaries were generated
        expect(sectionTransitionSummaries.length).toBe(5);
      });
    });
  });

  // =========================================================================
  // 4. REPORT GENERATION & CAREER MATCHING REGRESSION
  // =========================================================================
  describe("4. Report Generation Regression: Directional vs Career Outputs", () => {
    it("matches subject and stream directions for Class 6-8 and 9-10", () => {
      // Middle school profile with Realistic and Investigative answers
      const p68 = createProfile("class_6_8");
      p68.interests.R = 8;
      p68.interests.I = 9;
      p68.evidenceCounts.R = 4;
      p68.evidenceCounts.I = 5;

      const matches68 = matchCareers(p68, careers);
      expect(matches68.length).toBeGreaterThanOrEqual(4);

      // Top match for class 6-8 should be a Direction
      const top68 = matches68[0].career;
      expect(top68.isDirection).toBe(true);
      expect(top68.name).toContain("Direction");
    });

    it("matches specific career occupations for Undergrad and Postgrad", () => {
      const pUg = createProfile("undergrad");
      pUg.interests.I = 9;
      pUg.interests.E = 8;
      pUg.evidenceCounts.I = 5;
      pUg.evidenceCounts.E = 4;

      const matchesUg = matchCareers(pUg, careers);
      expect(matchesUg.length).toBe(6);

      // Top matches for undergrad should be actual career jobs
      const topUg = matchesUg[0].career;
      expect(topUg.isDirection).toBe(false);
      expect(topUg.requiredDegrees.length).toBeGreaterThan(0);
      expect(topUg.entryPathways.length).toBeGreaterThan(0);

      // Generates complete report with all required sections
      const report = generateDeterministicReport(pUg, matchesUg);
      expect(report.summary).toBeDefined();
      expect(report.strengths.length).toBeGreaterThan(0);
      expect(report.workStyle).toBeDefined();
      expect(report.values).toBeDefined();
      expect(report.careerExplanations.length).toBe(matchesUg.length);
      expect(report.nextSteps.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 5. RESUME UNFINISHED ASSESSMENT REGRESSION
  // =========================================================================
  describe("5. Persistence Regression: Resume Unfinished Assessment", () => {
    it("simulates pausing at question 7, reloading state, and completing to 20/20", () => {
      let profile = createProfile("class_11_12");

      // Answer first 7 questions (3 from about_you, 4 from likes_dislikes)
      for (let i = 0; i < 7; i++) {
        const candidates = getCandidates(profile, questions, 8);
        const q = candidates[0].question;
        profile = applyAnswer(profile, q, q.options[0].id, "deep", "Answer before pause");
      }

      expect(profile.answeredIds.length).toBe(7);
      expect(shouldStop(profile, questions)).toBe(false);

      // Serialize state as stored in Supabase / localStorage
      const serializedRow = {
        id: "assessment_pause_test",
        segment: profile.segment,
        answers: profile.history,
        profile: JSON.parse(JSON.stringify(profile)),
        status: "in_progress",
      };

      // Simulate resume: unpack row
      let resumedProfile = serializedRow.profile;
      expect(resumedProfile.answeredIds.length).toBe(7);
      expect(resumedProfile.segment).toBe("class_11_12");

      // Verify current section is still likes_dislikes (needs 1 more to reach 5)
      const currentSec = getCurrentSection(resumedProfile, questions);
      expect(currentSec).toBe("likes_dislikes");

      const counts = getSectionCounts(resumedProfile, questions);
      expect(counts.about_you).toBe(3);
      expect(counts.likes_dislikes).toBe(4);

      // Answer remaining 13 questions to complete assessment
      while (!shouldStop(resumedProfile, questions)) {
        const candidates = getCandidates(resumedProfile, questions, 8);
        const q = candidates[0].question;
        resumedProfile = applyAnswer(resumedProfile, q, q.options[0].id, "adaptive", "Resume answer");
      }

      expect(resumedProfile.answeredIds.length).toBe(20);
      expect(shouldStop(resumedProfile, questions)).toBe(true);

      // Mark completed in database
      const completedMatches = matchCareers(resumedProfile, careers);
      const completedReport = generateDeterministicReport(resumedProfile, completedMatches);

      const completedRow = {
        ...serializedRow,
        status: "completed",
        report: { report: completedReport, matches: completedMatches },
        completed_at: new Date().toISOString(),
      };

      expect(completedRow.status).toBe("completed");
      expect(completedRow.report.report.summary).toBeDefined();
      expect(completedRow.report.matches.length).toBe(6);
    });
  });

  // =========================================================================
  // 6. HIDDEN ?demo=1 PITCH MODE REGRESSION
  // =========================================================================
  describe("6. Pitch Demo Mode (?demo=1) Regression", () => {
    it("provides valid pre-filled demo profile and report data matching schemas", () => {
      expect(DEMO_PROFILE).toBeDefined();
      expect(DEMO_PROFILE.name).toBe("Aarav Sharma");
      expect(DEMO_PROFILE.segment).toBe("undergrad");
      expect(DEMO_PROFILE.answeredIds.length).toBe(20);
      expect(DEMO_PROFILE.history.length).toBe(20);

      // Holland scores
      expect(DEMO_PROFILE.interests.I).toBeGreaterThanOrEqual(9.0);
      expect(DEMO_PROFILE.interests.E).toBeGreaterThan(7.0);

      // Report
      expect(DEMO_REPORT).toBeDefined();
      expect(DEMO_REPORT.summary).toBeDefined();
      expect(DEMO_REPORT.strengths.length).toBeGreaterThanOrEqual(3);
      expect(DEMO_REPORT.careerExplanations.length).toBeGreaterThanOrEqual(4);
      expect(DEMO_REPORT.nextSteps.length).toBeGreaterThanOrEqual(3);

      // Matches
      expect(DEMO_MATCHES).toBeDefined();
      expect(DEMO_MATCHES.length).toBeGreaterThanOrEqual(4);
      expect(DEMO_MATCHES[0].fitIndex).toBe(94);
      expect(DEMO_MATCHES[0].career.name).toBe("Data Scientist / AI Engineer");

      // Full report payload
      expect(DEMO_REPORT_DATA.report).toBe(DEMO_REPORT);
      expect(DEMO_REPORT_DATA.matches).toBe(DEMO_MATCHES);
      expect(DEMO_REPORT_DATA.path).toBe("llm");
    });

    it("provides valid demo dashboard state with completed & in-progress cards", () => {
      expect(DEMO_DASHBOARD_ASSESSMENTS.length).toBe(2);

      const completed = DEMO_DASHBOARD_ASSESSMENTS.find((a) => a.status === "completed");
      expect(completed).toBeDefined();
      expect(completed.segment).toBe("undergrad");
      expect(completed.report).toBeDefined();

      const inProgress = DEMO_DASHBOARD_ASSESSMENTS.find((a) => a.status === "in_progress");
      expect(inProgress).toBeDefined();
      expect(inProgress.answers.length).toBe(14);
      expect(inProgress.segment).toBe("class_11_12");
    });
  });
});
