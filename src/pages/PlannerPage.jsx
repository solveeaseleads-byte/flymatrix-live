import React, { useMemo, useState } from "react";
import { navigate } from "../router/AppRouter.jsx";

const DEFAULT_PLAN = {
  destination: "",
  startDate: "",
  endDate: "",
  travelers: 1,
  budget: "",
  currency: "USD",
  travelStyle: "Balanced",
  notes: "",
};

const SERVICES = [
  {
    id: "flights",
    title: "Flights",
    description: "Search and compare flight options.",
    path: "/search",
  },
  {
    id: "hotels",
    title: "Hotels",
    description: "Find accommodation options.",
    path: "/hotels",
  },
  {
    id: "activities",
    title: "Activities",
    description: "Explore activities and tours.",
    path: "/activities",
  },
  {
    id: "visa",
    title: "Visa guidance",
    description: "Review travel-document guidance.",
    path: "/visa",
  },
  {
    id: "esim",
    title: "eSIM",
    description: "Arrange mobile connectivity.",
    path: "/esim",
  },
  {
    id: "transfers",
    title: "Transfers",
    description: "Review airport and local transfers.",
    path: "/transfers",
  },
  {
    id: "luggage",
    title: "Luggage",
    description: "Find luggage-storage options.",
    path: "/luggage",
  },
  {
    id: "assistance",
    title: "Assistance",
    description: "Review travel assistance services.",
    path: "/assistance",
  },
];

const DESTINATIONS = [
  "Lagos",
  "London",
  "Dubai",
  "Paris",
  "Lisbon",
  "Madrid",
  "Rome",
  "Istanbul",
  "Toronto",
  "New York",
  "Cape Town",
  "Nairobi",
  "Kuala Lumpur",
  "Tokyo",
  "Bangkok",
  "Bali",
];

