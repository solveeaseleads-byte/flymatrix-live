import React, {
  useState
} from "react";

import SearchWidget
  from "./SearchWidget.jsx";

import FlightResultsList
  from "./FlightResultsList.jsx";

import PopularCorridors
  from "./PopularCorridors.jsx";

import BudgetPlanner
  from "./BudgetPlanner.jsx";

import PaystackButton
  from "./PaystackButton.jsx";

import { apiFetch }
  from "../utils/api.js";

export default function Dashboard() {
  const [page, setPage] =
    useState("Home");

  const [results, setResults] =
    useState(null);

  const [searchDefaults, setSearchDefaults] =
    useState({
      origin: "LOS",
      destination: "JFK"
    });

  const [email, setEmail] =
    useState("");

  async function calculateTrueCost() {
    if (!results?.results?.[0]) {
      alert(
        "Search for a flight first."
      );

      return;
    }

    try {
      const data =
        await apiFetch(
          "true-cost",
          {
            offer: JSON.stringify(
              results.results[0]
            )
          }
        );

      alert(
        `Comparable cost: ${
          data.comparableCost ?? "calculated"
        }`
      );
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="fm-shell">

      <nav className="fm-nav">

        <div className="fm-brand">
          Fly<span>Matrix</span>
        </div>

        <div className="fm-navlinks">
          {[
            "Home",
            "Explore",
            "Plan",
            "Prepare",
            "My Journey"
          ].map((item) => (
            <button
              key={item}
              className={
                page === item
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPage(item)
              }
            >
              {item}
            </button>
          ))}
        </div>

      </nav>

      <header className="fm-hero">

        <div className="fm-container">

          <h1>
            Global flight search
            and travel intelligence.
          </h1>

          <p>
            Search live flight offers,
            compare journey costs,
            plan trips and continue
            to booking partners.
          </p>

          <SearchWidget
            initial={searchDefaults}
            onResults={setResults}
          />

        </div>

      </header>

      <main className="fm-container">

        {results && (
          <section className="fm-section">

            <h2>
              Flight results
            </h2>

            <p className="lead">
              {results.providerMessage ||
                `${results.results?.length || 0} offer(s) returned.`}
            </p>

            <FlightResultsList
              data={results}
            />

            <div className="fm-actions">

              <button
                className="fm-btn fm-secondary"
                onClick={
                  calculateTrueCost
                }
              >
                Calculate true cost
              </button>

            </div>

          </section>
        )}

        <section className="fm-section">

          <h2>
            Popular corridors
          </h2>

          <PopularCorridors
            onSelect={(route) => {
              setSearchDefaults(route);

              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
            }}
          />

        </section>

        <section className="fm-section">

          <h2>
            Trip planning
          </h2>

          <BudgetPlanner />

        </section>

        <section className="fm-section">

          <h2>
            Pro access
          </h2>

          <div
            className="fm-card"
            style={{ padding: 20 }}
          >

            <div className="fm-field">

              <label>
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="you@example.com"
              />

            </div>

            <div className="fm-actions">

              <PaystackButton
                email={email}
                planName="Pro"
                amount={15000}
              />

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
