import { describe, it, expect, vi } from "vitest";
import { GET } from "../src/app/api/ai-status/route.js";

describe("/api/ai-status Route", () => {
  it("returns keyPresent: false and never returns the key when GEMINI_API_KEY is missing", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    const originalGoogleKey = process.env.GOOGLE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.keyPresent).toBe(false);
    expect(json.model).toBeDefined();
    expect(json.parsedOk).toBe(false);
    expect(json.rawError).toContain("GEMINI_API_KEY");
    // Explicitly verify key is never returned
    expect(json.apiKey).toBeUndefined();
    expect(json.key).toBeUndefined();

    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    if (originalGoogleKey) process.env.GOOGLE_API_KEY = originalGoogleKey;
  });

  it("handles mock Gemini call and validates response structure", async () => {
    process.env.GEMINI_API_KEY = "test_gemini_key_abc_123";
    process.env.GEMINI_MODEL = "gemini-1.5-flash";

    // Mock fetch for Google Gemini generateContent
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: '{"ok": true}' }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET();
    const json = await res.json();

    expect(json.keyPresent).toBe(true);
    expect(json.model).toBe("gemini-1.5-flash");
    expect(json.httpStatus).toBe(200);
    expect(json.parsedOk).toBe(true);
    expect(json.rawError).toBeNull();
    // Security check: Never return the key itself
    expect(JSON.stringify(json)).not.toContain("test_gemini_key_abc_123");

    vi.unstubAllGlobals();
    delete process.env.GEMINI_API_KEY;
  });
});
