import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import AirportSearch from "./AirportSearch.jsx";
import PassengerSelector from "./PassengerSelector.jsx";
import { navigate } from "../../router/AppRouter.jsx";

const DEFAULT_SEARCH = {
  tripType: "roundtrip",
  origin: null,
  destination: null,
  departureDate: "",
  returnDate: "",
  adults: 1,
  children: 0,
  infants: 0,
  cabin: "economy",
  stops: "any"
};

const CABIN_OPTIONS = [
  {
    value: "economy",
    label: "Economy"
  },
  {
    value: "premium_economy",
    label: "Premium Economy"
  },
  {
    value: "business",
    label: "Business"
  },
  {
    value: "first",
    label: "First Class"
  }
];

const STOP_OPTIONS = [
  {
    value: "any",
    label: "Any stops"
  },
  {
    value: "0",
    label: "Nonstop"
  },
  {
    value: "1",
    label: "Up to 1 stop"
  },
  {
    value: "2",
    label: "Up to 2 stops"
  }
];

function formatDateForDisplay(value) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getToday() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createSearchId() {
  return (
    `fm_${Date.now()}_` +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );
}

function normalizeAirport(value) {
  if (!value) {
    return null;
  }

  return {
    code: value.code || value.iata || "",
    name: value.name || "",
    city: value.city || "",
    country: value.country || "",
    countryCode: value.countryCode || "",
    type: value.type || "airport"
  };
}

function buildSearchPayload(search) {
  const adults =
    Number(search.adults) || 1;

  const children =
    Number(search.children) || 0;

  const infants =
    Number(search.infants) || 0;

  return {
    searchId: createSearchId(),

    tripType: search.tripType,

    origin: normalizeAirport(
      search.origin
    ),

    destination: normalizeAirport(
      search.destination
    ),

    departureDate:
      search.departureDate,

    returnDate:
      search.tripType === "roundtrip"
        ? search.returnDate
        : "",

    passengers: {
      adults,
      children,
      infants,
      total:
        adults +
        children +
        infants
    },

    cabin: search.cabin,

    stops: search.stops,

    createdAt:
      new Date().toISOString()
  };
}

function buildSearchQuery(search) {
  const params =
    new URLSearchParams();

  if (search.origin?.code) {
    params.set(
      "origin",
      search.origin.code
    );
  }

  if (search.destination?.code) {
    params.set(
      "destination",
      search.destination.code
    );
  }

  if (search.departureDate) {
    params.set(
      "departureDate",
      search.departureDate
    );

    params.set(
      "departure",
      search.departureDate
    );
  }

  if (
    search.tripType === "roundtrip" &&
    search.returnDate
  ) {
    params.set(
      "returnDate",
      search.returnDate
    );

    params.set(
      "return",
      search.returnDate
    );
  }

  params.set(
    "trip",
    search.tripType
  );

  params.set(
    "tripType",
    search.tripType
  );

  params.set(
    "adults",
    String(
      Number(search.adults) || 1
    )
  );

  if (
    Number(search.children) > 0
  ) {
    params.set(
      "children",
      String(
        Number(search.children)
      )
    );
  }

  if (
    Number(search.infants) > 0
  ) {
    params.set(
      "infants",
      String(
        Number(search.infants)
      )
    );
  }

  params.set(
    "cabin",
    search.cabin
  );

  if (search.stops !== "any") {
    params.set(
      "stops",
      search.stops
    );
  }

  return params;
}

function validateSearch(search) {
  const errors = {};

  if (!search.origin?.code) {
    errors.origin =
      "Select a departure airport.";
  }

  if (!search.destination?.code) {
    errors.destination =
      "Select a destination airport.";
  }

  if (
    search.origin?.code &&
    search.destination?.code &&
    search.origin.code ===
      search.destination.code
  ) {
    errors.destination =
      "Departure and destination cannot be the same.";
  }

  if (!search.departureDate) {
    errors.departureDate =
      "Select a departure date.";
  }

  if (
    search.tripType === "roundtrip" &&
    !search.returnDate
  ) {
    errors.returnDate =
      "Select a return date.";
  }

  if (
    search.tripType === "roundtrip" &&
    search.departureDate &&
    search.returnDate &&
    search.returnDate <
      search.departureDate
  ) {
    errors.returnDate =
      "Return date cannot be before departure.";
  }

  if (
    !search.adults ||
    Number(search.adults) < 1
  ) {
    errors.passengers =
      "At least one adult passenger is required.";
  }

  return errors;
}

function ErrorMessage({
  children
}) {
  if (!children) {
    return null;
  }

  return (
    <span
      className="field-error"
      role="alert"
    >
      {children}
    </span>
  );
}

