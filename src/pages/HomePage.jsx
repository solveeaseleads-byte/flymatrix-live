import React from "react";
import FlightSearchForm from "../components/flights/FlightSearchForm.jsx";

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

const SERVICES = [
  {
    icon: "🏨",
    title: "Hotels",
    description:
      "Compare accommodation options through trusted travel partners.",
    path: "/hotels",
  },
  {
    icon: "🎟️",
    title: "Activities",
    description:
      "Discover tours, attractions and things to do at your destination.",
    path: "/activities",
  },
  {
    icon: "📱",
    title: "eSIM",
    description:
      "Find connectivity options for international travel.",
    path: "/esim",
  },
  {
    icon: "🧳",
    title: "Luggage Storage",
    description:
      "Find luggage-storage options before check-in or after checkout.",
    path: "/luggage",
  },
  {
    icon: "🚕",
    title: "Transfers",
    description:
      "Explore airport and destination transfer options.",
    path: "/transfers",
  },
  {
    icon: "🛟",
    title: "Travel Assistance",
    description:
      "Get access to travel assistance and disruption-support services.",
    path: "/assistance",
  },
];

const TOOLS = [
  {
    icon: "🗺️",
    title: "Plan My Trip",
    description:
      "Build a practical trip plan around your destination, dates and budget.",
    path: "/planner",
  },
  {
    icon: "🛂",
    title: "Visa Guidance",
    description:
      "Check travel-document and visa guidance for your journey.",
    path: "/visa",
  },
  {
    icon: "🎒",
    title: "Travel Essentials",
    description:
      "Prepare documents, connectivity, baggage and other trip essentials.",
    path: "/essentials",
  },
  {
    icon: "🔔",
    title: "Fare Alerts",
    description:
      "Create alerts around routes and travel dates you want to monitor.",
    path: "/alerts",
  },
];

