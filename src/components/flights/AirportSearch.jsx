import React, { useEffect, useRef, useState } from "react";

const FALLBACK_AIRPORTS = [
  {
    code: "LOS",
    name: "Murtala Muhammed International Airport",
    city: "Lagos",
    country: "Nigeria",
    countryCode: "NG",
    type: "airport",
  },
  {
    code: "ABV",
    name: "Nnamdi Azikiwe International Airport",
    city: "Abuja",
    country: "Nigeria",
    countryCode: "NG",
    type: "airport",
  },
  {
    code: "KAN",
    name: "Mallam Aminu Kano International Airport",
    city: "Kano",
    country: "Nigeria",
    countryCode: "NG",
    type: "airport",
  },
  {
    code: "PHC",
    name: "Port Harcourt International Airport",
    city: "Port Harcourt",
    country: "Nigeria",
    countryCode: "NG",
    type: "airport",
  },
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    type: "airport",
  },
  {
    code: "LGW",
    name: "London Gatwick Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    type: "airport",
  },
  {
    code: "STN",
    name: "London Stansted Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    type: "airport",
  },
  {
    code: "LTN",
    name: "London Luton Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    type: "airport",
  },
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    countryCode: "US",
    type: "airport",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    type: "airport",
  },
  {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    type: "airport",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    type: "airport",
  },
  {
    code: "CDG",
    name: "Paris Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    type: "airport",
  },
];

function normalizeAirport(item) {
  if (!item) return null;

  return {
    code:
      item.code ||
      item.iata ||
      item.iataCode ||
      "",
    name:
      item.name ||
      item.airportName ||
      item.label ||
      "",
    city:
      item.city ||
      item.cityName ||
      "",
    country:
      item.country ||
      item.countryName ||
      "",
    countryCode:
      item.countryCode ||
      item.country_code ||
      "",
    type:
      item.type ||
      "airport",
  };
}

