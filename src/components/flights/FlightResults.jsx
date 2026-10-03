import React, { useMemo } from "react";
import FlightCard from "../FlightCard.jsx";

function normalizeResults(results) {
  if (Array.isArray(results)) {
    return results;
  }

  if (!results || typeof results !== "object") {
    return [];
  }

  if (Array.isArray(results.flights)) {
    return results.flights;
  }

  if (Array.isArray(results.results)) {
    return results.results;
  }

  if (Array.isArray(results.offers)) {
    return results.offers;
  }

  if (Array.isArray(results.data)) {
    return results.data;
  }

  return [];
}

function getPrice(flight) {
  return Number(
    flight?.price?.amount ??
      flight?.price?.total ??
      flight?.totalPrice ??
      flight?.total_price ??
      flight?.amount ??
      Infinity
  );
}

function getDuration(flight) {
  const value =
    flight?.durationMinutes ??
    flight?.duration_minutes ??
    flight?.duration ??
    flight?.totalDuration ??
    flight?.total_duration;

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const hours = value.match(/(\d+)\s*h/i);
    const minutes = value.match(/(\d+)\s*m/i);

    return (
      Number(hours?.[1] || 0) * 60 +
      Number(minutes?.[1] || 0)
    );
  }

  return Infinity;
}

function getDepartureTime(flight) {
  return (
    flight?.departure?.time ||
    flight?.departureTime ||
    flight?.departure?.datetime ||
    ""
  );
}

function getArrivalTime(flight) {
  return (
    flight?.arrival?.time ||
    flight?.arrivalTime ||
    flight?.arrival?.datetime ||
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

  if (Array.isArray(flight?.segments)) {
    return Math.max(
      flight.segments.length - 1,
      0
    );
  }

  return 0;
}

function getFlightId(flight, index) {
  return (
    flight?.id ||
    flight?.offerId ||
    flight?.offer_id ||
    flight?.token ||
    flight?.reference ||
    `flight-${index}`
  );
}

export default function FlightResults({
  results = [],
  search,
  sessionId,
  sortBy = "price",
  loading = false,
}) {
  const flights = useMemo(
    () => normalizeResults(results),
    [results]
  );

  const sortedFlights = useMemo(() => {
    const list = [...flights];

    switch (sortBy) {
      case "duration":
        return list.sort(
          (a, b) =>
            getDuration(a) -
            getDuration(b)
        );

      case "departure":
        return list.sort((a, b) =>
          String(
            getDepartureTime(a)
          ).localeCompare(
            String(
              getDepartureTime(b)
            )
          )
        );

      case "arrival":
        return list.sort((a, b) =>
          String(
            getArrivalTime(a)
          ).localeCompare(
            String(
              getArrivalTime(b)
            )
          )
        );

      case "stops":
        return list.sort(
          (a, b) =>
            getStops(a) -
            getStops(b)
        );

      case "price":
      default:
        return list.sort(
          (a, b) =>
            getPrice(a) -
            getPrice(b)
        );
    }
  }, [flights, sortBy]);

  if (loading) {
    return (
      <section
        className="flight-results fm-flight-results"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="fm-results-heading">
          <div>
            <span className="fm-section-kicker">
              SEARCHING
            </span>

            <h2>Finding flights</h2>

            <p>
              Searching available flight
              options...
            </p>
          </div>
        </div>

        <div
          className="flight-results-loading fm-results-loading"
          aria-label="Loading flight results"
        >
          {[1, 2, 3].map((item) => (
            <div
              className="loading-card fm-loading-card"
              key={item}
            >
              <div className="loading-line loading-line-large" />
              <div className="loading-line" />
              <div className="loading-line loading-line-short" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!sortedFlights.length) {
    return (
      <section className="flight-results fm-flight-results">
        <div className="empty-state fm-results-empty">
          <div
            className="empty-state-icon fm-empty-icon"
            aria-hidden="true"
          >
            ✈
          </div>

          <span className="fm-section-kicker">
            SEARCH COMPLETE
          </span>

          <h2>No flights found</h2>

          <p>
            We couldn't find flights matching
            this search. Try changing your
            dates, airports, cabin, or stop
            preference.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flight-results fm-flight-results">
      <div className="fm-results-heading">
        <div>
          <span className="fm-section-kicker">
            FLIGHT SEARCH
          </span>

          <h2>
            {sortedFlights.length}{" "}
            {sortedFlights.length === 1
              ? "flight option"
              : "flight options"}
          </h2>

          <p>
            Compare available flight options
            before continuing to the booking
            partner.
          </p>
        </div>

        <div
          className="fm-results-count"
          aria-label={`${sortedFlights.length} flight options found`}
        >
          <strong>
            {sortedFlights.length}
          </strong>

          <span>
            options
          </span>
        </div>
      </div>

      <div className="fm-results-divider" />

      <div className="fm-results-context">
        <span>
          Available options
        </span>

        <span>
          Sorted by{" "}
          <strong>
            {sortBy === "price"
              ? "price"
              : sortBy}
          </strong>
        </span>
      </div>

      <div className="flight-results-list fm-results-list">
        {sortedFlights.map(
          (flight, index) => (
            <FlightCard
              key={getFlightId(
                flight,
                index
              )}
              offer={flight}
              sessionId={sessionId}
            />
          )
        )}
      </div>
    </section>
  );
}
