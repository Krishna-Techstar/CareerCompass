import { NextResponse } from "next/server";
import { getUserByEmail, createSession, sanitizeUser } from "@/lib/db.js";
import { verifyPassword } from "@/lib/auth.js";
import { SignInSchema } from "@/lib/types.js";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Validate credentials payload
    const validated = SignInSchema.safeParse(body);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || "Invalid email or password.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password } = validated.data;

    // 2. Fetch user from database
    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Verify password hash
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 4. Create session
    const token = createSession(user.id);
    const safeUser = sanitizeUser(user);

    // 5. Return user profile JSON as it is + set cookie
    const response = NextResponse.json({
      ok: true,
      user: safeUser,
      token,
      message: "Signed in successfully.",
    });

    response.cookies.set("career_compass_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[SignIn Route] Error:", err.message);
    return NextResponse.json(
      { error: "Internal server error during sign in." },
      { status: 500 }
    );
  }
}
