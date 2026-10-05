import React, { useMemo, useState } from "react";
import { navigate } from "../router/AppRouter.jsx";

const ESSENTIALS = [
  {
    id: "documents",
    icon: "▣",
    title: "Travel documents",
    description:
      "Keep your passport, visa documents, tickets, reservations and other required records organized.",
    items: [
      "Passport validity",
      "Visa or entry authorization",
      "Flight confirmation",
      "Accommodation confirmation",
      "Travel insurance documents",
      "Copies of important documents",
    ],
  },
  {
    id: "money",
    icon: "$",
    title: "Money & payments",
    description:
      "Prepare payment methods and a practical backup plan for your destination.",
    items: [
      "Primary payment card",
      "Backup payment method",
      "Some local currency",
      "Emergency funds",
      "Bank travel notifications",
    ],
  },
  {
    id: "connectivity",
    icon: "◉",
    title: "Connectivity",
    description:
      "Plan how you will stay connected after arrival.",
    items: [
      "eSIM or local SIM",
      "Roaming settings",
      "Offline maps",
      "Important phone numbers",
      "Accommodation address",
    ],
  },
  {
    id: "health",
    icon: "+",
    title: "Health & safety",
    description:
      "Prepare appropriate health and safety items for the trip.",
    items: [
      "Required medication",
      "Prescription information",
      "Travel insurance",
      "Destination health requirements",
      "Emergency contacts",
      "Basic first-aid items",
    ],
  },
  {
    id: "packing",
    icon: "□",
    title: "Packing",
    description:
      "Build a practical packing list around the destination, duration and activities.",
    items: [
      "Weather-appropriate clothing",
      "Comfortable footwear",
      "Chargers and adapters",
      "Personal-care items",
      "Required documents",
      "Activity-specific equipment",
    ],
  },
  {
    id: "arrival",
    icon: "→",
    title: "Arrival",
    description:
      "Reduce arrival friction by preparing your first few hours before departure.",
    items: [
      "Airport transfer",
      "Accommodation check-in details",
      "Offline address",
      "Local transport plan",
      "Emergency contact information",
    ],
  },
];

const DESTINATIONS = [
  "London",
  "Paris",
  "Dubai",
  "Lisbon",
  "Madrid",
  "Rome",
  "Istanbul",
  "Toronto",
  "New York",
  "Cape Town",
  "Nairobi",
  "Tokyo",
  "Singapore",
  "Bangkok",
  "Kuala Lumpur",
];

const DEFAULT_PLAN = {
  destination: "",
  days: 7,
  travelStyle: "Balanced",
};

function storageKey(destination) {
  return `flymatrix:essentials:${destination
    .trim()
    .toLowerCase()}`;
}

