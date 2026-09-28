import {
  getSupabase
} from "./supabase.js";

const MARKET_ALIASES = {
  US: "US",
  USA: "US",
  CA: "CA",
  CANADA: "CA",
  AU: "AU",
  DE: "DE",
  ES: "ES",
  GLOBAL: "GLOBAL"
};

export async function resolveBookingPartner({
  category = "flights",
  market = "GLOBAL"
}) {
  const requested =
    MARKET_ALIASES[market] ||
    market;

  const markets = [
    requested,
    "GLOBAL"
  ].filter(
    (value, index, array) =>
      array.indexOf(value) === index
  );

  const {
    data,
    error
  } = await getSupabase()
    .from("affiliate_programs")
    .select("*")
    .eq("category", category)
    .eq("active", true)
    .eq("status", "active")
    .in("market", markets);

  if (error) {
    throw error;
  }

  const partners =
    data || [];

  partners.sort(
    (a, b) => {
      const score = (partner) =>
        (partner.market ===
        requested
          ? 100
          : 0) +
        (partner.api_available
          ? 10
          : 0) +
        Number(
          partner.priority || 0
        );

      return (
        score(b) -
        score(a)
      );
    }
  );

  if (!partners[0]) {
    throw new Error(
      `No active ${category} booking partner is configured.`
    );
  }

  return partners[0];
}
