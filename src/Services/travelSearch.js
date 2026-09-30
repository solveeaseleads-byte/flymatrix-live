const API_BASE = "/api";

function clean(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function number(value, fallback = 0) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function encodeParams(values = {}) {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length) {
        params.set(key, value.join(","));
      }

      return;
    }

    params.set(key, String(value));
  });

  return params;
}

/* --------------------------------------------------
   AIRPORT / LOCATION
-------------------------------------------------- */

export function normalizeLocation(location) {
  if (!location) {
    return {
      code: "",
      name: "",
      city: "",
      country: "",
    };
  }

  if (typeof location === "string") {
    return {
      code: location.trim().toUpperCase(),
      name: "",
      city: "",
      country: "",
    };
  }

  return {
    code: clean(
      location.code ||
        location.iata ||
        location.iataCode ||
        location.airportCode
    ).toUpperCase(),

    name: clean(
      location.name ||
        location.airportName ||
        location.airport_name
    ),

    city: clean(
      location.city ||
        location.cityName ||
        location.city_name
    ),

    country: clean(
      location.country ||
        location.countryName ||
        location.country_name
    ),
  };
}

/* --------------------------------------------------
   FLIGHT SEARCH
-------------------------------------------------- */

export function normalizeFlightSearch(search = {}) {
  const origin = normalizeLocation(
    search.origin ||
      search.from
  );

  const destination = normalizeLocation(
    search.destination ||
      search.to
  );

  const passengers =
    search.passengers || {};

  return {
    tripType:
      clean(
        search.tripType
      ).toLowerCase() ||
      "roundtrip",

    origin,

    destination,

    departureDate: clean(
      search.departureDate ||
        search.departure ||
        search.date
    ),

    returnDate: clean(
      search.returnDate ||
        search.return
    ),

    adults: number(
      search.adults ??
        passengers.adults ??
        1,
      1
    ),

    children: number(
      search.children ??
        passengers.children ??
        0
    ),

    infants: number(
      search.infants ??
        passengers.infants ??
        0
    ),

    cabin:
      clean(
        search.cabin ||
          search.cabinClass
      ).toLowerCase() ||
      "economy",

    stops:
      clean(
        search.stops
      ).toLowerCase() ||
      "any",

    currency:
      clean(
        search.currency ||
          "USD"
      ).toUpperCase(),
  };
}

export function validateFlightSearch(
  search
) {
  const normalized =
    normalizeFlightSearch(
      search
    );

  const errors = [];

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
      "Select a return date for a round trip."
    );
  }

  if (
    normalized.tripType ===
      "roundtrip" &&
    normalized.departureDate &&
    normalized.returnDate &&
    normalized.returnDate <
      normalized.departureDate
  ) {
    errors.push(
      "Return date cannot be before departure date."
    );
  }

  if (
    normalized.adults < 1
  ) {
    errors.push(
      "At least one adult passenger is required."
    );
  }

  return {
    valid:
      errors.length === 0,

    errors,

    search:
      normalized,
  };
}

/* --------------------------------------------------
   SEARCH SESSION
-------------------------------------------------- */