function airportSearchText(airport) {
  return [
    airport.code,
    airport.name,
    airport.city,
    airport.country,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreAirport(airport, query) {
  const q = query.trim().toLowerCase();

  if (!q) return 0;

  const code = airport.code.toLowerCase();
  const city = airport.city.toLowerCase();
  const name = airport.name.toLowerCase();
  const country =
    airport.country.toLowerCase();

  if (code === q) return 1000;
  if (city === q) return 900;
  if (name === q) return 800;
  if (country === q) return 500;

  if (code.startsWith(q)) return 700;
  if (city.startsWith(q)) return 650;
  if (name.startsWith(q)) return 600;

  if (city.includes(q)) return 450;
  if (name.includes(q)) return 400;
  if (country.includes(q)) return 300;

  return 0;
}

function rankAirports(items, query) {
  return [...items]
    .map((airport) => ({
      airport,
      score: scoreAirport(
        airport,
        query
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.airport.city.localeCompare(
        b.airport.city
      );
    })
    .map((item) => item.airport);
}

function deduplicateAirports(items) {
  const map = new Map();

  items.forEach((item) => {
    const airport = normalizeAirport(item);

    if (!airport.code) return;

    const key = airport.code.toUpperCase();

    if (!map.has(key)) {
      map.set(key, airport);
    }
  });

  return Array.from(map.values());
}

function getNearbyOrLocalResults(
  airports,
  query
) {
  const q = query.trim().toLowerCase();

  if (!q) {
    return airports.slice(0, 10);
  }

  /*
   * A city may have several airports.
   * Keep all matching airports so a user searching
   * "London" can see LHR, LGW, STN, LTN, etc.
   */
  const exactCityMatches = airports.filter(
    (airport) =>
      airport.city.toLowerCase() === q
  );

  const cityMatches = airports.filter(
    (airport) =>
      airport.city
        .toLowerCase()
        .startsWith(q)
  );

  const ranked = rankAirports(
    airports,
    query
  );

  return deduplicateAirports([
    ...exactCityMatches,
    ...cityMatches,
    ...ranked,
  ]).slice(0, 12);
}

export default function AirportSearch({
  id,
  value,
  onChange,
  placeholder = "City or airport",
  ariaLabel,
  disabled = false,
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(0);

  const [query, setQuery] = useState(
    value
      ? `${value.city || ""}${
          value.code
            ? ` (${value.code})`
            : ""
        }`
      : ""
  );

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [isOpen, setIsOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }

    setQuery(
      value.city
        ? `${value.city}${
            value.code
              ? ` (${value.code})`
              : ""
          }`
        : value.code || ""
    );
  }, [value]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  async function searchAirports(searchTerm) {
    const term =
      searchTerm.trim();

    if (!term) {
      setResults(
        FALLBACK_AIRPORTS.slice(0, 8)
      );
      return;
    }

    const requestId =
      ++requestRef.current;

    setLoading(true);
    setError("");

    try {
      /*
       * Primary source:
       * backend global airport search.
       *
       * This keeps the frontend independent from
       * a small hard-coded airport list.
       */
      const response = await fetch(
        `/api/destinations?search=${encodeURIComponent(
          term
        )}`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Airport API returned ${response.status}`
        );
      }

      const data =
        await response.json();

      if (
        requestId !==
        requestRef.current
      ) {
        return;
      }

      const apiItems =
        Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.destinations)
          ? data.destinations
          : Array.isArray(data.airports)
          ? data.airports
          : [];

      const normalized =
        deduplicateAirports(
          apiItems
        );

      /*
       * Include fallback results as a safety net,
       * but only when the backend does not return
       * enough useful results.
       */
      const combined =
        deduplicateAirports([
          ...normalized,
          ...getNearbyOrLocalResults(
            FALLBACK_AIRPORTS,
            term
          ),
        ]);

      const ranked =
        rankAirports(
          combined,
          term
        );

      setResults(
        ranked.length
          ? ranked.slice(0, 12)
          : getNearbyOrLocalResults(
              combined,
              term
            )
      );
    } catch (requestError) {
      if (
        requestId !==
        requestRef.current
      ) {
        return;
      }

      console.warn(
        "FlyMatrix airport search:",
        requestError
      );

      const fallback =
        getNearbyOrLocalResults(
          FALLBACK_AIRPORTS,
          term
        );

      setResults(fallback);

      if (!fallback.length) {
        setError(
          "Airport search is temporarily unavailable."
        );
      }
    } finally {
      if (
        requestId ===
        requestRef.current
      ) {
        setLoading(false);
      }
    }
  }

  function handleFocus() {
    setIsOpen(true);

    if (!query.trim()) {
      setResults(
        FALLBACK_AIRPORTS.slice(0, 8)
      );
    }
  }

  function handleInputChange(event) {
    const nextValue =
      event.target.value;

    setQuery(nextValue);
    setIsOpen(true);

    /*
     * Clearing the input also clears the selected
     * normalized airport object.
     */
    if (!nextValue.trim()) {
      onChange?.(null);
      setResults(
        FALLBACK_AIRPORTS.slice(0, 8)
      );
      return;
    }

    /*
     * Debounce backend requests so typing "London"
     * does not create six immediate requests.
     */
    if (
      inputRef.current
        ?.airportSearchTimer
    ) {
      clearTimeout(
        inputRef.current
          .airportSearchTimer
      );
    }

    const timer = setTimeout(() => {
      searchAirports(nextValue);
    }, 250);

    if (inputRef.current) {
      inputRef.current.airportSearchTimer =
        timer;
    }
  }

  function handleSelect(airport) {
    const normalized =
      normalizeAirport(airport);

    setQuery(
      normalized.city
        ? `${normalized.city}${
            normalized.code
              ? ` (${normalized.code})`
              : ""
          }`
        : normalized.code
    );

    setIsOpen(false);
    setError("");

    onChange?.(normalized);
  }

  function handleKeyDown(event) {
    if (
      event.key === "Escape"
    ) {
      setIsOpen(false);
      return;
    }

    if (
      event.key === "Enter" &&
      results.length
    ) {
      event.preventDefault();
      handleSelect(results[0]);
    }
  }

  return (
    <div
      ref={containerRef}
      className="airport-search"
    >
      <div className="airport-input-wrapper">
        <span
          className="airport-input-icon"
          aria-hidden="true"
        >
          ✈
        </span>

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          disabled={disabled}
          autoComplete="off"
          placeholder={placeholder}
          aria-label={
            ariaLabel || placeholder
          }
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
          onFocus={handleFocus}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        {loading && (
          <span
            className="airport-loading"
            aria-label="Searching airports"
          >
            …
          </span>
        )}

        {query && !loading && (
          <button
            type="button"
            className="airport-clear"
            aria-label="Clear airport"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(true);
              onChange?.(null);
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="airport-dropdown"
          role="listbox"
        >
          {loading && (
            <div className="airport-status">
              Searching airports…
            </div>
          )}

          {!loading &&
            results.length > 0 && (
              <>
                {results.map(
                  (airport) => (
                    <button
                      type="button"
                      key={`${airport.code}-${airport.name}`}
                      className="airport-option"
                      role="option"
                      onMouseDown={(event) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        handleSelect(
                          airport
                        )
                      }
                    >
                      <span className="airport-code">
                        {airport.code}
                      </span>

                      <span className="airport-option-main">
                        <strong>
                          {airport.city ||
                            airport.name}
                        </strong>

                        <span>
                          {airport.name}
                        </span>

                        {airport.country && (
                          <small>
                            {
                              airport.country
                            }
                          </small>
                        )}
                      </span>
                    </button>
                  )
                )}
              </>
            )}

          {!loading &&
            !results.length &&
            !error && (
              <div className="airport-status">
                No matching airports found.
              </div>
            )}

          {!loading && error && (
            <div
              className="airport-status airport-error"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
    }
