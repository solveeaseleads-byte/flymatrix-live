import { getSupabase } from "./supabase.js";

const MARKET_ALIASES = {
  US: "US", USA: "US", CA: "CA", CAN: "CA", CANADA: "CA",
  AU: "AU", AUS: "AU", AUSTRALIA: "AU", DE: "DE", GER: "DE", GERMANY: "DE",
  ES: "ES", ESP: "ES", SPAIN: "ES"
};

function normalizeMarket(value) {
  if (!value) return "GLOBAL";
  const key = String(value).trim().toUpperCase();
  return MARKET_ALIASES[key] || key;
}

function determineMarkets({ market, originCountry, destinationCountry }) {
  const result = [];
  const explicit = normalizeMarket(market);
  if (explicit !== "GLOBAL") result.push(explicit);
  if (originCountry) result.push(normalizeMarket(originCountry));
  if (destinationCountry) result.push(normalizeMarket(destinationCountry));
  result.push("GLOBAL");
  return [...new Set(result)];
}

async function getActivePrograms({ category, markets }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("affiliate_programs")
    .select("*")
    .eq("category", category)
    .eq("active", true)
    .eq("status", "active")
    .in("market", markets)
    .order("priority", { ascending: true });
  if (error) throw error;
  return data || [];
}

function scoreProgram(program, requestedMarkets) {
  let score = Number(program.priority || 100);
  const market = normalizeMarket(program.market);
  const requestedIndex = requestedMarkets.indexOf(market);
  if (requestedIndex >= 0) score += requestedIndex * 10;
  if (!program.tracking_url) score += 1000;
  if (program.api_available === true) score -= 5;
  return score;
}

export async function resolveBookingPartner({ category = "flights", market = "GLOBAL", originCountry = null, destinationCountry = null }) {
  const markets = determineMarkets({ market, originCountry, destinationCountry });
  const programs = await getActivePrograms({ category, markets });
  const ranked = programs.map(program => ({ program, score: scoreProgram(program, markets) })).sort((a, b) => a.score - b.score);
  const selected = ranked[0]?.program || null;
  return {
    category,
    requestedMarket: normalizeMarket(market),
    marketsConsidered: markets,
    selected: selected ? {
      id: selected.id, name: selected.name, market: selected.market, network: selected.network,
      trackingUrl: selected.tracking_url, apiAvailable: selected.api_available
    } : null,
    alternatives: ranked.slice(1).map(item => ({
      id: item.program.id, name: item.program.name, market: item.program.market,
      network: item.program.network, apiAvailable: item.program.api_available
    }))
  };
}
