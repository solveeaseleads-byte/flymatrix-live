import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import FlightSearchForm from "../components/flights/FlightSearchForm.jsx";
import SearchSummary from "../components/flights/SearchSummary.jsx";
import FlightResults from "../components/flights/FlightResults.jsx";
import { navigate } from "../router/AppRouter.jsx";

const EMPTY_SEARCH = {
  searchId: "",
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
  if (!value) {
    return null;
  }

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

function normalizePassengerCount(
  value,
  fallback,
  minimum
) {
  return Math.max(
    minimum,
    readNumber(value, fallback)
  );
}

function readSearchFromUrl() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const originCode =
    params.get("origin") || "";

  const destinationCode =
    params.get("destination") || "";

  return {
    ...EMPTY_SEARCH,

    searchId:
      params.get("searchId") || "",

    tripType:
      params.get("trip") ||
      params.get("tripType") ||
      "roundtrip",

    origin: originCode
      ? {
          code:
            originCode
              .trim()
              .toUpperCase(),
          name: "",
          city: "",
          country: "",
          countryCode: "",
          type: "airport",
        }
      : null,

    destination:
      destinationCode
        ? {
            code:
              destinationCode
                .trim()
                .toUpperCase(),
            name: "",
            city: "",
            country: "",
            countryCode: "",
            type: "airport",
          }
        : null,

    departureDate:
      params.get("departureDate") ||
      params.get("departure") ||
      params.get("depart") ||
      "",

    returnDate:
      params.get("returnDate") ||
      params.get("return") ||
      "",

    adults:
      normalizePassengerCount(
        params.get("adults"),
        1,
        1
      ),

    children:
      normalizePassengerCount(
        params.get("children"),
        0,
        0
      ),

    infants:
      normalizePassengerCount(
        params.get("infants"),
        0,
        0
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

    if (!stored) {
      return null;
    }

    const parsed =
      JSON.parse(stored);

    if (!parsed) {
      return null;
    }

    return {
      ...EMPTY_SEARCH,

      ...parsed,

      searchId:
        parsed.searchId || "",

      tripType:
        parsed.tripType ||
        parsed.trip ||
        "roundtrip",

      origin:
        normalizeAirport(
          parsed.origin
        ),

      destination:
        normalizeAirport(
          parsed.destination
        ),

      departureDate:
        parsed.departureDate ||
        parsed.departure ||
        "",

      returnDate:
        parsed.returnDate ||
        parsed.return ||
        "",

      adults:
        normalizePassengerCount(
          parsed.passengers?.adults ??
            parsed.adults,
          1,
          1
        ),

      children:
        normalizePassengerCount(
          parsed.passengers?.children ??
            parsed.children,
          0,
          0
        ),

      infants:
        normalizePassengerCount(
          parsed.passengers?.infants ??
            parsed.infants,
          0,
          0
        ),

      cabin:
        parsed.cabin ||
        "economy",

      stops:
        parsed.stops ||
        "any",
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

  const merged = {
    ...EMPTY_SEARCH,
    ...(storedSearch || {}),
    ...(urlSearch || {}),
  };

  if (
    urlSearch.origin?.code &&
    storedSearch?.origin?.code ===
      urlSearch.origin.code
  ) {
    merged.origin =
      storedSearch.origin;
  }

  if (
    urlSearch.destination?.code &&
    storedSearch?.destination?.code ===
      urlSearch.destination.code
  ) {
    merged.destination =
      storedSearch.destination;
  }

  return merged;
}

function createInitialSearch() {
  return mergeSearchData();
}

function hasMeaningfulSearch(search) {
  return Boolean(
    search?.origin?.code &&
      search?.destination?.code &&
      search?.departureDate
  );
}

function buildSearchPayload(search) {
  return {
    searchId:
      search?.searchId ||
      `fm_${Date.now()}`,

    tripType:
      search?.tripType ||
      "roundtrip",

    origin:
      normalizeAirport(
        search?.origin
      ),

    destination:
      normalizeAirport(
        search?.destination
      ),

    departureDate:
      search?.departureDate ||
      "",

    returnDate:
      search?.returnDate ||
      "",

    passengers: {
      adults:
        normalizePassengerCount(
          search?.adults,
          1,
          1
        ),

      children:
        normalizePassengerCount(
          search?.children,
          0,
          0
        ),

      infants:
        normalizePassengerCount(
          search?.infants,
          0,
          0
        ),
    },

    cabin:
      search?.cabin ||
      "economy",

    stops:
      search?.stops ||
      "any",
  };
}

function buildSearchQuery(payload) {
  const params =
    new URLSearchParams();

  if (payload.searchId) {
    params.set(
      "searchId",
      payload.searchId
    );
  }

  if (payload.tripType) {
    params.set(
      "trip",
      payload.tripType
    );

    params.set(
      "tripType",
      payload.tripType
    );
  }

  if (payload.origin?.code) {
    params.set(
      "origin",
      payload.origin.code
    );
  }

  if (payload.destination?.code) {
    params.set(
      "destination",
      payload.destination.code
    );
  }

  if (payload.departureDate) {
    params.set(
      "departureDate",
      payload.departureDate
    );

    params.set(
      "departure",
      payload.departureDate
    );
  }

  if (payload.returnDate) {
    params.set(
      "returnDate",
      payload.returnDate
    );

    params.set(
      "return",
      payload.returnDate
    );
  }

  params.set(
    "adults",
    String(
      payload.passengers?.adults ||
        1
    )
  );

  params.set(
    "children",
    String(
      payload.passengers?.children ||
        0
    )
  );

  params.set(
    "infants",
    String(
      payload.passengers?.infants ||
        0
    )
  );

  params.set(
    "cabin",
    payload.cabin ||
      "economy"
  );

  params.set(
    "stops",
    payload.stops ||
      "any"
  );

  return params.toString();
}

function extractResults(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.flights)) {
    return data.flights;
  }

  if (Array.isArray(data?.offers)) {
    return data.offers;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function SearchPage() {
  const [search, setSearch] =
    useState(
      createInitialSearch
    );

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState("");

  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);

  const [
    sessionId,
    setSessionId,
  ] = useState("");

  const [sortBy, setSortBy] =
    useState("recommended");

  const [filters, setFilters] =
    useState({
      maxStops: "any",
      maxPrice: "",
      airlines: [],
    });

  useEffect(() => {
    const initialSearch =
      createInitialSearch();

    setSearch(initialSearch);

    if (
      hasMeaningfulSearch(
        initialSearch
      )
    ) {
      performSearch(
        initialSearch
      );
    }

    const handleNavigation =
      () => {
        const nextSearch =
          createInitialSearch();

        setSearch(nextSearch);
        setResults([]);
        setSearchError("");
        setSessionId("");

        if (
          hasMeaningfulSearch(
            nextSearch
          )
        ) {
          performSearch(
            nextSearch
          );
        } else {
          setHasSearched(false);
        }
      };

    window.addEventListener(
      "popstate",
      handleNavigation
    );

    return () =>
      window.removeEventListener(
        "popstate",
        handleNavigation
      );
  }, []);

  const payload = useMemo(
    () =>
      buildSearchPayload(
        search
      ),
    [search]
  );

  async function performSearch(
    nextSearch
  ) {
    const nextPayload =
      buildSearchPayload(
        nextSearch
      );

    setSearch(nextSearch);
    setLoading(true);
    setSearchError("");
    setHasSearched(true);
    setResults([]);

    try {
      const params =
        new URLSearchParams();

      if (
        nextPayload.origin?.code
      ) {
        params.set(
          "origin",
          nextPayload.origin.code
        );
      }

      if (
        nextPayload.destination?.code
      ) {
        params.set(
          "destination",
          nextPayload.destination.code
        );
      }

      if (
        nextPayload.departureDate
      ) {
        params.set(
          "departureDate",
          nextPayload.departureDate
        );
      }

      if (
        nextPayload.returnDate
      ) {
        params.set(
          "returnDate",
          nextPayload.returnDate
        );
      }

      params.set(
        "tripType",
        nextPayload.tripType
      );

      params.set(
        "adults",
        String(
          nextPayload.passengers
            .adults
        )
      );

      params.set(
        "children",
        String(
          nextPayload.passengers
            .children
        )
      );

      params.set(
        "infants",
        String(
          nextPayload.passengers
            .infants
        )
      );

      params.set(
        "cabin",
        nextPayload.cabin
      );

      params.set(
        "stops",
        nextPayload.stops
      );

      const response =
        await fetch(
          `/api/flights?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Flight search failed with status ${response.status}.`
        );
      }

      const flightResults =
        extractResults(data);

      const backendSessionId =
        data?.sessionId ||
        data?.session_id ||
        "";

      setResults(
        flightResults
      );

      setSessionId(
        backendSessionId
      );

      if (backendSessionId) {
        try {
          sessionStorage.setItem(
            "flymatrix:sessionId",
            backendSessionId
          );

          sessionStorage.setItem(
            "flymatrix:searchSessionId",
            backendSessionId
          );
        } catch (error) {
          console.warn(
            "FlyMatrix session ID could not be stored:",
            error
          );
        }
      }

      try {
        sessionStorage.setItem(
          "flymatrix:lastSearch",
          JSON.stringify({
            ...nextPayload,

            sessionId:
              backendSessionId ||
              nextPayload.searchId,

            providerMessage:
              data?.providerMessage ||
              "",

            createdAt:
              new Date().toISOString(),
          })
        );
      } catch (error) {
        console.warn(
          "FlyMatrix search could not be stored:",
          error
        );
      }
    } catch (error) {
      console.error(
        "FlyMatrix flight search:",
        error
      );

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

      origin:
        normalizeAirport(
          nextPayload.origin
        ),

      destination:
        normalizeAirport(
          nextPayload.destination
        ),

      departureDate:
        nextPayload.departureDate ||
        nextPayload.departure ||
        "",

      returnDate:
        nextPayload.returnDate ||
        nextPayload.return ||
        "",

      adults:
        normalizePassengerCount(
          nextPayload.passengers
            ?.adults ??
            nextPayload.adults,
          1,
          1
        ),

      children:
        normalizePassengerCount(
          nextPayload.passengers
            ?.children ??
            nextPayload.children,
          0,
          0
        ),

      infants:
        normalizePassengerCount(
          nextPayload.passengers
            ?.infants ??
            nextPayload.infants,
          0,
          0
        ),

      cabin:
        nextPayload.cabin ||
        "economy",

      stops:
        nextPayload.stops ||
        "any",

      searchId:
        nextPayload.searchId ||
        `fm_${Date.now()}`,
    };

    const normalizedPayload =
      buildSearchPayload(
        nextSearch
      );

    const query =
      buildSearchQuery(
        normalizedPayload
      );

    const target =
      `/search?${query}`;

    window.history.pushState(
      {},
      "",
      target
    );

    return performSearch(
      nextSearch
    );
  }

  function handleFlightSelect(
    flight
  ) {
    try {
      sessionStorage.setItem(
        "flymatrix:selectedFlight",
        JSON.stringify(
          flight
        )
      );
    } catch (error) {
      console.warn(
        "Selected flight could not be stored:",
        error
      );
    }

    const activeSessionId =
      sessionId ||
      payload.searchId ||
      "";

    const params =
      new URLSearchParams();

    if (activeSessionId) {
      params.set(
        "searchId",
        activeSessionId
      );
    }

    if (payload.origin?.code) {
      params.set(
        "origin",
        payload.origin.code
      );
    }

    if (
      payload.destination?.code
    ) {
      params.set(
        "destination",
        payload.destination.code
      );
    }

    navigate(
      `/flights/details?${params.toString()}`
    );
  }

  function handleFilterChange(
    nextFilters
  ) {
    setFilters(
      nextFilters
    );
  }

  function editSearch() {
    setHasSearched(false);
    setSearchError("");
  }

  function clearSearch() {
    try {
      sessionStorage.removeItem(
        "flymatrix:lastSearch"
      );

      sessionStorage.removeItem(
        "flymatrix:selectedFlight"
      );

      sessionStorage.removeItem(
        "flymatrix:sessionId"
      );

      sessionStorage.removeItem(
        "flymatrix:searchSessionId"
      );
    } catch (error) {
      console.warn(
        "FlyMatrix search storage could not be cleared:",
        error
      );
    }

    setSearch(EMPTY_SEARCH);
    setResults([]);
    setSearchError("");
    setSessionId("");
    setHasSearched(false);

    setFilters({
      maxStops: "any",
      maxPrice: "",
      airlines: [],
    });

    navigate("/search");
  }

  const showSearchForm =
    !hasSearched ||
    !hasMeaningfulSearch(
      search
    );

  return (
    <div className="fm-search-page">

      <section className="fm-page-section fm-search-hero">
        <div className="fm-container">

          <div className="fm-search-hero-content">

            <span className="fm-eyebrow">
              FLYMATRIX FLIGHT SEARCH
            </span>

            <h1>
              Find flights for your journey
            </h1>

            <p>
              Search using your exact route,
              travel dates and passenger
              requirements.
            </p>

          </div>

        </div>
      </section>

      <section className="fm-search-content">
        <div className="fm-container">

          {showSearchForm ? (
            <div className="fm-search-panel">

              <FlightSearchForm
                initialSearch={search}
                onSearch={handleSearch}
              />

            </div>
          ) : (
            <>

              <div className="fm-search-summary">
                <SearchSummary
                  search={search}
                  onEdit={editSearch}
                />
              </div>

              <div className="fm-search-results-layout">

                <aside className="fm-search-filters">

                  <div className="fm-search-filter-panel">

                    <div className="fm-search-filter-header">

                      <strong>
                        Filter results
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          setFilters({
                            maxStops:
                              "any",
                            maxPrice:
                              "",
                            airlines:
                              [],
                          })
                        }
                      >
                        Reset
                      </button>

                    </div>

                    <div className="fm-search-filter-field">

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
                              event.target.value,
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

                    <div className="fm-search-filter-field">

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
                              event.target.value,
                          })
                        }
                      />

                    </div>

                  </div>

                </aside>

                <section className="fm-search-results-column">

                  <div className="fm-search-toolbar">

                    <div className="fm-search-toolbar-info">

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
                        {search.destination?.code ||
                          "Destination"}
                      </span>

                    </div>

                    <div className="fm-search-sort">

                      <label htmlFor="sort-results">
                        Sort
                      </label>

                      <select
                        id="sort-results"
                        value={sortBy}
                        onChange={(event) =>
                          setSortBy(
                            event.target.value
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
                      className="fm-search-error"
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
                        className="fm-btn fm-btn-primary"
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
                      <div className="fm-search-empty">

                        <div className="fm-search-empty-icon">
                          ✈
                        </div>

                        <h2>
                          No flight results yet
                        </h2>

                        <p>
                          No live flight
                          options were
                          returned for
                          this search.
                        </p>

                        <button
                          type="button"
                          className="fm-btn fm-btn-primary"
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
                    onSelect={handleFlightSelect}
                    sessionId={
                      sessionId ||
                      payload.searchId
                    }
                  />

                </section>

              </div>

            </>
          )}

          <div className="fm-search-footer">

            <button
              type="button"
              className="fm-btn fm-btn-secondary"
              onClick={() =>
                navigate("/")
              }
            >
              ← Back to FlyMatrix
            </button>

            {!showSearchForm && (
              <button
                type="button"
                className="fm-btn fm-btn-secondary"
                onClick={clearSearch}
              >
                Clear search
              </button>
            )}

          </div>

        </div>
      </section>

    </div>
  );
}
