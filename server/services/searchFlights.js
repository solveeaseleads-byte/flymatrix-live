import crypto from "node:crypto";

import {
  searchDuffelFlights
} from "./duffel.js";

import {
  searchTravelpayouts
} from "./travelpayouts.js";

import {
  getSupabase
} from "./supabase.js";

const IATA =
  /^[A-Z]{3}$/;

export async function searchFlights(
  params
) {
  const origin =
    String(
      params.origin || ""
    ).toUpperCase();

  const destination =
    String(
      params.destination || ""
    ).toUpperCase();

  const departureDate =
    String(
      params.departureDate || ""
    );

  if (
    !IATA.test(origin) ||
    !IATA.test(destination)
  ) {
    throw new Error(
      "Origin and destination must be valid 3-letter IATA codes."
    );
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      departureDate
    )
  ) {
    throw new Error(
      "A valid departure date is required."
    );
  }

  const sessionId =
    crypto.randomUUID();

  let results = [];

  let providerMessage = "";

  try {
    results =
      await searchDuffelFlights({
        ...params,
        origin,
        destination,
        departureDate
      });

    providerMessage =
      "Live offers returned by Duffel.";
  } catch (error) {
    if (
      error.code !==
      "DUFFEL_NOT_CONFIGURED"
    ) {
      throw error;
    }

    const fallback =
      await searchTravelpayouts({
        origin,
        destination,
        departureDate
      });

    results =
      fallback.results;

    providerMessage =
      fallback.available
        ? "Live offers returned by Travelpayouts."
        : "No live flight provider is configured.";
  }

  results.sort(
    (a, b) =>
      Number(
        a?.price?.amount || 0
      ) -
      Number(
        b?.price?.amount || 0
      )
  );

  try {
    await getSupabase()
      .from(
        "flight_search_events"
      )
      .insert({
        session_id:
          sessionId,

        origin,

        destination,

        departure_date:
          departureDate,

        results_count:
          results.length,

        provider:
          results[0]?.source ||
          "none"
      });
  } catch {
    // Analytics must not break search.
  }

  return {
    success: true,
    sessionId,
    origin,
    destination,
    departureDate,
    providerMessage,
    results
  };
}
