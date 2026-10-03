import React, { useState } from "react";
import { apiPost } from "../utils/api.js";

function getAirportCode(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return (
    value.iata ||
    value.iataCode ||
    value.code ||
    value.airportCode ||
    ""
  );
}

function getPrice(offer) {
  const amount =
    offer?.price?.amount ??
    offer?.price?.total ??
    offer?.price ??
    offer?.totalPrice ??
    offer?.total_price ??
    offer?.amount;

  const numericAmount = Number(amount);

  return Number.isFinite(numericAmount)
    ? numericAmount
    : null;
}

function getCurrency(offer) {
  return (
    offer?.price?.currency ||
    offer?.currency ||
    "USD"
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

function formatPrice(amount, currency) {
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

export default function FlightCard({
  offer,
  sessionId,
  onSelect,
}) {
  const [booking, setBooking] =
    useState(false);

  const amount = getPrice(offer);
  const currency = getCurrency(offer);
  const airline = getAirline(offer);

  const origin = getAirportCode(
    offer?.origin ||
      offer?.from ||
      offer?.departureAirport ||
      offer?.segments?.[0]?.origin ||
      offer?.segments?.[0]?.departure
  );

  const destination = getAirportCode(
    offer?.destination ||
      offer?.to ||
      offer?.arrivalAirport ||
      (
        Array.isArray(offer?.segments) &&
        offer.segments.length
          ? offer.segments[
              offer.segments.length - 1
            ]?.destination ||
            offer.segments[
              offer.segments.length - 1
            ]?.arrival
          : null
      )
  );

  const departure = getDeparture(offer);
  const arrival = getArrival(offer);
  const stops = getStops(offer);

  async function openBooking(event) {
    event?.preventDefault();

    if (booking) {
      return;
    }

    if (!offer) {
      alert(
        "This flight offer is unavailable."
      );
      return;
    }

    if (typeof onSelect === "function") {
      onSelect(offer);
    }

    setBooking(true);

    try {
      let trackingUrl =
        offer?.link ||
        offer?.trackingUrl ||
        null;

      let affiliateProgramId =
        offer?.affiliateProgramId ||
        null;

      if (!trackingUrl) {
        const response = await apiPost(
          "booking/resolve",
          {
            category: "flights",
            market: "GLOBAL",

            originCountry: "NG",

            destinationCountry:
              offer?.destinationCountry ||
              offer?.destination?.countryCode ||
              offer?.destination?.country_code ||
              "",

            origin,
            destination,

            sessionId:
              sessionId || null,

            offerId:
              offer?.id ||
              offer?.offerId ||
              offer?.offer_id ||
              null,

            provider:
              offer?.source ||
              offer?.provider ||
              null,

            price: amount,
            currency,
          }
        );

        trackingUrl =
          response?.trackingUrl ||
          response?.url ||
          null;

        affiliateProgramId =
          response?.affiliateProgramId ||
          null;
      }

      if (!trackingUrl) {
        throw new Error(
          "No flight booking partner is currently configured."
        );
      }

      try {
        await apiPost(
          "affiliate/click",
          {
            affiliateProgramId,
            origin,
            destination,
            category: "flights",
            market: "GLOBAL",
            sessionId:
              sessionId || null,
          }
        );
      } catch (trackingError) {
        console.warn(
          "FlyMatrix affiliate click tracking failed:",
          trackingError
        );
      }

      window.open(
        trackingUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(
        "FlyMatrix booking flow failed:",
        error
      );

      alert(
        error?.message ||
          "Unable to open the booking partner. Please try again."
      );
    } finally {
      setBooking(false);
    }
  }

  return (
    <article
      className="fm-card fm-offer fm-flight-card"
      aria-label={`${airline} flight from ${origin || "origin"} to ${
        destination || "destination"
      }`}
    >
      {/* Airline / route */}
      <div className="fm-flight-card-main">
        <div className="fm-flight-card-header">
          <span className="fm-badge">
            Flight
          </span>

          <span className="fm-flight-card-airline">
            {airline}
          </span>
        </div>

        <div className="fm-flight-route">
          <div className="fm-flight-airport">
            <strong>
              {origin || "—"}
            </strong>
            <span>Departure</span>
          </div>

          <div className="fm-flight-route-line">
            <span aria-hidden="true">
              →
            </span>
          </div>

          <div className="fm-flight-airport">
            <strong>
              {destination || "—"}
            </strong>
            <span>Arrival</span>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="fm-flight-card-info">
        <div className="fm-flight-time-block">
          <span className="fm-flight-info-label">
            Departure
          </span>

          <strong>
            {departure}
          </strong>
        </div>

        <div className="fm-flight-time-block">
          <span className="fm-flight-info-label">
            Arrival
          </span>

          <strong>
            {arrival}
          </strong>
        </div>

        <div className="fm-flight-time-block">
          <span className="fm-flight-info-label">
            Journey
          </span>

          <strong>
            {offer?.duration ||
              "Duration unavailable"}
          </strong>
        </div>

        <div className="fm-flight-time-block">
          <span className="fm-flight-info-label">
            Stops
          </span>

          <strong>
            {stops === 0
              ? "Direct"
              : `${stops} ${
                  stops === 1
                    ? "stop"
                    : "stops"
                }`}
          </strong>
        </div>
      </div>

      {/* Price / action */}
      <div className="fm-flight-card-action">
        <span className="fm-flight-info-label">
          From
        </span>

        <div className="fm-price">
          {formatPrice(
            amount,
            currency
          )}
        </div>

        <button
          type="button"
          className="fm-btn fm-primary fm-flight-book-button"
          onClick={openBooking}
          disabled={booking}
          aria-busy={booking}
        >
          {booking
            ? "Opening booking..."
            : "View / book"}
        </button>
      </div>
    </article>
  );
}
