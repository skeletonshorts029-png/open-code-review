import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "@/utils/supabase/config";

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabasePublishableKey!);
