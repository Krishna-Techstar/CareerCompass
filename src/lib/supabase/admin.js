import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates an admin client using the SUPABASE_SERVICE_ROLE_KEY.
 * ONLY call this in Server Components, Server Actions, or Route Handlers.
 * NEVER expose the service role key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
