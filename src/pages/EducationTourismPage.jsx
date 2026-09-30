import React, { useMemo, useState } from "react";
import { navigate } from "../router/AppRouter.jsx";

const DESTINATIONS = [
  {
    code: "GB",
    country: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Edinburgh"],
  },
  {
    code: "IE",
    country: "Ireland",
    cities: ["Dublin", "Cork", "Limerick"],
  },
  {
    code: "DE",
    country: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt"],
  },
  {
    code: "FR",
    country: "France",
    cities: ["Paris", "Lyon", "Toulouse", "Nice"],
  },
  {
    code: "NL",
    country: "Netherlands",
    cities: ["Amsterdam", "Rotterdam", "Eindhoven"],
  },
  {
    code: "PT",
    country: "Portugal",
    cities: ["Lisbon", "Porto", "Coimbra"],
  },
  {
    code: "PL",
    country: "Poland",
    cities: ["Warsaw", "Krakow", "Wroclaw"],
  },
  {
    code: "HU",
    country: "Hungary",
    cities: ["Budapest", "Debrecen", "Szeged"],
  },
  {
    code: "TR",
    country: "Türkiye",
    cities: ["Istanbul", "Ankara", "Izmir"],
  },
  {
    code: "AE",
    country: "United Arab Emirates",
    cities: ["Dubai", "Abu Dhabi", "Sharjah"],
  },
  {
    code: "MY",
    country: "Malaysia",
    cities: ["Kuala Lumpur", "Penang", "Johor Bahru"],
  },
  {
    code: "TH",
    country: "Thailand",
    cities: ["Bangkok", "Chiang Mai", "Phuket"],
  },
  {
    code: "JP",
    country: "Japan",
    cities: ["Tokyo", "Osaka", "Kyoto"],
  },
  {
    code: "CA",
    country: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal"],
  },
  {
    code: "AU",
    country: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane"],
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
        query.set(key, String(value));
      }
    }
  );

  return query.toString();
}

export default function EducationTourismPage() {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [level, setLevel] = useState(
    "Certificate"
  );
  const [field, setField] = useState(
    "Information Technology"
  );
  const [budget, setBudget] = useState("");
  const [duration, setDuration] =
    useState("1-3-months");
  const [studyMode, setStudyMode] =
    useState("On campus");
  const [selectedFacilities, setSelectedFacilities] =
    useState([]);

  const selectedDestination = useMemo(
    () =>
      DESTINATIONS.find(
        (item) => item.code === country
      ),
    [country]
  );

  function updateCountry(value) {
    setCountry(value);

    const destination =
      DESTINATIONS.find(
        (item) => item.code === value
      );

    setCity(
      destination?.cities?.[0] || ""
    );
  }

  function toggleFacility(value) {
    setSelectedFacilities((current) =>
      current.includes(value)
        ? current.filter(
            (item) => item !== value
          )
        : [...current, value]
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
        query ? `?${query}` : ""
      }`
    );
  }

  return (
    <main className="page-container">
      <section className="tourism-hero education-tourism-hero">
        <div className="tourism-hero-content">
          <span className="fm-badge">
            Education Tourism
          </span>

          <h1>
            Plan study travel with the journey
            included
          </h1>

          <p>
            Explore education destinations while
            planning the practical travel
            requirements around your study
            journey — flights, accommodation,
            connectivity, transfers and other
            essentials.
          </p>
        </div>
      </section>

      <section className="tourism-dashboard">
        <div className="tourism-dashboard-header">
          <div>
            <span className="section-kicker">
              Education Tourism Intelligence
            </span>

            <h2>
              Define your education journey
            </h2>

            <p>
              Select your preferred destination,
              study level, field, duration and
              budget. Connected provider data can
              then be used for the travel and
              preparation layer.
            </p>
          </div>
        </div>

        <div className="tourism-form-grid">
          <div className="form-field">
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
                    key={destination.code}
                    value={destination.code}
                  >
                    {destination.country}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="education-city">
              Preferred city
            </label>

            <select
              id="education-city"
              value={city}
              disabled={!selectedDestination}
              onChange={(event) =>
                setCity(event.target.value)
              }
            >
              <option value="">
                Select a city
              </option>

              {selectedDestination?.cities?.map(
                (destinationCity) => (
                  <option
                    key={destinationCity}
                    value={destinationCity}
                  >
                    {destinationCity}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="education-level">
              Study level
            </label>

            <select
              id="education-level"
              value={level}
              onChange={(event) =>
                setLevel(event.target.value)
              }
            >
              {STUDY_LEVELS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="education-field">
              Field of study
            </label>

            <select
              id="education-field"
