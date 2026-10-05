import React, { useMemo, useState } from "react";
import { navigate } from "../router/AppRouter.jsx";

const DESTINATIONS = [
  {
    code: "GB",
    country: "United Kingdom",
    cities: [
      "London",
      "Manchester",
      "Birmingham",
      "Edinburgh",
    ],
  },
  {
    code: "IE",
    country: "Ireland",
    cities: [
      "Dublin",
      "Cork",
      "Limerick",
    ],
  },
  {
    code: "DE",
    country: "Germany",
    cities: [
      "Berlin",
      "Munich",
      "Hamburg",
      "Frankfurt",
    ],
  },
  {
    code: "FR",
    country: "France",
    cities: [
      "Paris",
      "Lyon",
      "Toulouse",
      "Nice",
    ],
  },
  {
    code: "NL",
    country: "Netherlands",
    cities: [
      "Amsterdam",
      "Rotterdam",
      "Eindhoven",
    ],
  },
  {
    code: "PT",
    country: "Portugal",
    cities: [
      "Lisbon",
      "Porto",
      "Coimbra",
    ],
  },
  {
    code: "PL",
    country: "Poland",
    cities: [
      "Warsaw",
      "Krakow",
      "Wroclaw",
    ],
  },
  {
    code: "HU",
    country: "Hungary",
    cities: [
      "Budapest",
      "Debrecen",
      "Szeged",
    ],
  },
  {
    code: "TR",
    country: "Türkiye",
    cities: [
      "Istanbul",
      "Ankara",
      "Izmir",
    ],
  },
  {
    code: "AE",
    country: "United Arab Emirates",
    cities: [
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
    ],
  },
  {
    code: "MY",
    country: "Malaysia",
    cities: [
      "Kuala Lumpur",
      "Penang",
      "Johor Bahru",
    ],
  },
  {
    code: "TH",
    country: "Thailand",
    cities: [
      "Bangkok",
      "Chiang Mai",
      "Phuket",
    ],
  },
  {
    code: "JP",
    country: "Japan",
    cities: [
      "Tokyo",
      "Osaka",
      "Kyoto",
    ],
  },
  {
    code: "CA",
    country: "Canada",
    cities: [
      "Toronto",
      "Vancouver",
      "Montreal",
    ],
  },
  {
    code: "AU",
    country: "Australia",
    cities: [
      "Sydney",
      "Melbourne",
      "Brisbane",
    ],
  },
];

const STUDY_LEVELS = [
  "Short course",
  "Certificate",
  "Diploma",
  "Bachelor's",
  "Master's",
  "Doctorate",
];

const STUDY_FIELDS = [
  "Business",
  "Information Technology",
  "Engineering",
  "Health",
  "Hospitality",
  "Automotive",
  "Design",
  "Education",
  "Other",
];

const STUDY_MODES = [
  "On campus",
  "Hybrid",
  "Flexible",
];

const FACILITIES = [
  "Student accommodation",
  "Airport transfer",
  "eSIM",
  "Travel insurance",
  "Local transport",
  "Activities",
  "Luggage storage",
  "Travel assistance",
];

function buildQuery(values) {
  const query = new URLSearchParams();

  Object.entries(values).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.set(
          key,
          String(value)
        );
      }
    }
  );

  return query.toString();
}

