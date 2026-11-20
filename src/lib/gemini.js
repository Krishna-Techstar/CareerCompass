import { normalizedProfile, confidence } from "./profile.js";
import { GeminiSelectionSchema, ReportSchema, SECTION_TITLES } from "./types.js";
import { getTopInterests } from "./selector.js";

/**
 * Deterministic section wrap-up summary fallback.
 */
export function generateDeterministicSectionSummary(profile, completedSection) {
  const norm = normalizedProfile(profile);
  const topInterest = getTopInterests(profile, 1)[0] || "I";
  const interestNames = {
    R: "hands-on physical & technological systems",
    I: "deep analytical inquiry & scientific curiosity",
    A: "creative design, aesthetics & storytelling",
    S: "mentorship, human empathy & helping others",
    E: "leadership, strategic entrepreneurship & business",
    C: "structured systems, accuracy & organization",
  };

  switch (completedSection) {
    case "about_you":
      return `Here's what we noticed so far: You bring clear curiosity toward ${interestNames[topInterest]}, with an open perspective on future opportunities.`;
    case "likes_dislikes":
      return `Here's what we noticed so far: Your authentic excitement centers on ${interestNames[topInterest]}, with a healthy aversion to uninspiring tasks.`;
    case "work_style": {
      const isSolo = (norm.workstyle.independent_vs_team || 0) < 0;
      const isStructured = (norm.workstyle.structured_vs_flexible || 0) < 0;
      const teamStyle = isSolo ? "deep solitary focus" : "collaborative teamwork";
      const processStyle = isStructured ? "clear structured roadmaps" : "agile, adaptable exploration";
      return `Here's what we noticed so far: You work best with ${teamStyle} paired with ${processStyle}.`;
    }
    case "best_at":
      return `Here's what we noticed so far: Your natural strengths demonstrate strong cognitive reasoning and reliable problem-solving.`;
    case "values": {
      const topVal = Object.entries(norm.values).sort((a, b) => b[1] - a[1])[0]?.[0] || "learning";
      return `Here's what we noticed so far: You place highest importance on ${topVal} and authentic purpose as your core career anchor.`;
    }
    default:
      return `Here's what we noticed so far: Your profile shows a distinctive orientation toward ${interestNames[topInterest]}.`;
  }
}

/**
 * Strips markdown code fences (```json ... ```) and extracts
 * the substring bounded by the first '{' and last '}' characters.
 */
export function extractJsonString(text) {
  if (!text || typeof text !== "string") return "";
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/**
 * Helper to get the configured Gemini API key.
 */
export function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || key.trim().length === 0 || key === "your_gemini_api_key_here") {
    return null;
  }
  return key.trim();
}

/**
 * Helper to get the configured Gemini model name.
 */
export function getGeminiModel() {
  return process.env.GEMINI_MODEL || "gemini-3.8-flash";
}

/**
 * Generates an analytical one-line section wrap-up summary using Google Gemini,
 * with deterministic fallback.
 */
export async function generateSectionSummaryWithGemini(profile, completedSection) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return generateDeterministicSectionSummary(profile, completedSection);
  }

  const model = getGeminiModel();
  const norm = normalizedProfile(profile);

  const systemInstruction = `You are an encouraging career discovery mentor for Indian students. Return ONLY JSON {"summary": string}. The summary must start with "Here's what we noticed so far: " and be under 25 words, highlighting one concrete observation about their interests, workstyle, strengths, or values in the completed section '${completedSection}'.`;

  const userPrompt = JSON.stringify({
    completedSection,
    sectionTitle: SECTION_TITLES[completedSection] || completedSection,
    interests: norm.interests,
    workstyle: norm.workstyle,
    values: norm.values,
    segment: profile.segment || "undergrad",
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      return generateDeterministicSectionSummary(profile, completedSection);
    }

    const data = await res.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = extractJsonString(rawContent);
    const parsed = JSON.parse(cleaned);

    if (parsed && typeof parsed.summary === "string" && parsed.summary.trim().length > 0) {
      return parsed.summary.trim();
    }
  } catch (err) {
    // Fallback gracefully
  }

  return generateDeterministicSectionSummary(profile, completedSection);
}

