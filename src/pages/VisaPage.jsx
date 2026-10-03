import React, { useMemo, useState } from "react";
import { navigate } from "../router/AppRouter.jsx";

const NATIONALITIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "India",
  "United Arab Emirates",
];

const DESTINATIONS = [
  "United Kingdom",
  "United States",
  "Canada",
  "United Arab Emirates",
  "France",
  "Portugal",
  "Spain",
  "Italy",
  "Germany",
  "Turkey",
  "Ireland",
  "Australia",
  "Japan",
  "Singapore",
  "Thailand",
  "Malaysia",
  "South Africa",
];

const TRAVEL_PURPOSES = [
  "Tourism",
  "Business",
  "Study",
  "Family visit",
  "Transit",
  "Work",
];

const PASSPORT_TYPES = [
  "Ordinary passport",
  "Diplomatic passport",
  "Official passport",
  "Other",
];

function normalizeStatus(value) {
  const text = String(value || "").toLowerCase();

  if (
    text.includes("visa free") ||
    text.includes("no visa") ||
    text.includes("not required")
  ) {
    return "visa-free";
  }

  if (
    text.includes("visa on arrival") ||
    text.includes("on arrival")
  ) {
    return "on-arrival";
  }

  if (
    text.includes("evisa") ||
    text.includes("e-visa") ||
    text.includes("electronic")
  ) {
    return "evisa";
  }

  return "visa-required";
}

function getStatusLabel(status) {
  switch (status) {
    case "visa-free":
      return "Visa may not be required";

    case "on-arrival":
      return "Visa on arrival may be available";

    case "evisa":
      return "Electronic visa may be available";

    default:
      return "Visa may be required";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "visa-free":
      return "visa-status visa-status-positive";

    case "on-arrival":
      return "visa-status visa-status-neutral";

    case "evisa":
      return "visa-status visa-status-neutral";

    default:
      return "visa-status visa-status-warning";
  }
}

function buildProviderUrl(destination) {
  const encoded = encodeURIComponent(
    destination || ""
  );

  return `https://ivisa.tpk.lv/zXqbkMmK?destination=${encoded}`;
}

