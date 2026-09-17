import { getSupabase } from "./supabase.js";

function normaliseMarket(market) {
  if (!market) return "GLOBAL";
  return String(market).trim().toUpperCase();
}

export async function resolveAffiliate({ category = "flights", market = "GLOBAL", originCountry = null, destinationCountry = null }) {
  const supabase = getSupabase();
  const requestedMarket = normaliseMarket(market);
  const markets = [requestedMarket, originCountry?.toUpperCase(), destinationCountry?.toUpperCase(), "GLOBAL"].filter(Boolean);
  const { data, error } = await supabase
    .from("affiliate_programs")
    .select("*")
    .eq("category", category)
    .eq("active", true)
    .in("market", [...new Set(markets)])
    .order("priority", { ascending: true });
  if (error) throw error;
  return { requestedMarket, category, programs: data || [] };
}
