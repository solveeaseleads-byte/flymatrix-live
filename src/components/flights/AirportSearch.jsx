import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  AIRPORTS,
  searchLocalAirports
} from "../../data/airports.js";

const MIN_SEARCH_LENGTH = 3;
const MAX_RESULTS = 12;

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

    region:
      item.region ||
      "",

    type:
      item.type ||
      "airport"
  };
}

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isPrefixMatch(
  airport,
  query
) {
  const q =
    normalizeSearchValue(
      query
    );

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

function deduplicateAirports(
  items
) {
  const map = new Map();

  for (
    const item of
    items || []
  ) {
    const airport =
      normalizeAirport(item);

    if (
      !airport ||
      !airport.code
    ) {
      continue;
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
  }

  return Array.from(
    map.values()
  );
}

function rankAirports(
  items,
  query
) {
  const q =
    normalizeSearchValue(
      query
    );

  if (
    q.length <
    MIN_SEARCH_LENGTH
  ) {
    return [];
  }

  return deduplicateAirports(
    items
  )
    .filter(
      (airport) =>
        isPrefixMatch(
          airport,
          q
        )
    )
    .map(
      (airport) => {
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

        let score = 0;

        if (
          code === q
        ) {
          score = 1000;
        } else if (
          city === q
        ) {
          score = 900;
        } else if (
          name === q
        ) {
          score = 800;
        } else if (
          city.startsWith(q)
        ) {
          score = 700;
        } else if (
          name.startsWith(q)
        ) {
          score = 600;
        } else if (
          code.startsWith(q)
        ) {
          score = 500;
        }

        return {
          airport,
          score
        };
      }
    )
    .filter(
      (item) =>
        item.score > 0
    )
    .sort(
      (a, b) => {
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
      }
    )
    .map(
      (item) =>
        item.airport
    )
    .slice(
      0,
      MAX_RESULTS
    );
}

function getLocalAirportResults(
  query
) {
  const q =
    normalizeSearchValue(
      query
    );

  if (
    q.length <
    MIN_SEARCH_LENGTH
  ) {
    return [];
  }

  /*
   * Use the existing FlyMatrix airport
   * dataset as the primary local fallback.
   *
   * searchLocalAirports provides broader
   * ranking, while rankAirports enforces
   * the strict prefix rule required by
   * the autocomplete UI.
   */
  const localCandidates =
    searchLocalAirports(
      q,
      {
        limit: 100,
        nigeriaFirst: true
      }
    );

  /*
   * Also use the complete exported AIRPORTS
   * array so we do not depend on the search
   * helper's ranking rules.
   */
  const combined =
    deduplicateAirports([
      ...localCandidates,
      ...AIRPORTS
    ]);

  return rankAirports(
    combined,
    q
  );
}

export default function AirportSearch({
  id,
  value,
  onChange,
  placeholder = "City or airport",
  ariaLabel,
  disabled = false
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

    /*
     * Always prepare the local dataset first.
     * This means airport autocomplete can still
     * function when the backend is unavailable.
     */
    const localResults =
      getLocalAirportResults(
        normalizedTerm
      );

    try {
      const response =
        await fetch(
          `/api/destinations?search=${encodeURIComponent(
            term
          )}`,
          {
            headers: {
              Accept:
                "application/json"
            }
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

      /*
       * API results are strictly filtered before
       * they are allowed into the dropdown.
       */
      const apiResults =
        rankAirports(
          apiItems,
          normalizedTerm
        );

      /*
       * API + local inventory.
       *
       * Local inventory guarantees that a temporary
       * backend problem does not destroy autocomplete.
       */
      const combined =
        rankAirports(
          [
            ...apiResults,
            ...localResults
          ],
          normalizedTerm
        );

      setResults(
        combined.slice(
          0,
          MAX_RESULTS
        )
      );

      /*
       * An empty result is a valid search outcome,
       * not an "unavailable" error.
       */
      setError("");
    } catch (requestError) {
      if (
        requestId !==
        requestRef.current
      ) {
        return;
      }

      console.warn(
        "FlyMatrix airport API unavailable; using local airport dataset.",
        requestError
      );

      /*
       * Backend failure does NOT mean airport
       * search is unavailable.
       *
       * Use the local FlyMatrix dataset instead.
       */
      setResults(
        localResults.slice(
          0,
          MAX_RESULTS
        )
      );

      setError("");
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

    if (
      normalizedValue.length <
      MIN_SEARCH_LENGTH
    ) {
      setResults([]);
      setLoading(false);
      return;
    }

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
            !results.length && (
              <div className="airport-status">
                No matching airports found.
              </div>
            )}
        </div>
      )}
    </div>
  );
      }
