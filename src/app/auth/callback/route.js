import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server.js";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Successfully authenticated
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[Auth Callback] Exchange code error:", error.message);
  }

  // Return to login with error if exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
