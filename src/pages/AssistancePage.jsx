import React, { useMemo, useState } from "react";

const AIRHELP_AFFILIATE_URL =
  "https://airhelp.tpk.lv/vuZpde9f";

const ASSISTANCE_TYPES = [
  {
    value: "flight-delay",
    label: "Flight delay",
  },
  {
    value: "flight-cancellation",
    label: "Flight cancellation",
  },
  {
    value: "missed-connection",
    label: "Missed connection",
  },
  {
    value: "baggage",
    label: "Baggage problem",
  },
  {
    value: "general",
    label: "General flight assistance",
  },
];

const SERVICE_AREAS = [
  {
    title: "Flight disruption",
    text:
      "Review available assistance when a flight is delayed, cancelled or otherwise disrupted.",
  },
  {
    title: "Missed connection",
    text:
      "Keep your itinerary details available when a disruption affects a connecting journey.",
  },
  {
    title: "Baggage problems",
    text:
      "Find information and provider assistance for baggage-related travel problems.",
  },
];

function buildProviderUrl({
  departure,
  arrival,
  flightDate,
  assistanceType,
}) {
  const params = new URLSearchParams();

  if (departure.trim()) {
    params.set(
      "departure",
      departure.trim()
    );
  }

  if (arrival.trim()) {
    params.set(
      "arrival",
      arrival.trim()
    );
  }

  if (flightDate) {
    params.set(
      "date",
      flightDate
    );
  }

  if (assistanceType) {
    params.set(
      "issue",
      assistanceType
    );
  }

  const query = params.toString();

  return query
    ? `${AIRHELP_AFFILIATE_URL}?${query}`
    : AIRHELP_AFFILIATE_URL;
}

