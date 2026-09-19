import { searchDuffelFlights } from "./providers/duffel.js";
import { searchTravelpayouts } from "./providers/travelpayouts.js";
import { normalizeDuffelSearch, normalizeTravelpayoutsSearch } from "./flightNormalizer.js";
import { getSupabase } from "./supabase.js";

function validIata(code) { return typeof code === "string" && /^[A-Z]{3}$/.test(code); }

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

// Cheapest-first. Offers with no known price sort to the end rather
// than being dropped, since "price on partner site" is still useful.
function sortByPrice(offers) {
  return [...offers].sort((a, b) => {
    const priceA = a?.price?.amount;
    const priceB = b?.price?.amount;
    if (priceA == null && priceB == null) return 0;
    if (priceA == null) return 1;
    if (priceB == null) return -1;
    return priceA - priceB;
  });
}

export async function searchFlights(params) {
  const {
    origin, destination, departureDate, returnDate = null, passengers = 1,
    cabin = "economy", maxConnections = 1, currency = "USD", market = "GLOBAL"
  } = params;

  if (!validIata(origin)) throw new Error("Origin must be a valid three-letter IATA code.");
  if (!validIata(destination)) throw new Error("Destination must be a valid three-letter IATA code.");
  if (!validDate(departureDate)) throw new Error("Departure date must use YYYY-MM-DD.");
  if (returnDate !== null && !validDate(returnDate)) throw new Error("Return date must use YYYY-MM-DD.");

  const passengerCount = Math.min(Math.max(Number(passengers) || 1, 1), 9);
  const connectionLimit = Math.min(Math.max(Number(maxConnections) || 0, 0), 4);

  let result;
  let provider;

  try {
    const providerResponse = await searchDuffelFlights({
      origin, destination, departureDate, returnDate, passengers: passengerCount, cabin, maxConnections: connectionLimit
    });
    result = normalizeDuffelSearch(providerResponse);
    provider = "duffel";
  } catch (error) {
    if (error.code !== "DUFFEL_NOT_CONFIGURED") throw error;

    const tpResponse = await searchTravelpayouts({
      origin, destination, currency: currency.toLowerCase(),
      market: market.toLowerCase() === "global" ? "us" : market.toLowerCase()
    });
    result = normalizeTravelpayoutsSearch(tpResponse);
    provider = "travelpayouts";
  }

  result.offers = sortByPrice(result.offers);

  try {
    const supabase = getSupabase();
    await supabase.from("flight_search_events").insert({
      origin, destination, departure_date: departureDate, return_date: returnDate,
      passengers: passengerCount, cabin, currency, market, provider
    });
  } catch (error) {
    console.error("Search analytics error:", error);
  }

  return {
    success: true,
    search: { origin, destination, departureDate, returnDate, passengers: passengerCount, cabin, maxConnections: connectionLimit, currency, market },
    ...result
  };
}