export default function VisaPage() {
  const [nationality, setNationality] =
    useState("Nigeria");

  const [destination, setDestination] =
    useState("");

  const [purpose, setPurpose] =
    useState("Tourism");

  const [passportType, setPassportType] =
    useState("Ordinary passport");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const canCheck =
    Boolean(
      nationality &&
        destination &&
        purpose &&
        passportType
    );

  const providerUrl = useMemo(
    () =>
      buildProviderUrl(destination),
    [destination]
  );

  async function checkVisa() {
    if (!canCheck) {
      setError(
        "Select your nationality and destination first."
      );

      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const params =
        new URLSearchParams({
          nationality,
          destination,
          purpose,
          passportType,
        });

      const response = await fetch(
        `/api/visa/check?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Visa service returned ${response.status}.`
        );
      }

      const data =
        await response.json();

      setResult(data);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "The visa information service is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  function openProvider() {
    window.open(
      providerUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function goPlanner() {
    navigate("/planner");
  }

  const normalizedResult = result
    ? {
        ...result,
        status: normalizeStatus(
          result.status ||
            result.visaStatus ||
            result.requirement
        ),
      }
    : null;

  return (
    <main className="page-container fm-visa-page">
      <section className="visa-hero fm-visa-hero">
        <div className="fm-visa-hero-content">
          <span className="fm-badge">
            Visa Guidance
          </span>

          <h1>
            Check travel-document requirements
          </h1>

          <p>
            Enter your passport nationality,
            destination and travel purpose to
            retrieve available visa guidance from
            the FlyMatrix backend.
          </p>
        </div>
      </section>

      <section className="visa-layout fm-visa-layout">
        <div className="visa-form-card fm-visa-form-card">
          <div className="planner-card-heading fm-visa-card-heading">
            <div>
              <span className="section-kicker">
                Visa checker
              </span>

              <h2>
                Your travel details
              </h2>

              <p>
                Requirements can differ by
                nationality, destination, travel
                purpose and passport type.
              </p>
            </div>
          </div>

          <div className="tourism-form-grid fm-visa-form-grid">
            <div className="form-field">
              <label htmlFor="visa-nationality">
                Passport nationality
              </label>

              <select
                id="visa-nationality"
                value={nationality}
                onChange={(event) => {
                  setNationality(
                    event.target.value
                  );
                  setResult(null);
                  setError("");
                }}
              >
                {NATIONALITIES.map(
                  (country) => (
                    <option
                      value={country}
                      key={country}
                    >
                      {country}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="visa-destination">
                Destination
              </label>

              <select
                id="visa-destination"
                value={destination}
                onChange={(event) => {
                  setDestination(
                    event.target.value
                  );
                  setResult(null);
                  setError("");
                }}
              >
                <option value="">
                  Select destination
                </option>

                {DESTINATIONS.map(
                  (country) => (
                    <option
                      value={country}
                      key={country}
                    >
                      {country}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="visa-purpose">
                Travel purpose
              </label>

              <select
                id="visa-purpose"
                value={purpose}
                onChange={(event) => {
                  setPurpose(
                    event.target.value
                  );
                  setResult(null);
                }}
              >
                {TRAVEL_PURPOSES.map(
                  (item) => (
                    <option
                      value={item}
                      key={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="visa-passport-type">
                Passport type
              </label>

              <select
                id="visa-passport-type"
                value={passportType}
                onChange={(event) => {
                  setPassportType(
                    event.target.value
                  );
                  setResult(null);
                }}
              >
                {PASSPORT_TYPES.map(
                  (item) => (
                    <option
                      value={item}
                      key={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {error && (
            <div
              className="visa-error fm-visa-error"
              role="alert"
            >
              <strong>
                Visa check unavailable
              </strong>

              <p>{error}</p>

              <p>
                No visa requirement has been
                invented or assumed from the
                failed request.
              </p>
            </div>
          )}

          <div className="planner-actions fm-visa-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !canCheck || loading
              }
              onClick={checkVisa}
            >
              {loading
                ? "Checking..."
                : "Check visa guidance"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={openProvider}
              disabled={!destination}
            >
              Open visa provider
            </button>
          </div>
        </div>

        <aside className="visa-summary-card fm-visa-summary-card">
          <span className="section-kicker">
            Selected trip
          </span>

          <h2>
            {destination ||
              "Destination not selected"}
          </h2>

          <div className="visa-summary-list fm-visa-summary-list">
            <div>
              <span>
                Nationality
              </span>

              <strong>
                {nationality}
              </strong>
            </div>

            <div>
              <span>
                Destination
              </span>

              <strong>
                {destination ||
                  "Not selected"}
              </strong>
            </div>

            <div>
              <span>
                Purpose
              </span>

              <strong>
                {purpose}
              </strong>
            </div>

            <div>
              <span>
                Passport
              </span>

              <strong>
                {passportType}
              </strong>
            </div>
          </div>
        </aside>
      </section>

      {normalizedResult && (
        <section className="visa-result-card fm-visa-result-card">
          <div className="planner-card-heading fm-visa-result-heading">
            <div>
              <span className="section-kicker">
                Result
              </span>

              <h2>
                Visa guidance
              </h2>
            </div>

            <span
              className={getStatusClass(
                normalizedResult.status
              )}
            >
              {getStatusLabel(
                normalizedResult.status
              )}
            </span>
          </div>

          <div className="visa-result-grid fm-visa-result-grid">
            <div>
              <span>
                Passport nationality
              </span>

              <strong>
                {nationality}
              </strong>
            </div>

            <div>
              <span>
                Destination
              </span>

              <strong>
                {destination}
              </strong>
            </div>

            <div>
              <span>
                Travel purpose
              </span>

              <strong>
                {purpose}
              </strong>
            </div>

            <div>
              <span>
                Requirement
              </span>

              <strong>
                {normalizedResult.requirement ||
                  normalizedResult.visaType ||
                  getStatusLabel(
                    normalizedResult.status
                  )}
              </strong>
            </div>
          </div>

          {(normalizedResult.summary ||
            normalizedResult.description ||
            normalizedResult.message) && (
            <div className="visa-result-description fm-visa-result-description">
              <h3>
                Information
              </h3>

              <p>
                {normalizedResult.summary ||
                  normalizedResult.description ||
                  normalizedResult.message}
              </p>
            </div>
          )}

          {Array.isArray(
            normalizedResult.requirements
          ) &&
            normalizedResult.requirements
              .length > 0 && (
              <div className="visa-requirements fm-visa-requirements">
                <h3>
                  Requirements
                </h3>

                <ul>
                  {normalizedResult.requirements.map(
                    (item, index) => (
                      <li
                        key={`${String(
                          item
                        )}-${index}`}
                      >
                        {typeof item ===
                        "string"
                          ? item
                          : item?.name ||
                            item?.description ||
                            JSON.stringify(
                              item
                            )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          <div className="planner-actions fm-visa-result-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={openProvider}
            >
              Verify with visa provider
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={goPlanner}
            >
              Add to trip plan
            </button>
          </div>
        </section>
      )}

      <section className="visa-guidance-grid fm-visa-guidance-grid">
        <article className="service-card">
          <div className="service-card-icon">
            ✓
          </div>

          <h3>
            Check before booking
          </h3>

          <p>
            Visa eligibility can affect travel
            planning, so check the applicable
            requirements before making
            non-refundable arrangements.
          </p>
        </article>

        <article className="service-card">
          <div className="service-card-icon">
            →
          </div>

          <h3>
            Use official information
          </h3>

          <p>
            Treat the FlyMatrix result as
            guidance. Confirm current requirements
            with the destination country's
            official immigration or consular
            authority.
          </p>
        </article>

        <article className="service-card">
          <div className="service-card-icon">
            !
          </div>

          <h3>
            Requirements can change
          </h3>

          <p>
            Passport validity, funds, insurance,
            invitation letters, vaccination
            requirements and supporting documents
            can vary by destination and purpose.
          </p>
        </article>
      </section>

      <section className="planner-notice fm-visa-notice">
        <strong>
          Important travel-document notice
        </strong>

        <p>
          FlyMatrix does not issue visas or
          guarantee admission at a border. Visa
          decisions are made by the relevant
          government or immigration authority.
          Always verify the latest requirements
          before travelling.
        </p>
      </section>
    </main>
  );
}
