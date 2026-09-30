const API_BASE = "/api";

function clean(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function normalizeAirport(airport) {
  if (!airport) {
    return null;
  }

  if (typeof airport === "string") {
    return {
      code: airport.toUpperCase(),
      name: "",
      city: "",
      country: "",
    };
  }

  const code = clean(
    airport.code ||
      airport.iata ||
      airport.iataCode ||
      airport.airportCode
  ).toUpperCase();

  return {
    code,
    name: clean(
      airport.name ||
        airport.airportName
    ),
    city: clean(
      airport.city ||
        airport.cityName
    ),
    country: clean(
      airport.country ||
        airport.countryName
    ),
  };
}

export function normalizeFlightSearch(search = {}) {
  const origin =
    normalizeAirport(
      search.origin
    ) || {
      code: clean(
        search.originCode
      ).toUpperCase(),
      name: "",
      city: "",
      country: "",
    };

  const destination =
    normalizeAirport(
      search.destination
    ) || {
      code: clean(
        search.destinationCode
      ).toUpperCase(),
      name: "",
      city: "",
      country: "",
    };

  const tripType =
    clean(
      search.tripType ||
        search.type ||
        "roundtrip"
    ).toLowerCase() === "oneway"
      ? "oneway"
      : "roundtrip";

  const passengers =
    search.passengers || {};

  const adults = Math.max(
    1,
    toNumber(
      search.adults ??
        passengers.adults,
      1
    )
  );

  const children = Math.max(
    0,
    toNumber(
      search.children ??
        passengers.children,
      0
    )
  );

  const infants = Math.max(
    0,
    toNumber(
      search.infants ??
        passengers.infants,
      0
    )
  );

  return {
    tripType,

    origin,

    destination,

    departureDate: clean(
      search.departureDate ||
        search.departure ||
        search.departDate
    ),

    returnDate:
      tripType === "roundtrip"
        ? clean(
            search.returnDate ||
              search.return ||
              search.returningDate
          )
        : "",

    adults,

    children,

    infants,

    cabin: clean(
      search.cabin ||
        search.cabinClass ||
        "economy"
    ).toLowerCase(),

    maxStops:
      search.maxStops === undefined ||
      search.maxStops === null ||
      search.maxStops === ""
        ? "any"
        : String(search.maxStops),

    currency: clean(
      search.currency ||
        "USD"
    ).toUpperCase(),
  };
}

export function validateFlightSearch(
  search
) {
  const errors = [];

  const normalized =
    normalizeFlightSearch(search);

  if (!normalized.origin.code) {
    errors.push(
      "Select a departure airport."
    );
  }

  if (!normalized.destination.code) {
    errors.push(
      "Select a destination airport."
    );
  }

  if (
    normalized.origin.code &&
    normalized.destination.code &&
    normalized.origin.code ===
      normalized.destination.code
  ) {
    errors.push(
      "Departure and destination airports must be different."
    );
  }

  if (!normalized.departureDate) {
    errors.push(
      "Select a departure date."
    );
  }

  if (
    normalized.tripType ===
      "roundtrip" &&
    !normalized.returnDate
  ) {
    errors.push(
      "Select a return date."
    );
  }

  if (
    normalized.departureDate &&
    normalized.returnDate &&
    normalized.returnDate <
      normalized.departureDate
  ) {
    errors.push(
      "Return date cannot be earlier than the departure date."
    );
  }

  if (
    normalized.infants >
    normalized.adults
  ) {
    errors.push(
      "The number of infants cannot exceed the number of adults."
    );
  }

  const totalPassengers =
    normalized.adults +
    normalized.children +
    normalized.infants;

  if (totalPassengers > 9) {
    errors.push(
      "Maximum passenger count is 9."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    search: normalized,
  };
}

function buildRequestPayload(search) {
  const normalized =
    normalizeFlightSearch(search);

  return {
    tripType:
      normalized.tripType,

    origin:
      normalized.origin,

    destination:
      normalized.destination,

    originCode:
      normalized.origin.code,

    destinationCode:
      normalized.destination.code,

    departureDate:
      normalized.departureDate,

    returnDate:
      normalized.returnDate,

    passengers: {
      adults:
        normalized.adults,

      children:
        normalized.children,

      infants:
        normalized.infants,

      total:
        normalized.adults +
        normalized.children +
        normalized.infants,
    },

    adults:
      normalized.adults,

    children:
      normalized.children,

    infants:
      normalized.infants,

    cabin:
      normalized.cabin,

    cabinClass:
      normalized.cabin,

    maxStops:
      normalized.maxStops,

    currency:
      normalized.currency,
  };
}

async function parseResponse(response) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function searchFlights(
  search,
  options = {}
) {
  const validation =
    validateFlightSearch(search);

  if (!validation.valid) {
    const error =
      new Error(
        validation.errors.join(" ")
      );

    error.code =
      "INVALID_SEARCH";

    error.validation =
      validation;

    throw error;
  }

  const payload =
    buildRequestPayload(
      validation.search
    );

  const controller =
    new AbortController();

  const timeout =
    Number(
      options.timeout || 30000
    );

  const timeoutId =
    window.setTimeout(
      () => controller.abort(),
      timeout
    );

  try {
    const response =
      await fetch(
        `${API_BASE}/flights/search`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),

          signal:
            options.signal ||
            controller.signal,

          credentials:
            "include",
        }
      );

    const data =
      await parseResponse(
        response
      );

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Flight search failed (${response.status}).`;

      const error =
        new Error(message);

      error.status =
        response.status;

      error.response =
        data;

      throw error;
    }

    return normalizeFlightSearchResponse(
      data,
      validation.search
    );
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      const timeoutError =
        new Error(
          "Flight search timed out. Please try again."
        );

      timeoutError.code =
        "SEARCH_TIMEOUT";

      throw timeoutError;
    }

    throw error;
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

export function normalizeFlightSearchResponse(
  response,
  search
) {
  const source =
    response || {};

  const flights =
    Array.isArray(source)
      ? source
      : Array.isArray(
          source.flights
        )
      ? source.flights
      : Array.isArray(
          source.results
        )
      ? source.results
      : Array.isArray(
          source.offers
        )
      ? source.offers
      : Array.isArray(
          source.data
        )
      ? source.data
      : [];

  return {
    ...source,

    flights,

    results:
      flights,

    search:
      source.search ||
      search,

    sessionId:
      source.sessionId ||
      source.session_id ||
      null,

    requestId:
      source.requestId ||
      source.request_id ||
      null,

    currency:
      source.currency ||
      search.currency,

    provider:
      source.provider ||
      source.source ||
      null,
  };
}

export function serializeFlightSearch(
  search
) {
  const normalized =
    normalizeFlightSearch(
      search
    );

  return {
    ...normalized,

    origin:
      normalizeAirport(
        normalized.origin
      ),

    destination:
      normalizeAirport(
        normalized.destination
      ),
  };
}

export function saveFlightSearch(
  search
) {
  const normalized =
    serializeFlightSearch(
      search
    );

  sessionStorage.setItem(
    "flymatrix:lastSearch",
    JSON.stringify(
      normalized
    )
  );

  return normalized;
}

export function loadFlightSearch() {
  try {
    const stored =
      sessionStorage.getItem(
        "flymatrix:lastSearch"
      );

    if (!stored) {
      return null;
    }

    return normalizeFlightSearch(
      JSON.parse(stored)
    );
  } catch {
    return null;
  }
}

export function clearFlightSearch() {
  sessionStorage.removeItem(
    "flymatrix:lastSearch"
  );
}

export function createFlightSearchParams(
  search
) {
  const normalized =
    normalizeFlightSearch(
      search
    );

  const params =
    new URLSearchParams();

  params.set(
    "origin",
    normalized.origin.code
  );

  params.set(
    "destination",
    normalized.destination.code
  );

  params.set(
    "departureDate",
    normalized.departureDate
  );

  if (
    normalized.returnDate
  ) {
    params.set(
      "returnDate",
      normalized.returnDate
    );
  }

  params.set(
    "tripType",
    normalized.tripType
  );

  params.set(
    "adults",
    String(
      normalized.adults
    )
  );

  params.set(
    "children",
    String(
      normalized.children
    )
  );

  params.set(
    "infants",
    String(
      normalized.infants
    )
  );

  params.set(
    "cabin",
    normalized.cabin
  );

  params.set(
    "maxStops",
    normalized.maxStops
  );

  params.set(
    "currency",
    normalized.currency
  );

  return params;
}

export function buildFlightSearchUrl(
  search
) {
  const params =
    createFlightSearchParams(
      search
    );

  return `/search?${params.toString()}`;
}

export default {
  normalizeFlightSearch,

  validateFlightSearch,

  searchFlights,

  normalizeFlightSearchResponse,

  serializeFlightSearch,

  saveFlightSearch,

  loadFlightSearch,

  clearFlightSearch,

  createFlightSearchParams,

  buildFlightSearchUrl,
};
