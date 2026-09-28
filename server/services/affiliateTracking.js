import {
  getSupabase
} from "./supabase.js";

export async function recordAffiliateClick(
  payload
) {
  const {
    data,
    error
  } = await getSupabase()
    .from("affiliate_clicks")
    .insert({
      affiliate_program_id:
        payload.affiliateProgramId ||
        null,

      origin:
        payload.origin ||
        null,

      destination:
        payload.destination ||
        null,

      category:
        payload.category ||
        null,

      market:
        payload.market ||
        "GLOBAL",

      session_id:
        payload.sessionId ||
        null
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