export default function EducationTourismPage() {
  const [country, setCountry] =
    useState("");

  const [city, setCity] =
    useState("");

  const [level, setLevel] =
    useState("Certificate");

  const [field, setField] =
    useState("Information Technology");

  const [budget, setBudget] =
    useState("");

  const [duration, setDuration] =
    useState("1-3-months");

  const [studyMode, setStudyMode] =
    useState("On campus");

  const [
    selectedFacilities,
    setSelectedFacilities,
  ] = useState([]);

  const selectedDestination =
    useMemo(
      () =>
        DESTINATIONS.find(
          (item) =>
            item.code === country
        ),
      [country]
    );

  function updateCountry(value) {
    setCountry(value);

    const destination =
      DESTINATIONS.find(
        (item) =>
          item.code === value
      );

    setCity(
      destination?.cities?.[0] ||
        ""
    );
  }

  function toggleFacility(value) {
    setSelectedFacilities(
      (current) =>
        current.includes(value)
          ? current.filter(
              (item) =>
                item !== value
            )
          : [
              ...current,
              value,
            ]
    );
  }

  function handleExplore() {
    const query = buildQuery({
      country,
      city,
      level,
      field,
      budget,
      duration,
      studyMode,
      facilities:
        selectedFacilities.join(","),
    });

    navigate(
      `/tourism/education/results${
        query
          ? `?${query}`
          : ""
      }`
    );
  }

  return (
    <main className="fm-education-page">

      <section className="fm-education-hero">

        <div className="fm-education-hero-content">

          <span className="fm-eyebrow">
            EDUCATION TOURISM
          </span>

          <span className="fm-badge">
            Education Tourism
          </span>

          <h1>
            Plan study travel with
            the journey included
          </h1>

          <p>
            Explore education
            destinations while planning
            the practical travel
            requirements around your
            study journey — flights,
            accommodation, connectivity,
            transfers and other
            essentials.
          </p>

        </div>

      </section>

      <section className="fm-education-dashboard">

        <div className="fm-education-dashboard-header">

          <div>

            <span className="fm-eyebrow">
              EDUCATION JOURNEY
            </span>

            <h2>
              Define your education
              journey
            </h2>

            <p>
              Select your preferred
              destination, study level,
              field, duration and budget.
              Connected provider data can
              then be used for the travel
              and preparation layer.
            </p>

          </div>

        </div>

        <div className="fm-education-form-grid">

          <div className="fm-form-field">
            <label htmlFor="education-country">
              Destination country
            </label>

            <select
              id="education-country"
              value={country}
              onChange={(event) =>
                updateCountry(
                  event.target.value
                )
              }
            >
              <option value="">
                Select a country
              </option>

              {DESTINATIONS.map(
                (destination) => (
                  <option
                    key={
                      destination.code
                    }
                    value={
                      destination.code
                    }
                  >
                    {
                      destination.country
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="fm-form-field">
            <label htmlFor="education-city">
              Preferred city
            </label>

            <select
              id="education-city"
              value={city}
              disabled={
                !selectedDestination
              }
              onChange={(event) =>
                setCity(
                  event.target.value
                )
              }
            >
              <option value="">
                Select a city
              </option>

              {selectedDestination?.cities?.map(
                (destinationCity) => (
                  <option
                    key={
                      destinationCity
                    }
                    value={
                      destinationCity
                    }
                  >
                    {destinationCity}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="fm-form-field">
            <label htmlFor="education-level">
              Study level
            </label>

            <select
              id="education-level"
              value={level}
              onChange={(event) =>
                setLevel(
                  event.target.value
                )
              }
            >
              {STUDY_LEVELS.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="fm-form-field">
            <label htmlFor="education-field">
              Field of study
            </label>

            <select
              id="education-field"
              value={field}
              onChange={(event) =>
                setField(
                  event.target.value
                )
              }
            >
              {STUDY_FIELDS.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="fm-form-field">
            <label htmlFor="education-budget">
              Estimated budget
            </label>

            <select
              id="education-budget"
              value={budget}
              onChange={(event) =>
                setBudget(
                  event.target.value
                )
              }
            >
              <option value="">
                Any budget
              </option>

              <option value="under-5000">
                Under $5,000
              </option>

              <option value="5000-10000">
                $5,000 – $10,000
              </option>

              <option value="10000-20000">
                $10,000 – $20,000
              </option>

              <option value="20000-40000">
                $20,000 – $40,000
              </option>

              <option value="over-40000">
                Over $40,000
              </option>
            </select>
          </div>

          <div className="fm-form-field">
            <label htmlFor="education-duration">
              Study duration
            </label>

            <select
              id="education-duration"
              value={duration}
              onChange={(event) =>
                setDuration(
                  event.target.value
                )
              }
            >
              <option value="1-3-months">
                1–3 months
              </option>

              <option value="3-6-months">
                3–6 months
              </option>

              <option value="6-12-months">
                6–12 months
              </option>

              <option value="1-2-years">
                1–2 years
              </option>

              <option value="2-4-years">
                2–4 years
              </option>

              <option value="4-plus-years">
                4+ years
              </option>
            </select>
          </div>

          <div className="fm-form-field">
            <label htmlFor="education-mode">
              Study mode
            </label>

            <select
              id="education-mode"
              value={studyMode}
              onChange={(event) =>
                setStudyMode(
                  event.target.value
                )
              }
            >
              {STUDY_MODES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

        </div>

        <section className="fm-education-facilities">

          <div className="fm-education-facilities-heading">

            <span className="fm-eyebrow">
              TRAVEL PREPARATION
            </span>

            <h3>
              What would you like
              included?
            </h3>

            <p>
              Select the travel and
              preparation services you want
              to consider with your
              education journey.
            </p>

          </div>

          <div className="fm-education-facility-grid">

            {FACILITIES.map(
              (facility) => {
                const selected =
                  selectedFacilities.includes(
                    facility
                  );

                return (
                  <label
                    key={facility}
                    className={
                      selected
                        ? "fm-education-facility is-selected"
                        : "fm-education-facility"
                    }
                  >
                    <input
                      type="checkbox"
                      checked={
                        selected
                      }
                      onChange={() =>
                        toggleFacility(
                          facility
                        )
                      }
                    />

                    <span>
                      {facility}
                    </span>

                  </label>
                );
              }
            )}

          </div>

        </section>

        <section className="fm-education-form-actions">

          <div className="fm-education-action-copy">

            <span className="fm-eyebrow">
              READY TO EXPLORE?
            </span>

            <strong>
              Explore education
              options
            </strong>

            <p>
              Your selections will be
              passed to the education
              results page.
            </p>

          </div>

          <button
            type="button"
            className="fm-btn fm-btn-primary"
            onClick={
              handleExplore
            }
          >
            Explore education
            options →
          </button>

        </section>

      </section>

    </main>
  );
}