function createSessionId() {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return [
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");
}

export function createFlightSession(
  search
) {
  const validation =
    validateFlightSearch(
      search
    );

  if (!validation.valid) {
    const error =
      new Error(
        validation.errors.join(
          " "
        )
      );

    error.code =
      "INVALID_FLIGHT_SEARCH";

    error.validation =
      validation;

    throw error;
  }

  const sessionId =
    createSessionId();

  return {
    sessionId,

    search:
      validation.search,

    createdAt:
      new Date().toISOString(),
  };
}

/* --------------------------------------------------
   BUILD BACKEND SEARCH REQUEST
-------------------------------------------------- */

function buildSearchPayload(
  search,
  sessionId
) {
  const normalized =
    normalizeFlightSearch(
      search
    );

  return {
    sessionId,

    category:
      "flights",

    market:
      "GLOBAL",

    tripType:
      normalized.tripType,

    origin:
      normalized.origin.code,

    originCode:
      normalized.origin.code,

    originName:
      normalized.origin.name,

    originCity:
      normalized.origin.city,

    originCountry:
      normalized.origin.country,

    destination:
      normalized.destination.code,

    destinationCode:
      normalized.destination.code,

    destinationName:
      normalized.destination.name,

    destinationCity:
      normalized.destination.city,

    destinationCountry:
      normalized.destination.country,

    departureDate:
      normalized.departureDate,

    returnDate:
      normalized.returnDate,

    adults:
      normalized.adults,

    children:
      normalized.children,

    infants:
      normalized.infants,

    cabin:
      normalized.cabin,

    stops:
      normalized.stops,

    currency:
      normalized.currency,
  };
}

/* --------------------------------------------------
   RESPONSE NORMALIZATION
-------------------------------------------------- */

function normalizeAirline(airline) {
  if (!airline) {
    return {
      code: "",
      name: "Airline",
      logo: null,
    };
  }

  if (typeof airline === "string") {
    return {
      code: "",
      name: airline,
      logo: null,
    };
  }

  return {
    code: clean(
      airline.code ||
        airline.iata ||
        airline.airlineCode
    ).toUpperCase(),

    name:
      clean(
        airline.name ||
          airline.airlineName ||
          airline.title
      ) || "Airline",

    logo:
      airline.logo ||
      airline.logoUrl ||
      null,
  };
}

function normalizeSegment(
  segment = {}
) {
  return {
    origin:
      clean(
        segment.origin?.iata ||
          segment.origin?.code ||
          segment.origin
      ).toUpperCase(),

    destination:
      clean(
        segment.destination?.iata ||
          segment.destination?.code ||
          segment.destination
      ).toUpperCase(),

    departure:
      clean(
        segment.departure?.time ||
          segment.departureTime ||
          segment.departure
      ),

    arrival:
      clean(
        segment.arrival?.time ||
          segment.arrivalTime ||
          segment.arrival
      ),

    duration:
      clean(
        segment.duration
      ),

    airline:
      normalizeAirline(
        segment.airline ||
          segment.carrier
      ),

    flightNumber:
      clean(
        segment.flightNumber ||
          segment.flight_number
      ),
  };
}

function normalizeOffer(
  offer,
  index,
  search
) {
  const airline =
    normalizeAirline(
      offer?.airline ||
        offer?.carrier ||
        offer?.marketingCarrier
    );

  const price =
    offer?.price;

  const segments =
    Array.isArray(
      offer?.segments
    )
      ? offer.segments.map(
          normalizeSegment
        )
      : [];

  const firstSegment =
    segments[0] || {};

  const lastSegment =
    segments[
      segments.length - 1
    ] || firstSegment;

  const amount = number(
    price?.amount ??
      price?.value ??
      offer?.amount ??
      offer?.priceValue ??
      offer?.totalPrice
  );

  const currency =
    clean(
      price?.currency ||
        offer?.currency ||
        search.currency ||
        "USD"
    ).toUpperCase();

  const stops =
    offer?.stops !== undefined
      ? number(
          offer.stops
        )
      : Math.max(
          0,
          segments.length - 1
        );

  return {
    ...offer,

    id:
      offer?.id ||
      offer?.offerId ||
      offer?.offer_id ||
      `flight-${index}`,

    airline,

    origin:
      offer?.origin ||
      {
        iata:
          firstSegment.origin,
      },

    destination:
      offer?.destination ||
      {
        iata:
          lastSegment.destination,
      },

    departure:
      offer?.departure ||
      {
        time:
          firstSegment.departure,
      },

    arrival:
      offer?.arrival ||
      {
        time:
          lastSegment.arrival,
      },

    duration:
      clean(
        offer?.duration
      ) ||
      firstSegment.duration ||
      "Duration unavailable",

    stops,

    segments,

    price: {
      amount,

      currency,

      type:
        clean(
          price?.type ||
            offer?.priceType
        ),

      isLive:
        Boolean(
          price?.isLive ??
            offer?.isLive
        ),
    },

    affiliateProgramId:
      offer?.affiliateProgramId ||
      offer?.affiliate_program_id ||
      null,

    link:
      offer?.link ||
      offer?.trackingUrl ||
      offer?.tracking_url ||
      null,

    destinationCountry:
      offer?.destinationCountry ||
      search.destination.country ||
      "",

    originCountry:
      offer?.originCountry ||
      search.origin.country ||
      "",

    sessionId:
      offer?.sessionId ||
      null,
  };
}

function extractOffers(
  response
) {
  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(
      response?.offers
    )
  ) {
    return response.offers;
  }

  if (
    Array.isArray(
      response?.results
    )
  ) {
    return response.results;
  }

  if (
    Array.isArray(
      response?.flights
    )
  ) {
    return response.flights;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  return [];
}

/* --------------------------------------------------
   SEARCH FLIGHTS ON FLYMATRIX
-------------------------------------------------- */

export async function searchFlights(
  search,
  options = {}
) {
  const validation =
    validateFlightSearch(
      search
    );

  if (!validation.valid) {
    const error =
      new Error(
        validation.errors.join(
          " "
        )
      );

    error.code =
      "INVALID_FLIGHT_SEARCH";

    error.validation =
      validation;

    throw error;
  }

  const session =
    options.sessionId
      ? {
          sessionId:
            options.sessionId,

          search:
            validation.search,
        }
      : createFlightSession(
          validation.search
        );

  const payload =
    buildSearchPayload(
      validation.search,
      session.sessionId
    );

  const controller =
    new AbortController();

  const timeout =
    Number(
      options.timeout ||
        30000
    );

  const timeoutId =
    window.setTimeout(
      () =>
        controller.abort(),
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

          credentials:
            "include",

          body:
            JSON.stringify(
              payload
            ),

          signal:
            options.signal ||
            controller.signal,
        }
      );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let data;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      try {
        data =
          JSON.parse(text);
      } catch {
        data = {
          message: text,
        };
      }
    }

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
            data?.error ||
            `Flight search failed (${response.status}).`
        );

      error.status =
        response.status;

      error.response =
        data;

      throw error;
    }

    const rawOffers =
      extractOffers(
        data
      );

    const offers =
      rawOffers.map(
        (offer, index) =>
          normalizeOffer(
            offer,
            index,
            validation.search
          )
      );

    return {
      sessionId:
        data?.sessionId ||
        session.sessionId,

      search:
        validation.search,

      offers,

      results:
        offers,

      total:
        data?.total ??
        offers.length,

      provider:
        data?.provider ||
        data?.source ||
        null,

      dataStatus:
        clean(
          data?.dataStatus ||
            data?.data_status ||
            data?.status ||
            "live"
        ).toLowerCase(),

      generatedAt:
        data?.generatedAt ||
        new Date().toISOString(),

      raw: data,
    };
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
        "FLIGHT_SEARCH_TIMEOUT";

      throw timeoutError;
    }

    throw error;
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

