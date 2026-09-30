import React, { useEffect, useState } from "react";

/* =========================================================
   CONSTANTS
   ========================================================= */

const APP_NAME = "FlyMatrix";

const NAV_ITEMS = [
  { label: "Flights", path: "/search" },
  { label: "Leisure", path: "/tourism/leisure" },
  { label: "Education", path: "/tourism/education" },
  { label: "Planner", path: "/planner" },
  { label: "Visa", path: "/visa" },
];

const SERVICE_ITEMS = [
  {
    title: "Hotels",
    description: "Find accommodation for your destination.",
    path: "/hotels",
    icon: "🏨",
  },
  {
    title: "Activities",
    description: "Discover activities and experiences.",
    path: "/activities",
    icon: "🎟️",
  },
  {
    title: "eSIM",
    description: "Find mobile connectivity for your trip.",
    path: "/esim",
    icon: "📱",
  },
  {
    title: "Luggage",
    description: "Find luggage storage options.",
    path: "/luggage",
    icon: "🧳",
  },
  {
    title: "Assistance",
    description: "Travel assistance and support.",
    path: "/assistance",
    icon: "🛟",
  },
  {
    title: "Essentials",
    description: "Prepare documents and travel essentials.",
    path: "/essentials",
    icon: "📋",
  },
  {
    title: "Fare Alerts",
    description: "Monitor fares and travel opportunities.",
    path: "/alerts",
    icon: "🔔",
  },
  {
    title: "Transfers",
    description: "Find airport and destination transfers.",
    path: "/transfers",
    icon: "🚐",
  },
];

const FEATURED_ROUTES = [
  {
    from: "LOS",
    to: "LON",
    title: "Lagos → London",
    description: "Compare flight options between Lagos and London.",
  },
  {
    from: "LOS",
    to: "DXB",
    title: "Lagos → Dubai",
    description: "Explore flight options for Dubai.",
  },
  {
    from: "LOS",
    to: "YYZ",
    title: "Lagos → Toronto",
    description: "Search travel options for Toronto.",
  },
  {
    from: "LOS",
    to: "MAN",
    title: "Lagos → Manchester",
    description: "Explore Manchester flight options.",
  },
];

/* =========================================================
   UTILITIES
   ========================================================= */

function getCurrentPath() {
  return window.location.pathname || "/";
}

function navigate(path) {
  if (!path) return;

  window.history.pushState({}, "", path);

  window.dispatchEvent(
    new PopStateEvent("popstate")
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function usePath() {
  const [path, setPath] = useState(getCurrentPath);

  useEffect(() => {
    const handleNavigation = () => {
      setPath(getCurrentPath());
    };

    window.addEventListener(
      "popstate",
      handleNavigation
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleNavigation
      );
    };
  }, []);

  return path;
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored =
      window.localStorage.getItem(
        "flymatrix-dark-mode"
      );

    if (stored === "true") return true;
    if (stored === "false") return false;

    return window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      dark
    );

    window.localStorage.setItem(
      "flymatrix-dark-mode",
      String(dark)
    );
  }, [dark]);

  return [dark, setDark];
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const path = usePath();
  const [dark, setDark] = useDarkMode();

  return (
    <div className="fm-app">
      <Header
        path={path}
        dark={dark}
        onToggleDark={() => setDark((value) => !value)}
      />

      <main>
        <RouteView path={path} />
      </main>

      <Footer />

      <MobileNavigation path={path} />
    </div>
  );
}

/* =========================================================
   ROUTER
   ========================================================= */

