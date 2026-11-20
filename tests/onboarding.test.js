import { describe, it, expect } from "vitest";
import { UserProfileSchema, ProfileSchema } from "../src/lib/types.js";
import { createProfile, applyAnswer } from "../src/lib/profile.js";
import questionsData from "../src/data/questions.json";

describe("Fix C: Onboarding & Segment Profile Alignment", () => {
  it("ProfileSchema accepts name, streamOrCourse, age, and parentalConsent", () => {
    const raw = {
      segment: "class_11_12",
      name: "Rohan Sharma",
      age: 16,
      streamOrCourse: "Science (PCM)",
      parentalConsent: true,
      interests: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
      workstyle: {},
      values: {},
      evidenceCounts: {},
      answeredIds: [],
      history: [],
    };

    const parsed = ProfileSchema.parse(raw);
    expect(parsed.segment).toBe("class_11_12");
    expect(parsed.name).toBe("Rohan Sharma");
    expect(parsed.age).toBe(16);
    expect(parsed.streamOrCourse).toBe("Science (PCM)");
    expect(parsed.parentalConsent).toBe(true);
  });

  it("UserProfileSchema validates and tolerantly coerces onboarding fields", () => {
    const raw = {
      name: "  Priya Patel  ",
      age: "15",
      segment: "class_9_10",
      streamOrCourse: "Commerce",
      parentalConsent: true,
    };

    const parsed = UserProfileSchema.parse(raw);
    expect(parsed.name).toBe("Priya Patel");
    expect(parsed.age).toBe(15);
    expect(parsed.segment).toBe("class_9_10");
    expect(parsed.streamOrCourse).toBe("Commerce");
    expect(parsed.parentalConsent).toBe(true);
  });

  it("createProfile initializes profile with segment and metadata", () => {
    const profile = createProfile("class_6_8", {
      name: "Aarav Gupta",
      age: 12,
      parentalConsent: true,
    });

    expect(profile.segment).toBe("class_6_8");
    expect(profile.name).toBe("Aarav Gupta");
    expect(profile.age).toBe(12);
    expect(profile.parentalConsent).toBe(true);
    expect(profile.answeredIds).toEqual([]);
  });

  it("applyAnswer preserves onboarding metadata across question cycles", () => {
    let profile = createProfile("undergrad", {
      name: "Sneha Kulkarni",
      age: 20,
      streamOrCourse: "B.Tech Computer Science",
      parentalConsent: true,
    });

    const question = questionsData[0];
    profile = applyAnswer(profile, question, question.options[0].id);

    expect(profile.name).toBe("Sneha Kulkarni");
    expect(profile.age).toBe(20);
    expect(profile.streamOrCourse).toBe("B.Tech Computer Science");
    expect(profile.segment).toBe("undergrad");
    expect(profile.answeredIds).toContain(question.id);
  });

  it("flags under-18 users for mandatory parental consent", () => {
    // Under 18 by age
    const isUnder18ByAge = (age, segment) =>
      (age && Number(age) < 18) || segment === "class_6_8" || segment === "class_9_10";

    expect(isUnder18ByAge(14, "class_9_10")).toBe(true);
    expect(isUnder18ByAge(17, "class_11_12")).toBe(true);
    expect(isUnder18ByAge(null, "class_6_8")).toBe(true);
    expect(isUnder18ByAge(null, "class_9_10")).toBe(true);

    // Over 18
    expect(isUnder18ByAge(19, "undergrad")).toBe(false);
    expect(isUnder18ByAge(24, "postgrad")).toBe(false);
  });
});
