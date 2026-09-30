const AFFILIATES = {
  flights: {
    id: "aviasales",
    name: "Aviasales / Travelpayouts",
    category: "flights",
    market: "GLOBAL",
    baseUrl:
      "https://aviasales.tpk.lv/zXqbkMmK",
  },

  hotels: {
    id: "booking",
    name: "Booking.com",
    category: "hotels",
    market: "GLOBAL",
    baseUrl:
      "https://booking.tpk.lv/zXqbkMmK",
  },

  activities: {
    id: "getyourguide",
    name: "GetYourGuide",
    category: "activities",
    market: "GLOBAL",
    baseUrl:
      "https://getyourguide.tpk.lv/zXqbkMmK",
  },

  esim: {
    id: "airalo",
    name: "Airalo",
    category: "esim",
    market: "GLOBAL",
    baseUrl:
      "https://airalo.tpk.lv/SMhYBmH2",
  },

  assistance: {
    id: "airhelp",
    name: "AirHelp",
    category: "assistance",
    market: "GLOBAL",
    baseUrl:
      "https://airhelp.tpk.lv/vuZpde9f",
  },

  luggage: {
    id: "radical-storage",
    name: "Radical Storage",
    category: "luggage",
    market: "GLOBAL",
    baseUrl:
      "https://radicalstorage.tpk.lv/LwLfrsRU",
  },

  visa: {
    id: "ivisa",
    name: "iVisa",
    category: "visa",
    market: "GLOBAL",
    baseUrl:
      "https://ivisa.tpk.lv/zXqbkMmK",
  },
};

function clean(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function encode(value) {
  return encodeURIComponent(
    clean(value)
  );
}

function appendParams(
  baseUrl,
  params = {}
) {
  const entries =
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    );

  if (!entries.length) {
    return baseUrl;
  }

  const separator =
    baseUrl.includes("?")
      ? "&"
      : "?";

  const query =
    entries
      .map(
        ([key, value]) =>
          `${encodeURIComponent(
            key
          )}=${encode(
            value
          )}`
      )
      .join("&");

  return `${baseUrl}${separator}${query}`;
}

export function getAffiliate(
  category
) {
  const key =
    clean(category)
      .toLowerCase();

  return (
    AFFILIATES[key] ||
    null
  );
}

export function getAffiliateBaseUrl(
  category
) {
  return (
    getAffiliate(
      category
    )?.baseUrl || null
  );
}

export function listAffiliates() {
  return Object.values(
    AFFILIATES
  ).map(
    (affiliate) => ({
      ...affiliate,
    })
  );
}

/*
 * Flight affiliate URL
 *
 * The exact provider-specific flight-results
 * URL format can vary by approved Travelpayouts/
 * Aviasales integration. This function therefore
 * preserves the tracking URL and exposes the
 * requested search data as query parameters rather
 * than pretending an unverified provider path is
 * universal.
 *
 * The backend can replace/upgrade this URL with
 * the provider's approved deep-link format.
 */
export function buildFlightAffiliateUrl(
  search = {}
) {
  const affiliate =
    getAffiliate(
      "flights"
    );

  if (!affiliate) {
    return null;
  }

  const origin =
    search.origin?.code ||
    search.origin ||
    search.originCode ||
    "";

  const destination =
    search.destination?.code ||
    search.destination ||
    search.destinationCode ||
    "";

  const departureDate =
    search.departureDate ||
    search.departure ||
    "";

  const returnDate =
    search.returnDate ||
    search.return ||
    "";

  const tripType =
    search.tripType ||
    "roundtrip";

  const adults =
    search.adults ??
    search.passengers?.adults ??
    1;

  const children =
    search.children ??
    search.passengers?.children ??
    0;

  const infants =
    search.infants ??
    search.passengers?.infants ??
    0;

  const cabin =
    search.cabin ||
    search.cabinClass ||
    "economy";

  return appendParams(
    affiliate.baseUrl,
    {
      origin:
        clean(origin).toUpperCase(),

      destination:
        clean(
          destination
        ).toUpperCase(),

      departureDate,

      ...(tripType ===
        "roundtrip" &&
      returnDate
        ? {
            returnDate,
          }
        : {}),

      tripType,

      adults,

      children,

      infants,

      cabin,
    }
  );
}

