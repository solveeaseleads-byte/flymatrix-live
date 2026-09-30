import React, { useEffect, useMemo, useState } from "react";
import FlightSearchForm from "../components/flights/FlightSearchForm.jsx";
import SearchSummary from "../components/flights/SearchSummary.jsx";
import FlightResults from "../components/flights/FlightResults.jsx";
import { navigate } from "../router/AppRouter.jsx";

const EMPTY_SEARCH = {
  tripType: "roundtrip",
  origin: null,
  destination: null,
  departureDate: "",
  returnDate: "",
  adults: 1,
  children: 0,
  infants: 0,
  cabin: "economy",
  stops: "any",
};

function normalizeAirport(value) {
  if (!value) return null;

  return {
    code:
      value.code ||
      value.iata ||
      value.iataCode ||
      "",
    name:
      value.name ||
      value.airportName ||
      "",
    city:
      value.city ||
      value.cityName ||
      "",
    country:
      value.country ||
      value.countryName ||
      "",
    countryCode:
      value.countryCode ||
      value.country_code ||
      "",
    type:
      value.type ||
      "airport",
  };
}

function readNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function readSearchFromUrl() {
  const params = new URLSearchParams(
    window.location.search
  );

  const originCode =
    params.get("origin") || "";

  const destinationCode =
    params.get("destination") || "";

  return {
    ...EMPTY_SEARCH,

    tripType:
      params.get("trip") ||
      params.get("tripType") ||
      "roundtrip",

    origin: originCode
      ? {
          code: originCode.toUpperCase(),
          name: "",
          city: "",
          country: "",
          countryCode: "",
          type: "airport",
        }
      : null,

    destination: destinationCode
      ? {
          code:
            destinationCode.toUpperCase(),
          name: "",
          city: "",
          country: "",
          countryCode: "",
          type: "airport",
        }
      : null,

    departureDate:
      params.get("departure") ||
      params.get("depart") ||
      "",

    returnDate:
      params.get("return") ||
      "",

    adults: Math.max(
      1,
      readNumber(
        params.get("adults"),
        1
      )
    ),

    children: Math.max(
      0,
      readNumber(
        params.get("children"),
        0
      )
    ),

    infants: Math.max(
      0,
      readNumber(
        params.get("infants"),
        0
      )
    ),

    cabin:
      params.get("cabin") ||
      "economy",

    stops:
      params.get("stops") ||
      "any",
  };
}

function readStoredSearch() {
  try {
    const stored =
      sessionStorage.getItem(
        "flymatrix:lastSearch"
      );

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (!parsed) return null;

    return {
      ...EMPTY_SEARCH,
      ...parsed,

      origin: normalizeAirport(
        parsed.origin
      ),

      destination: normalizeAirport(
        parsed.destination
      ),

      adults: Math.max(
        1,
        readNumber(
          parsed.passengers?.adults ??
            parsed.adults,
          1
        )
      ),

      children: Math.max(
        0,
        readNumber(
          parsed.passengers?.children ??
            parsed.children,
          0
        )
      ),

      infants: Math.max(
        0,
        readNumber(
          parsed.passengers?.infants ??
            parsed.infants,
          0
        )
      ),
    };
  } catch (error) {
    console.warn(
      "FlyMatrix stored search could not be read:",
      error
    );

    return null;
  }
}

function mergeSearchData() {
  const urlSearch =
    readSearchFromUrl();

  const storedSearch =
    readStoredSearch();

  /*
   * URL values are authoritative when they exist.
   * Stored search fills in airport metadata that may
   * not fit into a short URL.
   */
  return {
    ...EMPTY_SEARCH,
    ...(storedSearch || {}),
    ...(urlSearch || {}),
    origin:
      urlSearch.origin?.code &&
      storedSearch?.origin?.code ===
        urlSearch.origin.code
        ? storedSearch.origin
        : urlSearch.origin ||
          storedSearch?.origin ||
          null,
    destination:
      urlSearch.destination?.code &&
      storedSearch?.destination?.code ===
        urlSearch.destination.code
        ? storedSearch.destination
        : urlSearch.destination ||
          storedSearch?.destination ||
          null,
  };
}

function createInitialSearch() {
  return mergeSearchData();
}

