import {
  createClient
} from "@supabase/supabase-js";

import { config }
  from "../config.js";

let supabase = null;

if (
  config.supabase.url &&
  config.supabase.serviceRoleKey
) {
  supabase = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey
  );
}

export function getSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured."
    );
  }

  return supabase;
}
