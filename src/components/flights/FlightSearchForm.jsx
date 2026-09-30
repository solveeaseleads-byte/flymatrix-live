import React, { useEffect, useMemo, useState } from "react";
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
  stops: "any",
};

const CABIN_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

const STOP_OPTIONS = [
  { value: "any", label: "Any stops" },
  { value: "0", label: "Nonstop" },
  { value: "1", label: "Up to 1 stop" },
  { value: "2", label: "Up to 2 stops" },
];

function formatDateForDisplay(value) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createSearchId() {
  return `fm_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function normalizeAirport(value) {
  if (!value) return null;

  return {
    code: value.code || "",
    name: value.name || "",
    city: value.city || "",
    country: value.country || "",
    countryCode: value.countryCode || "",
    type: value.type || "airport",
  };
}

function buildSearchPayload(search) {
  return {
    searchId: createSearchId(),

    tripType: search.tripType,

    origin: normalizeAirport(search.origin),

    destination: normalizeAirport(search.destination),

    departureDate: search.departureDate,

    returnDate:
      search.tripType === "roundtrip"
        ? search.returnDate
        : "",

    passengers: {
      adults: Number(search.adults) || 1,
      children: Number(search.children) || 0,
      infants: Number(search.infants) || 0,
      total:
        (Number(search.adults) || 1) +
        (Number(search.children) || 0) +
        (Number(search.infants) || 0),
    },

    cabin: search.cabin,

    stops: search.stops,

    createdAt: new Date().toISOString(),
  };
}

function buildSearchQuery(search) {
  const params = new URLSearchParams();

  if (search.origin?.code) {
    params.set("origin", search.origin.code);
  }

  if (search.destination?.code) {
    params.set(
      "destination",
      search.destination.code
    );
  }

  if (search.departureDate) {
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
      "return",
      search.returnDate
    );
  }

  params.set("trip", search.tripType);

  params.set(
    "adults",
    String(Number(search.adults) || 1)
  );

  if (Number(search.children) > 0) {
    params.set(
      "children",
      String(Number(search.children))
    );
  }

  if (Number(search.infants) > 0) {
    params.set(
      "infants",
      String(Number(search.infants))
    );
  }

  params.set("cabin", search.cabin);

  if (search.stops !== "any") {
    params.set("stops", search.stops);
  }

  return params;
}

function validateSearch(search) {
  const errors = {};

  if (!search.origin?.code) {
    errors.origin = "Select a departure airport.";
  }

  if (!search.destination?.code) {
    errors.destination =
      "Select a destination airport.";
  }

  if (
    search.origin?.code &&
    search.destination?.code &&
    search.origin.code === search.destination.code
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
    search.returnDate < search.departureDate
  ) {
    errors.returnDate =
      "Return date cannot be before departure.";
  }

  if (!search.adults || Number(search.adults) < 1) {
    errors.passengers =
      "At least one adult passenger is required.";
  }

  return errors;
}

function ErrorMessage({ children }) {
  if (!children) return null;

  return (
    <span className="field-error" role="alert">
      {children}
    </span>
  );
}

export default function FlightSearchForm({
  initialSearch = null,
  compact = false,
  onSearch,
}) {
  const [search, setSearch] = useState(() => ({
    ...DEFAULT_SEARCH,
    ...(initialSearch || {}),
  }));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showAdvanced, setShowAdvanced] =
    useState(false);

  const today = useMemo(() => getToday(), []);

  useEffect(() => {
    if (!initialSearch) return;

    setSearch((current) => ({
      ...current,
      ...initialSearch,
    }));
  }, [initialSearch]);

  function updateField(field, value) {
    setSearch((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });
  }

  function handleTripTypeChange(type) {
    setSearch((current) => ({
      ...current,
      tripType: type,
      returnDate:
        type === "roundtrip"
          ? current.returnDate
          : "",
    }));

    setErrors({});
  }

  function handlePassengerChange(passengers) {
    setSearch((current) => ({
      ...current,
      adults:
        Number(passengers.adults) || 1,
      children:
        Number(passengers.children) || 0,
      infants:
        Number(passengers.infants) || 0,
    }));

    setErrors((current) => {
      const next = {
        ...current,
      };

      delete next.passengers;

      return next;
    });
  }

  function handleDepartureChange(event) {
    const value = event.target.value;

    setSearch((current) => {
      let returnDate = current.returnDate;

      if (
        current.tripType === "roundtrip" &&
        returnDate &&
        value &&
        returnDate < value
      ) {
        returnDate = "";
      }

      return {
        ...current,
        departureDate: value,
        returnDate,
      };
    });

    setErrors((current) => {
      const next = {
        ...current,
      };

      delete next.departureDate;

      if (current.returnDate) {
        delete next.returnDate;
      }

      return next;
    });
  }

  function handleReturnChange(event) {
    updateField(
      "returnDate",
      event.target.value
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors =
      validateSearch(search);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildSearchPayload(search);

      /*
       * Keep the complete search state available to the
       * results page. This allows the exact airport,
       * date and passenger selections to survive navigation.
       */
      sessionStorage.setItem(
        "flymatrix:lastSearch",
        JSON.stringify(payload)
      );

      const query = buildSearchQuery(search);

      if (typeof onSearch === "function") {
        await onSearch(payload);
      }

      navigate(`/search?${query.toString()}`);
    } catch (error) {
      console.error(
        "FlyMatrix flight search failed:",
        error
      );

      setErrors({
        form:
          "The search could not be started. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={`flight-search-form ${
        compact
          ? "flight-search-form-compact"
          : ""
      }`}
      onSubmit={handleSubmit}
      noValidate
    >
      {/* TRIP TYPE */}
      <div className="trip-type-tabs">
        <button
          type="button"
          className={
            search.tripType === "roundtrip"
              ? "trip-tab active"
              : "trip-tab"
          }
          onClick={() =>
            handleTripTypeChange("roundtrip")
          }
        >
          Round trip
        </button>

        <button
          type="button"
          className={
            search.tripType === "oneway"
              ? "trip-tab active"
              : "trip-tab"
          }
          onClick={() =>
            handleTripTypeChange("oneway")
          }
        >
          One way
        </button>
      </div>

      {/* ROUTE */}
      <div className="flight-search-grid">
        <div className="form-field airport-field">
          <label htmlFor="flight-origin">
            From
          </label>

          <AirportSearch
            id="flight-origin"
            value={search.origin}
            placeholder="City or airport"
            ariaLabel="Departure airport"
            onChange={(airport) =>
              updateField(
                "origin",
                normalizeAirport(airport)
              )
            }
          />

          <ErrorMessage>
            {errors.origin}
          </ErrorMessage>
        </div>

        <div className="route-swap">
          <button
            type="button"
            title="Swap airports"
            aria-label="Swap departure and destination airports"
            onClick={() => {
              setSearch((current) => ({
                ...current,
                origin: current.destination,
                destination: current.origin,
              }));
            }}
          >
            ⇄
          </button>
        </div>

        <div className="form-field airport-field">
          <label htmlFor="flight-destination">
            To
          </label>

          <AirportSearch
            id="flight-destination"
            value={search.destination}
            placeholder="City or airport"
            ariaLabel="Destination airport"
            onChange={(airport) =>
              updateField(
                "destination",
                normalizeAirport(airport)
              )
            }
          />

          <ErrorMessage>
            {errors.destination}
          </ErrorMessage>
        </div>
      </div>

      {/* DATES */}
      <div className="flight-search-grid flight-date-grid">
        <div className="form-field">
          <label htmlFor="departure-date">
            Departure
          </label>

          <input
            id="departure-date"
            type="date"
            min={today}
            value={search.departureDate}
            onChange={handleDepartureChange}
            aria-invalid={
              Boolean(errors.departureDate)
            }
          />

          {search.departureDate && (
            <small className="date-preview">
              {formatDateForDisplay(
                search.departureDate
              )}
            </small>
          )}

          <ErrorMessage>
            {errors.departureDate}
          </ErrorMessage>
        </div>

        <div className="form-field">
          <label htmlFor="return-date">
            Return
          </label>

          <input
            id="return-date"
            type="date"
            min={
              search.departureDate || today
            }
            value={search.returnDate}
            disabled={
              search.tripType !== "roundtrip"
            }
            onChange={handleReturnChange}
            aria-invalid={
              Boolean(errors.returnDate)
            }
          />

          {search.returnDate &&
            search.tripType === "roundtrip" && (
              <small className="date-preview">
                {formatDateForDisplay(
                  search.returnDate
                )}
              </small>
            )}

          {search.tripType !== "roundtrip" && (
            <small className="field-hint">
              One-way trip
            </small>
          )}

          <ErrorMessage>
            {errors.returnDate}
          </ErrorMessage>
        </div>
      </div>

      {/* PASSENGERS + CABIN */}
      <div className="flight-search-grid">
        <div className="form-field">
          <label>
            Passengers
          </label>

          <PassengerSelector
            adults={search.adults}
            children={search.children}
            infants={search.infants}
            onChange={handlePassengerChange}
          />

          <ErrorMessage>
            {errors.passengers}
          </ErrorMessage>
        </div>

        <div className="form-field">
          <label htmlFor="cabin-class">
            Cabin class
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
            {CABIN_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ADVANCED */}
      <div className="advanced-search">
        <button
          type="button"
          className="advanced-toggle"
          onClick={() =>
            setShowAdvanced((current) => !current)
          }
          aria-expanded={showAdvanced}
        >
          <span>
            {showAdvanced
              ? "Hide advanced options"
              : "More search options"}
          </span>

          <span>
            {showAdvanced ? "−" : "+"}
          </span>
        </button>

        {showAdvanced && (
          <div className="advanced-search-panel">
            <div className="form-field">
              <label htmlFor="stops">
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
                {STOP_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* FORM ERROR */}
      {errors.form && (
        <div
          className="form-error-banner"
          role="alert"
        >
          {errors.form}
        </div>
      )}

      {/* SUBMIT */}
      <div className="search-submit-row">
        <button
          type="submit"
          className="btn btn-primary search-submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Starting search..."
            : "Search flights"}
        </button>
      </div>

      <p className="search-disclaimer">
        Flight availability, prices and final booking
        terms are provided by the relevant travel
        provider. Review the provider's final terms
        before booking.
      </p>
    </form>
  );
    }