function AirportDisplay({
  value,
  fallback,
  label
}) {
  const airport =
    normalizeAirport(value);

  return (
    <div className="airport-display">
      <span className="airport-display-label">
        {label}
      </span>

      <div className="airport-display-main">
        <strong className="airport-display-code">
          {airport?.code ||
            "---"}
        </strong>

        <div className="airport-display-location">
          <span className="airport-display-city">
            {airport?.city ||
              fallback}
          </span>

          {airport?.name && (
            <span className="airport-display-name">
              {airport.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlightSearchForm({
  initialSearch = null,
  compact = false,
  onSearch
}) {
  const [
    search,
    setSearch
  ] = useState(() => ({
    ...DEFAULT_SEARCH,
    ...(initialSearch || {})
  }));

  const [
    errors,
    setErrors
  ] = useState({});

  const [
    isSubmitting,
    setIsSubmitting
  ] = useState(false);

  const [
    showAdvanced,
    setShowAdvanced
  ] = useState(false);

  const today = useMemo(
    () => getToday(),
    []
  );

  useEffect(() => {
    if (!initialSearch) {
      return;
    }

    setSearch(
      (current) => ({
        ...current,
        ...initialSearch
      })
    );
  }, [initialSearch]);

  function updateField(
    field,
    value
  ) {
    setSearch(
      (current) => ({
        ...current,
        [field]: value
      })
    );

    setErrors(
      (current) => {
        if (!current[field]) {
          return current;
        }

        const next = {
          ...current
        };

        delete next[field];

        return next;
      }
    );
  }

  function handleTripTypeChange(
    type
  ) {
    setSearch(
      (current) => ({
        ...current,

        tripType: type,

        returnDate:
          type === "roundtrip"
            ? current.returnDate
            : ""
      })
    );

    setErrors({});
  }

  function handlePassengerChange(
    passengers
  ) {
    setSearch(
      (current) => ({
        ...current,

        adults:
          Number(
            passengers.adults
          ) || 1,

        children:
          Number(
            passengers.children
          ) || 0,

        infants:
          Number(
            passengers.infants
          ) || 0
      })
    );

    setErrors(
      (current) => {
        const next = {
          ...current
        };

        delete next.passengers;

        return next;
      }
    );
  }

  function handleDepartureChange(
    event
  ) {
    const value =
      event.target.value;

    setSearch(
      (current) => {
        let returnDate =
          current.returnDate;

        if (
          current.tripType ===
            "roundtrip" &&
          returnDate &&
          value &&
          returnDate < value
        ) {
          returnDate = "";
        }

        return {
          ...current,

          departureDate:
            value,

          returnDate
        };
      }
    );

    setErrors(
      (current) => {
        const next = {
          ...current
        };

        delete next.departureDate;
        delete next.returnDate;

        return next;
      }
    );
  }

  function handleReturnChange(
    event
  ) {
    updateField(
      "returnDate",
      event.target.value
    );
  }

  function swapAirports() {
    setSearch(
      (current) => ({
        ...current,

        origin:
          current.destination,

        destination:
          current.origin
      })
    );

    setErrors(
      (current) => {
        const next = {
          ...current
        };

        delete next.origin;
        delete next.destination;

        return next;
      }
    );
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const validationErrors =
      validateSearch(search);

    if (
      Object.keys(
        validationErrors
      ).length
    ) {
      setErrors(
        validationErrors
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const payload =
        buildSearchPayload(
          search
        );

      sessionStorage.setItem(
        "flymatrix:lastSearch",
        JSON.stringify(payload)
      );

      const query =
        buildSearchQuery(search);

      if (
        typeof onSearch ===
        "function"
      ) {
        await onSearch(payload);
      }

      navigate(
        `/search?${query.toString()}`
      );
    } catch (error) {
      console.error(
        "FlyMatrix flight search failed:",
        error
      );

      setErrors({
        form:
          "The search could not be started. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={[
        "fm-flight-search-form",
        compact
          ? "fm-flight-search-form-compact"
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
      onSubmit={handleSubmit}
      noValidate
    >
      {/* =================================================
          TRIP TYPE
          ================================================= */}

      <div className="fm-trip-switch">
        <button
          type="button"
          className={
            search.tripType ===
            "roundtrip"
              ? "fm-trip-option active"
              : "fm-trip-option"
          }
          onClick={() =>
            handleTripTypeChange(
              "roundtrip"
            )
          }
        >
          Round trip
        </button>

        <button
          type="button"
          className={
            search.tripType ===
            "oneway"
              ? "fm-trip-option active"
              : "fm-trip-option"
          }
          onClick={() =>
            handleTripTypeChange(
              "oneway"
            )
          }
        >
          One way
        </button>
      </div>

      {/* =================================================
          ROUTE AREA
          ================================================= */}

      <div className="fm-route-panel">
        <div className="fm-route-field">
          <AirportDisplay
            value={search.origin}
            fallback="Choose departure"
            label="From"
          />

          <AirportSearch
            id="flight-origin"
            value={search.origin}
            placeholder="Search city or airport"
            ariaLabel="Departure airport"
            onChange={(airport) =>
              updateField(
                "origin",
                normalizeAirport(
                  airport
                )
              )
            }
          />

          <ErrorMessage>
            {errors.origin}
          </ErrorMessage>
        </div>

        <div className="fm-route-swap">
          <button
            type="button"
            onClick={swapAirports}
            title="Swap airports"
            aria-label="Swap departure and destination airports"
          >
            ⇄
          </button>
        </div>

        <div className="fm-route-field">
          <AirportDisplay
            value={
              search.destination
            }
            fallback="Choose destination"
            label="To"
          />

          <AirportSearch
            id="flight-destination"
            value={
              search.destination
            }
            placeholder="Search city or airport"
            ariaLabel="Destination airport"
            onChange={(airport) =>
              updateField(
                "destination",
                normalizeAirport(
                  airport
                )
              )
            }
          />

          <ErrorMessage>
            {errors.destination}
          </ErrorMessage>
        </div>
      </div>

      {/* =================================================
          DATE + PASSENGER CONTROLS
          ================================================= */}

      <div className="fm-search-controls">
        <div className="fm-control-card">
          <span className="fm-control-label">
            Departure
          </span>

          <input
            id="departure-date"
            type="date"
            min={today}
            value={
              search.departureDate
            }
            onChange={
              handleDepartureChange
            }
            aria-invalid={
              Boolean(
                errors.departureDate
              )
            }
          />

          <span className="fm-control-value">
            {search.departureDate
              ? formatDateForDisplay(
                  search.departureDate
                )
              : "Select date"}
          </span>

          <ErrorMessage>
            {
              errors.departureDate
            }
          </ErrorMessage>
        </div>

        <div className="fm-control-card">
          <span className="fm-control-label">
            Return
          </span>

          <input
            id="return-date"
            type="date"
            min={
              search.departureDate ||
              today
            }
            value={
              search.returnDate
            }
            disabled={
              search.tripType !==
              "roundtrip"
            }
            onChange={
              handleReturnChange
            }
            aria-invalid={
              Boolean(
                errors.returnDate
              )
            }
          />

          <span className="fm-control-value">
            {search.tripType !==
            "roundtrip"
              ? "One-way"
              : search.returnDate
                ? formatDateForDisplay(
                    search.returnDate
                  )
                : "Select date"}
          </span>

          <ErrorMessage>
            {errors.returnDate}
          </ErrorMessage>
        </div>

        <div className="fm-control-card">
          <span className="fm-control-label">
            Travelers
          </span>

          <PassengerSelector
            adults={search.adults}
            children={
              search.children
            }
            infants={
              search.infants
            }
            onChange={
              handlePassengerChange
            }
          />

          <span className="fm-control-value">
            {Number(
              search.adults
            ) +
              Number(
                search.children
              ) +
              Number(
                search.infants
              )}{" "}
            traveler
            {Number(
              search.adults
            ) +
              Number(
                search.children
              ) +
              Number(
                search.infants
              ) !== 1
              ? "s"
              : ""}
          </span>

          <ErrorMessage>
            {errors.passengers}
          </ErrorMessage>
        </div>

        <div className="fm-control-card">
          <label
            className="fm-control-label"
            htmlFor="cabin-class"
          >
            Cabin
          </label>

          <select
            id="cabin-class"
            value={search.cabin}
            onChange={(event) =>
              updateField(
                "cabin",
                event.target.value
              )
            }
          >
            {CABIN_OPTIONS.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              )
            )}
          </select>

          <span className="fm-control-value">
            {
              CABIN_OPTIONS.find(
                (item) =>
                  item.value ===
                  search.cabin
              )?.label
            }
          </span>
        </div>
      </div>

      {/* =================================================
          ADVANCED OPTIONS
          ================================================= */}

      <div className="fm-advanced-area">
        <button
          type="button"
          className="fm-advanced-toggle"
          onClick={() =>
            setShowAdvanced(
              (current) =>
                !current
            )
          }
          aria-expanded={
            showAdvanced
          }
        >
          <span>
            {showAdvanced
              ? "Hide advanced options"
              : "More search options"}
          </span>

          <span className="fm-advanced-icon">
            {showAdvanced
              ? "−"
              : "+"}
          </span>
        </button>

        {showAdvanced && (
          <div className="fm-advanced-panel">
            <div className="fm-control-card">
              <label
                className="fm-control-label"
                htmlFor="stops"
              >
                Stops
              </label>

              <select
                id="stops"
                value={search.stops}
                onChange={(event) =>
                  updateField(
                    "stops",
                    event.target.value
                  )
                }
              >
                {STOP_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

              <span className="fm-control-value">
                {
                  STOP_OPTIONS.find(
                    (item) =>
                      item.value ===
                      search.stops
                  )?.label
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          FORM ERROR
          ================================================= */}

      {errors.form && (
        <div
          className="fm-form-error"
          role="alert"
        >
          {errors.form}
        </div>
      )}

      {/* =================================================
          PRIMARY SEARCH ACTION
          ================================================= */}

      <div className="fm-search-action">
        <button
          type="submit"
          className="fm-search-primary"
          disabled={
            isSubmitting
          }
        >
          <span className="fm-search-primary-icon">
            {isSubmitting
              ? "…"
              : "→"}
          </span>

          <span>
            {isSubmitting
              ? "Starting search..."
              : "Search flights"}
          </span>
        </button>
      </div>

      <p className="fm-search-note">
        Prices and availability are
        provided by the relevant travel
        provider. Final terms are confirmed
        before booking.
      </p>
    </form>
  );
      }
