import { config } from "../../config.js";

function requireDuffel() {
  if (!config.providers.duffel.apiKey) {
    const error = new Error("Duffel flight provider is not configured.");
    error.code = "DUFFEL_NOT_CONFIGURED";
    throw error;
  }
}

function buildHeaders() {
  return {
    "Authorization": `Bearer ${config.providers.duffel.apiKey}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Duffel-Version": config.providers.duffel.version
  };
}

export async function searchDuffelFlights({
  origin, destination, departureDate, returnDate = null,
  passengers = 1, cabin = "economy", maxConnections = 1, supplierTimeout = 10000
}) {
  requireDuffel();
  const slices = [{ origin, destination, departure_date: departureDate }];
  if (returnDate) {
    slices.push({ origin: destination, destination: origin, departure_date: returnDate });
  }
  const passengerList = Array.from({ length: passengers }, () => ({ type: "adult" }));
  const body = {
    data: { slices, passengers: passengerList, cabin_class: cabin, max_connections: maxConnections }
  };
  const url = `${config.providers.duffel.baseUrl}/air/offer_requests?return_offers=true&view=offers&supplier_timeout=${supplierTimeout}`;
  const response = await fetch(url, { method: "POST", headers: buildHeaders(), body: JSON.stringify(body) });
  const rawText = await response.text();
  let data;
  try { data = JSON.parse(rawText); } catch { data = { raw: rawText }; }
  if (!response.ok) {
    const error = new Error("Duffel flight search failed.");
    error.status = response.status;
    error.providerResponse = data;
    throw error;
  }
  return data;
}
