import React, {
  useEffect,
  useRef,
  useState
} from "react";

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
  if (!item) {
    return null;
  }

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

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/*
 * A search becomes active only after three characters.
 *
 * This prevents very broad one- and two-character
 * searches from producing unrelated results.
 */
const MIN_SEARCH_LENGTH = 3;

/*
 * Strict prefix matching.
 *
 * A result is valid when the beginning of its:
 * - IATA code
 * - city name
 * - airport name
 *
 * matches the beginning of the user's query.
 *
 * We intentionally do NOT use String.includes()
 * here because that can produce unrelated results.
 */
function isPrefixMatch(airport, query) {
  const q =
    normalizeSearchValue(query);

  if (
    q.length <
    MIN_SEARCH_LENGTH
  ) {
    return false;
  }

  const code =
    normalizeSearchValue(
      airport.code
    );

  const city =
    normalizeSearchValue(
      airport.city
    );

  const name =
    normalizeSearchValue(
      airport.name
    );

  return (
    code.startsWith(q) ||
    city.startsWith(q) ||
    name.startsWith(q)
  );
}

function scoreAirport(
  airport,
  query
) {
  const q =
    normalizeSearchValue(query);

  if (
    q.length <
    MIN_SEARCH_LENGTH
  ) {
    return 0;
  }

  const code =
    normalizeSearchValue(
      airport.code
    );

  const city =
    normalizeSearchValue(
      airport.city
    );

  const name =
    normalizeSearchValue(
      airport.name
    );

  /*
   * Exact IATA code is the strongest match.
   */
  if (code === q) {
    return 1000;
  }

  /*
   * Exact city match comes next.
   */
  if (city === q) {
    return 900;
  }

  /*
   * Exact airport name.
   */
  if (name === q) {
    return 800;
  }

  /*
   * City prefix is preferred because the
   * user is primarily searching for a
   * city or airport destination.
   */
  if (city.startsWith(q)) {
    return 700;
  }

  /*
   * Airport name prefix.
   */
  if (name.startsWith(q)) {
    return 600;
  }

  /*
   * IATA prefix.
   */
  if (code.startsWith(q)) {
    return 500;
  }

  return 0;
}

function rankAirports(
  items,
  query
) {
  const normalized =
    deduplicateAirports(items);

  return normalized
    .map((airport) => ({
      airport,
      score: scoreAirport(
        airport,
        query
      ),
    }))
    .filter(
      (item) =>
        item.score > 0 &&
        isPrefixMatch(
          item.airport,
          query
        )
    )
    .sort((a, b) => {
      if (
        b.score !==
        a.score
      ) {
        return (
          b.score -
          a.score
        );
      }

      const cityCompare =
        a.airport.city.localeCompare(
          b.airport.city
        );

      if (
        cityCompare !== 0
      ) {
        return cityCompare;
      }

      return a.airport.name.localeCompare(
        b.airport.name
      );
    })
    .map(
      (item) =>
        item.airport
    );
}

function deduplicateAirports(
  items
) {
  const map = new Map();

  items.forEach((item) => {
    const airport =
      normalizeAirport(item);

    if (
      !airport ||
      !airport.code
    ) {
      return;
    }

    const key =
      airport.code
        .trim()
        .toUpperCase();

    if (!map.has(key)) {
      map.set(
        key,
        airport
      );
    }
  });

  return Array.from(
    map.values()
  );
}

function getLocalResults(
  airports,
  query
) {
  const q =
    normalizeSearchValue(query);

  if (
    q.length <
    MIN_SEARCH_LENGTH
  ) {
    return [];
  }

  return rankAirports(
    airports,
    q
  ).slice(0, 12);
}

