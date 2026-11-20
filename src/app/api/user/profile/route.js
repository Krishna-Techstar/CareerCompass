import { NextResponse } from "next/server";
import { getUserBySession, updateUserProfile } from "@/lib/db.js";
import { getSessionTokenFromRequest } from "@/lib/auth.js";
import { UserProfileSchema } from "@/lib/types.js";
import { createClient } from "@/lib/supabase/server.js";

export async function GET(req) {
  try {
    // 1. Check Supabase session first
    try {
      const supabase = createClient();
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (sbUser) {
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sbUser.id)
          .single();

        return NextResponse.json({
          ok: true,
          user: {
            id: sbUser.id,
            email: sbUser.email,
            profile: profileRow || {},
          },
          profile: profileRow || {},
        });
      }
    } catch (e) {
      // Supabase unconfigured or error, continue to fallback
    }

    // 2. Fallback to custom session token
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const user = getUserBySession(token);
    if (!user) {
      return NextResponse.json({ error: "Session expired or invalid." }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user,
      profile: user.profile,
    });
  } catch (err) {
    console.error("[Profile GET] Error:", err.message);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req) {
  return handleUpdateProfile(req);
}

export async function POST(req) {
  return handleUpdateProfile(req);
}

async function handleUpdateProfile(req) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Check Supabase session first
    try {
      const supabase = createClient();
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (sbUser) {
        const updateData = {
          full_name: body.full_name || body.name || "",
          segment: body.segment || "undergrad",
          stream: body.stream || body.streamOrCourse || "",
          is_minor: Boolean(body.is_minor || body.age < 18),
          parental_consent: Boolean(body.parental_consent || body.parentalConsent),
          updated_at: new Date().toISOString(),
        };

        const { data: updatedProfile, error } = await supabase
          .from("profiles")
          .upsert({ id: sbUser.id, ...updateData })
          .select()
          .single();

        return NextResponse.json({
          ok: true,
          user: { id: sbUser.id, email: sbUser.email, profile: updatedProfile },
          profile: updatedProfile,
          message: "Profile updated successfully.",
        });
      }
    } catch (e) {
      // Continue to fallback
    }

    // 2. Fallback to custom session token
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const user = getUserBySession(token);
    if (!user) {
      return NextResponse.json({ error: "Session expired or invalid." }, { status: 401 });
    }

    // Validate update fields
    const validated = UserProfileSchema.safeParse(body);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || "Invalid profile data format.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // Persist updated profile in database
    const updatedUser = updateUserProfile(user.id, validated.data);

    return NextResponse.json({
      ok: true,
      user: updatedUser,
      profile: updatedUser.profile,
      message: "Profile updated successfully.",
    });
  } catch (err) {
    console.error("[Profile PUT] Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
