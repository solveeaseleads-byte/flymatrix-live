import React from "react";

import { apiPost } from "../utils/api.js";

export default function FlightCard({
  offer,
  sessionId
}) {
  const amount = Number(
    offer?.price?.amount ??
    offer?.price ??
    0
  );

  const currency =
    offer?.price?.currency ||
    offer?.currency ||
    "USD";

  const airline =
    offer?.airline?.name ||
    offer?.airlineName ||
    offer?.airline?.code ||
    "Airline";

  const origin =
    offer?.origin?.iata ||
    offer?.origin ||
    "";

  const destination =
    offer?.destination?.iata ||
    offer?.destination ||
    "";

  const departure =
    offer?.departure?.time ||
    offer?.departureTime ||
    "—";

  const arrival =
    offer?.arrival?.time ||
    offer?.arrivalTime ||
    "—";

  async function openBooking() {
    try {
      let trackingUrl =
        offer?.link || null;

      let affiliateProgramId =
        offer?.affiliateProgramId || null;

      if (!trackingUrl) {
        const response =
          await apiPost(
            "booking/resolve",
            {
              category: "flights",
              market: "GLOBAL",
              originCountry: "NG",
              destinationCountry:
                offer?.destinationCountry || "",
              origin,
              destination,
              sessionId
            }
          );

        trackingUrl =
          response.trackingUrl;

        affiliateProgramId =
          response.affiliateProgramId;
      }

      if (!trackingUrl) {
        throw new Error(
          "No booking partner is configured."
        );
      }

      await apiPost(
        "affiliate/click",
        {
          affiliateProgramId,
          origin,
          destination,
          category: "flights",
          market: "GLOBAL",
          sessionId
        }
      ).catch(() => {});

      window.open(
        trackingUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <article className="fm-card fm-offer">

      <div>
        <span className="fm-badge">
          Flight
        </span>

        <h3>{airline}</h3>

        <div className="fm-meta">
          {origin} → {destination}
        </div>
      </div>

      <div className="fm-meta">
        <strong>{departure}</strong>
        {" → "}
        <strong>{arrival}</strong>

        <br />

        {offer?.duration ||
          "Duration unavailable"}

        {" · "}

        {offer?.stops ?? 0}
        {" stop(s)"}
      </div>

      <div>
        <div className="fm-price">
          {currency}{" "}
          {amount.toLocaleString()}
        </div>

        <button
          className="fm-btn fm-primary"
          onClick={openBooking}
        >
          View / book
        </button>
      </div>

    </article>
  );
}
