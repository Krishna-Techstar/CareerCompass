import { NextResponse } from "next/server";
import { getUserBySession } from "@/lib/db.js";
import { getSessionTokenFromRequest } from "@/lib/auth.js";

export async function GET(req) {
  try {
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = getUserBySession(token);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