/* --------------------------------------------------
   FILTERING
-------------------------------------------------- */

export function filterFlights(
  offers = [],
  filters = {}
) {
  const {
    maxPrice,
    stops,
    airlines,
    cabin,
  } = filters;

  return offers.filter(
    (offer) => {
      if (
        maxPrice !==
          undefined &&
        maxPrice !==
          null &&
        Number(
          offer.price?.amount
        ) >
          Number(maxPrice)
      ) {
        return false;
      }

      if (
        stops &&
        stops !== "any" &&
        String(
          offer.stops
        ) !==
          String(stops)
      ) {
        return false;
      }

      if (
        Array.isArray(
          airlines
        ) &&
        airlines.length
      ) {
        const code =
          offer.airline?.code;

        const name =
          offer.airline?.name;

        const matches =
          airlines.some(
            (value) =>
              String(value)
                .toLowerCase() ===
                String(code)
                  .toLowerCase() ||
              String(value)
                .toLowerCase() ===
                String(name)
                  .toLowerCase()
          );

        if (!matches) {
          return false;
        }
      }

      if (
        cabin &&
        offer.cabin &&
        String(
          offer.cabin
        ).toLowerCase() !==
          String(cabin)
            .toLowerCase()
      ) {
        return false;
      }

      return true;
    }
  );
}

