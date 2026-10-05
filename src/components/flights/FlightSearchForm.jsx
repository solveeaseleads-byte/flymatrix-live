import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import AirportSearch from "./AirportSearch.jsx";
import PassengerSelector from "./PassengerSelector.jsx";
import { navigate } from "../../router/AppRouter.jsx";

/* =========================================================
   DEFAULT SEARCH
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

  multiCityLegs: [
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

/* =========================================================
   CABIN OPTIONS
   ========================================================= */

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

/* =========================================================
   STOP OPTIONS
   ========================================================= */

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
   SEARCH PAYLOAD
   ========================================================= */

function buildSearchPayload(search) {
  const adults =
    Number(search.adults) || 1;

  const children =
    Number(search.children) || 0;

  const infants =
    Number(search.infants) || 0;

  const payload = {
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

  /*
   * MULTI-CITY
   */

  if (
    search.tripType ===
    "multicity"
  ) {
    payload.multiCityLegs = (
      search.multiCityLegs ||
      []
    ).map((leg) => ({
      origin:
        normalizeAirport(
          leg.origin
        ),

      destination:
        normalizeAirport(
          leg.destination
        ),

      departureDate:
        leg.departureDate || ""
    }));

    return payload;
  }

  /*
   * NORMAL SEARCH
   */

  payload.origin =
    normalizeAirport(
      search.origin
    );

  payload.destination =
    normalizeAirport(
      search.destination
    );

  payload.departureDate =
    search.departureDate;

  payload.returnDate =
    search.tripType ===
    "roundtrip"
      ? search.returnDate
      : "";

  return payload;
}

/* =========================================================
   QUERY STRING
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

  if (
    search.stops &&
    search.stops !== "any"
  ) {
    params.set(
      "stops",
      search.stops
    );
  }

  /*
   * MULTI-CITY QUERY
   */

  if (
    search.tripType ===
    "multicity"
  ) {
    const legs =
      search.multiCityLegs ||
      [];

    params.set(
      "legs",
      JSON.stringify(
        legs.map((leg) => ({
          origin:
            leg.origin?.code ||
            "",

          destination:
            leg.destination?.code ||
            "",

          departureDate:
            leg.departureDate ||
            ""
        }))
      )
    );

    return params;
  }

  /*
   * NORMAL QUERY
   */

  if (search.origin?.code) {
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

  /*
   * MULTI-CITY
   */

  if (
    search.tripType ===
    "multicity"
  ) {
    const legs =
      search.multiCityLegs ||
      [];

    if (legs.length < 2) {
      errors.form =
        "Add at least two flights.";
    }

    legs.forEach(
      (leg, index) => {
        if (!leg.origin?.code) {
          errors[
            `leg-${index}-origin`
          ] =
            `Select the departure airport for Flight ${
              index + 1
            }.`;
        }

        if (
          !leg.destination?.code
        ) {
          errors[
            `leg-${index}-destination`
          ] =
            `Select the destination airport for Flight ${
              index + 1
            }.`;
        }

        if (
          leg.origin?.code &&
          leg.destination?.code &&
          leg.origin.code ===
            leg.destination.code
        ) {
          errors[
            `leg-${index}-destination`
          ] =
            `Flight ${
              index + 1
            } cannot have the same departure and destination airport.`;
        }

        if (
          !leg.departureDate
        ) {
          errors[
            `leg-${index}-date`
          ] =
            `Select a departure date for Flight ${
              index + 1
            }.`;
        }

        if (
          index > 0 &&
          legs[index - 1]
            ?.departureDate &&
          leg.departureDate &&
          leg.departureDate <
            legs[index - 1]
              .departureDate
        ) {
          errors[
            `leg-${index}-date`
          ] =
            `Flight ${
              index + 1
            } cannot depart before Flight ${
              index
            }.`;
        }
      }
    );

    /*
     * Passenger validation
     */

    if (
      !search.adults ||
      Number(search.adults) < 1
    ) {
      errors.passengers =
        "At least one adult passenger is required.";
    }

    return errors;
  }

  /*
   * NORMAL SEARCH
   */

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

  if (
    !search.adults ||
    Number(search.adults) < 1
  ) {
    errors.passengers =
      "At least one adult passenger is required.";
  }

  return errors;
}

/* =========================================================
   ERROR MESSAGE
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

/* =========================================================
   AIRPORT DISPLAY
   ========================================================= */

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
            ""}
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
   COMPONENT
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

  const today = useMemo(
    () => getToday(),
    []
  );

  /*
   * APPLY INITIAL SEARCH
   */

  useEffect(() => {
    if (!initialSearch) {
      return;
    }

    setSearch(
      (current) => ({
        ...current,
        ...initialSearch,

        multiCityLegs:
          initialSearch.multiCityLegs ||
          current.multiCityLegs
      })
    );
  }, [initialSearch]);

  /* =======================================================
     FIELD UPDATE
     ======================================================= */

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

  /* =======================================================
     TRIP TYPE
     ======================================================= */

  function handleTripTypeChange(
    type
  ) {
    setSearch(
      (current) => ({
        ...current,

        tripType:
          type,

        returnDate:
          type === "roundtrip"
            ? current.returnDate
            : ""
      })
    );

    setErrors({});
  }

  /* =======================================================
     PASSENGERS
     ======================================================= */

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

  /* =======================================================
     DEPARTURE
     ======================================================= */

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

  /* =======================================================
     RETURN
     ======================================================= */

  function handleReturnChange(
    event
  ) {
    updateField(
      "returnDate",
      event.target.value
    );
  }

  /* =======================================================
     SWAP
     ======================================================= */

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

  /* =======================================================
     MULTI-CITY LEG UPDATE
     ======================================================= */

  function updateMultiCityLeg(
    index,
    field,
    value
  ) {
    setSearch(
      (current) => {
        const legs = [
          ...(current.multiCityLegs ||
            [])
        ];

        legs[index] = {
          ...legs[index],
          [field]: value
        };

        return {
          ...current,

          multiCityLegs:
            legs
        };
      }
    );

    setErrors({});
  }

  /* =======================================================
     ADD MULTI-CITY LEG
     ======================================================= */

  function addMultiCityLeg() {
    setSearch(
      (current) => {
        const legs = [
          ...(current.multiCityLegs ||
            [])
        ];

        /*
         * Maximum 4 legs.
         */

        if (legs.length >= 4) {
          return current;
        }

        legs.push({
          origin: null,
          destination: null,
          departureDate: ""
        });

        return {
          ...current,

          multiCityLegs:
            legs
        };
      }
    );
  }

  /* =======================================================
     REMOVE MULTI-CITY LEG
     ======================================================= */

  function removeMultiCityLeg(
    index
  ) {
    setSearch(
      (current) => {
        const legs = [
          ...(current.multiCityLegs ||
            [])
        ];

        if (legs.length <= 2) {
          return current;
        }

        legs.splice(index, 1);

        return {
          ...current,

          multiCityLegs:
            legs
        };
      }
    );

    setErrors({});
  }

  /* =======================================================
     SUBMIT
     ======================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const validationErrors =
      validateSearch(search);

    if (
      Object.keys(
        validationErrors
      ).length > 0
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

      /*
       * Save complete search.
       */

      sessionStorage.setItem(
        "flymatrix:lastSearch",
        JSON.stringify(payload)
      );

      /*
       * Build URL.
       */

      const query =
        buildSearchQuery(
          search
        );

      /*
       * Optional callback.
       */

      if (
        typeof onSearch ===
        "function"
      ) {
        await onSearch(
          payload
        );
      }

      /*
       * Navigate to results.
       */

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

  /* =======================================================
     TRAVELER TOTAL
     ======================================================= */

  const totalTravelers =
    Number(search.adults) +
    Number(search.children) +
    Number(search.infants);

  /* =======================================================
     CURRENT CABIN
     ======================================================= */

  const currentCabin =
    CABIN_OPTIONS.find(
      (item) =>
        item.value ===
        search.cabin
    ) ||
    CABIN_OPTIONS[0];

  /* =======================================================
     RENDER
     ======================================================= */

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

      {/* =================================================
          TRIP TYPE
          ================================================= */}

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

      {/* =================================================
          NORMAL ROUTE SEARCH
          ================================================= */}

      {search.tripType !==
        "multicity" && (
        <>
          <div className="fm-booking-main-row">

            {/* FROM */}

            <div className="fm-booking-route-field">

              <AirportDisplay
                value={
                  search.origin
                }
                fallback="City or airport"
                label="From"
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
                {
                  errors.origin
                }
              </ErrorMessage>

            </div>

            {/* SWAP */}

            <button
              type="button"
              className="fm-booking-swap"
              onClick={
                swapAirports
              }
              title="Swap airports"
              aria-label="Swap departure and destination airports"
            >
              ⇄
            </button>

            {/* TO */}

            <div className="fm-booking-route-field">

              <AirportDisplay
                value={
                  search.destination
                }
                fallback="City or airport"
                label="To"
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

          {/* =================================================
              DATES
              ================================================= */}

          <div className="fm-booking-details-row">

            {/* DEPARTURE */}

            <div className="fm-booking-detail-field">

              <span className="fm-booking-field-label">
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
                aria-invalid={Boolean(
                  errors.departureDate
                )}
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

            {/* RETURN */}

            <div
              className={[
                "fm-booking-detail-field",

                search.tripType !==
                  "roundtrip"
                  ? "disabled"
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >

              <span className="fm-booking-field-label">
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
                aria-invalid={Boolean(
                  errors.returnDate
                )}
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

      {/* =================================================
          MULTI-CITY
          ================================================= */}

      {search.tripType ===
        "multicity" && (
        <div className="fm-booking-multicity">

          {(search.multiCityLegs ||
            []
          ).map(
            (
              leg,
              index
            ) => (
              <div
                className="fm-multicity-leg"
                key={
                  `leg-${index}`
                }
              >

                <div className="fm-multicity-leg-header">

                  <strong>
                    Flight{" "}
                    {index + 1}
                  </strong>

                  {index >=
                    2 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeMultiCityLeg(
                          index
                        )
                      }
                    >
                      Remove
                    </button>
                  )}

                </div>

                <div className="fm-booking-main-row">

                  {/* LEG FROM */}

                  <div className="fm-booking-route-field">

                    <AirportDisplay
                      value={
                        leg.origin
                      }
                      fallback="City or airport"
                      label="From"
                    />

                    <AirportSearch
                      id={`multicity-origin-${index}`}
                      value={
                        leg.origin
                      }
                      placeholder="City or airport"
                      ariaLabel={`Flight ${
                        index + 1
                      } departure airport`}
                      onChange={(
                        airport
                      ) =>
                        updateMultiCityLeg(
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
                          `leg-${index}-origin`
                        ]
                      }
                    </ErrorMessage>

                  </div>

                  {/* LEG TO */}

                  <div className="fm-booking-route-field">

                    <AirportDisplay
                      value={
                        leg.destination
                      }
                      fallback="City or airport"
                      label="To"
                    />

                    <AirportSearch
                      id={`multicity-destination-${index}`}
                      value={
                        leg.destination
                      }
                      placeholder="City or airport"
                      ariaLabel={`Flight ${
                        index + 1
                      } destination airport`}
                      onChange={(
                        airport
                      ) =>
                        updateMultiCityLeg(
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
                          `leg-${index}-destination`
                        ]
                      }
                    </ErrorMessage>

                  </div>

                </div>

                {/* LEG DATE */}

                <div className="fm-multicity-date">

                  <span className="fm-booking-field-label">
                    Departure
                  </span>

                  <input
                    type="date"
                    min={today}
                    value={
                      leg.departureDate
                    }
                    onChange={(
                      event
                    ) =>
                      updateMultiCityLeg(
                        index,
                        "departureDate",
                        event.target
                          .value
                      )
                    }
                    aria-label={`Flight ${
                      index + 1
                    } departure date`}
                  />

                  <ErrorMessage>
                    {
                      errors[
                        `leg-${index}-date`
                      ]
                    }
                  </ErrorMessage>

                </div>

              </div>
            )
          )}

          {/* ADD FLIGHT */}

          {(
            search.multiCityLegs ||
            []
          ).length < 4 && (
            <button
              type="button"
              className="fm-add-flight"
              onClick={
                addMultiCityLeg
              }
            >
              + Add another flight
            </button>
          )}

        </div>
      )}

      {/* =================================================
          TRAVELLERS
          ================================================= */}

      <div className="fm-booking-travellers">

        <div className="fm-booking-travellers-content">

          <span className="fm-booking-field-label">
            Travellers
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

          <span className="fm-booking-traveller-value">
            {totalTravelers}{" "}
            {totalTravelers ===
            1
              ? "Adult"
              : "Travellers"}
          </span>

        </div>

        <ErrorMessage>
          {errors.passengers}
        </ErrorMessage>

      </div>

      {/* =================================================
          BOTTOM ACTION ROW
          ================================================= */}

      <div className="fm-booking-action-row">

        {/* CABIN */}

        <div className="fm-booking-cabin">

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

          <span className="fm-booking-cabin-current">
            {
              currentCabin.label
            }
          </span>

        </div>

        {/* SEARCH */}

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

      {/* =================================================
          OPTIONAL STOP FILTER
          ================================================= */}

      <details className="fm-booking-extra-options">

        <summary>
          More flight options
        </summary>

        <div className="fm-booking-extra-content">

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
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>

        </div>

      </details>

      {/* =================================================
          FORM ERROR
          ================================================= */}

      {errors.form && (
        <div
          className="fm-booking-form-error"
          role="alert"
        >
          {errors.form}
        </div>
      )}

      {/* =================================================
          DISCLAIMER
          ================================================= */}

      <div className="fm-booking-disclaimer">
        Prices and availability are
        provided by the relevant travel
        provider. Final terms are confirmed
        before booking.
      </div>

    </form>
  );
}
