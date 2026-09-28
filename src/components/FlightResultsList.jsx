import React from "react";

import FlightCard from "./FlightCard.jsx";

export default function FlightResultsList({
  data
}) {
  if (!data) {
    return null;
  }

  const results =
    data.results || [];

  if (!results.length) {
    return (
      <div className="fm-card fm-loading">
        No live offers were returned.
      </div>
    );
  }

  return (
    <div className="fm-results">
      {results.map(
        (offer, index) => (
          <FlightCard
            key={
              offer.id ||
              `offer-${index}`
            }
            offer={offer}
            sessionId={data.sessionId}
          />
        )
      )}
    </div>
  );
}