function loadPlan() {
  try {
    const saved =
      sessionStorage.getItem(
        "flymatrix:tripPlan"
      );

    if (!saved) {
      return DEFAULT_PLAN;
    }

    return {
      ...DEFAULT_PLAN,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_PLAN;
  }
}

function calculateTripDays(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(
    `${startDate}T00:00:00`
  );

  const end = new Date(
    `${endDate}T00:00:00`
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  const difference =
    end.getTime() - start.getTime();

  return Math.max(
    Math.round(
      difference / 86400000
    ),
    0
  );
}

function formatDate(value) {
  if (!value) {
    return "Not selected";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function buildFlightSearch(plan) {
  const destination =
    plan.destination.trim();

  const query =
    new URLSearchParams();

  query.set(
    "destination",
    destination
  );

  if (plan.startDate) {
    query.set(
      "departureDate",
      plan.startDate
    );
  }

  if (plan.endDate) {
    query.set(
      "returnDate",
      plan.endDate
    );
  }

  query.set(
    "adults",
    String(plan.travelers || 1)
  );

  return `/search?${query.toString()}`;
}

export default function PlannerPage() {
  const [plan, setPlan] =
    useState(loadPlan);

  const [saved, setSaved] =
    useState(false);

  const tripDays = useMemo(
    () =>
      calculateTripDays(
        plan.startDate,
        plan.endDate
      ),
    [plan.startDate, plan.endDate]
  );

  function updateField(
    field,
    value
  ) {
    setPlan((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  function savePlan() {
    try {
      sessionStorage.setItem(
        "flymatrix:tripPlan",
        JSON.stringify(plan)
      );

      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function clearPlan() {
    setPlan(DEFAULT_PLAN);

    try {
      sessionStorage.removeItem(
        "flymatrix:tripPlan"
      );
    } catch {
      // Ignore storage errors.
    }

    setSaved(false);
  }

  function openService(path) {
    navigate(path);
  }

  return (
    <main className="page-container">
      <section className="planner-hero">
        <div>
          <span className="fm-badge">
            Trip Planner
          </span>

          <h1>
            Build your travel plan
          </h1>

          <p>
            Organize your destination, dates,
            travelers, budget and travel
            requirements before moving into
            individual booking services.
          </p>
        </div>
      </section>

      <section className="planner-layout">
        <div className="planner-form-card">
          <div className="planner-card-heading">
            <div>
              <span className="section-kicker">
                Step 1
              </span>

              <h2>
                Trip details
              </h2>
            </div>
          </div>

          <div className="tourism-form-grid">
            <div className="form-field">
              <label htmlFor="planner-destination">
                Destination
              </label>

              <input
                id="planner-destination"
                list="flymatrix-destinations"
                type="text"
                value={plan.destination}
                placeholder="e.g. London"
                onChange={(event) =>
                  updateField(
                    "destination",
                    event.target.value
                  )
                }
              />

              <datalist id="flymatrix-destinations">
                {DESTINATIONS.map(
                  (destination) => (
                    <option
                      key={destination}
                      value={destination}
                    />
                  )
                )}
              </datalist>
            </div>

            <div className="form-field">
              <label htmlFor="planner-travelers">
                Travelers
              </label>

              <input
                id="planner-travelers"
                type="number"
                min="1"
                max="9"
                value={plan.travelers}
                onChange={(event) =>
                  updateField(
                    "travelers",
                    Math.min(
                      Math.max(
                        Number(
                          event.target.value
                        ) || 1,
                        1
                      ),
                      9
                    )
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="planner-start">
                Departure
              </label>

              <input
                id="planner-start"
                type="date"
                value={plan.startDate}
                onChange={(event) =>
                  updateField(
                    "startDate",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="planner-end">
                Return
              </label>

              <input
                id="planner-end"
                type="date"
                min={plan.startDate || undefined}
                value={plan.endDate}
                onChange={(event) =>
                  updateField(
                    "endDate",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="planner-currency">
                Budget currency
              </label>

              <select
                id="planner-currency"
                value={plan.currency}
                onChange={(event) =>
                  updateField(
                    "currency",
                    event.target.value
                  )
                }
              >
                <option value="USD">
                  USD
                </option>

                <option value="EUR">
                  EUR
                </option>

                <option value="GBP">
                  GBP
                </option>

                <option value="CAD">
                  CAD
                </option>

                <option value="AUD">
                  AUD
                </option>

                <option value="NGN">
                  NGN
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="planner-budget">
                Total trip budget
              </label>

              <input
                id="planner-budget"
                type="number"
                min="0"
                placeholder="Enter your budget"
                value={plan.budget}
                onChange={(event) =>
                  updateField(
                    "budget",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="planner-style">
                Travel style
              </label>

              <select
                id="planner-style"
                value={plan.travelStyle}
                onChange={(event) =>
                  updateField(
                    "travelStyle",
                    event.target.value
                  )
                }
              >
                <option value="Budget">
                  Budget
                </option>

                <option value="Balanced">
                  Balanced
                </option>

                <option value="Comfort">
                  Comfort
                </option>

                <option value="Premium">
                  Premium
                </option>

                <option value="Luxury">
                  Luxury
                </option>
              </select>
            </div>

            <div className="form-field planner-notes-field">
              <label htmlFor="planner-notes">
                Notes
              </label>

              <textarea
                id="planner-notes"
                rows="4"
                placeholder="Add preferences, activities, accessibility needs or other trip notes..."
                value={plan.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="planner-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={savePlan}
            >
              Save trip plan
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearPlan}
            >
              Clear
            </button>

            {saved && (
              <span className="planner-saved-message">
                Plan saved for this browser
                session.
              </span>
            )}
          </div>
        </div>

        <aside className="planner-summary-card">
          <span className="section-kicker">
            Trip summary
          </span>

          <h2>
            {plan.destination ||
              "Your destination"}
          </h2>

          <div className="planner-summary-list">
            <div>
              <span>
                Departure
              </span>

              <strong>
                {formatDate(
                  plan.startDate
                )}
              </strong>
            </div>

            <div>
              <span>
                Return
              </span>

              <strong>
                {formatDate(
                  plan.endDate
                )}
              </strong>
            </div>

            <div>
              <span>
                Trip length
              </span>

              <strong>
                {tripDays
                  ? `${tripDays} ${
                      tripDays === 1
                        ? "day"
                        : "days"
                    }`
                  : "Not calculated"}
              </strong>
            </div>

            <div>
              <span>
                Travelers
              </span>

              <strong>
                {plan.travelers}
              </strong>
            </div>

            <div>
              <span>
                Budget
              </span>

              <strong>
                {plan.budget
                  ? `${plan.currency} ${Number(
                      plan.budget
                    ).toLocaleString()}`
                  : "Not specified"}
              </strong>
            </div>

            <div>
              <span>
                Style
              </span>

              <strong>
                {plan.travelStyle}
              </strong>
            </div>
          </div>

          {plan.notes && (
            <div className="planner-summary-notes">
              <span>
                Notes
              </span>

              <p>
                {plan.notes}
              </p>
            </div>
          )}
        </aside>
      </section>

      <section className="planner-services">
        <div className="planner-card-heading">
          <div>
            <span className="section-kicker">
              Step 2
            </span>

            <h2>
              Continue planning
            </h2>

            <p>
              Use the individual FlyMatrix
              services to research and prepare
              each part of your journey.
            </p>
          </div>
        </div>

        <div className="service-card-grid">
          {SERVICES.map((service) => (
            <article
              className="service-card"
              key={service.id}
            >
              <div className="service-card-icon">
                ✈
              </div>

              <h3>
                {service.title}
              </h3>

              <p>
                {service.description}
              </p>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  service.id ===
                    "flights" &&
                  plan.destination
                    ? navigate(
                        buildFlightSearch(
                          plan
                        )
                      )
                    : openService(
                        service.path
                      )
                }
              >
                Open
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="planner-notice">
        <strong>
          Planning and pricing notice
        </strong>

        <p>
          The planner stores your preferences
          locally in the current browser
          session. It does not guarantee provider
          prices, availability, admission,
          visa approval or booking confirmation.
          Final terms are supplied by the
          relevant provider.
        </p>
      </section>
    </main>
  );
}
