import { NextResponse } from "next/server";
import careersData from "@/data/careers.json";
import { matchCareers } from "@/lib/matching.js";
import { createProfile } from "@/lib/profile.js";
import { generateReportWithGemini, generateDeterministicReport } from "@/lib/gemini.js";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit.js";

const careers = careersData;

export async function POST(req) {
  try {
    // 1. In-memory per-IP rate limiting (20 report generations / min)
    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 20, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many report requests. Please slow down." },
        { status: 429 }
      );
    }

    // 2. Max body size check (max 100KB)
    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > 100 * 1024) {
      return NextResponse.json(
        { error: "Payload too large. Maximum body size is 100KB." },
        { status: 413 }
      );
    }

    const body = await req.json().catch(() => ({}));
    let { profile } = body;

    if (!profile) {
      profile = createProfile();
    }

    // 3. Deterministic matching engine (returns top 6)
    const matches = matchCareers(profile, careers);

    // 4. Call Gemini once for analytical report
    let report = await generateReportWithGemini(profile, matches);
    let path = "llm";

    // 5. Fallback to deterministic template report if Gemini fails or key is missing
    if (!report) {
      report = generateDeterministicReport(profile, matches);
      path = "deterministic";
    }

    // Sanitized logging (no sensitive credentials or student data)
    console.log(`[ReportRoute] Generated report via path: ${path}`);

    return NextResponse.json({
      report,
      matches,
      profile,
      path,
    });
  } catch (error) {
    console.error("[ReportRoute] Error generating report:", error?.message || "Internal error");

    // Bulletproof fallback: guaranteed render
    const safeProfile = createProfile();
    const safeMatches = matchCareers(safeProfile, careers);
    const safeReport = generateDeterministicReport(safeProfile, safeMatches);

    return NextResponse.json({
      report: safeReport,
      matches: safeMatches,
      profile: safeProfile,
      path: "deterministic",
    });
  }
}
