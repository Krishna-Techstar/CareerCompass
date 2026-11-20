import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/db.js";
import { getSessionTokenFromRequest } from "@/lib/auth.js";

export async function POST(req) {
  try {
    const token = getSessionTokenFromRequest(req);
    if (token) {
      deleteSession(token);
    }

    const response = NextResponse.json({
      ok: true,
      message: "Signed out successfully.",
    });

    // Clear session cookie
    response.cookies.set("career_compass_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ ok: true });
  }
}