export default function AirportSearch({
  id,
  value,
  onChange,
  placeholder = "City or airport",
  ariaLabel,
  disabled = false,
}) {
  const containerRef =
    useRef(null);

  const inputRef =
    useRef(null);

  const requestRef =
    useRef(0);

  const timerRef =
    useRef(null);

  const [
    query,
    setQuery
  ] = useState(
    value
      ? `${value.city || ""}${
          value.code
            ? ` (${value.code})`
            : ""
        }`
      : ""
  );

  const [
    results,
    setResults
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    isOpen,
    setIsOpen
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

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
    function handleOutsideClick(
      event
    ) {
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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(
          timerRef.current
        );
      }

      requestRef.current += 1;
    };
  }, []);

  async function searchAirports(
    searchTerm
  ) {
    const term =
      searchTerm.trim();

    const normalizedTerm =
      normalizeSearchValue(
        term
      );

    /*
     * Do not perform an airport search
     * until at least three characters
     * have been entered.
     */
    if (
      normalizedTerm.length <
      MIN_SEARCH_LENGTH
    ) {
      setLoading(false);
      setError("");
      setResults([]);
      return;
    }

    const requestId =
      ++requestRef.current;

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
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
          : Array.isArray(
              data.results
            )
          ? data.results
          : Array.isArray(
              data.destinations
            )
          ? data.destinations
          : Array.isArray(
              data.airports
            )
          ? data.airports
          : [];

      const normalized =
        deduplicateAirports(
          apiItems
        );

      /*
       * The backend response is NEVER trusted
       * blindly. Filter it using the same strict
       * prefix rule as the fallback data.
       */
      const apiMatches =
        getLocalResults(
          normalized,
          normalizedTerm
        );

      /*
       * Fallback data is also filtered strictly.
       * Therefore Kano cannot leak into "Lag"
       * or "Los" simply because it exists in the
       * fallback list.
       */
      const fallbackMatches =
        getLocalResults(
          FALLBACK_AIRPORTS,
          normalizedTerm
        );

      /*
       * API results take priority, while fallback
       * records fill gaps where appropriate.
       */
      const combined =
        deduplicateAirports([
          ...apiMatches,
          ...fallbackMatches,
        ]);

      const ranked =
        rankAirports(
          combined,
          normalizedTerm
        );

      setResults(
        ranked.slice(0, 12)
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

      /*
       * If the backend is unavailable,
       * use the same strict prefix matching
       * against the local fallback dataset.
       */
      const fallback =
        getLocalResults(
          FALLBACK_AIRPORTS,
          normalizedTerm
        );

      setResults(
        fallback
      );

      setError(
        fallback.length
          ? ""
          : "Airport search is temporarily unavailable."
      );
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

    const normalizedQuery =
      normalizeSearchValue(
        query
      );

    /*
     * We intentionally do not display a broad
     * airport list on focus. The user must type
     * at least three characters.
     */
    if (
      normalizedQuery.length <
      MIN_SEARCH_LENGTH
    ) {
      setResults([]);
      setError("");
    }
  }

  function handleInputChange(
    event
  ) {
    const nextValue =
      event.target.value;

    setQuery(nextValue);
    setIsOpen(true);
    setError("");

    /*
     * Typing replaces the previous selection.
     */
    onChange?.(null);

    const normalizedValue =
      normalizeSearchValue(
        nextValue
      );

    if (
      timerRef.current
    ) {
      clearTimeout(
        timerRef.current
      );
    }

    /*
     * Clear results for fewer than
     * three characters.
     */
    if (
      normalizedValue.length <
      MIN_SEARCH_LENGTH
    ) {
      setResults([]);
      setLoading(false);
      return;
    }

    /*
     * Debounce backend searches.
     */
    timerRef.current =
      setTimeout(() => {
        searchAirports(
          nextValue
        );
      }, 250);
  }

  function handleSelect(
    airport
  ) {
    const normalized =
      normalizeAirport(
        airport
      );

    if (!normalized) {
      return;
    }

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

    onChange?.(
      normalized
    );
  }

  function handleKeyDown(
    event
  ) {
    if (
      event.key ===
      "Escape"
    ) {
      setIsOpen(false);
      return;
    }

    if (
      event.key ===
        "Enter" &&
      results.length
    ) {
      event.preventDefault();

      handleSelect(
        results[0]
      );
    }
  }

  const normalizedQuery =
    normalizeSearchValue(
      query
    );

  const needsMoreCharacters =
    normalizedQuery.length > 0 &&
    normalizedQuery.length <
      MIN_SEARCH_LENGTH;

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
            ariaLabel ||
            placeholder
          }
          aria-expanded={
            isOpen
          }
          aria-autocomplete="list"
          role="combobox"
          onFocus={
            handleFocus
          }
          onChange={
            handleInputChange
          }
          onKeyDown={
            handleKeyDown
          }
        />

        {loading && (
          <span
            className="airport-loading"
            aria-label="Searching airports"
          >
            …
          </span>
        )}

        {query &&
          !loading && (
            <button
              type="button"
              className="airport-clear"
              aria-label="Clear airport"
              onClick={() => {
                if (
                  timerRef.current
                ) {
                  clearTimeout(
                    timerRef.current
                  );
                }

                requestRef.current +=
                  1;

                setQuery("");
                setResults([]);
                setError("");
                setLoading(false);
                setIsOpen(true);

                onChange?.(
                  null
                );

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
          {needsMoreCharacters && (
            <div className="airport-status">
              Type at least 3 letters to search.
            </div>
          )}

          {!needsMoreCharacters &&
            loading && (
              <div className="airport-status">
                Searching airports…
              </div>
            )}

          {!needsMoreCharacters &&
            !loading &&
            results.length >
              0 && (
              <>
                {results.map(
                  (airport) => (
                    <button
                      type="button"
                      key={`${airport.code}-${airport.name}`}
                      className="airport-option"
                      role="option"
                      onMouseDown={(
                        event
                      ) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        handleSelect(
                          airport
                        )
                      }
                    >
                      <span className="airport-code">
                        {
                          airport.code
                        }
                      </span>

                      <span className="airport-option-main">
                        <strong>
                          {airport.city ||
                            airport.name}
                        </strong>

                        <span>
                          {
                            airport.name
                          }
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

          {!needsMoreCharacters &&
            !loading &&
            !results.length &&
            !error && (
              <div className="airport-status">
                No matching airports found.
              </div>
            )}

          {!needsMoreCharacters &&
            !loading &&
            error && (
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
