import React from "react";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getAirportCode(airport) {
  if (!airport) return "—";

  if (typeof airport === "string") {
    return airport;
  }

  return airport.code || airport.iata || airport.iataCode || "—";
}

function getAirportName(airport) {
  if (!airport || typeof airport === "string") {
    return "";
  }

  return airport.name || airport.airportName || "";
}

function getAirportCity(airport) {
  if (!airport || typeof airport === "string") {
    return "";
  }

  return airport.city || airport.cityName || "";
}

function getCabinLabel(cabin) {
  const labels = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    premiumEconomy: "Premium Economy",
    business: "Business",
    first: "First Class",
  };

  return labels[cabin] || cabin || "Economy";
}

function getTripTypeLabel(tripType) {
  if (tripType === "oneway" || tripType === "one-way") {
    return "One way";
  }

  if (tripType === "multicity" || tripType === "multi-city") {
    return "Multi-city";
  }

  return "Round trip";
}

function getPassengerCount(search) {
  if (!search) return 1;

  if (typeof search.passengers === "number") {
    return search.passengers;
  }

  if (search.passengers?.total) {
    return search.passengers.total;
  }

  const adults = Number(search.adults ?? search.passengers?.adults ?? 1);
  const children = Number(
    search.children ?? search.passengers?.children ?? 0
  );
  const infants = Number(
    search.infants ?? search.passengers?.infants ?? 0
  );

  return adults + children + infants;
}

function getPassengerLabel(search) {
  const total = getPassengerCount(search);

  return `${total} ${total === 1 ? "traveler" : "travelers"}`;
}

export default function SearchSummary({ search, onEdit }) {
  if (!search) {
    return null;
  }

  const origin = search.origin || search.from;
  const destination = search.destination || search.to;

  const departureDate =
    search.departureDate ||
    search.departure ||
    search.departDate;

  const returnDate =
    search.returnDate ||
    search.return ||
    search.returnDateValue;

  const tripType =
    search.tripType ||
    search.type ||
    (returnDate ? "roundtrip" : "oneway");

  const cabin =
    search.cabin ||
    search.cabinClass ||
    search.travelClass ||
    "economy";

  const originCode = getAirportCode(origin);
  const destinationCode = getAirportCode(destination);

  const originName = getAirportName(origin);
  const destinationName = getAirportName(destination);

  const originCity = getAirportCity(origin);
  const destinationCity = getAirportCity(destination);

  return (
    <section className="search-summary" aria-label="Your flight search">
      <div className="search-summary-main">
        <div className="search-summary-route">
          <div className="search-summary-location">
            <span className="search-summary-label">From</span>

            <strong className="search-summary-code">
              {originCode}
            </strong>

            {(originCity || originName) && (
              <span className="search-summary-place">
                {originCity || originName}
              </span>
            )}
          </div>

          <div className="search-summary-arrow" aria-hidden="true">
            →
          </div>

          <div className="search-summary-location">
            <span className="search-summary-label">To</span>

            <strong className="search-summary-code">
              {destinationCode}
            </strong>

            {(destinationCity || destinationName) && (
              <span className="search-summary-place">
                {destinationCity || destinationName}
              </span>
            )}
          </div>
        </div>

        <div className="search-summary-details">
          <div className="search-summary-detail">
            <span className="search-summary-detail-label">
              Departure
            </span>

            <strong>
              {formatDate(departureDate)}
            </strong>
          </div>

          {tripType !== "oneway" &&
            tripType !== "one-way" &&
            returnDate && (
              <div className="search-summary-detail">
                <span className="search-summary-detail-label">
                  Return
                </span>

                <strong>
                  {formatDate(returnDate)}
                </strong>
              </div>
            )}

          <div className="search-summary-detail">
            <span className="search-summary-detail-label">
              Travelers
            </span>

            <strong>
              {getPassengerLabel(search)}
            </strong>
          </div>

          <div className="search-summary-detail">
            <span className="search-summary-detail-label">
              Cabin
            </span>

            <strong>
              {getCabinLabel(cabin)}
            </strong>
          </div>

          <div className="search-summary-detail">
            <span className="search-summary-detail-label">
              Trip
            </span>

            <strong>
              {getTripTypeLabel(tripType)}
            </strong>
          </div>
        </div>
      </div>

      {typeof onEdit === "function" && (
        <button
          type="button"
          className="btn btn-secondary search-summary-edit"
          onClick={onEdit}
          aria-label="Edit flight search"
        >
          Edit search
        </button>
      )}
    </section>
  );
}