/**
 * Calls Gemini API to select the next adaptive question with:
 * - 15-second timeout
 * - JSON output mode (responseMimeType: "application/json")
 * - Markdown fence stripping & { } slicing
 * - Full HTTP error code and body logging
 * - 1 retry before deterministic fallback
 */
export async function selectNextQuestionWithGemini(profile, candidates) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("[Gemini] No valid GEMINI_API_KEY found in environment. Using fallback pick.");
    return null;
  }

  const model = getGeminiModel();
  const norm = normalizedProfile(profile);

  const profileSummary = {
    interests: norm.interests,
    workstyle: norm.workstyle,
    values: norm.values,
  };

  const last4History = (profile.history || []).slice(-4).map((h) => ({
    questionId: h.questionId,
    optionId: h.optionId,
    probeType: h.probeType,
    reason: h.reason,
  }));

  const compactCandidates = candidates.map((c) => ({
    id: c.question.id,
    text: c.question.text,
    probeType: c.probeType,
    tags: c.question.tags,
  }));

  const candidateIds = new Set(candidates.map((c) => c.question.id));

  const systemInstruction = `Choose exactly one candidate id, prefer variety, do not reinforce only the first interest, return ONLY JSON {"questionId": string, "probeType": "deep"|"cross"|"challenge", "reason": string (max 20 words, addressed to the student, e.g. "You liked building things, so let me test whether you also enjoy the business side."), "emergingInterest": string}.`;

  const userPrompt = JSON.stringify({
    profile: profileSummary,
    lastHistory: last4History,
    candidates: compactCandidates,
  });

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout for detailed narrative

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(
          `[Gemini] Attempt ${attempt}/${maxAttempts} failed with HTTP ${res.status} (${res.statusText}): ${errorBody}`
        );
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        return null;
      }

      const data = await res.json();
      const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawContent) {
        console.error(
          `[Gemini] Attempt ${attempt}/${maxAttempts}: Empty message content received from Gemini.`
        );
        if (attempt < maxAttempts) continue;
        return null;
      }

      const cleaned = extractJsonString(rawContent);

      let parsedJson = null;
      try {
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error(
          `[Gemini] Attempt ${attempt}/${maxAttempts}: JSON.parse error: ${parseErr.message}. Cleaned: "${cleaned}" | Raw: "${rawContent}"`
        );
        if (attempt < maxAttempts) continue;
        return null;
      }

      let validated = null;
      try {
        validated = GeminiSelectionSchema.parse(parsedJson);
      } catch (zodErr) {
        console.error(
          `[Gemini] Attempt ${attempt}/${maxAttempts}: Zod validation error: ${JSON.stringify(
            zodErr.errors || zodErr.message
          )}. Payload: "${cleaned}"`
        );
        if (attempt < maxAttempts) continue;
        return null;
      }

      if (!candidateIds.has(validated.questionId)) {
        console.error(
          `[Gemini] Attempt ${attempt}/${maxAttempts}: Selected questionId "${validated.questionId}" not found in candidate pool [${Array.from(
            candidateIds
          ).join(", ")}]`
        );
        if (attempt < maxAttempts) continue;
        return null;
      }

      console.log(`[Gemini] Successfully selected question: ${validated.questionId} on attempt ${attempt}`);
      return validated;
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      console.error(
        `[Gemini] Attempt ${attempt}/${maxAttempts} error: ${
          isTimeout ? "Timed out after 15,000ms" : err.message
        }`
      );
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      return null;
    }
  }

  console.warn("[Gemini] All retry attempts failed for next question. Falling back to deterministic pick.");
  return null;
}

/**
 * Calls Gemini to generate the final analytical report narrative with:
 * - 15-second timeout
 * - JSON output mode (responseMimeType: "application/json")
 * - Markdown fence stripping & { } slicing
 * - Full HTTP error code and body logging
 * - 1 retry before deterministic fallback
 */
