function durationMinutes(value = "") {
  const match = String(value).match(
    /PT(?:(\d+)H)?(?:(\d+)M)?/
  );

  if (!match) {
    return null;
  }

  return (
    Number(match[1] || 0) * 60 +
    Number(match[2] || 0)
  );
}

function durationLabel(minutes) {
  if (minutes == null) {
    return null;
  }

  return `${Math.floor(minutes / 60)}h ${
    minutes % 60
  }m`;
}

export function normalizeDuffelOffer(
  offer
) {
  const slice =
    offer?.slices?.[0];

  const segments =
    slice?.segments || [];

  const segment =
    segments[0];

  const duration =
    durationMinutes(
      slice?.duration ||
      segment?.duration
    );

  return {
    id: offer?.id,

    source: "duffel",

    price: {
      amount: Number(
        offer?.total_amount || 0
      ),

      currency:
        offer?.total_currency ||
        "USD"
    },

    airline: {
      name:
        segment?.marketing_carrier
          ?.name ||
        "Airline",

      code:
        segment?.marketing_carrier
          ?.iata_code ||
        ""
    },

    origin: {
      iata:
        segment?.origin
          ?.iata_code ||
        "",

      name:
        segment?.origin
          ?.city_name ||
        segment?.origin
          ?.name ||
        ""
    },

    destination: {
      iata:
        segment?.destination
          ?.iata_code ||
        "",

      name:
        segment?.destination
          ?.city_name ||
        segment?.destination
          ?.name ||
        ""
    },

    departure: {
      time:
        segment?.departing_at ||
        ""
    },

    arrival: {
      time:
        segment?.arriving_at ||
        ""
    },

    duration:
      durationLabel(duration),

    stops:
      Math.max(
        0,
        segments.length - 1
      ),

    raw: offer
  };
}

export function normalizeTravelpayoutsOffer(
  item
) {
  return {
    id: String(
      item?.id ||
      `${item?.airline || "tp"}-${
        item?.flight_number || ""
      }`
    ),

    source:
      "travelpayouts",

    price: {
      amount: Number(
        item?.price ??
        item?.value ??
        0
      ),

      currency:
        item?.currency ||
        "USD"
    },

    airline: {
      name:
        item?.airline ||
        item?.airline_name ||
        "Airline",

      code:
        item?.airline ||
        ""
    },

    origin: {
      iata:
        item?.origin ||
        "",

      name: ""
    },

    destination: {
      iata:
        item?.destination ||
        "",

      name: ""
    },

    departure: {
      time:
        item?.departure_at ||
        item?.departure_time ||
        ""
    },

    arrival: {
      time:
        item?.arrival_at ||
        item?.arrival_time ||
        ""
    },

    duration:
      item?.duration ||
      null,

    stops:
      Number(
        item?.transfers ||
        item?.stops ||
        0
      ),

    link:
      item?.link ||
      null,

    raw: item
  };
}
