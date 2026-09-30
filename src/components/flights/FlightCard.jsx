import React from "react";

function formatMoney(value, currency = "USD") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${Math.round(amount).toLocaleString()}`;
  }
}

function getPrice(flight) {
  const price = flight?.price;

  if (typeof price === "number") {
    return {
      amount: price,
      currency: flight?.currency || "USD",
    };
  }

  if (price && typeof price === "object") {
    return {
      amount:
        price.amount ??
        price.total ??
        price.value ??
        price.grandTotal,
      currency:
        price.currency ||
        price.currencyCode ||
        flight?.currency ||
        "USD",
    };
  }

  return {
    amount:
      flight?.totalPrice ??
      flight?.total_price ??
      flight?.amount,
    currency:
      flight?.currency ||
      flight?.currencyCode ||
      "USD",
  };
}

function formatDuration(value) {
  if (value === undefined || value === null || value === "") {
    return "Duration unavailable";
  }

  if (typeof value === "string") {
    if (value.includes("h") || value.includes("min")) {
      return value;
    }

    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return value;
    }

    value = numeric;
  }

  const minutes = Number(value);

  if (!Number.isFinite(minutes)) {
    return "Duration unavailable";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hours) {
    return `${mins}m`;
  }

  if (!mins) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return String(value);
}

function getAirportCode(value) {
  if (!value) return "—";

  if (typeof value === "string") {
    return value;
  }

  return (
    value.code ||
    value.iata ||
    value.iataCode ||
    value.airportCode ||
    "—"
  );
}

function getAirportName(value) {
  if (!value || typeof value === "string") {
    return "";
  }

  return (
    value.name ||
    value.airportName ||
    value.city ||
    ""
  );
}

function getAirportFromSegment(segment, type) {
  if (!segment) return null;

  if (type === "departure") {
    return (
      segment.departure ||
      segment.origin ||
      segment.from ||
      segment.departureAirport
    );
  }

  return (
    segment.arrival ||
    segment.destination ||
    segment.to ||
    segment.arrivalAirport
  );
}

function getSegments(flight) {
  if (Array.isArray(flight?.segments)) {
    return flight.segments;
  }

  if (Array.isArray(flight?.legs)) {
    return flight.legs;
  }

  if (Array.isArray(flight?.slices)) {
    return flight.slices.flatMap((slice) =>
      Array.isArray(slice?.segments) ? slice.segments : []
    );
  }

  return [];
}

function getFirstSegment(flight) {
  return getSegments(flight)[0] || null;
}

function getLastSegment(flight) {
  const segments = getSegments(flight);

  return segments[segments.length - 1] || null;
}

function getAirlineName(flight) {
  return (
    flight?.airline?.name ||
    flight?.airlineName ||
    flight?.carrierName ||
    flight?.carrier?.name ||
    flight?.marketingCarrier?.name ||
    flight?.airlines?.[0]?.name ||
    "Airline"
  );
}

function getAirlineCode(flight) {
  return (
    flight?.airline?.code ||
    flight?.airlineCode ||
    flight?.carrierCode ||
    flight?.carrier?.code ||
    flight?.marketingCarrier?.code ||
    flight?.airlines?.[0]?.code ||
    ""
  );
}

function getStops(flight) {
  if (typeof flight?.stops === "number") {
    return flight.stops;
  }

  if (typeof flight?.stopCount === "number") {
    return flight.stopCount;
  }

  if (typeof flight?.stop_count === "number") {
    return flight.stop_count;
  }

  const segments = getSegments(flight);

  if (segments.length > 0) {
    return Math.max(segments.length - 1, 0);
  }

  return null;
}

function getStopsLabel(stops) {
  if (stops === 0) {
    return "Direct";
  }

  if (stops === 1) {
    return "1 stop";
  }

  if (typeof stops === "number") {
    return `${stops} stops`;
  }

  return "Stops unavailable";
}

function getDeparture(flight) {
  const segment = getFirstSegment(flight);

  return (
    flight?.departure ||
    flight?.departureTime ||
    flight?.departure_datetime ||
    segment?.departureTime ||
    segment?.departure?.time ||
    segment?.departure?.datetime ||
    segment?.departure?.at ||
    segment?.departAt
  );
}

function getArrival(flight) {
  const segment = getLastSegment(flight);

  return (
    flight?.arrival ||
    flight?.arrivalTime ||
    flight?.arrival_datetime ||
    segment?.arrivalTime ||
    segment?.arrival?.time ||
    segment?.arrival?.datetime ||
    segment?.arrival?.at ||
    segment?.arriveAt
  );
}

function getOrigin(flight) {
  const segment = getFirstSegment(flight);

  return (
    flight?.origin ||
    flight?.from ||
    flight?.departureAirport ||
    segment &&
      getAirportFromSegment(segment, "departure")
  );
}

function getDestination(flight) {
  const segment = getLastSegment(flight);

  return (
    flight?.destination ||
    flight?.to ||
    flight?.arrivalAirport ||
    segment &&
      getAirportFromSegment(segment, "arrival")
  );
}

function getDuration(flight) {
  return (
    flight?.durationMinutes ??
    flight?.duration_minutes ??
    flight?.duration ??
    flight?.totalDuration ??
    flight?.total_duration ??
    getFirstSegment(flight)?.duration
  );
}

function getCabin(flight, search) {
  return (
    flight?.cabin ||
    flight?.cabinClass ||
    flight?.cabin_class ||
    search?.cabin ||
    "economy"
  );
}

function formatCabin(value) {
  const labels = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    premiumEconomy: "Premium Economy",
    business: "Business",
    first: "First Class",
  };

  return labels[value] || value || "Economy";
}

function getBaggage(flight) {
  return (
    flight?.baggage ||
    flight?.baggageAllowance ||
    flight?.baggage_allowance ||
    null
  );
}

export default function FlightCard({
  flight,
  search,
  onSelect,
}) {
  if (!flight) {
    return null;
  }

  const price = getPrice(flight);

  const origin = getOrigin(flight);
  const destination = getDestination(flight);

  const originCode = getAirportCode(origin);
  const destinationCode = getAirportCode(destination);

  const originName = getAirportName(origin);
  const destinationName = getAirportName(destination);

  const departure = getDeparture(flight);
  const arrival = getArrival(flight);

  const stops = getStops(flight);
  const duration = getDuration(flight);

  const airlineName = getAirlineName(flight);
  const airlineCode = getAirlineCode(flight);

  const baggage = getBaggage(flight);

  return (
    <article className="flight-card">
      <div className="flight-card-main">
        <div className="flight-card-airline">
          {flight?.airline?.logo ||
          flight?.airlineLogo ||
          flight?.carrier?.logo ? (
            <img
              src={
                flight?.airline?.logo ||
                flight?.airlineLogo ||
                flight?.carrier?.logo
              }
              alt=""
              className="flight-airline-logo"
              loading="lazy"
            />
          ) : (
            <div className="flight-airline-placeholder">
              ✈
            </div>
          )}

          <div>
            <strong>{airlineName}</strong>

            {airlineCode && (
              <span className="flight-airline-code">
                {airlineCode}
              </span>
            )}
          </div>
        </div>

        <div className="flight-card-route">
          <div className="flight-time-block">
            <strong className="flight-time">
              {formatTime(departure)}
            </strong>

            <span className="flight-airport-code">
              {originCode}
            </span>

            {originName && (
              <span className="flight-airport-name">
                {originName}
              </span>
            )}
          </div>

          <div className="flight-route-line">
            <span className="flight-duration">
              {formatDuration(duration)}
            </span>

            <div className="flight-line" aria-hidden="true">
              <span className="flight-line-dot" />
              <span className="flight-line-arrow">✈</span>
              <span className="flight-line-dot" />
            </div>

            <span className="flight-stops">
              {getStopsLabel(stops)}
            </span>
          </div>

          <div className="flight-time-block">
            <strong className="flight-time">
              {formatTime(arrival)}
            </strong>

            <span className="flight-airport-code">
              {destinationCode}
            </span>

            {destinationName && (
              <span className="flight-airport-name">
                {destinationName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flight-card-side">
        <div className="flight-card-price">
          <span className="flight-price-label">
            From
          </span>

          <strong>
            {formatMoney(
              price.amount,
              price.currency
            )}
          </strong>

          <span className="flight-price-note">
            Provider price
          </span>
        </div>

        <div className="flight-card-meta">
          <span>{formatCabin(getCabin(flight, search))}</span>

          {baggage && (
            <span>
              {typeof baggage === "string"
                ? baggage
                : "Baggage details"}
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary flight-select-button"
          onClick={() => {
            if (typeof onSelect === "function") {
              onSelect(flight);
            }
          }}
        >
          View flight
        </button>
      </div>
    </article>
  );
      }
