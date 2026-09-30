import {
  config
} from "../config.js";

import {
  normalizeTravelpayoutsOffer
} from "./flightNormalizer.js";

const TRAVELPAYOUTS_BASE_URL =
  "https://api.travelpayouts.com";

function getApiKey() {
  return (
    config?.providers
      ?.travelpayouts
      ?.apiKey ||
    ""
  );
}

function validateSearchInput({
  origin,
  destination,
  departureDate
}) {
  if (!origin) {
    throw new Error(
      "Flight origin is required."
    );
  }

  if (!destination) {
    throw new Error(
      "Flight destination is required."
    );
  }

  if (!departureDate) {
    throw new Error(
      "Flight departure date is required."
    );
  }
}

function buildSearchUrl({
  origin,
  destination,
  departureDate
}) {
  const apiKey =
    getApiKey();

  const params =
    new URLSearchParams();

  params.set(
    "origin",
    String(origin)
      .trim()
      .toUpperCase()
  );

  params.set(
    "destination",
    String(destination)
      .trim()
      .toUpperCase()
  );

  params.set(
    "departure_at",
    String(
      departureDate
    ).trim()
  );

  params.set(
    "currency",
    "USD"
  );

  params.set(
    "token",
    apiKey
  );

  return (
    `${TRAVELPAYOUTS_BASE_URL}` +
    `/aviasales/v3/search_by_price_range?` +
    params.toString()
  );
}

function normalizeResults(
  data
) {
  const results =
    Array.isArray(
      data?.data
    )
      ? data.data
      : [];

  return results
    .map(
      (offer) =>
        normalizeTravelpayoutsOffer(
          offer
        )
    )
    .filter(Boolean);
}

export async function searchTravelpayouts({
  origin,
  destination,
  departureDate
}) {
  validateSearchInput({
    origin,
    destination,
    departureDate
  });

  const apiKey =
    getApiKey();

  if (!apiKey) {
    return {
      available: false,
      configured: false,
      provider:
        "Aviasales",
      network:
        "Travelpayouts",
      results: [],
      message:
        "Travelpayouts flight search is not configured."
    };
  }

  const url =
    buildSearchUrl({
      origin,
      destination,
      departureDate
    });

  const response =
    await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          "application/json"
      }
    });

  let data;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error =
      new Error(
        data?.error ||
          data?.message ||
          "Travelpayouts flight search failed."
      );

    error.statusCode =
      response.status;

    error.provider =
      "Travelpayouts";

    error.response =
      data;

    throw error;
  }

  const results =
    normalizeResults(
      data
    );

  return {
    available: true,
    configured: true,

    provider:
      "Aviasales",

    network:
      "Travelpayouts",

    source:
      "travelpayouts",

    live:
      true,

    cached:
      false,

    estimated:
      false,

    results,

    count:
      results.length,

    currency:
      "USD"
  };
}

export async function getTravelpayoutsFlightStatus() {
  const configured =
    Boolean(
      getApiKey()
    );

  return {
    provider:
      "Aviasales",

    network:
      "Travelpayouts",

    configured,

    apiAvailable:
      configured
  };
}

export default {
  searchTravelpayouts,
  getTravelpayoutsFlightStatus
};
