import React, { useMemo } from "react";
import { navigate } from "../router/AppRouter.jsx";
import FlightCard from "../components/FlightCard.jsx";

function getStoredFlight() {
  try {
    const raw = sessionStorage.getItem(
      "flymatrix:selectedFlight"
    );

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredSearch() {
  try {
    const raw = sessionStorage.getItem(
      "flymatrix:lastSearch"
    );

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getPrice(offer) {
  const amount =
    offer?.price?.amount ??
    offer?.price?.total ??
    offer?.price ??
    offer?.totalPrice ??
    offer?.total_price ??
    offer?.amount;

  const currency =
    offer?.price?.currency ||
    offer?.currency ||
    "USD";

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return {
      amount: null,
      currency,
    };
  }

  return {
    amount: numericAmount,
    currency,
  };
}

function formatPrice(offer) {
  const { amount, currency } = getPrice(offer);

  if (amount === null) {
    return "Price unavailable";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function getAirportCode(value) {
  if (!value) return "—";

  if (typeof value === "string") {
    return value;
  }

  return (
    value.iata ||
    value.iataCode ||
    value.code ||
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

function getOrigin(offer) {
  return (
    offer?.origin ||
    offer?.from ||
    offer?.departureAirport ||
    offer?.segments?.[0]?.origin ||
    offer?.segments?.[0]?.departure
  );
}

function getDestination(offer) {
  const segments = offer?.segments;

  return (
    offer?.destination ||
    offer?.to ||
    offer?.arrivalAirport ||
    (
      Array.isArray(segments) &&
      segments.length
        ? segments[segments.length - 1]?.destination ||
          segments[segments.length - 1]?.arrival
        : null
    )
  );
}

function getAirline(offer) {
  return (
    offer?.airline?.name ||
    offer?.airlineName ||
    offer?.carrier?.name ||
    offer?.carrierName ||
    offer?.airline?.code ||
    "Airline"
  );
}

function getDeparture(offer) {
  return (
    offer?.departure?.time ||
    offer?.departureTime ||
    offer?.departure?.datetime ||
    offer?.segments?.[0]?.departureTime ||
    offer?.segments?.[0]?.departure?.time ||
    "—"
  );
}

function getArrival(offer) {
  const segments = offer?.segments;

  if (Array.isArray(segments) && segments.length) {
    const finalSegment =
      segments[segments.length - 1];

    return (
      finalSegment?.arrivalTime ||
      finalSegment?.arrival?.time ||
      finalSegment?.arrival?.datetime ||
      offer?.arrival?.time ||
      offer?.arrivalTime ||
      "—"
    );
  }

  return (
    offer?.arrival?.time ||
    offer?.arrivalTime ||
    offer?.arrival?.datetime ||
    "—"
  );
}

function formatDateTime(value) {
  if (!value || value === "—") {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStops(offer) {
  if (typeof offer?.stops === "number") {
    return offer.stops;
  }

  if (typeof offer?.stopCount === "number") {
    return offer.stopCount;
  }

  if (typeof offer?.stop_count === "number") {
    return offer.stop_count;
  }

  if (Array.isArray(offer?.segments)) {
    return Math.max(
      offer.segments.length - 1,
      0
    );
  }

  return 0;
}

function getStopsLabel(stops) {
  if (stops === 0) {
    return "Direct";
  }

  if (stops === 1) {
    return "1 stop";
  }

  return `${stops} stops`;
}

function getCabin(offer, search) {
  return (
    offer?.cabin ||
    offer?.cabinClass ||
    offer?.cabin_class ||
    search?.cabin ||
    "economy"
  );
}

function formatCabin(cabin) {
  const labels = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    premiumEconomy: "Premium Economy",
    business: "Business",
    first: "First Class",
  };

  return labels[cabin] || cabin || "Economy";
}

function getSessionId() {
  try {
    return (
      sessionStorage.getItem(
        "flymatrix:sessionId"
      ) ||
      sessionStorage.getItem(
        "flymatrix:searchSessionId"
      ) ||
      ""
    );
  } catch {
    return "";
  }
}

export default function FlightDetailsPage() {
  const offer = useMemo(
    () => getStoredFlight(),
    []
  );

  const search = useMemo(
    () => getStoredSearch(),
    []
  );

  const sessionId = useMemo(
    () => getSessionId(),
    []
  );

  if (!offer) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <div
            className="empty-state-icon"
            aria-hidden="true"
          >
            ✈
          </div>

          <h1>Flight details unavailable</h1>

          <p>
            This flight selection is no longer
            available in this browser session.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/search")}
          >
            Search flights again
          </button>
        </section>
      </main>
    );
  }

  const origin = getOrigin(offer);
  const destination = getDestination(offer);

  const originCode =
    getAirportCode(origin);

  const destinationCode =
    getAirportCode(destination);

  const originName =
    getAirportName(origin);

  const destinationName =
    getAirportName(destination);

  const airline =
    getAirline(offer);

  const departure =
    getDeparture(offer);

  const arrival =
    getArrival(offer);

  const stops =
    getStops(offer);

  const cabin =
    getCabin(offer, search);

  const segments =
    Array.isArray(offer?.segments)
      ? offer.segments
      : [];

  return (
    <main className="page-container">
      <div className="page-heading">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/search")}
        >
          ← Back to results
        </button>

        <div>
          <span className="fm-badge">
            Flight details
          </span>

          <h1>
            {originCode} → {destinationCode}
          </h1>

          <p>
            Review the selected flight before
            continuing to the booking partner.
          </p>
        </div>
      </div>

      <section className="flight-detail-card">
        <div className="flight-detail-header">
          <div>
            <span className="fm-badge">
              {airline}
            </span>

            <h2>
              {originCode} → {destinationCode}
            </h2>
          </div>

          <div className="flight-detail-price">
            {formatPrice(offer)}
          </div>
        </div>

        <div className="flight-detail-route">
          <div className="flight-detail-point">
            <span className="flight-detail-label">
              Departure
            </span>

            <strong>
              {formatDateTime(departure)}
            </strong>

            <span>
              {originCode}
            </span>

            {originName && (
              <small>{originName}</small>
            )}
          </div>

          <div
            className="flight-detail-connector"
            aria-hidden="true"
          >
            ✈
          </div>

          <div className="flight-detail-point">
            <span className="flight-detail-label">
              Arrival
            </span>

            <strong>
              {formatDateTime(arrival)}
            </strong>

            <span>
              {destinationCode}
            </span>

            {destinationName && (
              <small>{destinationName}</small>
            )}
          </div>
        </div>

        <div className="flight-detail-meta">
          <div>
            <span>Stops</span>
            <strong>
              {getStopsLabel(stops)}
            </strong>
          </div>

          <div>
            <span>Cabin</span>
            <strong>
              {formatCabin(cabin)}
            </strong>
          </div>

          {offer?.duration && (
            <div>
              <span>Duration</span>
              <strong>
                {offer.duration}
              </strong>
            </div>
          )}
        </div>

        {segments.length > 0 && (
          <div className="flight-segments">
            <h3>Journey segments</h3>

            {segments.map((segment, index) => {
              const segmentOrigin =
                segment?.origin ||
                segment?.departure;

              const segmentDestination =
                segment?.destination ||
                segment?.arrival;

              return (
                <div
                  className="flight-segment"
                  key={
                    segment?.id ||
                    `${index}-${getAirportCode(
                      segmentOrigin
                    )}-${getAirportCode(
                      segmentDestination
                    )}`
                  }
                >
                  <strong>
                    {getAirportCode(
                      segmentOrigin
                    )}
                    {" → "}
                    {getAirportCode(
                      segmentDestination
                    )}
                  </strong>

                  {segment?.duration && (
                    <span>
                      {segment.duration}
                    </span>
                  )}

                  {segment?.carrier?.name && (
                    <span>
                      {segment.carrier.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flight-detail-booking">
          <div>
            <strong>
              Continue to booking
            </strong>

            <p>
              FlyMatrix will use the selected
              flight information and your existing
              affiliate tracking flow to open the
              booking partner.
            </p>
          </div>

          <FlightCard
            offer={offer}
            sessionId={sessionId}
          />
        </div>
      </section>
    </main>
  );
      }
