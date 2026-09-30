import React, { useMemo } from "react";
import FlightCard from "./FlightCard.jsx";

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

function normalizeResults(results) {
  if (Array.isArray(results)) {
    return results;
  }

  if (!results || typeof results !== "object") {
    return [];
  }

  return (
    results.flights ||
    results.results ||
    results.offers ||
    results.data ||
    []
  );
}

export default function FlightResults({
  results = [],
  search,
  sortBy = "price",
  onSelectFlight,
  loading = false,
}) {
  const flights = useMemo(
    () => normalizeResults(results),
    [results]
  );

  const sortedFlights = useMemo(() => {
    const copy = [...flights];

    const getPrice = (flight) =>
      Number(
        flight?.price?.amount ??
          flight?.price?.total ??
          flight?.totalPrice ??
          flight?.total_price ??
          flight?.amount ??
          Infinity
      );

    const getDuration = (flight) =>
      Number(
        flight?.durationMinutes ??
          flight?.duration_minutes ??
          flight?.duration ??
          Infinity
      );

    if (sortBy === "duration") {
      return copy.sort(
        (a, b) => getDuration(a) - getDuration(b)
      );
    }

    if (sortBy === "departure") {
      return copy.sort((a, b) => {
        const aTime =
          a?.departure?.time ||
          a?.departure?.datetime ||
          a?.departureTime ||
          "";

        const bTime =
          b?.departure?.time ||
          b?.departure?.datetime ||
          b?.departureTime ||
          "";

        return String(aTime).localeCompare(String(bTime));
      });
    }

    if (sortBy === "arrival") {
      return copy.sort((a, b) => {
        const aTime =
          a?.arrival?.time ||
          a?.arrival?.datetime ||
          a?.arrivalTime ||
          "";

        const bTime =
          b?.arrival?.time ||
          b?.arrival?.datetime ||
          b?.arrivalTime ||
          "";

        return String(aTime).localeCompare(String(bTime));
      });
    }

    return copy.sort((a, b) => getPrice(a) - getPrice(b));
  }, [flights, sortBy]);

  if (loading) {
    return (
      <section className="flight-results" aria-live="polite">
        <div className="flight-results-header">
          <div>
            <h2>Finding flights</h2>
            <p>
              Searching available options for your trip...
            </p>
          </div>
        </div>

        <div className="flight-results-loading">
          <div className="loading-card">
            <div className="loading-line loading-line-large" />
            <div className="loading-line" />
            <div className="loading-line loading-line-short" />
          </div>

          <div className="loading-card">
            <div className="loading-line loading-line-large" />
            <div className="loading-line" />
            <div className="loading-line loading-line-short" />
          </div>

          <div className="loading-card">
            <div className="loading-line loading-line-large" />
            <div className="loading-line" />
            <div className="loading-line loading-line-short" />
          </div>
        </div>
      </section>
    );
  }

  if (!sortedFlights.length) {
    return (
      <section className="flight-results" aria-live="polite">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            ✈
          </div>

          <h2>No flights found</h2>

          <p>
            We couldn't find matching flight options for this
            search. Try changing your dates, airports, cabin,
            or number of stops.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flight-results" aria-live="polite">
      <div className="flight-results-header">
        <div>
          <h2>
            {sortedFlights.length}{" "}
            {sortedFlights.length === 1
              ? "flight option"
              : "flight options"}
          </h2>

          <p>
            Compare available options and choose the flight
            that fits your trip.
          </p>
        </div>
      </div>

      <div className="flight-results-list">
        {sortedFlights.map((flight, index) => {
          const id = getFlightId(flight, index);

          return (
            <FlightCard
              key={id}
              flight={flight}
              search={search}
              onSelect={() => {
                if (typeof onSelectFlight === "function") {
                  onSelectFlight(flight);
                }
              }}
            />
          );
        })}
      </div>
    </section>
  );
        }