/* --------------------------------------------------
   SORTING
-------------------------------------------------- */

export function sortFlights(
  offers = [],
  sortBy = "price"
) {
  const sorted = [
    ...offers,
  ];

  switch (sortBy) {
    case "price":
      return sorted.sort(
        (a, b) =>
          Number(
            a.price?.amount ??
              Infinity
          ) -
          Number(
            b.price?.amount ??
              Infinity
          )
      );

    case "duration":
      return sorted.sort(
        (a, b) =>
          durationToMinutes(
            a.duration
          ) -
          durationToMinutes(
            b.duration
          )
      );

    case "stops":
      return sorted.sort(
        (a, b) =>
          Number(
            a.stops ?? 0
          ) -
          Number(
            b.stops ?? 0
          )
      );

    case "airline":
      return sorted.sort(
        (a, b) =>
          String(
            a.airline?.name ||
              ""
          ).localeCompare(
            String(
              b.airline?.name ||
                ""
            )
          )
      );

    default:
      return sorted;
  }
}

function durationToMinutes(
  duration
) {
  if (
    typeof duration ===
    "number"
  ) {
    return duration;
  }

  const value =
    clean(duration);

  if (!value) {
    return Infinity;
  }

  const hourMatch =
    value.match(
      /(\d+)\s*h/i
    );

  const minuteMatch =
    value.match(
      /(\d+)\s*m/i
    );

  if (
    hourMatch ||
    minuteMatch
  ) {
    return (
      number(
        hourMatch?.[1]
      ) * 60 +
      number(
        minuteMatch?.[1]
      )
    );
  }

  const colonMatch =
    value.match(
      /^(\d+):(\d+)$/
    );

  if (colonMatch) {
    return (
      number(
        colonMatch[1]
      ) * 60 +
      number(
        colonMatch[2]
      )
    );
  }

  return Infinity;
}

/* --------------------------------------------------
   AIRLINE LIST
-------------------------------------------------- */

export function getAirlines(
  offers = []
) {
  const map =
    new Map();

  offers.forEach(
    (offer) => {
      const airline =
        offer.airline;

      if (!airline) {
        return;
      }

      const key =
        airline.code ||
        airline.name;

      if (!key) {
        return;
      }

      if (!map.has(key)) {
        map.set(
          key,
          {
            code:
              airline.code ||
              "",

            name:
              airline.name ||
              airline.code,

            logo:
              airline.logo ||
              null,
          }
        );
      }
    }
  );

  return Array.from(
    map.values()
  ).sort(
    (a, b) =>
      a.name.localeCompare(
        b.name
      )
  );
}

/* --------------------------------------------------
   PRICE SUMMARY
-------------------------------------------------- */

export function getFlightPriceRange(
  offers = []
) {
  const prices =
    offers
      .map(
        (offer) =>
          Number(
            offer.price?.amount
          )
      )
      .filter(
        Number.isFinite
      );

  if (!prices.length) {
    return {
      min: null,
      max: null,
    };
  }

  return {
    min: Math.min(
      ...prices
    ),

    max: Math.max(
      ...prices
    ),
  };
}

