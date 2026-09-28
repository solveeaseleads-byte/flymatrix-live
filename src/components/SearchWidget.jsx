import React, { useState } from "react";

import { apiFetch } from "../utils/api.js";

const AIRPORTS = [
  ["Lagos", "LOS"],
  ["Abuja", "ABV"],
  ["Port Harcourt", "PHC"],
  ["Accra", "ACC"],
  ["London", "LHR"],
  ["New York", "JFK"],
  ["Toronto", "YYZ"],
  ["Dubai", "DXB"],
  ["Johannesburg", "JNB"],
  ["Paris", "CDG"],
  ["Amsterdam", "AMS"],
  ["Frankfurt", "FRA"]
];

function extractIata(value) {
  const match =
    String(value).match(
      /\(([A-Za-z]{3})\)/
    );

  if (match) {
    return match[1].toUpperCase();
  }

  return String(value)
    .trim()
    .toUpperCase();
}

export default function SearchWidget({
  initial,
  onResults
}) {
  const [origin, setOrigin] =
    useState(initial?.origin || "LOS");

  const [destination, setDestination] =
    useState(initial?.destination || "JFK");

  const [date, setDate] =
    useState(
      initial?.date ||
      new Date(
        Date.now() +
        7 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .slice(0, 10)
    );

  const [returnDate, setReturnDate] =
    useState("");

  const [passengers, setPassengers] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit(event) {
    event.preventDefault();

    setError("");

    const originCode =
      extractIata(origin);

    const destinationCode =
      extractIata(destination);

    try {
      setLoading(true);

      const data = await apiFetch(
        "flights",
        {
          origin: originCode,
          destination: destinationCode,
          departureDate: date,
          returnDate,
          passengers,
          cabin: "economy",
          currency: "USD"
        }
      );

      onResults?.(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="fm-card fm-search"
      onSubmit={submit}
    >
      <div className="fm-grid">

        <div className="fm-field">
          <label>From</label>

          <input
            list="fm-airports"
            value={origin}
            onChange={(e) =>
              setOrigin(e.target.value)
            }
            placeholder="LOS or Lagos (LOS)"
            required
          />
        </div>

        <div className="fm-field">
          <label>To</label>

          <input
            list="fm-airports"
            value={destination}
            onChange={(e) =>
              setDestination(e.target.value)
            }
            placeholder="JFK or New York (JFK)"
            required
          />
        </div>

      </div>

      <datalist id="fm-airports">
        {AIRPORTS.map(
          ([name, code]) => (
            <option
              key={code}
              value={`${name} (${code})`}
            />
          )
        )}
      </datalist>

      <div
        className="fm-grid-4"
        style={{ marginTop: 14 }}
      >

        <div className="fm-field">
          <label>Departure</label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
          />
        </div>

        <div className="fm-field">
          <label>Return</label>

          <input
            type="date"
            value={returnDate}
            onChange={(e) =>
              setReturnDate(e.target.value)
            }
          />
        </div>

        <div className="fm-field">
          <label>Passengers</label>

          <select
            value={passengers}
            onChange={(e) =>
              setPassengers(
                Number(e.target.value)
              )
            }
          >
            {Array.from(
              { length: 9 },
              (_, i) => i + 1
            ).map((number) => (
              <option
                key={number}
                value={number}
              >
                {number}
              </option>
            ))}
          </select>
        </div>

        <div className="fm-actions">
          <button
            className="fm-btn fm-primary"
            disabled={loading}
            type="submit"
          >
            {loading
              ? "Searching..."
              : "Search flights"}
          </button>
        </div>

      </div>

      {error && (
        <div className="fm-error">
          {error}
        </div>
      )}
    </form>
  );
}
