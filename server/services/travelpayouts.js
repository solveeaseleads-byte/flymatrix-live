import { config }
  from "../config.js";

import {
  normalizeTravelpayoutsOffer
} from "./flightNormalizer.js";

export async function searchTravelpayouts({
  origin,
  destination,
  departureDate
}) {
  if (
    !config.providers
      .travelpayouts.apiKey
  ) {
    return {
      available: false,
      results: []
    };
  }

  const params =
    new URLSearchParams({
      origin,
      destination,
      departure_at:
        departureDate,

      currency: "USD",

      token:
        config.providers
          .travelpayouts.apiKey
    });

  const response =
    await fetch(
      `https://api.travelpayouts.com/aviasales/v3/search_by_price_range?${params}`
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Travelpayouts search failed."
    );
  }

  return {
    available: true,

    results:
      (data?.data || []).map(
        normalizeTravelpayoutsOffer
      )
  };
}