function RouteView({ path }) {
  if (path === "/") {
    return <HomePage />;
  }

  if (
    path === "/search" ||
    path === "/flights"
  ) {
    return <PlaceholderPage title="Search Flights" />;
  }

  if (
    path === "/tourism/leisure"
  ) {
    return (
      <PlaceholderPage
        title="Leisure Tourism"
      />
    );
  }

  if (
    path === "/tourism/education"
  ) {
    return (
      <PlaceholderPage
        title="Education Tourism"
      />
    );
  }

  if (path === "/planner") {
    return (
      <PlaceholderPage
        title="Trip Planner"
      />
    );
  }

  if (path === "/visa") {
    return (
      <PlaceholderPage
        title="Visa Guidance"
      />
    );
  }

  if (path === "/hotels") {
    return (
      <PlaceholderPage title="Hotels" />
    );
  }

  if (path === "/activities") {
    return (
      <PlaceholderPage
        title="Activities"
      />
    );
  }

  if (path === "/essentials") {
    return (
      <PlaceholderPage
        title="Travel Essentials"
      />
    );
  }

  if (path === "/esim") {
    return (
      <PlaceholderPage title="eSIM" />
    );
  }

  if (path === "/transfers") {
    return (
      <PlaceholderPage
        title="Transfers"
      />
    );
  }

  if (path === "/luggage") {
    return (
      <PlaceholderPage
        title="Luggage Storage"
      />
    );
  }

  if (path === "/assistance") {
    return (
      <PlaceholderPage
        title="Travel Assistance"
      />
    );
  }

  if (path === "/alerts") {
    return (
      <PlaceholderPage
        title="Fare Alerts"
      />
    );
  }

  return (
    <PlaceholderPage
      title="Page Not Found"
      notFound
    />
  );
}

/* =========================================================
   HEADER
   ========================================================= */