function loadChecklist(destination) {
  if (!destination) {
    return {};
  }

  try {
    const saved = sessionStorage.getItem(
      storageKey(destination)
    );

    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function getDateLabel() {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export default function EssentialsPage() {
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [checked, setChecked] = useState({});
  const [saved, setSaved] = useState(false);

  const totalItems = useMemo(
    () =>
      ESSENTIALS.reduce(
        (total, category) =>
          total + category.items.length,
        0
      ),
    []
  );

  const completedItems =
    Object.values(checked).filter(Boolean).length;

  const completion =
    totalItems > 0
      ? Math.round(
          (completedItems / totalItems) * 100
        )
      : 0;

  function updatePlan(field, value) {
    setPlan((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  function toggleItem(categoryId, item) {
    const key = `${categoryId}:${item}`;

    setChecked((current) => {
      const next = {
        ...current,
        [key]: !current[key],
      };

      if (plan.destination) {
        try {
          sessionStorage.setItem(
            storageKey(plan.destination),
            JSON.stringify(next)
          );
        } catch {
          // Storage is optional.
        }
      }

      return next;
    });

    setSaved(false);
  }

  function saveChecklist() {
    if (!plan.destination) {
      return;
    }

    try {
      sessionStorage.setItem(
        storageKey(plan.destination),
        JSON.stringify(checked)
      );

      sessionStorage.setItem(
        "flymatrix:essentialsPlan",
        JSON.stringify(plan)
      );

      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function loadDestinationChecklist(destination) {
    const savedChecklist =
      loadChecklist(destination);

    setChecked(savedChecklist);

    setPlan((current) => ({
      ...current,
      destination,
    }));

    setSaved(false);
  }

  function clearChecklist() {
    setChecked({});
    setSaved(false);

    if (plan.destination) {
      try {
        sessionStorage.removeItem(
          storageKey(plan.destination)
        );
      } catch {
        // Storage is optional.
      }
    }
  }

  function openEsim() {
    navigate("/esim");
  }

  function openLuggage() {
    navigate("/luggage");
  }

  function openVisa() {
    navigate("/visa");
  }

  function openAssistance() {
    navigate("/assistance");
  }

  return (
    <main className="fm-essentials-page">
      <section className="fm-section fm-essentials-section">
        <div className="fm-container">

          <header className="fm-page-header fm-essentials-header">
            <div className="fm-essentials-header-content">
              <span className="fm-eyebrow">
                TRAVEL ESSENTIALS
              </span>

              <h1>
                Prepare before you travel
              </h1>

              <p>
                Organize the practical parts of
                your trip before departure with a
                reusable preparation checklist.
              </p>
            </div>

            <div className="fm-essentials-header-badge">
              <span className="fm-essentials-header-icon">
                ✓
              </span>

              <div>
                <strong>
                  Personal checklist
                </strong>

                <span>
                  Track your preparation in one place
                </span>
              </div>
            </div>
          </header>

          <section className="fm-card fm-essentials-planner-card">
            <div className="fm-essentials-planner-heading">
              <div>
                <span className="fm-eyebrow">
                  PERSONAL CHECKLIST
                </span>

                <h2>
                  Build your preparation list
                </h2>

                <p>
                  Choose your destination, trip
                  length and travel style before
                  working through the checklist.
                </p>
              </div>

              <div className="fm-essentials-progress">
                <strong>
                  {completion}%
                </strong>

                <span>
                  {completedItems} of{" "}
                  {totalItems} completed
                </span>
              </div>
            </div>

            <div className="fm-essentials-form-grid">
              <div className="fm-form-field">
                <label htmlFor="essentials-destination">
                  Destination
                </label>

                <input
                  id="essentials-destination"
                  list="essentials-destinations"
                  value={plan.destination}
                  placeholder="Select or type a destination"
                  onChange={(event) =>
                    loadDestinationChecklist(
                      event.target.value
                    )
                  }
                />

                <datalist id="essentials-destinations">
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

              <div className="fm-form-field">
                <label htmlFor="essentials-days">
                  Trip length
                </label>

                <input
                  id="essentials-days"
                  type="number"
                  min="1"
                  max="365"
                  value={plan.days}
                  onChange={(event) =>
                    updatePlan(
                      "days",
                      Math.min(
                        Math.max(
                          Number(
                            event.target.value
                          ) || 1,
                          1
                        ),
                        365
                      )
                    )
                  }
                />
              </div>

              <div className="fm-form-field">
                <label htmlFor="essentials-style">
                  Travel style
                </label>

                <select
                  id="essentials-style"
                  value={plan.travelStyle}
                  onChange={(event) =>
                    updatePlan(
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
            </div>

            <div className="fm-actions fm-essentials-actions">
              <button
                type="button"
                className="fm-btn fm-btn-primary"
                disabled={!plan.destination}
                onClick={saveChecklist}
              >
                Save checklist
              </button>

              <button
                type="button"
                className="fm-btn fm-btn-secondary"
                onClick={clearChecklist}
              >
                Clear checklist
              </button>

              {saved && (
                <span className="fm-essentials-saved-message">
                  Checklist saved for this browser
                  session.
                </span>
              )}
            </div>
          </section>

          <section className="fm-card fm-essentials-overview">
            <div className="fm-essentials-overview-content">
              <span className="fm-eyebrow">
                TRIP OVERVIEW
              </span>

              <h2>
                {plan.destination ||
                  "Your destination"}
              </h2>

              <p>
                {plan.days}{" "}
                {plan.days === 1
                  ? "day"
                  : "days"}{" "}
                · {plan.travelStyle} travel ·
                Checklist generated{" "}
                {getDateLabel()}
              </p>
            </div>

            <div className="fm-essentials-progress-area">
              <div className="fm-essentials-progress-label">
                <span>
                  Preparation progress
                </span>

                <strong>
                  {completion}%
                </strong>
              </div>

              <div className="fm-essentials-progress-bar">
                <div
                  className="fm-essentials-progress-fill"
                  style={{
                    width: `${completion}%`,
                  }}
                />
              </div>
            </div>
          </section>

          <section className="fm-essentials-grid">
            {ESSENTIALS.map((category) => {
              const categoryCompleted =
                category.items.filter(
                  (item) =>
                    checked[
                      `${category.id}:${item}`
                    ]
                ).length;

              return (
                <article
                  className="fm-card fm-essentials-card"
                  key={category.id}
                >
                  <div className="fm-essentials-card-header">
                    <div className="fm-essentials-icon">
                      {category.icon}
                    </div>

                    <div className="fm-essentials-card-title">
                      <h2>
                        {category.title}
                      </h2>

                      <span>
                        {categoryCompleted} /{" "}
                        {category.items.length}{" "}
                        complete
                      </span>
                    </div>
                  </div>

                  <p className="fm-essentials-card-description">
                    {category.description}
                  </p>

                  <div className="fm-essentials-checklist">
                    {category.items.map(
                      (item) => {
                        const key =
                          `${category.id}:${item}`;

                        const isChecked =
                          Boolean(
                            checked[key]
                          );

                        return (
                          <label
                            className={`fm-essentials-check-item ${
                              isChecked
                                ? "is-checked"
                                : ""
                            }`}
                            key={item}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                toggleItem(
                                  category.id,
                                  item
                                )
                              }
                            />

                            <span>
                              {item}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="fm-card fm-essentials-tools">
            <div className="fm-essentials-tools-heading">
              <div>
                <span className="fm-eyebrow">
                  FLYMATRIX TOOLS
                </span>

                <h2>
                  Continue preparing
                </h2>

                <p>
                  Open the dedicated FlyMatrix
                  services for specific travel
                  requirements.
                </p>
              </div>
            </div>

            <div className="fm-essentials-service-grid">
              <article className="fm-card fm-essentials-service-card">
                <div className="fm-essentials-service-top">
                  <div className="fm-essentials-service-icon">
                    ◉
                  </div>

                  <span>01</span>
                </div>

                <h3>
                  eSIM
                </h3>

                <p>
                  Review connectivity options for
                  your destination.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-btn-secondary"
                  onClick={openEsim}
                >
                  Open eSIM
                </button>
              </article>

              <article className="fm-card fm-essentials-service-card">
                <div className="fm-essentials-service-top">
                  <div className="fm-essentials-service-icon">
                    ▣
                  </div>

                  <span>02</span>
                </div>

                <h3>
                  Visa guidance
                </h3>

                <p>
                  Check available travel-document
                  guidance for your journey.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-btn-secondary"
                  onClick={openVisa}
                >
                  Check visa
                </button>
              </article>

              <article className="fm-card fm-essentials-service-card">
                <div className="fm-essentials-service-top">
                  <div className="fm-essentials-service-icon">
                    □
                  </div>

                  <span>03</span>
                </div>

                <h3>
                  Luggage storage
                </h3>

                <p>
                  Find luggage-storage options when
                  you need them.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-btn-secondary"
                  onClick={openLuggage}
                >
                  Find storage
                </button>
              </article>

              <article className="fm-card fm-essentials-service-card">
                <div className="fm-essentials-service-top">
                  <div className="fm-essentials-service-icon">
                    +
                  </div>

                  <span>04</span>
                </div>

                <h3>
                  Travel assistance
                </h3>

                <p>
                  Review assistance services before
                  your trip.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-btn-secondary"
                  onClick={openAssistance}
                >
                  Open assistance
                </button>
              </article>
            </div>
          </section>

          <section className="fm-card fm-essentials-notice">
            <div className="fm-essentials-notice-icon">
              !
            </div>

            <div>
              <strong>
                Important
              </strong>

              <p>
                This checklist provides general travel
                preparation guidance. Requirements can
                vary by destination, nationality,
                itinerary and individual circumstances.
                Confirm immigration, health, insurance
                and other official requirements with the
                relevant authorities and providers.
              </p>
            </div>
          </section>

        </div>
      </section>
    </main>
  );
}
