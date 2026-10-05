import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import AirportSearch from "./AirportSearch.jsx";
import PassengerSelector from "./PassengerSelector.jsx";
import { navigate } from "../../router/AppRouter.jsx";

import "./FlightSearchForm.css";

/* =========================================================
   DEFAULTS
   ========================================================= */

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

  multiCitySegments: [
    {
      origin: null,
      destination: null,
      departureDate: ""
    },
    {
      origin: null,
      destination: null,
      departureDate: ""
    }
  ]
};

const MAX_MULTI_CITY_SEGMENTS = 4;

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

/* =========================================================
   HELPERS
   ========================================================= */

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

function formatDateForDisplay(value) {
  if (!value) {
    return "";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  ).format(date);
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
    code:
      value.code ||
      value.iata ||
      "",

    name:
      value.name ||
      "",

    city:
      value.city ||
      "",

    country:
      value.country ||
      "",

    countryCode:
      value.countryCode ||
      "",

    type:
      value.type ||
      "airport"
  };
}

/* =========================================================
   PAYLOAD
   ========================================================= */

function buildSearchPayload(search) {
  const adults =
    Number(search.adults) || 1;

  const children =
    Number(search.children) || 0;

  const infants =
    Number(search.infants) || 0;

  const basePayload = {
    searchId: createSearchId(),

    tripType:
      search.tripType,

    passengers: {
      adults,
      children,
      infants,
      total:
        adults +
        children +
        infants
    },

    cabin:
      search.cabin,

    stops:
      search.stops,

    createdAt:
      new Date().toISOString()
  };

  if (
    search.tripType ===
    "multicity"
  ) {
    return {
      ...basePayload,

      segments:
        search.multiCitySegments.map(
          (segment) => ({
            origin:
              normalizeAirport(
                segment.origin
              ),

            destination:
              normalizeAirport(
                segment.destination
              ),

            departureDate:
              segment.departureDate
          })
        )
    };
  }

  return {
    ...basePayload,

    origin:
      normalizeAirport(
        search.origin
      ),

    destination:
      normalizeAirport(
        search.destination
      ),

    departureDate:
      search.departureDate,

    returnDate:
      search.tripType ===
      "roundtrip"
        ? search.returnDate
        : ""
  };
}

/* =========================================================
   QUERY
   ========================================================= */