export function buildHotelAffiliateUrl(
  options = {}
) {
  const affiliate =
    getAffiliate(
      "hotels"
    );

  if (!affiliate) {
    return null;
  }

  return appendParams(
    affiliate.baseUrl,
    {
      destination:
        options.destination ||
        options.city ||
        options.destinationCity,

      country:
        options.country ||
        options.destinationCountry,

      checkIn:
        options.checkIn ||
        options.startDate,

      checkOut:
        options.checkOut ||
        options.endDate,

      adults:
        options.adults ||
        options.guests,

      rooms:
        options.rooms,
    }
  );
}

export function buildActivitiesAffiliateUrl(
  options = {}
) {
  const affiliate =
    getAffiliate(
      "activities"
    );

  if (!affiliate) {
    return null;
  }

  return appendParams(
    affiliate.baseUrl,
    {
      destination:
        options.destination ||
        options.city,

      country:
        options.country,

      date:
        options.date ||
        options.activityDate,

      travelers:
        options.travelers ||
        options.guests,

      category:
        options.category,
    }
  );
}

export function buildEsimAffiliateUrl(
  options = {}
) {
  const affiliate =
    getAffiliate(
      "esim"
    );

  if (!affiliate) {
    return null;
  }

  return appendParams(
    affiliate.baseUrl,
    {
      destination:
        options.destination ||
        options.country,

      region:
        options.region,

      data:
        options.dataNeed ||
        options.data,

      duration:
        options.duration,
    }
  );
}

export function buildAssistanceAffiliateUrl(
  options = {}
) {
  const affiliate =
    getAffiliate(
      "assistance"
    );

  if (!affiliate) {
    return null;
  }

  return appendParams(
    affiliate.baseUrl,
    {
      departure:
        options.departure,

      arrival:
        options.arrival,

      flightDate:
        options.flightDate,

      assistanceType:
        options.assistanceType,
    }
  );
}

export function buildLuggageAffiliateUrl(
  options = {}
) {
  const affiliate =
    getAffiliate(
      "luggage"
    );

  if (!affiliate) {
    return null;
  }

  return appendParams(
    affiliate.baseUrl,
    {
      destination:
        options.destination,

      city:
        options.city,

      date:
        options.date,

      bags:
        options.bags,

      storageType:
        options.storageType,
    }
  );
}

export function buildVisaAffiliateUrl(
  options = {}
) {
  const affiliate =
    getAffiliate(
      "visa"
    );

  if (!affiliate) {
    return null;
  }

  return appendParams(
    affiliate.baseUrl,
    {
      nationality:
        options.nationality,

      destination:
        options.destination,

      purpose:
        options.purpose,

      passportType:
        options.passportType,
    }
  );
}

export function buildProviderUrl(
  category,
  options = {}
) {
  switch (
    clean(category).toLowerCase()
  ) {
    case "flights":
      return buildFlightAffiliateUrl(
        options
      );

    case "hotels":
      return buildHotelAffiliateUrl(
        options
      );

    case "activities":
      return buildActivitiesAffiliateUrl(
        options
      );

    case "esim":
      return buildEsimAffiliateUrl(
        options
      );

    case "assistance":
      return buildAssistanceAffiliateUrl(
        options
      );

    case "luggage":
      return buildLuggageAffiliateUrl(
        options
      );

    case "visa":
      return buildVisaAffiliateUrl(
        options
      );

    default:
      return null;
  }
}

export function isConfiguredAffiliate(
  category
) {
  return Boolean(
    getAffiliateBaseUrl(
      category
    )
  );
}

export default {
  getAffiliate,
  getAffiliateBaseUrl,
  listAffiliates,
  buildFlightAffiliateUrl,
  buildHotelAffiliateUrl,
  buildActivitiesAffiliateUrl,
  buildEsimAffiliateUrl,
  buildAssistanceAffiliateUrl,
  buildLuggageAffiliateUrl,
  buildVisaAffiliateUrl,
  buildProviderUrl,
  isConfiguredAffiliate,
};
