import React, { useMemo } from "react";
import { navigate } from "../router/AppRouter.jsx";
import FlightCard from "../components/FlightCard.jsx";

function readSessionStorage(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredFlight() {
  return readSessionStorage("flymatrix:selectedFlight");
}

function getStoredSearch() {
  return readSessionStorage("flymatrix:lastSearch");
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
  if (!value) {
    return "—";
  }

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
  const segments = offer?.segments;

  return (
    offer?.origin ||
    offer?.from ||
    offer?.departureAirport ||
    (Array.isArray(segments) && segments.length > 0
      ? segments[0]?.origin ||
        segments[0]?.departure
      : null)
  );
}

function getDestination(offer) {
  const segments = offer?.segments;

  if (Array.isArray(segments) && segments.length > 0) {
    const finalSegment =
      segments[segments.length - 1];

    return (
      offer?.destination ||
      offer?.to ||
      offer?.arrivalAirport ||
      finalSegment?.destination ||
      finalSegment?.arrival
    );
  }

  return (
    offer?.destination ||
    offer?.to ||
    offer?.arrivalAirport ||
    null
  );
}

function getAirline(offer) {
  return (
    offer?.airline?.name ||
    offer?.airlineName ||
    offer?.carrier?.name ||
    offer?.carrierName ||
    offer?.airline?.code ||
    offer?.carrier?.code ||
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
    offer?.segments?.[0]?.departure?.datetime ||
    "—"
  );
}

function getArrival(offer) {
  const segments = offer?.segments;

  if (Array.isArray(segments) && segments.length > 0) {
    const finalSegment =
      segments[segments.length - 1];

    return (
      finalSegment?.arrivalTime ||
      finalSegment?.arrival?.time ||
      finalSegment?.arrival?.datetime ||
      offer?.arrival?.time ||
      offer?.arrivalTime ||
      offer?.arrival?.datetime ||
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
    return Math.max(0, offer.stops);
  }

  if (typeof offer?.stopCount === "number") {
    return Math.max(0, offer.stopCount);
  }

  if (typeof offer?.stop_count === "number") {
    return Math.max(0, offer.stop_count);
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
  const normalized = String(
    cabin || "economy"
  ).trim();

  const labels = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    premiumEconomy: "Premium Economy",
    business: "Business",
    first: "First Class",
  };

  return labels[normalized] || normalized || "Economy";
}

function getSessionId(search) {
  try {
    return (
      search?.sessionId ||
      sessionStorage.getItem(
        "flymatrix:sessionId"
      ) ||
      sessionStorage.getItem(
        "flymatrix:searchSessionId"
      ) ||
      ""
    );
  } catch {
    return search?.sessionId || "";
  }
}

function getSearchId(search) {
  return search?.searchId || "";
}

function getSegments(offer) {
  return Array.isArray(offer?.segments)
    ? offer.segments
    : [];
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
    () => getSessionId(search),
    [search]
  );

  const searchId = useMemo(
    () => getSearchId(search),
    [search]
  );

  if (!offer) {
    return (
      <div className="page-container fm-flight-details-page">
        <section className="empty-state fm-flight-details-empty">
          <div
            className="empty-state-icon"
            aria-hidden="true"
          >
            ✈
          </div>

          <span className="fm-section-kicker">
            FLIGHT SELECTION
          </span>

          <h1>
            Flight details unavailable
          </h1>

          <p>
            This flight selection is no
            longer available in this
            browser session.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/search")}
          >
            Search flights again
          </button>
        </section>
      </div>
    );
  }

  const origin = getOrigin(offer);
  const destination = getDestination(offer);

  const originCode = getAirportCode(origin);
  const destinationCode =
    getAirportCode(destination);

  const originName = getAirportName(origin);
  const destinationName =
    getAirportName(destination);

  const airline = getAirline(offer);
  const departure = getDeparture(offer);
  const arrival = getArrival(offer);
  const stops = getStops(offer);
  const cabin = getCabin(offer, search);
  const segments = getSegments(offer);

  const backToResultsUrl = searchId
    ? `/search?searchId=${encodeURIComponent(
        searchId
      )}`
    : "/search";

  return (
    <div className="page-container fm-flight-details-page">
      <div className="page-heading fm-flight-details-heading">
        <button
          type="button"
          className="btn btn-secondary fm-back-button"
          onClick={() => navigate(backToResultsUrl)}
        >
          ← Back to results
        </button>

        <div className="fm-flight-details-title">
          <span className="fm-badge">
            Flight details
          </span>

          <span className="fm-section-kicker">
            SELECTED FLIGHT
          </span>

          <h1>
            {originCode} → {destinationCode}
          </h1>

          <p>
            Review the selected flight
            before continuing to the
            booking partner.
          </p>
        </div>
      </div>

      <section className="flight-detail-card fm-flight-detail-card">
        <div className="flight-detail-header fm-flight-detail-header">
          <div>
            <span className="fm-badge">
              {airline}
            </span>

            <h2>
              {originCode} → {destinationCode}
            </h2>

            <p className="fm-flight-detail-route-caption">
              Selected itinerary
            </p>
          </div>

          <div className="flight-detail-price fm-flight-detail-price">
            {formatPrice(offer)}
          </div>
        </div>

        <div className="flight-detail-route fm-flight-detail-route">
          <div className="flight-detail-point fm-flight-detail-point">
            <span className="flight-detail-label">
              Departure
            </span>

            <strong>
              {formatDateTime(departure)}
            </strong>

            <span>{originCode}</span>

            {originName && (
              <small>{originName}</small>
            )}
          </div>

          <div
            className="flight-detail-connector fm-flight-detail-connector"
            aria-hidden="true"
          >
            ✈
          </div>

          <div className="flight-detail-point fm-flight-detail-point">
            <span className="flight-detail-label">
              Arrival
            </span>

            <strong>
              {formatDateTime(arrival)}
            </strong>

            <span>{destinationCode}</span>

            {destinationName && (
              <small>{destinationName}</small>
            )}
          </div>
        </div>

        <div className="flight-detail-meta fm-flight-detail-meta">
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
          <div className="flight-segments fm-flight-segments">
            <div className="fm-flight-section-heading">
              <div>
                <span className="fm-section-kicker">
                  JOURNEY
                </span>

                <h3>
                  Journey segments
                </h3>
              </div>

              <span className="fm-flight-segment-count">
                {segments.length}{" "}
                {segments.length === 1
                  ? "segment"
                  : "segments"}
              </span>
            </div>

            <div className="fm-flight-segment-list">
              {segments.map(
                (segment, index) => {
                  const segmentOrigin =
                    segment?.origin ||
                    segment?.departure;

                  const segmentDestination =
                    segment?.destination ||
                    segment?.arrival;

                  const segmentKey =
                    segment?.id ||
                    `${index}-${getAirportCode(
                      segmentOrigin
                    )}-${getAirportCode(
                      segmentDestination
                    )}`;

                  return (
                    <div
                      className="flight-segment fm-flight-segment"
                      key={segmentKey}
                    >
                      <div className="fm-flight-segment-route">
                        <strong>
                          {getAirportCode(
                            segmentOrigin
                          )}
                          {" → "}
                          {getAirportCode(
                            segmentDestination
                          )}
                        </strong>
                      </div>

                      {segment?.duration && (
                        <span>
                          {segment.duration}
                        </span>
                      )}

                      {(segment?.carrier?.name ||
                        segment?.airline?.name) && (
                        <span>
                          {segment?.carrier?.name ||
                            segment?.airline?.name}
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        <div className="flight-detail-booking fm-flight-detail-booking">
          <div className="fm-booking-copy">
            <span className="fm-section-kicker">
              NEXT STEP
            </span>

            <strong>
              Continue to booking
            </strong>

            <p>
              FlyMatrix will use the
              selected flight information
              and the configured affiliate
              tracking flow to open the
              booking partner.
            </p>

            {offer?.source && (
              <small>
                Source: {offer.source}
              </small>
            )}
          </div>

          <div className="fm-booking-action">
            <FlightCard
              offer={offer}
              sessionId={
                sessionId || searchId
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