function hasMeaningfulSearch(search) {
  return Boolean(
    search.origin?.code ||
      search.destination?.code ||
      search.departureDate ||
      search.returnDate
  );
}

function buildSearchPayload(search) {
  return {
    searchId:
      search.searchId ||
      `fm_${Date.now()}`,

    tripType:
      search.tripType ||
      "roundtrip",

    origin:
      normalizeAirport(search.origin),

    destination:
      normalizeAirport(
        search.destination
      ),

    departureDate:
      search.departureDate || "",

    returnDate:
      search.returnDate || "",

    passengers: {
      adults: Math.max(
        1,
        readNumber(search.adults, 1)
      ),
      children: Math.max(
        0,
        readNumber(search.children, 0)
      ),
      infants: Math.max(
        0,
        readNumber(search.infants, 0)
      ),
    },

    cabin:
      search.cabin || "economy",

    stops:
      search.stops || "any",
  };
}

export default function SearchPage() {
  const [search, setSearch] =
    useState(createInitialSearch);

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const [hasSearched, setHasSearched] =
    useState(false);

  const [sortBy, setSortBy] =
    useState("recommended");

  const [filters, setFilters] =
    useState({
      maxStops: "any",
      maxPrice: "",
      airlines: [],
    });

  useEffect(() => {
    const handleNavigation = () => {
      setSearch(createInitialSearch());
    };

    window.addEventListener(
      "popstate",
      handleNavigation
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleNavigation
      );
    };
  }, []);

  const payload = useMemo(
    () => buildSearchPayload(search),
    [search]
  );

  async function performSearch(nextSearch) {
    const nextPayload =
      buildSearchPayload(nextSearch);

    setSearch(nextSearch);
    setLoading(true);
    setSearchError("");
    setHasSearched(true);
    setResults([]);

    try {
      /*
       * The frontend sends normalized search details
       * to the existing backend flight endpoint.
       *
       * The backend remains responsible for provider
       * credentials and live provider communication.
       */
      const response = await fetch(
        "/api/flights/search",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify(
            nextPayload
          ),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Flight search failed with status ${response.status}`
        );
      }

      const data =
        await response.json();

      const flightResults =
        Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.flights)
          ? data.flights
          : Array.isArray(data.data)
          ? data.data
          : [];

      setResults(flightResults);

      /*
       * Preserve the complete search so a refresh,
       * details page or affiliate-link adapter can
       * access the exact search.
       */
      sessionStorage.setItem(
        "flymatrix:lastSearch",
        JSON.stringify({
          ...nextPayload,
          createdAt:
            new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error(
        "FlyMatrix flight search:",
        error
      );

      /*
       * The backend may not yet expose the live
       * provider route during frontend construction.
       * Keep the page usable and show a clear state
       * rather than inventing flight prices.
       */
      setResults([]);

      setSearchError(
        error?.message ||
          "Flight search is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(nextPayload) {
    const nextSearch = {
      ...EMPTY_SEARCH,
      ...nextPayload,

      origin: normalizeAirport(
        nextPayload.origin
      ),

      destination: normalizeAirport(
        nextPayload.destination
      ),

      adults:
        nextPayload.passengers?.adults ||
        1,

      children:
        nextPayload.passengers?.children ||
        0,

      infants:
        nextPayload.passengers?.infants ||
        0,
    };

    return performSearch(nextSearch);
  }

  function handleFlightSelect(flight) {
    try {
      sessionStorage.setItem(
        "flymatrix:selectedFlight",
        JSON.stringify(flight)
      );
    } catch (error) {
      console.warn(
        "Selected flight could not be stored:",
        error
      );
    }

    navigate(
      `/flights/details?searchId=${encodeURIComponent(
        payload.searchId
      )}`
    );
  }

  function handleFilterChange(
    nextFilters
  ) {
    setFilters(nextFilters);
  }

  function clearSearch() {
    sessionStorage.removeItem(
      "flymatrix:lastSearch"
    );

    setSearch(EMPTY_SEARCH);
    setResults([]);
    setSearchError("");
    setHasSearched(false);

    navigate("/search");
  }

  const showSearchForm =
    !hasSearched ||
    !hasMeaningfulSearch(search);

  return (
    <main className="search-page">
      <section className="page-hero search-page-hero">
        <div className="page-hero-inner">
          <span className="eyebrow">
            FLYMATRIX FLIGHT SEARCH
          </span>

          <h1>
            Find flights for your journey
          </h1>

          <p>
            Search using your exact route, travel
            dates and passenger requirements.
          </p>
        </div>
      </section>

      <section className="search-page-content">
        <div className="section-container">
          {showSearchForm ? (
            <div className="search-page-panel">
              <FlightSearchForm
                initialSearch={search}
                onSearch={handleSearch}
              />
            </div>
          ) : (
            <>
              <div className="search-summary-wrapper">
                <SearchSummary
                  search={search}
                  onEdit={() => {
                    setHasSearched(false);
                    setSearchError("");
                  }}
                />
              </div>

              <div className="search-results-layout">
                <aside className="flight-filters-column">
                  <div className="filter-panel">
                    <div className="filter-panel-header">
                      <strong>
                        Filter results
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          setFilters({
                            maxStops: "any",
                            maxPrice: "",
                            airlines: [],
                          })
                        }
                      >
                        Reset
                      </button>
                    </div>

                    <div className="filter-field">
                      <label htmlFor="result-stops">
                        Stops
                      </label>

                      <select
                        id="result-stops"
                        value={
                          filters.maxStops
                        }
                        onChange={(event) =>
                          handleFilterChange({
                            ...filters,
                            maxStops:
                              event.target
                                .value,
                          })
                        }
                      >
                        <option value="any">
                          Any
                        </option>

                        <option value="0">
                          Nonstop
                        </option>

                        <option value="1">
                          Up to 1 stop
                        </option>

                        <option value="2">
                          Up to 2 stops
                        </option>
                      </select>
                    </div>

                    <div className="filter-field">
                      <label htmlFor="max-price">
                        Maximum price
                      </label>

                      <input
                        id="max-price"
                        type="number"
                        min="0"
                        inputMode="decimal"
                        placeholder="Any price"
                        value={
                          filters.maxPrice
                        }
                        onChange={(event) =>
                          handleFilterChange({
                            ...filters,
                            maxPrice:
                              event.target
                                .value,
                          })
                        }
                      />
                    </div>
                  </div>
                </aside>

                <section className="flight-results-column">
                  <div className="results-toolbar">
                    <div>
                      <strong>
                        {loading
                          ? "Searching flights…"
                          : results.length
                          ? `${results.length} flight options`
                          : "Flight results"}
                      </strong>

                      <span>
                        {search.origin?.code ||
                          "Origin"}{" "}
                        →{" "}
                        {search.destination
                          ?.code ||
                          "Destination"}
                      </span>
                    </div>

                    <div className="sort-control">
                      <label htmlFor="sort-results">
                        Sort
                      </label>

                      <select
                        id="sort-results"
                        value={sortBy}
                        onChange={(event) =>
                          setSortBy(
                            event.target
                              .value
                          )
                        }
                      >
                        <option value="recommended">
                          Recommended
                        </option>

                        <option value="price">
                          Lowest price
                        </option>

                        <option value="duration">
                          Shortest duration
                        </option>
                      </select>
                    </div>
                  </div>

                  {searchError && (
                    <div
                      className="search-error-card"
                      role="alert"
                    >
                      <strong>
                        Flight search unavailable
                      </strong>

                      <p>
                        {searchError}
                      </p>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          performSearch(
                            search
                          )
                        }
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {!loading &&
                    !searchError &&
                    !results.length && (
                      <div className="empty-results-card">
                        <div className="empty-results-icon">
                          ✈
                        </div>

                        <h2>
                          No flight results yet
                        </h2>

                        <p>
                          Start the search to request
                          current flight options from
                          the configured provider.
                        </p>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            performSearch(
                              search
                            )
                          }
                        >
                          Search again
                        </button>
                      </div>
                    )}

                  <FlightResults
                    results={results}
                    loading={loading}
                    sortBy={sortBy}
                    filters={filters}
                    onSelect={
                      handleFlightSelect
                    }
                  />
                </section>
              </div>
            </>
          )}

          <div className="search-page-footer-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate("/")
              }
            >
              ← Back to FlyMatrix
            </button>

            {!showSearchForm && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearSearch}
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
      }
