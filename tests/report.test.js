import { describe, it, expect } from "vitest";
import { POST } from "../src/app/api/report/route.js";
import { createProfile, applyAnswer } from "../src/lib/profile.js";
import questionsData from "../src/data/questions.json";
import { ReportSchema } from "../src/lib/types.js";

describe("/api/report Route (Step 7)", () => {
  it("generates deterministic top 6 matches and report even without Gemini API key", async () => {
    let profile = createProfile();
    // Simulate 16 answers
    for (let i = 0; i < 16; i++) {
      const q = questionsData[i];
      profile = applyAnswer(profile, q, q.options[0].id);
    }

    const req = new Request("http://localhost:3000/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.matches).toBeDefined();
    expect(json.matches.length).toBe(6);
    expect(json.report).toBeDefined();
    expect(json.path).toBe("deterministic");

    // Validate report matches ReportSchema
    const validated = ReportSchema.safeParse(json.report);
    expect(validated.success).toBe(true);

    // Verify all 6 careers have explanations
    expect(json.report.careerExplanations.length).toBe(6);
    expect(json.report.unsureAbout.length).toBeGreaterThanOrEqual(1);
    expect(json.report.nextSteps.length).toBeGreaterThanOrEqual(3);

    // Verify each match contains fitIndex and evidence
    json.matches.forEach((m) => {
      expect(m.fitIndex).toBeGreaterThan(0);
      expect(m.fitIndex).toBeLessThanOrEqual(100);
      expect(m.evidence.topContributors.length).toBeGreaterThanOrEqual(1);
    });
  });
});
