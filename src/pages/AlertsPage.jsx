import React, { useEffect, useState } from "react";

const STORAGE_KEY = "flymatrix:fareAlert";

const DEFAULT_ALERT = {
  origin: "",
  destination: "",
  departureDate: "",
  returnDate: "",
  tripType: "roundtrip",
  adults: 1,
  cabin: "economy",
  maxPrice: "",
  currency: "USD",
  email: "",
  enabled: true,
};

function loadAlert() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_ALERT;
    }

    return {
      ...DEFAULT_ALERT,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_ALERT;
  }
}

export default function AlertsPage() {
  const [alert, setAlert] = useState(loadAlert);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(alert)
      );
    } catch {
      // Storage may be unavailable in some browser configurations.
    }
  }, [alert]);

  function update(field, value) {
    setAlert((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setMessage("");
    setError("");
  }

  function validate() {
    if (!alert.origin.trim()) {
      return "Enter your departure airport.";
    }

    if (!alert.destination.trim()) {
      return "Enter your destination airport.";
    }

    if (!alert.departureDate) {
      return "Select a departure date.";
    }

    if (
      alert.tripType === "roundtrip" &&
      !alert.returnDate
    ) {
      return "Select a return date.";
    }

    if (
      alert.tripType === "roundtrip" &&
      alert.returnDate &&
      alert.returnDate < alert.departureDate
    ) {
      return "The return date cannot be before the departure date.";
    }

    if (
      !Number.isInteger(Number(alert.adults)) ||
      Number(alert.adults) < 1 ||
      Number(alert.adults) > 9
    ) {
      return "Adults must be between 1 and 9.";
    }

    if (
      alert.maxPrice !== "" &&
      (
        Number.isNaN(Number(alert.maxPrice)) ||
        Number(alert.maxPrice) <= 0
      )
    ) {
      return "Enter a valid maximum price.";
    }

    if (!alert.email.trim()) {
      return "Enter an email address for the alert.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        alert.email.trim()
      )
    ) {
      return "Enter a valid email address.";
    }

    return "";
  }

  async function saveAlert(event) {
    event.preventDefault();

    setSaved(false);
    setMessage("");
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(alert)
      );

      let backendRegistered = false;

      try {
        const response = await fetch(
          "/api/alerts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              origin: alert.origin.trim(),
              destination: alert.destination.trim(),
              departureDate: alert.departureDate,
              returnDate:
                alert.tripType === "roundtrip"
                  ? alert.returnDate
                  : null,
              tripType: alert.tripType,
              adults: Number(alert.adults),
              cabin: alert.cabin,
              maxPrice:
                alert.maxPrice === ""
                  ? null
                  : Number(alert.maxPrice),
              currency: alert.currency,
              email: alert.email.trim(),
              enabled: alert.enabled,
            }),
          }
        );

        if (response.ok) {
          backendRegistered = true;
        }
      } catch {
        /*
         * Local persistence remains available even
         * when the backend alert service is offline.
         */
      }

      setSaved(true);

      setMessage(
        backendRegistered
          ? "Your fare alert has been saved and registered."
          : "Your fare alert has been saved on this device. The live alert service is not currently available."
      );
    } finally {
      setLoading(false);
    }
  }

  function disableAlert() {
    const next = {
      ...alert,
      enabled: false,
    };

    setAlert(next);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch {
      // Ignore storage errors.
    }

    setSaved(true);
    setMessage(
      "The fare alert has been disabled on this device."
    );
  }

  function clearAlert() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }

    setAlert(DEFAULT_ALERT);
    setSaved(false);
    setMessage(
      "The saved fare alert has been cleared."
    );
    setError("");
  }

  function openSearch() {
    const params = new URLSearchParams();

    if (alert.origin.trim()) {
      params.set(
        "origin",
        alert.origin.trim()
      );
    }

    if (alert.destination.trim()) {
      params.set(
        "destination",
        alert.destination.trim()
      );
    }

    if (alert.departureDate) {
      params.set(
        "departure",
        alert.departureDate
      );
    }

    if (
      alert.tripType === "roundtrip" &&
      alert.returnDate
    ) {
      params.set(
        "return",
        alert.returnDate
      );
    }

    params.set(
      "tripType",
      alert.tripType
    );

    params.set(
      "adults",
      String(alert.adults)
    );

    params.set(
      "cabin",
      alert.cabin
    );

    window.location.href =
      `/search?${params.toString()}`;
  }

  return (
    <main className="fm-page fm-alerts-page">
      <section className="fm-section fm-alerts-section">
        <div className="fm-container">

          <header className="fm-page-header fm-alerts-header">
            <span className="fm-eyebrow">
              FARE ALERTS
            </span>

            <h1>
              Monitor a Flight Route
            </h1>

            <p>
              Create a fare-alert preference for a
              route, travel dates, passenger count
              and target price.
            </p>
          </header>

          <form
            className="fm-card fm-search-panel fm-alerts-search-card"
            onSubmit={saveAlert}
          >
            <div className="fm-alerts-search-heading">
              <div>
                <span className="fm-eyebrow">
                  ALERT SETUP
                </span>

                <h2>
                  Define the fare you want to monitor
                </h2>

                <p>
                  Set your route, travel dates,
                  passenger details and optional
                  target price.
                </p>
              </div>
            </div>

            <div className="fm-search-grid fm-alerts-form-grid">

              <div className="fm-field">
                <label htmlFor="alert-origin">
                  From
                </label>

                <input
                  id="alert-origin"
                  type="text"
                  value={alert.origin}
                  onChange={(event) =>
                    update(
                      "origin",
                      event.target.value
                    )
                  }
                  placeholder="e.g. LOS"
                  autoComplete="off"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="alert-destination">
                  To
                </label>

                <input
                  id="alert-destination"
                  type="text"
                  value={alert.destination}
                  onChange={(event) =>
                    update(
                      "destination",
                      event.target.value
                    )
                  }
                  placeholder="e.g. LHR"
                  autoComplete="off"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="alert-trip-type">
                  Trip type
                </label>

                <select
                  id="alert-trip-type"
                  value={alert.tripType}
                  onChange={(event) =>
                    update(
                      "tripType",
                      event.target.value
                    )
                  }
                >
                  <option value="roundtrip">
                    Round trip
                  </option>

                  <option value="oneway">
                    One way
                  </option>
                </select>
              </div>

              <div className="fm-field">
                <label htmlFor="alert-departure">
                  Departure
                </label>

                <input
                  id="alert-departure"
                  type="date"
                  value={alert.departureDate}
                  onChange={(event) =>
                    update(
                      "departureDate",
                      event.target.value
                    )
                  }
                />
              </div>

              {alert.tripType === "roundtrip" && (
                <div className="fm-field">
                  <label htmlFor="alert-return">
                    Return
                  </label>

                  <input
                    id="alert-return"
                    type="date"
                    value={alert.returnDate}
                    min={alert.departureDate}
                    onChange={(event) =>
                      update(
                        "returnDate",
                        event.target.value
                      )
                    }
                  />
                </div>
              )}

              <div className="fm-field">
                <label htmlFor="alert-adults">
                  Adults
                </label>

                <select
                  id="alert-adults"
                  value={alert.adults}
                  onChange={(event) =>
                    update(
                      "adults",
                      Number(event.target.value)
                    )
                  }
                >
                  {Array.from(
                    { length: 9 },
                    (_, index) => index + 1
                  ).map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number}{" "}
                      {number === 1
                        ? "adult"
                        : "adults"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fm-field">
                <label htmlFor="alert-cabin">
                  Cabin
                </label>

                <select
                  id="alert-cabin"
                  value={alert.cabin}
                  onChange={(event) =>
                    update(
                      "cabin",
                      event.target.value
                    )
                  }
                >
                  <option value="economy">
                    Economy
                  </option>

                  <option value="premium_economy">
                    Premium economy
                  </option>

                  <option value="business">
                    Business
                  </option>

                  <option value="first">
                    First class
                  </option>
                </select>
              </div>

              <div className="fm-field">
                <label htmlFor="alert-currency">
                  Target-price currency
                </label>

                <select
                  id="alert-currency"
                  value={alert.currency}
                  onChange={(event) =>
                    update(
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

              <div className="fm-field">
                <label htmlFor="alert-price">
                  Maximum target price
                </label>

                <input
                  id="alert-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={alert.maxPrice}
                  onChange={(event) =>
                    update(
                      "maxPrice",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="alert-email">
                  Alert email
                </label>

                <input
                  id="alert-email"
                  type="email"
                  value={alert.email}
                  onChange={(event) =>
                    update(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

            </div>

            <div className="fm-actions fm-alerts-actions">

              <button
                type="submit"
                className="fm-btn fm-primary"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save fare alert"}
              </button>

              <button
                type="button"
                className="fm-btn fm-secondary"
                onClick={openSearch}
              >
                Search this route
              </button>

            </div>
          </form>

          {saved && (
            <section
              className="fm-card fm-alerts-message-card"
              aria-live="polite"
            >
              <span className="fm-badge">
                {alert.enabled
                  ? "Alert saved"
                  : "Alert disabled"}
              </span>

              <h2>
                Your fare-alert preference
              </h2>

              <p>
                {message}
              </p>
            </section>
          )}

          {!saved && message && (
            <section
              className="fm-card fm-alerts-message-card"
              aria-live="polite"
            >
              <p>{message}</p>
            </section>
          )}

          {error && (
            <section
              className="fm-card fm-alerts-error-card"
              role="alert"
            >
              <span className="fm-badge">
                Check your details
              </span>

              <p>{error}</p>
            </section>
          )}

          <section className="fm-section-inner fm-alerts-status-section">

            <div className="fm-section-heading fm-alerts-section-heading">
              <div>
                <span className="fm-eyebrow">
                  ALERT STATUS
                </span>

                <h2>
                  Your current alert
                </h2>
              </div>

              <span
                className={
                  alert.enabled
                    ? "fm-alert-status fm-alert-status-active"
                    : "fm-alert-status fm-alert-status-disabled"
                }
              >
                {alert.enabled
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>

            <div className="fm-card fm-alerts-status-card">

              <div className="fm-grid fm-alerts-status-grid">

                <div>
                  <span className="fm-alerts-detail-label">
                    Route
                  </span>

                  <strong>
                    {alert.origin || "Not set"}{" "}
                    →{" "}
                    {alert.destination || "Not set"}
                  </strong>
                </div>

                <div>
                  <span className="fm-alerts-detail-label">
                    Dates
                  </span>

                  <strong>
                    {alert.departureDate || "Not set"}

                    {alert.tripType === "roundtrip" &&
                      ` → ${
                        alert.returnDate || "Not set"
                      }`}
                  </strong>
                </div>

                <div>
                  <span className="fm-alerts-detail-label">
                    Passengers
                  </span>

                  <strong>
                    {alert.adults}{" "}
                    {Number(alert.adults) === 1
                      ? "adult"
                      : "adults"}
                  </strong>
                </div>

                <div>
                  <span className="fm-alerts-detail-label">
                    Cabin
                  </span>

                  <strong>
                    {alert.cabin.replace(
                      "_",
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span className="fm-alerts-detail-label">
                    Target
                  </span>

                  <strong>
                    {alert.maxPrice
                      ? `${alert.currency} ${Number(
                          alert.maxPrice
                        ).toLocaleString()}`
                      : "No maximum price"}
                  </strong>
                </div>

                <div>
                  <span className="fm-alerts-detail-label">
                    Email
                  </span>

                  <strong>
                    {alert.email || "Not set"}
                  </strong>
                </div>

              </div>

              <div className="fm-actions fm-alerts-status-actions">

                <button
                  type="button"
                  className="fm-btn fm-secondary"
                  onClick={disableAlert}
                  disabled={!alert.enabled}
                >
                  Disable alert
                </button>

                <button
                  type="button"
                  className="fm-btn fm-secondary"
                  onClick={clearAlert}
                >
                  Clear saved alert
                </button>

              </div>

            </div>
          </section>

          <section className="fm-section-inner fm-alerts-workflow-section">

            <div className="fm-section-heading fm-alerts-section-heading">
              <div>
                <span className="fm-eyebrow">
                  HOW IT WORKS
                </span>

                <h2>
                  Fare monitoring workflow
                </h2>

                <p>
                  Configure the conditions that matter
                  to you before monitoring begins.
                </p>
              </div>
            </div>

            <div className="fm-grid fm-alerts-workflow-grid">

              <article className="fm-card fm-alerts-workflow-card">
                <span className="fm-alert-step">
                  01
                </span>

                <h3>
                  Define the route
                </h3>

                <p>
                  Enter the departure airport,
                  destination and dates you want
                  to monitor.
                </p>
              </article>

              <article className="fm-card fm-alerts-workflow-card">
                <span className="fm-alert-step">
                  02
                </span>

                <h3>
                  Set your conditions
                </h3>

                <p>
                  Choose passenger count, cabin
                  class, currency and optionally
                  specify a target price.
                </p>
              </article>

              <article className="fm-card fm-alerts-workflow-card">
                <span className="fm-alert-step">
                  03
                </span>

                <h3>
                  Monitor availability
                </h3>

                <p>
                  The configured alert service can
                  use these preferences when its
                  backend monitoring process is
                  available.
                </p>
              </article>

            </div>
          </section>

          <section className="fm-card fm-section-inner fm-alerts-important-card">

            <span className="fm-eyebrow">
              IMPORTANT
            </span>

            <h2>
              Alerts do not guarantee a fare
            </h2>

            <p>
              Flight prices, inventory, schedules,
              taxes and availability can change
              between an alert and the time you
              attempt to book. Always verify the
              final fare and conditions with the
              booking provider before purchasing.
            </p>

            <div className="fm-actions">

              <button
                type="button"
                className="fm-btn fm-primary"
                onClick={openSearch}
              >
                Search flights now
              </button>

              <button
                type="button"
                className="fm-btn fm-secondary"
                onClick={() =>
                  (window.location.href =
                    "/planner")
                }
              >
                Open trip planner
              </button>

            </div>

          </section>

          <section className="fm-card fm-disclaimer fm-alerts-disclaimer">

            <strong>
              Alert-service information
            </strong>

            <p>
              FlyMatrix stores the alert preference
              locally on this device and attempts to
              register it with the configured backend
              alert service. If that backend is
              unavailable, local storage does not by
              itself provide remote email monitoring.
            </p>

            <p>
              Alert delivery, frequency, provider
              data, fare availability and final
              booking conditions depend on the
              configured backend and external travel
              providers.
            </p>

          </section>

        </div>
      </section>
    </main>
  );
}
