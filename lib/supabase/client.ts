import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { supabasePublishableKey, supabaseUrl } from "@/utils/supabase/config";

const requiredSupabaseConfig = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
};

export const missingSupabaseConfigKeys = Object.entries(requiredSupabaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isSupabaseConfigured = missingSupabaseConfigKeys.length === 0;

let browserClient: SupabaseClient | null = null;

export const supabase = isSupabaseConfigured
  ? (browserClient ??= createBrowserClient())
  : null;

export { supabaseUrl, supabasePublishableKey };
