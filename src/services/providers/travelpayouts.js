import { config } from "../../config.js";

const BASE_URL = config.providers.flightApiBaseUrl || "https://api.travelpayouts.com";

export async function searchTravelpayouts({
  origin, destination, currency = "usd", market = "us",
  minPrice = 0, maxPrice = 100000, oneWay = true, direct = false
}) {
  if (!config.providers.flightApiKey) {
    return { provider: "travelpayouts", available: false, reason: "FLIGHT_API_KEY is not configured.", results: [] };
  }
  const url = new URL("/aviasales/v3/search_by_price_range", BASE_URL);
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("value_min", minPrice);
  url.searchParams.set("value_max", maxPrice);
  url.searchParams.set("one_way", String(oneWay));
  url.searchParams.set("direct", String(direct));
  url.searchParams.set("locale", "en");
  url.searchParams.set("currency", currency);
  url.searchParams.set("market", market);
  const response = await fetch(url, { headers: { "X-Access-Token": config.providers.flightApiKey } });
  if (!response.ok) throw new Error(`Travelpayouts request failed: ${response.status}`);
  const data = await response.json();
  const raw = Array.isArray(data?.data) ? data.data : [];
  const results = raw.map((item) => ({
    provider: "travelpayouts",
    origin: item.origin || origin,
    destination: item.destination || destination,
    price: item.value ?? item.price ?? null,
    currency,
    departureDate: item.depart_date || item.departure_at || null,
    returnDate: item.return_date || null,
    link: item.link || null
  }));
  return { provider: "travelpayouts", available: true, results };
}
