import { describe, it, expect, vi } from "vitest";
import { POST } from "../src/app/api/next-question/route.js";
import { createProfile, applyAnswer } from "../src/lib/profile.js";
import { GeminiSelectionSchema, TOTAL_QUESTION_BUDGET } from "../src/lib/types.js";
import questionsData from "../src/data/questions.json";

describe("/api/next-question Route (Fix B - 5 Sections & 5 Segments)", () => {
  it("initializes fresh profile and returns first question in about_you section", async () => {
    const req = new Request("http://localhost:3000/api/next-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segment: "undergrad" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.question).toBeDefined();
    expect(json.question.section).toBe("about_you");
    expect(json.profile).toBeDefined();
    expect(json.profile.segment).toBe("undergrad");
    expect(json.progress.current).toBe(0);
    expect(json.progress.total).toBe(TOTAL_QUESTION_BUDGET);
    expect(json.section.currentSection).toBe("about_you");
    expect(json.section.sectionIndex).toBe(1);
  });

  it("updates profile with lastAnswer and serves next question in section", async () => {
    let profile = createProfile("undergrad");
    const firstQ = questionsData.find(
      (q) => q.section === "about_you" && q.segment.includes("undergrad")
    );

    const req = new Request("http://localhost:3000/api/next-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        lastAnswer: {
          questionId: firstQ.id,
          optionId: firstQ.options[0].id,
          probeType: "deep",
          reason: "User selected option A",
        },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.profile.answeredIds).toContain(firstQ.id);
    expect(json.progress.current).toBe(1);
    expect(json.question.section).toBe("about_you");
  });

  it("generates sectionSummary when a section budget is completed", async () => {
    let profile = createProfile("class_9_10");
    const aboutQs = questionsData.filter(
      (q) => q.section === "about_you" && q.segment.includes("class_9_10")
    );

    // Answer 2 questions in about_you (budget is 3)
    profile = applyAnswer(profile, aboutQs[0], aboutQs[0].options[0].id);
    profile = applyAnswer(profile, aboutQs[1], aboutQs[1].options[0].id);

    // Answer the 3rd question via API
    const req = new Request("http://localhost:3000/api/next-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        lastAnswer: {
          questionId: aboutQs[2].id,
          optionId: aboutQs[2].options[0].id,
        },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    // Section about_you just completed!
    expect(json.sectionSummary).toBeDefined();
    expect(json.sectionSummary.section).toBe("about_you");
    expect(json.sectionSummary.summary).toContain("Here's what we noticed so far:");
    // Next question must now be in likes_dislikes
    expect(json.question.section).toBe("likes_dislikes");
    expect(json.section.currentSection).toBe("likes_dislikes");
    expect(json.section.sectionIndex).toBe(2);
  });

  it("returns done: true when all 5 sections are exhausted (20 answers)", async () => {
    let profile = createProfile("undergrad");
    const eligible = questionsData.filter((q) => q.segment.includes("undergrad"));

    // Answer 3 about_you
    eligible.filter((q) => q.section === "about_you").slice(0, 3).forEach((q) => {
      profile = applyAnswer(profile, q, q.options[0].id);
    });
    // Answer 5 likes_dislikes
    eligible.filter((q) => q.section === "likes_dislikes").slice(0, 5).forEach((q) => {
      profile = applyAnswer(profile, q, q.options[0].id);
    });
    // Answer 4 work_style
    eligible.filter((q) => q.section === "work_style").slice(0, 4).forEach((q) => {
      profile = applyAnswer(profile, q, q.options[0].id);
    });
    // Answer 5 best_at
    eligible.filter((q) => q.section === "best_at").slice(0, 5).forEach((q) => {
      profile = applyAnswer(profile, q, q.options[0].id);
    });
    // Answer 3 values
    eligible.filter((q) => q.section === "values").slice(0, 3).forEach((q) => {
      profile = applyAnswer(profile, q, q.options[0].id);
    });

    expect(profile.answeredIds.length).toBe(TOTAL_QUESTION_BUDGET);

    const req = new Request("http://localhost:3000/api/next-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.done).toBe(true);
    expect(json.progress.current).toBe(20);
  });

  it("GeminiSelectionSchema parses tolerantly with extra fields, whitespace, and coercion", () => {
    const raw = {
      questionId: " ay_ug_01 ",
      probeType: " DEEP ",
      reason: " You showed strong interest in systems. ",
      extraField1: "unrelated",
      extraField2: 12345,
    };
    const parsed = GeminiSelectionSchema.parse(raw);
    expect(parsed.questionId).toBe("ay_ug_01");
    expect(parsed.probeType).toBe("deep");
    expect(parsed.reason).toBe("You showed strong interest in systems.");
    expect(parsed.extraField1).toBe("unrelated");
  });
});