export async function generateReportWithGemini(profile, matches) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("[Gemini] No valid GEMINI_API_KEY found in environment. Generating deterministic report.");
    return null;
  }

  const model = getGeminiModel();
  const norm = normalizedProfile(profile);

  const profileSummary = {
    interests: norm.interests,
    workstyle: norm.workstyle,
    values: norm.values,
  };

  const compactMatches = matches.map((m) => ({
    careerId: m.career.id,
    name: m.career.name,
    industry: m.career.industry,
    fitIndex: m.fitIndex,
    topContributors: m.evidence.topContributors,
    mismatches: m.evidence.mismatches,
  }));

  const systemInstruction = `You are an empathetic, insightful career counselor writing an exploratory discovery report for an Indian student.
Strict rules:
1. Do NOT invent scores or reference percentages/probabilities.
2. Never say one career is the only right one; use cautious, exploratory language.
3. Explicitly reinforce that these results are exploratory directions for reflection and field testing.
4. Output ONLY valid JSON matching this exact structure:
{
  "summary": "string (holistic 2-3 sentence profile synthesis)",
  "strengths": ["string", "string", "string"],
  "workStyle": "string (synthesis of team vs independent and structure preferences)",
  "values": "string (synthesis of career priorities like growth, stability, impact)",
  "careerExplanations": [
    {
      "careerId": "string",
      "why": "string (why this pathway aligns with their profile)",
      "watchOut": "string (honest trade-off or challenge to prepare for)"
    }
  ],
  "unsureAbout": ["string", "string"],
  "nextSteps": ["string", "string", "string"]
}`;

  const userPrompt = JSON.stringify({
    profile: profileSummary,
    topMatches: compactMatches,
  });

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout for detailed narrative

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(
          `[Gemini] Report attempt ${attempt}/${maxAttempts} failed with HTTP ${res.status} (${res.statusText}): ${errorBody}`
        );
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        return null;
      }

      const data = await res.json();
      const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawContent) {
        console.error(`[Gemini] Report attempt ${attempt}/${maxAttempts}: Empty message content received.`);
        if (attempt < maxAttempts) continue;
        return null;
      }

      const cleaned = extractJsonString(rawContent);

      let parsedJson = null;
      try {
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error(
          `[Gemini] Report attempt ${attempt}/${maxAttempts}: JSON.parse error: ${parseErr.message}. Cleaned: "${cleaned}"`
        );
        if (attempt < maxAttempts) continue;
        return null;
      }

      let validated = null;
      try {
        validated = ReportSchema.parse(parsedJson);
      } catch (zodErr) {
        console.error(
          `[Gemini] Report attempt ${attempt}/${maxAttempts}: Zod validation error: ${JSON.stringify(
            zodErr.errors || zodErr.message
          )}. Payload: "${cleaned}"`
        );
        if (attempt < maxAttempts) continue;
        return null;
      }

      console.log(`[Gemini] Successfully generated report narrative on attempt ${attempt}`);
      return validated;
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      console.error(
        `[Gemini] Report attempt ${attempt}/${maxAttempts} error: ${
          isTimeout ? "Timed out after 15,000ms" : err.message
        }`
      );
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      return null;
    }
  }

  console.warn("[Gemini] All retry attempts failed for report. Falling back to deterministic report.");
  return null;
}

/**
 * Builds a deterministic template report from match evidence so the page always renders cleanly.
 */
