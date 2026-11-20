import { NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/db.js";
import { SignUpSchema } from "@/lib/types.js";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Validate payload with Zod
    const validated = SignUpSchema.safeParse(body);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || "Invalid registration data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password, ...profileFields } = validated.data;

    // 2. Create user with profile data in database
    let newUser;
    try {
      newUser = createUser({
        email,
        password,
        profile: {
          name: profileFields.name || "",
          age: profileFields.age || null,
          classLevel: profileFields.classLevel || "",
          highestEducation: profileFields.highestEducation || "",
          institution: profileFields.institution || "",
          stream: profileFields.stream || "",
          city: profileFields.city || "",
          state: profileFields.state || "",
          pincode: profileFields.pincode || "",
          country: profileFields.country || "India",
          aspirations: profileFields.aspirations || "",
        },
      });
    } catch (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 400 });
    }

    // 3. Create active session token
    const token = createSession(newUser.id);

    // 4. Return user and set HTTP-only cookie
    const response = NextResponse.json({
      ok: true,
      user: newUser,
      token,
      message: "Account created successfully.",
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
    console.error("[SignUp Route] Error:", err.message);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