/* --------------------------------------------------
   AFFILIATE HAND-OFF
--------------------------------------------------

   IMPORTANT:

   The flight search happens first on FlyMatrix.

   Only after results have been displayed does the
   user click "View / book".

   The selected search details are sent to the
   backend so the backend can create the correct
   provider/deep-link URL.

   This keeps FlyMatrix as the search/results layer
   rather than immediately sending the user away.
-------------------------------------------------- */

export async function resolveFlightBooking(
  offer,
  search,
  sessionId,
  options = {}
) {
  if (!offer) {
    throw new Error(
      "No flight offer was selected."
    );
  }

  const normalized =
    normalizeFlightSearch(
      search
    );

  const payload = {
    category:
      "flights",

    market:
      "GLOBAL",

    sessionId:
      sessionId || null,

    offerId:
      offer.id || null,

    affiliateProgramId:
      offer.affiliateProgramId ||
      null,

    origin:
      normalized.origin.code,

    destination:
      normalized.destination.code,

    departureDate:
      normalized.departureDate,

    returnDate:
      normalized.returnDate,

    tripType:
      normalized.tripType,

    adults:
      normalized.adults,

    children:
      normalized.children,

    infants:
      normalized.infants,

    cabin:
      normalized.cabin,

    currency:
      normalized.currency,

    provider:
      offer.provider ||
      offer.source ||
      null,
  };

  const response =
    await fetch(
      `${API_BASE}/booking/resolve`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        credentials:
          "include",

        body:
          JSON.stringify(
            payload
          ),

        signal:
          options.signal,
      }
    );

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let data;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();
  } else {
    const text =
      await response.text();

    try {
      data =
        JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Unable to create the flight booking link."
    );
  }

  const trackingUrl =
    data?.trackingUrl ||
    data?.bookingUrl ||
    data?.url ||
    null;

  if (!trackingUrl) {
    throw new Error(
      "The flight provider did not return a booking link."
    );
  }

  return {
    ...data,

    trackingUrl,

    affiliateProgramId:
      data?.affiliateProgramId ||
      offer.affiliateProgramId ||
      null,

    sessionId:
      data?.sessionId ||
      sessionId ||
      null,
  };
}

/* --------------------------------------------------
   CLICK TRACKING
-------------------------------------------------- */

export async function trackFlightAffiliateClick(
  data = {}
) {
  try {
    await fetch(
      `${API_BASE}/affiliate/click`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        credentials:
          "include",

        body:
          JSON.stringify({
            category:
              "flights",

            market:
              "GLOBAL",

            affiliateProgramId:
              data.affiliateProgramId ||
              null,

            sessionId:
              data.sessionId ||
              null,

            offerId:
              data.offerId ||
              null,

            origin:
              data.origin ||
              "",

            destination:
              data.destination ||
              "",
          }),
      }
    );
  } catch {
    /*
     * Tracking failure must never prevent
     * the user from reaching the booking
     * provider.
     */
  }
}

/* --------------------------------------------------
   OPEN BOOKING
-------------------------------------------------- */

export async function openFlightBooking(
  offer,
  search,
  sessionId
) {
  const result =
    await resolveFlightBooking(
      offer,
      search,
      sessionId
    );

  await trackFlightAffiliateClick(
    {
      affiliateProgramId:
        result.affiliateProgramId,

      sessionId:
        result.sessionId,

      offerId:
        offer.id,

      origin:
        search.origin?.code ||
        search.origin,

      destination:
        search.destination?.code ||
        search.destination,
    }
  );

  window.open(
    result.trackingUrl,
    "_blank",
    "noopener,noreferrer"
  );

  return result;
}

export default {
  normalizeFlightSearch,

  validateFlightSearch,

  createFlightSession,

  searchFlights,

  filterFlights,

  sortFlights,

  getAirlines,

  getFlightPriceRange,

  resolveFlightBooking,

  trackFlightAffiliateClick,

  openFlightBooking,
};