export function generateDeterministicReport(profile, matches) {
  const norm = normalizedProfile(profile);
  const conf = confidence(profile);

  // Find top 2 interests
  const sortedInterests = Object.entries(norm.interests).sort((a, b) => b[1] - a[1]);
  const top1Interest = sortedInterests[0] ? sortedInterests[0][0] : "I";
  const top2Interest = sortedInterests[1] ? sortedInterests[1][0] : "E";

  const RIASEC_NAMES = {
    R: "Realistic / Technical Systems",
    I: "Investigative / Analytical Inquiry",
    A: "Artistic / Creative Design",
    S: "Social / Mentoring & Empathy",
    E: "Enterprising / Leadership & Venture",
    C: "Conventional / Precision & Operations",
  };

  const top1Name = RIASEC_NAMES[top1Interest] || "Investigative";
  const top2Name = RIASEC_NAMES[top2Interest] || "Enterprising";

  // Top values
  const sortedValues = Object.entries(norm.values).sort((a, b) => b[1] - a[1]);
  const topValueNames = sortedValues
    .slice(0, 2)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));

  // Build summary
  const summary = `Your exploratory assessment highlights a strong dual alignment with ${top1Name} and ${top2Name}. Your responses indicate an orientation toward ${
    norm.workstyle.independent_vs_team <= -0.2
      ? "autonomous deep focus"
      : "cross-functional collaboration"
  }, energized predominantly by ${topValueNames.join(" and ")}. These directions represent exploratory paths for deeper real-world testing.`;

  // Strengths
  const strengths = [
    `Strong aptitude for ${top1Name} problems and methodologies.`,
    `A balanced orientation toward ${top2Name} challenges.`,
    `Motivation anchored in long-term ${topValueNames[0] || "Growth"} and purposeful contribution.`,
    `Workstyle adapted to ${
      norm.workstyle.structured_vs_flexible <= -0.2
        ? "systematic clarity and milestone precision"
        : "dynamic problem solving and experimental flexibility"
    }.`,
  ];

  // Workstyle summary
  const workStyle = `You gravitate toward ${
    norm.workstyle.independent_vs_team <= -0.2
      ? "individual contributor focus where you can dive deep without continuous distraction"
      : "team environments where bouncing perspectives sparks mutual momentum"
  }, with a preference for ${
    norm.workstyle.structured_vs_flexible <= -0.2
      ? "well-defined operational roadmaps and structured deliverables"
      : "agile environments with room for creative initiative"
  }.`;

  // Values summary
  const values = `Core priorities center around ${topValueNames.join(
    ", "
  )}, indicating that you evaluate career satisfaction not just by compensation, but by daily engagement and personal agency.`;

  // Explanations for all 6 matches
  const careerExplanations = matches.map((m) => {
    const whyText =
      m.evidence.topContributors.length > 0
        ? m.evidence.topContributors.map((c) => c.replace(/^Strong alignment:\s*/, "")).join(" • ")
        : `Strong baseline match across ${m.career.industry}.`;

    const watchOutText =
      m.evidence.mismatches.length > 0
        ? m.evidence.mismatches[0].replace(/^Potential friction:\s*/, "")
        : m.career.challenges?.[0] || "Demands consistent self-discipline and ongoing adaptation.";

    return {
      careerId: m.career.id,
      why: whyText,
      watchOut: watchOutText,
    };
  });

  // What we're still unsure about (lowest confidence dimensions)
  const lowConfidenceDims = Object.entries(conf)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([dim]) => {
      const dimLabels = {
        R: "hands-on physical/hardware engineering tolerance",
        I: "long-term academic or scientific research stamina",
        A: "artistic and aesthetic expressive demands",
        S: "direct patient or client emotional counseling fatigue",
        E: "high-stakes sales or executive commercial pressure",
        C: "routine compliance and audit documentation endurance",
        stability: "trade-off between government PSU stability vs private market upside",
        balance: "lifestyle expectations during intense 70-hour project sprints",
      };
      return dimLabels[dim] || `${dim} long-term orientation`;
    });

  const unsureAbout = [
    `Your exact comfort with ${lowConfidenceDims[0] || "high-stakes corporate ambiguity"}, which requires direct internship exposure to test authentically.`,
    `How you balance ${lowConfidenceDims[1] || "work-life boundaries"} when working on tight project deadlines.`,
  ];

  // Next steps
  const nextSteps = [
    `Informational Interviews: Reach out to 2 alumni or practitioners currently working in your top 2 matched roles (${matches[0]?.career?.name || "Target Career"}).`,
    "Hands-on Micro-Project: Build or contribute to a small 2-3 week portfolio project or case study to evaluate day-to-day satisfaction.",
    `Review Entrance Path: Examine sample papers or syllabus requirements for relevant Indian pathways (${matches[0]?.career?.entranceExams?.slice(0, 2).join(", ") || "Key Exams"}).`,
    "Elective Alignment: Choose 1-2 college electives or online modules exploring the intersection of your top interests.",
  ];

  return {
    summary,
    strengths,
    workStyle,
    values,
    careerExplanations,
    unsureAbout,
    nextSteps,
  };
}

// Backward-compatibility aliases for Grok imports
export const generateSectionSummaryWithGrok = generateSectionSummaryWithGemini;
export const selectNextQuestionWithGrok = selectNextQuestionWithGemini;
export const generateReportWithGrok = generateReportWithGemini;
