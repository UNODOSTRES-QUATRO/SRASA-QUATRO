import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== "undefined") {
      // Graceful fallback for local development without credentials
      console.info(
        "[Project Quatro] Supabase credentials not configured in environment. Running in offline/local mock mode."
      );
    }
    return null;
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return clientInstance;
}
