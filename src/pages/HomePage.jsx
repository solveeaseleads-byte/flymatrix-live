import React from "react";
import FlightSearchForm from "../components/flights/FlightSearchForm.jsx";
import { navigate } from "../router/AppRouter.jsx";

/*
 * =========================================================
 * FLYMATRIX HOME PAGE
 * =========================================================
 *
 * Purpose:
 * - Home is the application launchpad.
 * - Core actions navigate to dedicated pages.
 * - Supporting information remains secondary.
 * - Existing routes are preserved.
 */

const FEATURED_ROUTES = [
  {
    from: "Lagos",
    fromCode: "LOS",
    to: "London",
    toCode: "LON",
    label: "Lagos → London",
  },
  {
    from: "New York",
    fromCode: "JFK",
    to: "London",
    toCode: "LON",
    label: "New York → London",
  },
  {
    from: "Los Angeles",
    fromCode: "LAX",
    to: "Paris",
    toCode: "PAR",
    label: "Los Angeles → Paris",
  },
  {
    from: "Toronto",
    fromCode: "YYZ",
    to: "Dubai",
    toCode: "DXB",
    label: "Toronto → Dubai",
  },
];

const PRIMARY_ACTIONS = [
  {
    icon: "✈",
    title: "Search Flights",
    description:
      "Find flights by route, dates, passengers, cabin and stops.",
    path: "/search",
    className: "home-launch-primary",
  },
  {
    icon: "🧭",
    title: "Plan My Trip",
    description:
      "Build a practical journey around your destination and budget.",
    path: "/planner",
    className: "home-launch-secondary",
  },
];

const EXPLORE_ACTIONS = [
  {
    icon: "✈️",
    title: "Flights",
    description: "Search and compare flight options.",
    path: "/search",
  },
  {
    icon: "🌴",
    title: "Leisure Tourism",
    description: "Explore destinations for holidays and leisure.",
    path: "/tourism/leisure",
  },
  {
    icon: "🎓",
    title: "Education Tourism",
    description: "Explore study-focused travel destinations.",
    path: "/tourism/education",
  },
];

const PREPARATION_ACTIONS = [
  {
    icon: "🛂",
    title: "Visa Guidance",
    description:
      "Review travel-document and visa guidance.",
    path: "/visa",
  },
  {
    icon: "🏨",
    title: "Hotels",
    description:
      "Explore accommodation options.",
    path: "/hotels",
  },
  {
    icon: "🎟️",
    title: "Activities",
    description:
      "Discover attractions and things to do.",
    path: "/activities",
  },
  {
    icon: "📱",
    title: "eSIM",
    description:
      "Find connectivity options for your journey.",
    path: "/esim",
  },
];

const SERVICE_ACTIONS = [
  {
    icon: "🧳",
    title: "Luggage Storage",
    description:
      "Find luggage-storage options around your journey.",
    path: "/luggage",
  },
  {
    icon: "🚕",
    title: "Transfers",
    description:
      "Explore airport and destination transfers.",
    path: "/transfers",
  },
  {
    icon: "🛟",
    title: "Travel Assistance",
    description:
      "Access travel assistance and disruption support.",
    path: "/assistance",
  },
  {
    icon: "🔔",
    title: "Fare Alerts",
    description:
      "Monitor routes and travel dates.",
    path: "/alerts",
  },
  {
    icon: "🎒",
    title: "Travel Essentials",
    description:
      "Prepare documents, baggage and other essentials.",
    path: "/essentials",
  },
];

function InternalLink({
  path,
  children,
  className = "",
}) {
  return (
    <a
      href={path}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        navigate(path);
      }}
    >
      {children}
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">
        {eyebrow}
      </span>

      <h2>{title}</h2>

      {description && (
        <p>{description}</p>
      )}
    </div>
  );
}

function LaunchCard({
  action,
}) {
  return (
    <InternalLink
      path={action.path}
      className={`home-launch-card ${action.className || ""}`}
    >
      <span className="home-launch-icon">
        {action.icon}
      </span>

      <span className="home-launch-content">
        <strong>
          {action.title}
        </strong>

        <span>
          {action.description}
        </span>
      </span>

      <span className="home-launch-arrow">
        →
      </span>
    </InternalLink>
  );
}

function NavigationCard({
  item,
}) {
  return (
    <InternalLink
      path={item.path}
      className="home-navigation-card"
    >
      <span className="home-navigation-icon">
        {item.icon}
      </span>

      <span className="home-navigation-content">
        <strong>
          {item.title}
        </strong>

        <span>
          {item.description}
        </span>
      </span>

      <span className="home-navigation-arrow">
        →
      </span>
    </InternalLink>
  );
}

function RouteCard({
  route,
}) {
  return (
    <button
      type="button"
      className="home-route-card"
      onClick={() => {
        const params =
          new URLSearchParams();

        params.set(
          "origin",
          route.fromCode
        );

        params.set(
          "destination",
          route.toCode
        );

        navigate(
          `/search?${params.toString()}`
        );
      }}
    >
      <span className="home-route-codes">
        <span>
          {route.fromCode}
        </span>

        <span className="home-route-arrow">
          →
        </span>

        <span>
          {route.toCode}
        </span>
      </span>

      <span className="home-route-name">
        {route.label}
      </span>

      <span className="home-route-action">
        Search route →
      </span>
    </button>
  );
}

