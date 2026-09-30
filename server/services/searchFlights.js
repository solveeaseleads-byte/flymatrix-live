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

const DATE =
  /^\d{4}-\d{2}-\d{2}$/;

function normalizeIata(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toUpperCase();
}

function normalizeDate(
  value
) {
  return String(
    value || ""
  ).trim();
}

function validateSearch({
  origin,
  destination,
  departureDate
}) {
  if (
    !IATA.test(origin) ||
    !IATA.test(destination)
  ) {
    const error =
      new Error(
        "Origin and destination must be valid 3-letter IATA codes."
      );

    error.statusCode =
      400;

    error.code =
      "INVALID_AIRPORT_CODE";

    error.expose =
      true;

    throw error;
  }

  if (
    !DATE.test(
      departureDate
    )
  ) {
    const error =
      new Error(
        "A valid departure date is required."
      );

    error.statusCode =
      400;

    error.code =
      "INVALID_DEPARTURE_DATE";

    error.expose =
      true;

    throw error;
  }
}

function getPriceAmount(
  result
) {
  const amount =
    result?.price?.amount ??
    result?.price ??
    0;

  const numeric =
    Number(amount);

  return Number.isFinite(
    numeric
  )
    ? numeric
    : Number.POSITIVE_INFINITY;
}

function sortResults(
  results
) {
  return [
    ...(Array.isArray(
      results
    )
      ? results
      : [])
  ].sort(
    (a, b) =>
      getPriceAmount(a) -
      getPriceAmount(b)
  );
}

async function recordSearchEvent({
  sessionId,
  origin,
  destination,
  departureDate,
  results
}) {
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
    /*
     * Analytics must never break
     * a customer flight search.
     */
  }
}

async function searchWithDuffel(
  params
) {
  try {
    const results =
      await searchDuffelFlights(
        params
      );

    return {
      available: true,
      configured: true,
      provider:
        "Duffel",
      source:
        "duffel",
      results:
        Array.isArray(
          results
        )
          ? results
          : []
    };
  } catch (error) {
    if (
      error?.code !==
      "DUFFEL_NOT_CONFIGURED"
    ) {
      throw error;
    }

    return {
      available: false,
      configured: false,
      provider:
        "Duffel",
      source:
        "duffel",
      results: []
    };
  }
}

async function searchWithTravelpayouts(
  params
) {
  const result =
    await searchTravelpayouts(
      params
    );

  return {
    available:
      result?.available === true,

    configured:
      result?.configured === true,

    provider:
      result?.provider ||
      "Aviasales",

    network:
      result?.network ||
      "Travelpayouts",

    source:
      result?.source ||
      "travelpayouts",

    results:
      Array.isArray(
        result?.results
      )
        ? result.results
        : []
  };
}

export async function searchFlights(
  params = {}
) {
  const origin =
    normalizeIata(
      params.origin
    );

  const destination =
    normalizeIata(
      params.destination
    );

  const departureDate =
    normalizeDate(
      params.departureDate
    );

  validateSearch({
    origin,
    destination,
    departureDate
  });

  const sessionId =
    crypto.randomUUID();

  const searchParams = {
    ...params,

    origin,
    destination,
    departureDate
  };

  /*
   * ------------------------------------------------------
   * Primary provider: Duffel
   * ------------------------------------------------------
   */
  const duffel =
    await searchWithDuffel(
      searchParams
    );

  let results =
    duffel.results;

  let providerMessage =
    "";

  let providerUsed =
    duffel.available
      ? "duffel"
      : null;

  /*
   * ------------------------------------------------------
   * Fallback provider:
   * Travelpayouts / Aviasales
   * ------------------------------------------------------
   */
  if (
    !duffel.available
  ) {
    const travelpayouts =
      await searchWithTravelpayouts(
        searchParams
      );

    results =
      travelpayouts.results;

    providerUsed =
      travelpayouts.available
        ? "travelpayouts"
        : null;

    providerMessage =
      travelpayouts.available
        ? "Live offers returned by Travelpayouts / Aviasales."
        : "No live flight provider is configured.";
  } else {
    providerMessage =
      "Live offers returned by Duffel.";
  }

  results =
    sortResults(
      results
    );

  await recordSearchEvent({
    sessionId,
    origin,
    destination,
    departureDate,
    results
  });

  return {
    success: true,

    sessionId,

    origin,

    destination,

    departureDate,

    provider:
      providerUsed,

    providerMessage,

    resultsCount:
      results.length,

    results
  };
}

export default {
  searchFlights
};