function buildSearchQuery(search) {
  const params =
    new URLSearchParams();

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
        Number(
          search.children
        )
      )
    );
  }

  if (
    Number(search.infants) > 0
  ) {
    params.set(
      "infants",
      String(
        Number(
          search.infants
        )
      )
    );
  }

  params.set(
    "cabin",
    search.cabin
  );

  if (
    search.stops !==
    "any"
  ) {
    params.set(
      "stops",
      search.stops
    );
  }

  /* -------------------------------------
     MULTI CITY
     ------------------------------------- */

  if (
    search.tripType ===
    "multicity"
  ) {
    search.multiCitySegments.forEach(
      (segment, index) => {
        if (
          segment.origin?.code
        ) {
          params.set(
            `segment${index + 1}Origin`,
            segment.origin.code
          );
        }

        if (
          segment.destination?.code
        ) {
          params.set(
            `segment${index + 1}Destination`,
            segment.destination.code
          );
        }

        if (
          segment.departureDate
        ) {
          params.set(
            `segment${index + 1}Departure`,
            segment.departureDate
          );
        }
      }
    );

    params.set(
      "segments",
      String(
        search.multiCitySegments
          .length
      )
    );

    return params;
  }

  /* -------------------------------------
     NORMAL FLIGHT
     ------------------------------------- */

  if (
    search.origin?.code
  ) {
    params.set(
      "origin",
      search.origin.code
    );
  }

  if (
    search.destination?.code
  ) {
    params.set(
      "destination",
      search.destination.code
    );
  }

  if (
    search.departureDate
  ) {
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
    search.tripType ===
      "roundtrip" &&
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

  return params;
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validateSearch(search) {
  const errors = {};

  /* MULTI CITY */

  if (
    search.tripType ===
    "multicity"
  ) {
    search.multiCitySegments.forEach(
      (segment, index) => {
        if (
          !segment.origin?.code
        ) {
          errors[
            `segment${index}Origin`
          ] =
            "Select departure airport.";
        }

        if (
          !segment.destination?.code
        ) {
          errors[
            `segment${index}Destination`
          ] =
            "Select destination airport.";
        }

        if (
          segment.origin?.code &&
          segment.destination?.code &&
          segment.origin.code ===
            segment.destination.code
        ) {
          errors[
            `segment${index}Destination`
          ] =
            "Departure and destination cannot be the same.";
        }

        if (
          !segment.departureDate
        ) {
          errors[
            `segment${index}Date`
          ] =
            "Select a departure date.";
        }

        if (
          index > 0 &&
          segment.departureDate &&
          search
            .multiCitySegments[
            index - 1
          ]
            .departureDate &&
          segment.departureDate <
            search
              .multiCitySegments[
              index - 1
            ]
              .departureDate
        ) {
          errors[
            `segment${index}Date`
          ] =
            "This date cannot be before the previous flight.";
        }
      }
    );
  }

  /* NORMAL */

  if (
    search.tripType !==
    "multicity"
  ) {
    if (!search.origin?.code) {
      errors.origin =
        "Select departure airport.";
    }

    if (
      !search.destination?.code
    ) {
      errors.destination =
        "Select destination airport.";
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
      search.tripType ===
        "roundtrip" &&
      !search.returnDate
    ) {
      errors.returnDate =
        "Select a return date.";
    }

    if (
      search.tripType ===
        "roundtrip" &&
      search.departureDate &&
      search.returnDate &&
      search.returnDate <
        search.departureDate
    ) {
      errors.returnDate =
        "Return date cannot be before departure.";
    }
  }

  if (
    !search.adults ||
    Number(search.adults) <
      1
  ) {
    errors.passengers =
      "At least one adult is required.";
  }

  return errors;
}

/* =========================================================
   SMALL UI COMPONENTS
   ========================================================= */

function ErrorMessage({
  children
}) {
  if (!children) {
    return null;
  }

  return (
    <span
      className="fm-booking-field-error"
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
    <div className="fm-booking-airport-display">
      <span className="fm-booking-field-label">
        {label}
      </span>

      <div className="fm-booking-airport-main">
        <strong>
          {airport?.code ||
            "---"}
        </strong>

        <div className="fm-booking-airport-location">
          <span>
            {airport?.city ||
              fallback}
          </span>

          {airport?.name && (
            <small>
              {airport.name}
            </small>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

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

  /* -------------------------------------
     INITIAL SEARCH
     ------------------------------------- */

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

  /* -------------------------------------
     GENERAL UPDATE
     ------------------------------------- */

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
        const next = {
          ...current
        };

        delete next[field];

        return next;
      }
    );
  }

  /* -------------------------------------
     TRIP TYPE
     ------------------------------------- */

  function handleTripTypeChange(
    type
  ) {
    setSearch(
      (current) => {
        if (
          type ===
          "multicity"
        ) {
          return {
            ...current,
            tripType:
              "multicity"
          };
        }

        return {
          ...current,
          tripType: type,
          returnDate:
            type ===
            "roundtrip"
              ? current.returnDate
              : ""
        };
      }
    );

    setErrors({});
  }

  /* -------------------------------------
     PASSENGERS
     ------------------------------------- */

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

  /* -------------------------------------
     DEPARTURE
     ------------------------------------- */

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

  /* -------------------------------------
     SWAP
     ------------------------------------- */

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
      {}
    );
  }

  /* -------------------------------------
     MULTI CITY UPDATE
     ------------------------------------- */

  function updateMultiCitySegment(
    index,
    field,
    value
  ) {
    setSearch(
      (current) => {
        const segments =
          [
            ...current.multiCitySegments
          ];

        segments[index] = {
          ...segments[index],
          [field]: value
        };

        return {
          ...current,
          multiCitySegments:
            segments
        };
      }
    );

    setErrors(
      (current) => {
        const next = {
          ...current
        };

        delete next[
          `segment${index}Origin`
        ];

        delete next[
          `segment${index}Destination`
        ];

        delete next[
          `segment${index}Date`
        ];

        return next;
      }
    );
  }

  /* -------------------------------------
     ADD MULTI CITY LEG
     ------------------------------------- */

  function addMultiCitySegment() {
    if (
      search.multiCitySegments
        .length >=
      MAX_MULTI_CITY_SEGMENTS
    ) {
      return;
    }

    setSearch(
      (current) => ({
        ...current,

        multiCitySegments: [
          ...current.multiCitySegments,

          {
            origin: null,
            destination: null,
            departureDate: ""
          }
        ]
      })
    );
  }

  /* -------------------------------------
     REMOVE MULTI CITY LEG
     ------------------------------------- */

  function removeMultiCitySegment(
    index
  ) {
    if (
      search.multiCitySegments
        .length <= 2
    ) {
      return;
    }

    setSearch(
      (current) => ({
        ...current,

        multiCitySegments:
          current.multiCitySegments.filter(
            (_, itemIndex) =>
              itemIndex !== index
          )
      })
    );

    setErrors({});
  }

  /* -------------------------------------
     SUBMIT
     ------------------------------------- */

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
        JSON.stringify(
          payload
        )
      );

      const query =
        buildSearchQuery(
          search
        );

      if (
        typeof onSearch ===
        "function"
      ) {
        await onSearch(
          payload
        );
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
      setIsSubmitting(
        false
      );
    }
  }

  const totalTravelers =
    Number(search.adults) +
    Number(search.children) +
    Number(search.infants);

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <form
      className={[
        "fm-flight-search-form",
        "fm-wakanow-search",
        compact
          ? "fm-flight-search-form-compact"
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
      onSubmit={
        handleSubmit
      }
      noValidate
    >

      {/* ===============================================
          TRIP TYPE
          =============================================== */}

      <div className="fm-booking-tabs">

        <button
          type="button"
          className={
            search.tripType ===
            "roundtrip"
              ? "active"
              : ""
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
              ? "active"
              : ""
          }
          onClick={() =>
            handleTripTypeChange(
              "oneway"
            )
          }
        >
          One way
        </button>

        <button
          type="button"
          className={
            search.tripType ===
            "multicity"
              ? "active"
              : ""
          }
          onClick={() =>
            handleTripTypeChange(
              "multicity"
            )
          }
        >
          Multi-city
        </button>

      </div>

      {/* ===============================================
          STANDARD SEARCH
          =============================================== */}

      {search.tripType !==
        "multicity" && (
        <>
          <div className="fm-booking-route-stack">

            <div className="fm-booking-route-field">

              <AirportDisplay
                value={
                  search.origin
                }
                fallback="City or airport"
                label="FROM"
              />

              <AirportSearch
                id="flight-origin"
                value={
                  search.origin
                }
                placeholder="City or airport"
                ariaLabel="Departure airport"
                onChange={(
                  airport
                ) =>
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

            <button
              type="button"
              className="fm-booking-swap"
              onClick={
                swapAirports
              }
              title="Swap airports"
              aria-label="Swap departure and destination airports"
            >
              ⇅
            </button>

            <div className="fm-booking-route-field">

              <AirportDisplay
                value={
                  search.destination
                }
                fallback="City or airport"
                label="TO"
              />

              <AirportSearch
                id="flight-destination"
                value={
                  search.destination
                }
                placeholder="City or airport"
                ariaLabel="Destination airport"
                onChange={(
                  airport
                ) =>
                  updateField(
                    "destination",
                    normalizeAirport(
                      airport
                    )
                  )
                }
              />

              <ErrorMessage>
                {
                  errors.destination
                }
              </ErrorMessage>

            </div>

          </div>

          {/* DATE ROW */}

          <div className="fm-booking-date-row">

            <div className="fm-booking-date-field">

              <span className="fm-booking-field-label">
                DEPARTURE
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
              />

              <span className="fm-booking-value">
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

            <div
              className={[
                "fm-booking-date-field",
                search.tripType !==
                  "roundtrip"
                  ? "disabled"
                  : ""
              ].join(" ")}
            >

              <span className="fm-booking-field-label">
                RETURN
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
                onChange={(
                  event
                ) =>
                  updateField(
                    "returnDate",
                    event.target
                      .value
                  )
                }
              />

              <span className="fm-booking-value">
                {search.tripType !==
                "roundtrip"
                  ? "One way"
                  : search.returnDate
                    ? formatDateForDisplay(
                        search.returnDate
                      )
                    : "Select date"}
              </span>

              <ErrorMessage>
                {
                  errors.returnDate
                }
              </ErrorMessage>

            </div>

          </div>

        </>
      )}

      {/* ===============================================
          MULTI CITY
          =============================================== */}

      {search.tripType ===
        "multicity" && (
        <div className="fm-multicity-container">

          {search.multiCitySegments.map(
            (
              segment,
              index
            ) => (
              <div
                className="fm-multicity-leg"
                key={index}
              >

                <div className="fm-multicity-leg-header">
                  <strong>
                    Flight{" "}
                    {index + 1}
                  </strong>

                  {search
                    .multiCitySegments
                    .length >
                    2 && (
                    <button
                      type="button"
                      className="fm-remove-leg"
                      onClick={() =>
                        removeMultiCitySegment(
                          index
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="fm-multicity-route">

                  <div className="fm-booking-route-field">

                    <AirportDisplay
                      value={
                        segment.origin
                      }
                      fallback="City or airport"
                      label="FROM"
                    />

                    <AirportSearch
                      id={`multicity-origin-${index}`}
                      value={
                        segment.origin
                      }
                      placeholder="City or airport"
                      ariaLabel={`Flight ${index + 1} departure airport`}
                      onChange={(
                        airport
                      ) =>
                        updateMultiCitySegment(
                          index,
                          "origin",
                          normalizeAirport(
                            airport
                          )
                        )
                      }
                    />

                    <ErrorMessage>
                      {
                        errors[
                          `segment${index}Origin`
                        ]
                      }
                    </ErrorMessage>

                  </div>

                  <div className="fm-multicity-arrow">
                    →
                  </div>

                  <div className="fm-booking-route-field">

                    <AirportDisplay
                      value={
                        segment.destination
                      }
                      fallback="City or airport"
                      label="TO"
                    />

                    <AirportSearch
                      id={`multicity-destination-${index}`}
                      value={
                        segment.destination
                      }
                      placeholder="City or airport"
                      ariaLabel={`Flight ${index + 1} destination airport`}
                      onChange={(
                        airport
                      ) =>
                        updateMultiCitySegment(
                          index,
                          "destination",
                          normalizeAirport(
                            airport
                          )
                        )
                      }
                    />

                    <ErrorMessage>
                      {
                        errors[
                          `segment${index}Destination`
                        ]
                      }
                    </ErrorMessage>

                  </div>

                </div>

                <div className="fm-multicity-date">

                  <span className="fm-booking-field-label">
                    DEPARTURE
                  </span>

                  <input
                    type="date"
                    min={
                      index > 0 &&
                      search
                        .multiCitySegments[
                        index - 1
                      ]
                        .departureDate ||
                      today
                    }
                    value={
                      segment.departureDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateMultiCitySegment(
                        index,
                        "departureDate",
                        event.target
                          .value
                      )
                    }
                  />

                  <span className="fm-booking-value">
                    {segment.departureDate
                      ? formatDateForDisplay(
                          segment.departureDate
                        )
                      : "Select date"}
                  </span>

                  <ErrorMessage>
                    {
                      errors[
                        `segment${index}Date`
                      ]
                    }
                  </ErrorMessage>

                </div>

              </div>
            )
          )}

          {search
            .multiCitySegments
            .length <
            MAX_MULTI_CITY_SEGMENTS && (
            <button
              type="button"
              className="fm-add-leg"
              onClick={
                addMultiCitySegment
              }
            >
              + Add another flight
            </button>
          )}

        </div>
      )}

      {/* ===============================================
          TRAVELLERS
          =============================================== */}

      <div className="fm-booking-travellers">

        <span className="fm-booking-field-label">
          TRAVELLERS
        </span>

        <PassengerSelector
          adults={
            search.adults
          }
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

        <span className="fm-booking-value">
          {totalTravelers}{" "}
          {totalTravelers ===
          1
            ? "Adult"
            : "Travellers"}
        </span>

        <ErrorMessage>
          {errors.passengers}
        </ErrorMessage>

      </div>

      {/* ===============================================
          BOTTOM ACTION ROW
          =============================================== */}

      <div className="fm-booking-bottom-row">

        <div className="fm-booking-class">

          <label
            htmlFor="cabin-class"
            className="sr-only"
          >
            Cabin class
          </label>

          <select
            id="cabin-class"
            value={
              search.cabin
            }
            onChange={(
              event
            ) =>
              updateField(
                "cabin",
                event.target
                  .value
              )
            }
          >
            {CABIN_OPTIONS.map(
              (
                option
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>

        </div>

        <button
          type="submit"
          className="fm-booking-search-button"
          disabled={
            isSubmitting
          }
        >
          {isSubmitting
            ? "Searching..."
            : "Search flights"}
        </button>

      </div>

      {/* ===============================================
          ADVANCED OPTIONS
          =============================================== */}

      <div className="fm-booking-options">

        <button
          type="button"
          className="fm-booking-options-toggle"
          onClick={() =>
            setShowAdvanced(
              (
                current
              ) => !current
            )
          }
          aria-expanded={
            showAdvanced
          }
        >
          <span>
            {showAdvanced
              ? "Hide search options"
              : "More search options"}
          </span>

          <span>
            {showAdvanced
              ? "−"
              : "+"}
          </span>
        </button>

        {showAdvanced && (
          <div className="fm-booking-options-panel">

            <label htmlFor="stops">
              Stops
            </label>

            <select
              id="stops"
              value={
                search.stops
              }
              onChange={(
                event
              ) =>
                updateField(
                  "stops",
                  event.target
                    .value
                )
              }
            >
              {STOP_OPTIONS.map(
                (
                  option
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>

          </div>
        )}

      </div>

      {/* ===============================================
          ERROR
          =============================================== */}

      {errors.form && (
        <div
          className="fm-booking-form-error"
          role="alert"
        >
          {errors.form}
        </div>
      )}

      {/* ===============================================
          DISCLAIMER
          =============================================== */}

      <div className="fm-booking-disclaimer">
        Prices and availability are
        provided by the relevant
        travel provider. Final terms
        are confirmed before booking.
      </div>

    </form>
  );
}