export default function HomePage() {
  return (
    <div className="home-page">

      {/* =====================================================
          APPLICATION LAUNCH
      ===================================================== */}

      <section className="home-hero">
        <div className="section-container">

          <div className="home-hero-grid">

            <div className="home-hero-content">

              <span className="eyebrow">
                GLOBAL FLIGHT SEARCH & TRAVEL INTELLIGENCE
              </span>

              <h1>
                Search smarter.
                <br />
                <span>
                  Travel prepared.
                </span>
              </h1>

              <p className="home-hero-description">
                FlyMatrix brings flight search,
                trip planning and travel preparation
                together in one connected experience.
              </p>

              <div className="home-launch-actions">

                {PRIMARY_ACTIONS.map(
                  (action) => (
                    <LaunchCard
                      key={action.path}
                      action={action}
                    />
                  )
                )}

              </div>

              <div className="home-trust-row">
                <span>
                  ✓ Global routes
                </span>

                <span>
                  ✓ Travel partner connections
                </span>

                <span>
                  ✓ Preparation tools
                </span>
              </div>

            </div>

            {/* =================================================
                QUICK SEARCH
            ================================================= */}

            <div className="home-quick-search">

              <div className="home-quick-search-header">
                <span className="eyebrow">
                  QUICK SEARCH
                </span>

                <h2>
                  Find your flight
                </h2>

                <p>
                  Enter your journey details
                  to continue to flight results.
                </p>
              </div>

              <div className="home-search-card">
                <FlightSearchForm />
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          PRIMARY APPLICATION ENTRY
      ===================================================== */}

      <section className="home-entry-section">
        <div className="section-container">

          <SectionHeading
            eyebrow="START HERE"
            title="What do you want to do?"
            description="Choose a workflow and FlyMatrix will take you to the dedicated experience."
          />

          <div className="home-entry-grid">

            <div className="home-entry-column">

              <div className="home-entry-label">
                EXPLORE
              </div>

              <div className="home-navigation-grid">
                {EXPLORE_ACTIONS.map(
                  (item) => (
                    <NavigationCard
                      key={item.path}
                      item={item}
                    />
                  )
                )}
              </div>

            </div>

            <div className="home-entry-column">

              <div className="home-entry-label">
                PREPARE
              </div>

              <div className="home-navigation-grid">
                {PREPARATION_ACTIONS.map(
                  (item) => (
                    <NavigationCard
                      key={item.path}
                      item={item}
                    />
                  )
                )}
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          POPULAR ROUTES
      ===================================================== */}

      <section className="home-routes-section">
        <div className="section-container">

          <SectionHeading
            eyebrow="POPULAR ROUTES"
            title="Start with a popular journey"
            description="Select a route to open flight search with the airports already selected."
          />

          <div className="home-routes-grid">

            {FEATURED_ROUTES.map(
              (route) => (
                <RouteCard
                  key={`${route.fromCode}-${route.toCode}`}
                  route={route}
                />
              )
            )}

          </div>

        </div>
      </section>


      {/* =====================================================
          TRAVEL SERVICES
      ===================================================== */}

      <section className="home-services-section">
        <div className="section-container">

          <SectionHeading
            eyebrow="TRAVEL SERVICES"
            title="Continue preparing your journey"
            description="Open the specific service you need instead of searching through one long page."
          />

          <div className="home-services-grid">

            {SERVICE_ACTIONS.map(
              (item) => (
                <NavigationCard
                  key={item.path}
                  item={item}
                />
              )
            )}

          </div>

        </div>
      </section>


      {/* =====================================================
          SIMPLE WORKFLOW
      ===================================================== */}

      <section className="home-workflow-section">
        <div className="section-container">

          <SectionHeading
            eyebrow="THE FLYMATRIX FLOW"
            title="Search → prepare → travel"
            description="Each stage leads into the next part of your journey."
          />

          <div className="home-workflow">

            <button
              type="button"
              onClick={() =>
                navigate("/search")
              }
              className="home-workflow-step"
            >
              <span>01</span>

              <strong>
                Search
              </strong>

              <small>
                Find your flight
              </small>

              <b>
                →
              </b>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/planner")
              }
              className="home-workflow-step"
            >
              <span>02</span>

              <strong>
                Plan
              </strong>

              <small>
                Build your journey
              </small>

              <b>
                →
              </b>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/visa")
              }
              className="home-workflow-step"
            >
              <span>03</span>

              <strong>
                Prepare
              </strong>

              <small>
                Check requirements
              </small>

              <b>
                →
              </b>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/hotels")
              }
              className="home-workflow-step"
            >
              <span>04</span>

              <strong>
                Arrange
              </strong>

              <small>
                Hotels and services
              </small>

              <b>
                →
              </b>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/alerts")
              }
              className="home-workflow-step"
            >
              <span>05</span>

              <strong>
                Monitor
              </strong>

              <small>
                Keep track of your trip
              </small>

              <b>
                →
              </b>
            </button>

          </div>

        </div>
      </section>


      {/* =====================================================
          FINAL ACTION
      ===================================================== */}

      <section className="home-final-section">
        <div className="section-container">

          <div className="home-final-card">

            <div>
              <span className="eyebrow">
                READY TO TRAVEL?
              </span>

              <h2>
                Start with your next journey.
              </h2>

              <p>
                Search flights or open the
                planning workflow and let
                FlyMatrix guide the next step.
              </p>
            </div>

            <div className="home-final-actions">

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate("/search")
                }
              >
                Search Flights
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  navigate("/planner")
                }
              >
                Plan My Trip
              </button>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
      }