function Header({
  path,
  dark,
  onToggleDark,
}) {
  return (
    <header className="fm-header">
      <div className="fm-container fm-header-inner">
        <button
          type="button"
          className="fm-brand"
          onClick={() => navigate("/")}
          aria-label="Go to FlyMatrix home"
        >
          <span
            className="fm-brand-mark"
            aria-hidden="true"
          >
            ✈
          </span>

          <span className="fm-brand-text">
            {APP_NAME}
          </span>
        </button>

        <nav
          className="fm-nav"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`fm-nav-link ${
                isPathActive(
                  path,
                  item.path
                )
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate(item.path)
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="fm-header-actions">
          <button
            type="button"
            className="fm-btn fm-btn-secondary"
            onClick={() =>
              navigate("/alerts")
            }
          >
            Alerts
          </button>

          <button
            type="button"
            className="fm-btn fm-btn-ghost"
            onClick={onToggleDark}
            aria-label={
              dark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   HOME PAGE
   ========================================================= */

function HomePage() {
  return (
    <>
      <TrustStrip />

      <section className="fm-hero">
        <div className="fm-container">
          <div className="fm-hero-content">
            <div className="fm-eyebrow">
              Global Travel Intelligence
            </div>

            <h1 className="fm-hero-title">
              Search smarter.
              <br />
              <span>
                Travel prepared.
              </span>
            </h1>

            <p className="fm-hero-description">
              Search flights, explore leisure and
              education tourism, prepare your journey,
              compare travel services and connect with
              travel providers.
            </p>

            <div className="fm-hero-actions">
              <button
                type="button"
                className="fm-btn fm-btn-primary fm-btn-lg"
                onClick={() =>
                  navigate("/search")
                }
              >
                Search Flights
              </button>

              <button
                type="button"
                className="fm-btn fm-btn-secondary fm-btn-lg"
                onClick={() =>
                  navigate(
                    "/tourism/leisure"
                  )
                }
              >
                Explore Tourism
              </button>

              <button
                type="button"
                className="fm-btn fm-btn-secondary fm-btn-lg"
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

      <HomeSearchPanel />

      <section className="fm-section">
        <div className="fm-container">
          <div className="fm-section-title">
            Featured routes
          </div>

          <p className="fm-section-subtitle">
            Start with a route or enter your exact
            travel details in the flight search.
          </p>

          <div
            className="fm-grid fm-grid-4"
            style={{ marginTop: 24 }}
          >
            {FEATURED_ROUTES.map(
              (route) => (
                <RouteCard
                  key={`${route.from}-${route.to}`}
                  route={route}
                />
              )
            )}
          </div>
        </div>
      </section>

      <TourismEntrySection />

      <section className="fm-section">
        <div className="fm-container">
          <h2 className="fm-section-title">
            Travel services
          </h2>

          <p className="fm-section-subtitle">
            Access the travel services you need from
            dedicated FlyMatrix pages.
          </p>

          <div
            className="fm-grid fm-grid-4"
            style={{ marginTop: 24 }}
          >
            {SERVICE_ITEMS.map(
              (service) => (
                <ServiceCard
                  key={service.path}
                  service={service}
                />
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   SEARCH PANEL
   ========================================================= */

function HomeSearchPanel() {
  const [origin, setOrigin] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [departure, setDeparture] =
    useState("");

  const [returnDate, setReturnDate] =
    useState("");

  const [tripType, setTripType] =
    useState("round-trip");

  const [cabin, setCabin] =
    useState("economy");

  const handleSubmit = (event) => {
    event.preventDefault();

    const params =
      new URLSearchParams();

    if (origin.trim()) {
      params.set(
        "origin",
        origin.trim().toUpperCase()
      );
    }

    if (destination.trim()) {
      params.set(
        "destination",
        destination
          .trim()
          .toUpperCase()
      );
    }

    if (departure) {
      params.set(
        "departure",
        departure
      );
    }

    if (
      returnDate &&
      tripType === "round-trip"
    ) {
      params.set(
        "return",
        returnDate
      );
    }

    params.set("tripType", tripType);
    params.set("cabin", cabin);
    params.set("adults", "1");

    const query =
      params.toString();

    navigate(
      `/search${
        query
          ? `?${query}`
          : ""
      }`
    );
  };

  return (
    <section className="fm-search-panel">
      <div className="fm-container">
        <form
          className="fm-search-card"
          onSubmit={handleSubmit}
        >
          <div className="fm-search-tabs">
            {[
              [
                "round-trip",
                "Round trip",
              ],
              [
                "one-way",
                "One way",
              ],
              [
                "multi-city",
                "Multi-city",
              ],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`fm-search-tab ${
                    tripType === value
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setTripType(value)
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>

          <div className="fm-search-grid">
            <div className="fm-field">
              <label
                className="fm-field-label"
                htmlFor="home-origin"
              >
                From
              </label>

              <input
                id="home-origin"
                className="fm-input"
                value={origin}
                onChange={(event) =>
                  setOrigin(
                    event.target.value
                  )
                }
                placeholder="LOS"
                autoComplete="off"
              />
            </div>

            <div className="fm-field">
              <label
                className="fm-field-label"
                htmlFor="home-destination"
              >
                To
              </label>

              <input
                id="home-destination"
                className="fm-input"
                value={destination}
                onChange={(event) =>
                  setDestination(
                    event.target.value
                  )
                }
                placeholder="LON"
                autoComplete="off"
              />
            </div>

            <div className="fm-field">
              <label
                className="fm-field-label"
                htmlFor="home-departure"
              >
                Departure
              </label>

              <input
                id="home-departure"
                className="fm-input"
                type="date"
                value={departure}
                onChange={(event) =>
                  setDeparture(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="fm-field">
              <label
                className="fm-field-label"
                htmlFor="home-return"
              >
                Return
              </label>

              <input
                id="home-return"
                className="fm-input"
                type="date"
                disabled={
                  tripType !==
                  "round-trip"
                }
                value={returnDate}
                onChange={(event) =>
                  setReturnDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="fm-field">
              <label
                className="fm-field-label"
                htmlFor="home-cabin"
              >
                Cabin
              </label>

              <select
                id="home-cabin"
                className="fm-select"
                value={cabin}
                onChange={(event) =>
                  setCabin(
                    event.target.value
                  )
                }
              >
                <option value="economy">
                  Economy
                </option>

                <option value="premium-economy">
                  Premium Economy
                </option>

                <option value="business">
                  Business
                </option>

                <option value="first">
                  First
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="fm-btn fm-btn-primary fm-search-submit"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* =========================================================
   TOURISM ENTRY
   ========================================================= */

function TourismEntrySection() {
  return (
    <section className="fm-section">
      <div className="fm-container">
        <h2 className="fm-section-title">
          Tourism intelligence
        </h2>

        <p className="fm-section-subtitle">
          Explore destinations according to your
          budget, lifestyle and required facilities.
        </p>

        <div
          className="fm-grid fm-grid-2"
          style={{ marginTop: 24 }}
        >
          <TourismEntryCard
            title="Leisure Tourism"
            description="Build a leisure trip around destination, budget, lifestyle and facilities."
            icon="🌴"
            path="/tourism/leisure"
          />

          <TourismEntryCard
            title="Education Tourism"
            description="Explore education-focused destinations with budget and student lifestyle requirements."
            icon="🎓"
            path="/tourism/education"
          />
        </div>
      </div>
    </section>
  );
}

function TourismEntryCard({
  title,
  description,
  icon,
  path,
}) {
  return (
    <div className="fm-card fm-card-padding fm-card-hover">
      <div
        className="fm-service-icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      <h3 className="fm-service-title">
        {title}
      </h3>

      <p className="fm-service-description">
        {description}
      </p>

      <button
        type="button"
        className="fm-btn fm-btn-primary"
        style={{
          marginTop: 20,
          width: "100%",
        }}
        onClick={() =>
          navigate(path)
        }
      >
        Explore
      </button>
    </div>
  );
}

/* =========================================================
   ROUTE CARD
   ========================================================= */

function RouteCard({ route }) {
  return (
    <div className="fm-card fm-route-card fm-card-hover">
      <div
        className="fm-route-image"
        style={{
          display: "grid",
          placeItems: "center",
          fontSize: "2.2rem",
          background:
            "linear-gradient(135deg, var(--fm-primary-soft), var(--fm-surface-soft))",
        }}
      >
        ✈️
      </div>

      <div className="fm-route-body">
        <h3 className="fm-route-title">
          {route.title}
        </h3>

        <p className="fm-route-meta">
          {route.description}
        </p>

        <button
          type="button"
          className="fm-btn fm-btn-secondary fm-btn-block"
          onClick={() => {
            const params =
              new URLSearchParams({
                origin: route.from,
                destination: route.to,
              });

            navigate(
              `/search?${params.toString()}`
            );
          }}
        >
          Search route
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SERVICE CARD
   ========================================================= */

function ServiceCard({ service }) {
  return (
    <button
      type="button"
      className="fm-card fm-service-card fm-card-hover"
      onClick={() =>
        navigate(service.path)
      }
      style={{
        textAlign: "left",
      }}
    >
      <div>
        <div
          className="fm-service-icon"
          aria-hidden="true"
        >
          {service.icon}
        </div>

        <h3 className="fm-service-title">
          {service.title}
        </h3>

        <p className="fm-service-description">
          {service.description}
        </p>
      </div>

      <span
        className="fm-badge fm-badge-primary"
        style={{
          alignSelf: "flex-start",
          marginTop: 16,
        }}
      >
        Open
      </span>
    </button>
  );
}

/* =========================================================
   PLACEHOLDER PAGE
   ========================================================= */

function PlaceholderPage({
  title,
  notFound = false,
}) {
  return (
    <>
      <section className="fm-section">
        <div className="fm-container">
          <div
            className="fm-card"
            style={{
              padding:
                "clamp(30px, 7vw, 70px)",
              textAlign: "center",
            }}
          >
            <div
              className="fm-eyebrow"
              style={{
                marginBottom: 18,
              }}
            >
              {notFound
                ? "FlyMatrix"
                : "FlyMatrix"}
            </div>

            <h1 className="fm-section-title">
              {title}
            </h1>

            <p
              className="fm-section-subtitle"
              style={{
                marginInline:
                  "auto",
              }}
            >
              This dedicated page is part of the
              FlyMatrix application and will be
              connected to its complete data and
              affiliate engine in the next repository
              files.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent:
                  "center",
                gap: 10,
                marginTop: 24,
              }}
            >
              <button
                type="button"
                className="fm-btn fm-btn-primary"
                onClick={() =>
                  navigate("/")
                }
              >
                Back to FlyMatrix
              </button>

              <button
                type="button"
                className="fm-btn fm-btn-secondary"
                onClick={() =>
                  navigate("/search")
                }
              >
                Search Flights
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   TRUST STRIP
   ========================================================= */

function TrustStrip() {
  return (
    <div className="fm-trust-strip">
      <div className="fm-container fm-trust-inner">
        <span
          className="fm-status-dot"
          aria-hidden="true"
        />

        <span>
          Provider prices, availability and final
          booking terms are confirmed by the provider.
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {
  return (
    <footer className="fm-footer">
      <div className="fm-container">
        <div className="fm-footer-grid">
          <div>
            <button
              type="button"
              className="fm-brand"
              onClick={() =>
                navigate("/")
              }
            >
              <span
                className="fm-brand-mark"
                aria-hidden="true"
              >
                ✈
              </span>

              <span className="fm-brand-text">
                FlyMatrix
              </span>
            </button>

            <p
              className="fm-footer-text"
              style={{
                marginTop: 14,
                maxWidth: 360,
              }}
            >
              Global flight search and travel
              intelligence for smarter preparation,
              comparison and booking.
            </p>
          </div>

          <FooterColumn
            title="Travel"
            links={[
              [
                "Flights",
                "/search",
              ],
              [
                "Hotels",
                "/hotels",
              ],
              [
                "Activities",
                "/activities",
              ],
              [
                "Transfers",
                "/transfers",
              ],
            ]}
          />

          <FooterColumn
            title="Tourism"
            links={[
              [
                "Leisure Tourism",
                "/tourism/leisure",
              ],
              [
                "Education Tourism",
                "/tourism/education",
              ],
              [
                "Trip Planner",
                "/planner",
              ],
              [
                "Visa Guidance",
                "/visa",
              ],
            ]}
          />

          <FooterColumn
            title="Services"
            links={[
              [
                "eSIM",
                "/esim",
              ],
              [
                "Luggage",
                "/luggage",
              ],
              [
                "Assistance",
                "/assistance",
              ],
              [
                "Fare Alerts",
                "/alerts",
              ],
            ]}
          />
        </div>

        <div className="fm-footer-bottom">
          <span>
            © {new Date().getFullYear()} FlyMatrix
          </span>

          <span>
            Search smarter. Travel prepared.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}) {
  return (
    <div>
      <h3 className="fm-footer-title">
        {title}
      </h3>

      <div className="fm-footer-links">
        {links.map(
          ([label, path]) => (
            <button
              key={path}
              type="button"
              className="fm-footer-link"
              onClick={() =>
                navigate(path)
              }
              style={{
                background:
                  "transparent",
                border: 0,
                padding: 0,
                textAlign: "left",
              }}
            >
              {label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function MobileNavigation({ path }) {
  const links = [
    {
      label: "Home",
      path: "/",
      icon: "⌂",
    },
    {
      label: "Flights",
      path: "/search",
      icon: "✈",
    },
    {
      label: "Tourism",
      path: "/tourism/leisure",
      icon: "🌴",
    },
    {
      label: "Planner",
      path: "/planner",
      icon: "🗺",
    },
  ];

  return (
    <nav
      className="fm-mobile-nav"
      aria-label="Mobile navigation"
    >
      <div className="fm-mobile-nav-inner">
        {links.map((link) => (
          <button
            key={link.path}
            type="button"
            className={`fm-mobile-nav-link ${
              isPathActive(
                path,
                link.path
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate(link.path)
            }
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: "1rem",
              }}
            >
              {link.icon}
            </span>

            <span>
              {link.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* =========================================================
   PATH HELPERS
   ========================================================= */

function isPathActive(
  currentPath,
  targetPath
) {
  if (targetPath === "/") {
    return currentPath === "/";
  }

  return (
    currentPath === targetPath ||
    currentPath.startsWith(
      `${targetPath}/`
    )
  );
  }
