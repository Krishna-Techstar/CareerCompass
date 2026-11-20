import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server.js";
import { createAdminClient } from "@/lib/supabase/admin.js";

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in to delete your account." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 1. Delete assessments and profile data using user client
    await supabase.from("assessments").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);

    // 2. If service role key is present, delete auth.users record
    const admin = createAdminClient();
    if (admin) {
      const { error: adminDeleteErr } = await admin.auth.admin.deleteUser(userId);
      if (adminDeleteErr) {
        console.warn("[Delete Account] Admin user deletion warning:", adminDeleteErr.message);
      }
    }

    // 3. Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({
      ok: true,
      message: "Your account and all associated assessment data have been permanently deleted.",
    });
  } catch (err) {
    console.error("[Delete Account] Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
}