function navigate(path) {
  window.history.pushState({}, "", path);

  window.dispatchEvent(
    new PopStateEvent("popstate", {
      state: {},
    })
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

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

function RouteCard({ route }) {
  return (
    <button
      type="button"
      className="route-card"
      onClick={() => {
        const params = new URLSearchParams();

        params.set("origin", route.fromCode);
        params.set("destination", route.toCode);

        navigate(`/search?${params.toString()}`);
      }}
    >
      <div className="route-card-top">
        <span>{route.fromCode}</span>
        <span className="route-arrow">→</span>
        <span>{route.toCode}</span>
      </div>

      <strong>{route.label}</strong>

      <span className="route-card-action">
        Search route
      </span>
    </button>
  );
}

function ServiceCard({ service }) {
  return (
    <InternalLink
      path={service.path}
      className="service-card"
    >
      <span className="service-icon">
        {service.icon}
      </span>

      <span className="service-card-content">
        <strong>{service.title}</strong>

        <span>{service.description}</span>
      </span>

      <span className="service-arrow">→</span>
    </InternalLink>
  );
}

function ToolCard({ tool }) {
  return (
    <InternalLink
      path={tool.path}
      className="tool-card"
    >
      <span className="tool-icon">
        {tool.icon}
      </span>

      <span>
        <strong>{tool.title}</strong>
        <span>{tool.description}</span>
      </span>

      <span className="tool-arrow">→</span>
    </InternalLink>
  );
}

export default function HomePage() {
  return (
    <main className="home-page">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">
            GLOBAL FLIGHT SEARCH & TRAVEL INTELLIGENCE
          </span>

          <h1>
            Search smarter.
            <br />
            Travel prepared.
          </h1>

          <p className="hero-description">
            Search flights, compare travel options and prepare
            your journey with FlyMatrix.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/search")}
            >
              Search Flights
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/planner")}
            >
              Plan My Trip
            </button>
          </div>

          <div className="hero-trust">
            <span>✓ Global routes</span>
            <span>✓ Travel partner connections</span>
            <span>✓ Travel preparation tools</span>
          </div>
        </div>
      </section>

      {/* FLIGHT SEARCH */}
      <section className="search-section">
        <div className="section-container">
          <div className="section-heading">
            <span className="eyebrow">
              FLIGHT SEARCH
            </span>

            <h2>Find your next flight</h2>

            <p>
              Enter your exact travel requirements and
              continue to available flight results.
            </p>
          </div>

          <div className="search-panel">
            <FlightSearchForm />
          </div>
        </div>
      </section>

      {/* FEATURED ROUTES */}
      <section className="routes-section">
        <div className="section-container">
          <div className="section-heading">
            <span className="eyebrow">
              POPULAR ROUTES
            </span>

            <h2>Start with a popular route</h2>

            <p>
              Select a route to open the flight-search
              workflow with the airports already selected.
            </p>
          </div>

          <div className="routes-grid">
            {FEATURED_ROUTES.map((route) => (
              <RouteCard
                key={`${route.fromCode}-${route.toCode}`}
                route={route}
              />
            ))}
          </div>
        </div>
      </section>

      {/* TOURISM */}
      <section className="tourism-section">
        <div className="section-container">
          <div className="tourism-intro">
            <div>
              <span className="eyebrow">
                TOURISM INTELLIGENCE
              </span>

              <h2>
                Travel for leisure or education
              </h2>

              <p>
                Explore destination options using separate
                leisure and education travel workflows.
              </p>
            </div>
          </div>

          <div className="tourism-grid">
            <button
              type="button"
              className="tourism-card tourism-card-leisure"
              onClick={() =>
                navigate("/tourism/leisure")
              }
            >
              <span className="tourism-card-icon">
                🌴
              </span>

              <span className="tourism-card-body">
                <span className="eyebrow">
                  LEISURE TOURISM
                </span>

                <strong>
                  Discover destinations
                </strong>

                <span>
                  Explore destinations around your budget,
                  trip length, lifestyle and preferred
                  facilities.
                </span>
              </span>

              <span className="tourism-card-action">
                Explore Leisure →
              </span>
            </button>

            <button
              type="button"
              className="tourism-card tourism-card-education"
              onClick={() =>
                navigate("/tourism/education")
              }
            >
              <span className="tourism-card-icon">
                🎓
              </span>

              <span className="tourism-card-body">
                <span className="eyebrow">
                  EDUCATION TOURISM
                </span>

                <strong>
                  Explore study destinations
                </strong>

                <span>
                  Research education-focused destinations,
                  accommodation and travel preparation.
                </span>
              </span>

              <span className="tourism-card-action">
                Explore Education →
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* TRAVEL TOOLS */}
      <section className="tools-section">
        <div className="section-container">
          <div className="section-heading">
            <span className="eyebrow">
              TRAVEL INTELLIGENCE
            </span>

            <h2>Prepare before you travel</h2>

            <p>
              FlyMatrix brings planning and preparation
              tools together around your journey.
            </p>
          </div>

          <div className="tools-grid">
            {TOOLS.map((tool) => (
              <ToolCard
                key={tool.path}
                tool={tool}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services-section">
        <div className="section-container">
          <div className="section-heading">
            <span className="eyebrow">
              TRAVEL SERVICES
            </span>

            <h2>
              Useful services for your journey
            </h2>

            <p>
              Access partner-connected travel services
              from the same FlyMatrix workflow.
            </p>
          </div>

          <div className="services-grid">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.path}
                service={service}
              />
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="workflow-section">
        <div className="section-container">
          <div className="section-heading">
            <span className="eyebrow">
              FLYMATRIX WORKFLOW
            </span>

            <h2>
              From search to travel preparation
            </h2>
          </div>

          <div className="workflow-grid">
            <div className="workflow-step">
              <span>01</span>
              <strong>Search</strong>
              <p>
                Enter your route, dates and passenger
                requirements.
              </p>
            </div>

            <div className="workflow-step">
              <span>02</span>
              <strong>Compare</strong>
              <p>
                Review available travel options and
                relevant provider information.
              </p>
            </div>

            <div className="workflow-step">
              <span>03</span>
              <strong>Prepare</strong>
              <p>
                Review visa, baggage, connectivity and
                destination requirements.
              </p>
            </div>

            <div className="workflow-step">
              <span>04</span>
              <strong>Book</strong>
              <p>
                Continue to the relevant travel provider
                when you are ready.
              </p>
            </div>

            <div className="workflow-step">
              <span>05</span>
              <strong>Monitor</strong>
              <p>
                Use alerts and preparation tools to stay
                organised around your trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta-section">
        <div className="section-container">
          <div className="final-cta">
            <span className="eyebrow">
              READY TO START?
            </span>

            <h2>
              Build your next journey with FlyMatrix.
            </h2>

            <p>
              Search flights or start planning your trip
              with the information you already have.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/search")}
              >
                Search Flights
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/planner")}
              >
                Plan My Trip
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
        }
