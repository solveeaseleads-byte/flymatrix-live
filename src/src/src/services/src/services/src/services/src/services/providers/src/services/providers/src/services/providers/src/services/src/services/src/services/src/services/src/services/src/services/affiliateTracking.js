
import { getSupabase } from "./supabase.js";

export async function recordAffiliateClick({
  affiliateProgramId,
  origin,
  destination,
  category = "flights",
  market = "GLOBAL",
  sessionId = null
}) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("affiliate_clicks")
    .insert({
      affiliate_program_id:
        affiliateProgramId || null,

      origin:
        origin || null,

      destination:
        destination || null,

      category,

      market,

      session_id:
        sessionId || null
    })
    .select("id, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