function getSavedSearch() {
  try {
    const value =
      sessionStorage.getItem(
        "flymatrix:lastSearch"
      );

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default function AssistancePage() {
  const savedSearch = useMemo(
    () => getSavedSearch(),
    []
  );

  const [departure, setDeparture] =
    useState(
      savedSearch?.origin?.code ||
        savedSearch?.origin ||
        ""
    );

  const [arrival, setArrival] =
    useState(
      savedSearch?.destination?.code ||
        savedSearch?.destination ||
        ""
    );

  const [flightDate, setFlightDate] =
    useState(
      savedSearch?.departureDate ||
        ""
    );

  const [assistanceType, setAssistanceType] =
    useState("general");

  const [showGuide, setShowGuide] =
    useState(false);

  function openProvider() {
    const url = buildProviderUrl({
      departure,
      arrival,
      flightDate,
      assistanceType,
    });

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openPlanner() {
    const params =
      new URLSearchParams();

    if (arrival.trim()) {
      params.set(
        "destination",
        arrival.trim()
      );
    }

    window.location.href =
      `/planner?${params.toString()}`;
  }

  function loadSavedFlight() {
    const search =
      getSavedSearch();

    if (!search) {
      return;
    }

    setDeparture(
      search?.origin?.code ||
        search?.origin ||
        ""
    );

    setArrival(
      search?.destination?.code ||
        search?.destination ||
        ""
    );

    setFlightDate(
      search?.departureDate ||
        ""
    );
  }

  return (
    <main className="fm-page fm-assistance-page">
      <section className="fm-section fm-assistance-section">
        <div className="fm-container">

          <header className="fm-page-header fm-assistance-header">
            <span className="fm-eyebrow">
              TRAVEL ASSISTANCE
            </span>

            <h1>
              Flight & Travel Assistance
            </h1>

            <p>
              Prepare for disruptions, baggage
              problems and other flight-related
              issues, with access to a configured
              travel-assistance provider.
            </p>
          </header>

          <section className="fm-card fm-search-panel fm-assistance-search-card">

            <div className="fm-assistance-search-heading">
              <div>
                <span className="fm-eyebrow">
                  ASSISTANCE SEARCH
                </span>

                <h2>
                  Tell us what happened
                </h2>

                <p>
                  Add your flight details and choose
                  the type of assistance you need.
                </p>
              </div>
            </div>

            <div className="fm-search-grid fm-assistance-form-grid">

              <div className="fm-field">
                <label htmlFor="assistance-departure">
                  Departure airport
                </label>

                <input
                  id="assistance-departure"
                  type="text"
                  value={departure}
                  onChange={(event) =>
                    setDeparture(
                      event.target.value
                    )
                  }
                  placeholder="e.g. LOS"
                  autoComplete="off"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="assistance-arrival">
                  Arrival airport
                </label>

                <input
                  id="assistance-arrival"
                  type="text"
                  value={arrival}
                  onChange={(event) =>
                    setArrival(
                      event.target.value
                    )
                  }
                  placeholder="e.g. LHR"
                  autoComplete="off"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="assistance-date">
                  Flight date
                </label>

                <input
                  id="assistance-date"
                  type="date"
                  value={flightDate}
                  onChange={(event) =>
                    setFlightDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="fm-field">
                <label htmlFor="assistance-type">
                  What do you need help with?
                </label>

                <select
                  id="assistance-type"
                  value={assistanceType}
                  onChange={(event) =>
                    setAssistanceType(
                      event.target.value
                    )
                  }
                >
                  {ASSISTANCE_TYPES.map(
                    (item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

            <div className="fm-actions fm-assistance-actions">

              <button
                type="button"
                className="fm-btn fm-primary"
                onClick={openProvider}
              >
                Get assistance
              </button>

              <button
                type="button"
                className="fm-btn fm-secondary"
                onClick={loadSavedFlight}
              >
                Load my last flight
              </button>

            </div>

          </section>

          <section className="fm-section-inner fm-assistance-areas-section">

            <div className="fm-section-heading fm-assistance-section-heading">
              <div>
                <span className="fm-eyebrow">
                  ASSISTANCE AREAS
                </span>

                <h2>
                  What can you prepare for?
                </h2>
              </div>
            </div>

            <div className="fm-grid fm-assistance-area-grid">

              {SERVICE_AREAS.map(
                (item) => (
                  <article
                    className="fm-card fm-assistance-area-card"
                    key={item.title}
                  >
                    <span className="fm-badge">
                      Assistance
                    </span>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.text}
                    </p>

                    <button
                      type="button"
                      className="fm-btn fm-secondary"
                      onClick={() => {
                        const match =
                          ASSISTANCE_TYPES.find(
                            (type) =>
                              type.label
                                .toLowerCase()
                                .includes(
                                  item.title
                                    .toLowerCase()
                                )
                          );

                        if (match) {
                          setAssistanceType(
                            match.value
                          );
                        }
                      }}
                    >
                      Select assistance
                    </button>
                  </article>
                )
              )}

            </div>
          </section>

          <section className="fm-card fm-section-inner fm-assistance-checklist-card">

            <div className="fm-section-heading fm-assistance-checklist-heading">
              <div>
                <span className="fm-eyebrow">
                  BEFORE CONTACTING A PROVIDER
                </span>

                <h2>
                  Keep your travel details ready
                </h2>
              </div>
            </div>

            <p>
              Having your booking reference,
              flight number, departure date,
              airports and passenger details
              available can make it easier to
              explain a disruption.
            </p>

            <button
              type="button"
              className="fm-btn fm-secondary"
              onClick={() =>
                setShowGuide(
                  (current) => !current
                )
              }
            >
              {showGuide
                ? "Hide checklist"
                : "Show checklist"}
            </button>

            {showGuide && (
              <div className="fm-grid fm-assistance-checklist-grid">

                <article className="fm-card fm-assistance-check-card">
                  <div className="fm-assistance-check-icon">
                    01
                  </div>

                  <h3>
                    Booking information
                  </h3>

                  <p>
                    Keep your booking reference,
                    ticket information and the
                    name used for the reservation.
                  </p>
                </article>

                <article className="fm-card fm-assistance-check-card">
                  <div className="fm-assistance-check-icon">
                    02
                  </div>

                  <h3>
                    Flight information
                  </h3>

                  <p>
                    Note the flight number,
                    operating airline, scheduled
                    departure and arrival airports.
                  </p>
                </article>

                <article className="fm-card fm-assistance-check-card">
                  <div className="fm-assistance-check-icon">
                    03
                  </div>

                  <h3>
                    Disruption details
                  </h3>

                  <p>
                    Record notifications,
                    cancellation or delay messages,
                    and any instructions supplied
                    by the airline.
                  </p>
                </article>

                <article className="fm-card fm-assistance-check-card">
                  <div className="fm-assistance-check-icon">
                    04
                  </div>

                  <h3>
                    Receipts and evidence
                  </h3>

                  <p>
                    Keep relevant receipts and
                    travel documents when a
                    disruption creates additional
                    expenses.
                  </p>
                </article>

              </div>
            )}

          </section>

          <section className="fm-card fm-section-inner fm-assistance-planner-card">

            <span className="fm-eyebrow">
              TRIP PLANNER
            </span>

            <h2>
              Keep assistance alongside your itinerary
            </h2>

            <p>
              Combine flight details with hotels,
              activities, transfers, connectivity,
              luggage storage and other travel
              preparations.
            </p>

            <div className="fm-actions">

              <button
                type="button"
                className="fm-btn fm-primary"
                onClick={openPlanner}
              >
                Open trip planner
              </button>

              <button
                type="button"
                className="fm-btn fm-secondary"
                onClick={() =>
                  (window.location.href =
                    "/essentials")
                }
              >
                Travel essentials
              </button>

            </div>

          </section>

          <section className="fm-card fm-disclaimer fm-assistance-disclaimer">

            <strong>
              Assistance provider information
            </strong>

            <p>
              FlyMatrix does not itself provide
              airline compensation, legal advice,
              insurance decisions, claims handling or
              emergency services. Assistance,
              eligibility, claim requirements,
              compensation decisions, pricing and
              final terms are determined by the
              relevant provider and applicable
              conditions.
            </p>

            <p>
              For an immediate emergency, contact
              the appropriate local emergency
              service or the airline directly rather
              than relying on FlyMatrix.
            </p>

          </section>

        </div>
      </section>
    </main>
  );
}
