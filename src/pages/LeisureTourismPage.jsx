import React, { useMemo, useState } from "react";
import { navigate } from "../router/AppRouter.jsx";

const DESTINATIONS = [
  {
    code: "PT",
    country: "Portugal",
    cities: ["Lisbon", "Porto", "Algarve", "Madeira"],
  },
  {
    code: "AE",
    country: "United Arab Emirates",
    cities: ["Dubai", "Abu Dhabi"],
  },
  {
    code: "TR",
    country: "Türkiye",
    cities: ["Istanbul", "Antalya", "Cappadocia"],
  },
  {
    code: "GB",
    country: "United Kingdom",
    cities: ["London", "Manchester", "Edinburgh"],
  },
  {
    code: "FR",
    country: "France",
    cities: ["Paris", "Nice", "Lyon"],
  },
  {
    code: "ES",
    country: "Spain",
    cities: ["Madrid", "Barcelona", "Valencia"],
  },
  {
    code: "IT",
    country: "Italy",
    cities: ["Rome", "Milan", "Venice"],
  },
  {
    code: "GR",
    country: "Greece",
    cities: ["Athens", "Santorini", "Crete"],
  },
  {
    code: "MA",
    country: "Morocco",
    cities: ["Marrakech", "Casablanca", "Agadir"],
  },
  {
    code: "ZA",
    country: "South Africa",
    cities: ["Cape Town", "Johannesburg", "Durban"],
  },
  {
    code: "KE",
    country: "Kenya",
    cities: ["Nairobi", "Mombasa"],
  },
  {
    code: "TH",
    country: "Thailand",
    cities: ["Bangkok", "Phuket", "Chiang Mai"],
  },
  {
    code: "MY",
    country: "Malaysia",
    cities: ["Kuala Lumpur", "Penang", "Langkawi"],
  },
  {
    code: "JP",
    country: "Japan",
    cities: ["Tokyo", "Osaka", "Kyoto"],
  },
  {
    code: "ID",
    country: "Indonesia",
    cities: ["Bali", "Jakarta", "Lombok"],
  },
  {
    code: "US",
    country: "United States",
    cities: ["New York", "Los Angeles", "Miami"],
  },
  {
    code: "CA",
    country: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal"],
  },
];

const LIFESTYLES = [
  "Budget",
  "Relaxed",
  "Beach",
  "Culture",
  "Adventure",
  "Family",
  "Luxury",
  "Business",
];

const FACILITIES = [
  "Airport transfer",
  "Hotels",
  "Activities",
  "eSIM",
  "Luggage storage",
  "Travel assistance",
];

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export default function LeisureTourismPage() {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("7");
  const [lifestyle, setLifestyle] = useState("Budget");
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
      budget,
      days,
      lifestyle,
      facilities:
        selectedFacilities.join(","),
    });

    navigate(
      `/tourism/leisure/results${
        query ? `?${query}` : ""
      }`
    );
  }

  return (
    <main className="page-container">
      <section className="tourism-hero">
        <div className="tourism-hero-content">
          <span className="fm-badge">
            Leisure Tourism
          </span>

          <h1>
            Build a smarter leisure trip
          </h1>

          <p>
            Choose your destination, budget,
            travel style and preferred services.
            FlyMatrix can then organize the
            travel options you need into one
            planning workflow.
          </p>
        </div>
      </section>

      <section className="tourism-dashboard">
        <div className="tourism-dashboard-header">
          <div>
            <span className="section-kicker">
              Tourism Intelligence
            </span>

            <h2>
              Tell us what your trip should look
              like
            </h2>

            <p>
              Prices and availability should be
              supplied by connected providers where
              available. FlyMatrix does not invent
              live provider prices.
            </p>
          </div>
        </div>

        <div className="tourism-form-grid">
          <div className="form-field">
            <label htmlFor="leisure-country">
              Destination country
            </label>

            <select
              id="leisure-country"
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
            <label htmlFor="leisure-city">
              Preferred city
            </label>

            <select
              id="leisure-city"
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
            <label htmlFor="leisure-days">
              Trip length
            </label>

            <select
              id="leisure-days"
              value={days}
              onChange={(event) =>
                setDays(event.target.value)
              }
            >
              <option value="3">
                3 days
              </option>

              <option value="5">
                5 days
              </option>

              <option value="7">
                7 days
              </option>

              <option value="10">
                10 days
              </option>

              <option value="14">
                14 days
              </option>

              <option value="21">
                21 days
              </option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="leisure-budget">
              Budget
            </label>

            <select
              id="leisure-budget"
              value={budget}
              onChange={(event) =>
                setBudget(
                  event.target.value
                )
              }
            >
              <option value="">
                Select budget range
              </option>

              <option value="under-500">
                Under $500
              </option>

              <option value="500-1000">
                $500 – $1,000
              </option>

              <option value="1000-2000">
                $1,000 – $2,000
              </option>

              <option value="2000-3500">
                $2,000 – $3,500
              </option>

              <option value="3500-plus">
                $3,500+
              </option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="leisure-lifestyle">
              Lifestyle
            </label>

            <select
              id="leisure-lifestyle"
              value={lifestyle}
              onChange={(event) =>
                setLifestyle(
                  event.target.value
                )
              }
            >
              {LIFESTYLES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="tourism-facilities">
          <div>
            <h3>
              Services and facilities
            </h3>

            <p>
              Select what you want included in
              your planning workflow.
            </p>
          </div>

          <div className="facility-options">
            {FACILITIES.map((facility) => {
              const selected =
                selectedFacilities.includes(
                  facility
                );

              return (
                <label
                  key={facility}
                  className={`facility-option ${
                    selected
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
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
            })}
          </div>
        </div>

        <div className="tourism-dashboard-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExplore}
          >
            Explore leisure options
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate("/planner")
            }
          >
            Open trip planner
          </button>
        </div>
      </section>

      <section className="tourism-track-grid">
        <article className="tourism-track-card">
          <span className="fm-badge">
            Compare
          </span>

          <h2>
            Flights, stays and activities
          </h2>

          <p>
            Move from destination planning into
            connected flight, accommodation and
            activity providers.
          </p>
        </article>

        <article className="tourism-track-card">
          <span className="fm-badge">
            Prepare
          </span>

          <h2>
            Documents and travel essentials
          </h2>

          <p>
            Check visa guidance, connectivity,
            baggage, transfers and assistance
            before departure.
          </p>
        </article>

        <article className="tourism-track-card">
          <span className="fm-badge">
            Monitor
          </span>

          <h2>
            Alerts and trip information
          </h2>

          <p>
            Keep important travel information in
            one place and connect your trip with
            available alert tools.
          </p>
        </article>
      </section>

      <section className="tourism-disclaimer">
        <strong>
          Provider pricing notice
        </strong>

        <p>
          FlyMatrix should display live or cached
          provider data only when that data is
          actually available. Final prices,
          availability, booking conditions,
          cancellation terms and supplier
          policies are confirmed by the relevant
          provider.
        </p>
      </section>
    </main>
  );
}
