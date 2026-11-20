import { NextResponse } from "next/server";

export async function GET() {
  return handleAiStatus();
}

export async function POST() {
  return handleAiStatus();
}

async function handleAiStatus() {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const keyPresent = Boolean(
    apiKey &&
      apiKey.trim().length > 0 &&
      apiKey !== "your_gemini_api_key_here" &&
      apiKey !== "your_grok_api_key_here"
  );

  if (!keyPresent) {
    return NextResponse.json({
      keyPresent: false,
      model,
      httpStatus: null,
      latencyMs: 0,
      rawError: "GEMINI_API_KEY environment variable is not configured or is empty",
      parsedOk: false,
    });
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey.trim(),
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: 'reply with the JSON {"ok":true}' }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const rawError = await res.text();
      console.error(`[AI-Status] Gemini API responded with HTTP ${res.status}: ${rawError}`);
      return NextResponse.json({
        keyPresent: true,
        model,
        httpStatus: res.status,
        latencyMs,
        rawError,
        parsedOk: false,
      });
    }

    const data = await res.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean markdown code blocks and locate first { and last }
    let cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    let parsed = null;
    let parsedOk = false;
    try {
      parsed = JSON.parse(cleaned);
      parsedOk = parsed?.ok === true;
    } catch (parseErr) {
      console.error(`[AI-Status] JSON parse error on response: ${parseErr.message}. Content: ${rawContent}`);
    }

    return NextResponse.json({
      keyPresent: true,
      model,
      httpStatus: res.status,
      latencyMs,
      rawError: parsedOk ? null : `Response did not contain {ok: true}: ${rawContent}`,
      parsedOk,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const isTimeout = err.name === "AbortError";
    const rawError = isTimeout
      ? "Gemini request timed out after 15,000ms"
      : `Network error: ${err.message}`;

    console.error(`[AI-Status] Error calling Gemini: ${rawError}`);

    return NextResponse.json({
      keyPresent: true,
      model,
      httpStatus: null,
      latencyMs,
      rawError,
      parsedOk: false,
    });
  }
}
