import React, { useEffect, useState } from "react";

const PRIMARY_NAV_ITEMS = [
  {
    label: "Flights",
    path: "/search",
  },
  {
    label: "Leisure Tourism",
    path: "/tourism/leisure",
  },
  {
    label: "Education Tourism",
    path: "/tourism/education",
  },
  {
    label: "Trip Planner",
    path: "/planner",
  },
];

const TRAVEL_SERVICES = [
  {
    label: "Visa Guidance",
    path: "/visa",
  },
  {
    label: "Hotels",
    path: "/hotels",
  },
  {
    label: "Activities",
    path: "/activities",
  },
  {
    label: "eSIM",
    path: "/esim",
  },
  {
    label: "Transfers",
    path: "/transfers",
  },
  {
    label: "Luggage Storage",
    path: "/luggage",
  },
  {
    label: "Travel Assistance",
    path: "/assistance",
  },
  {
    label: "Travel Essentials",
    path: "/essentials",
  },
  {
    label: "Fare Alerts",
    path: "/alerts",
  },
];

function isActive(path) {
  const current = window.location.pathname;

  if (path === "/") {
    return current === "/";
  }

  return (
    current === path ||
    current.startsWith(`${path}/`)
  );
}

function isTravelServiceActive() {
  return TRAVEL_SERVICES.some((item) =>
    isActive(item.path)
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return (
        localStorage.getItem("flymatrix:theme") ===
        "dark"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );

    document.body.classList.toggle(
      "dark",
      darkMode
    );

    try {
      localStorage.setItem(
        "flymatrix:theme",
        darkMode ? "dark" : "light"
      );
    } catch {
      // Ignore storage errors.
    }
  }, [darkMode]);

  useEffect(() => {
    function closeMenus(event) {
      const target = event.target;

      if (
        target instanceof Element &&
        !target.closest(".fm-header-more")
      ) {
        setServicesOpen(false);
      }
    }

    document.addEventListener("click", closeMenus);

    return () => {
      document.removeEventListener(
        "click",
        closeMenus
      );
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setServicesOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  useEffect(() => {
    function handlePopState() {
      setMobileOpen(false);
      setServicesOpen(false);
    }

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  function navigate(path) {
    setMobileOpen(false);
    setServicesOpen(false);

    if (path === window.location.pathname) {
      return;
    }

    window.history.pushState({}, "", path);

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  }

  function toggleTheme() {
    setDarkMode((current) => !current);
  }

  function toggleServices(event) {
    event.stopPropagation();

    setServicesOpen((current) => !current);
  }

  return (
    <header className="fm-header">
      <div className="fm-header-inner">
        {/* Brand */}
        <button
          type="button"
          className="fm-brand"
          onClick={() => navigate("/")}
          aria-label="FlyMatrix home"
        >
          <span
            className="fm-brand-mark"
            aria-hidden="true"
          >
            ✈
          </span>

          <span className="fm-brand-text">
            <strong>FlyMatrix</strong>

            <small>
              Search smarter. Travel prepared.
            </small>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav
          className="fm-desktop-nav"
          aria-label="Main navigation"
        >
          {PRIMARY_NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.path}
              className={
                isActive(item.path)
                  ? "fm-nav-link active"
                  : "fm-nav-link"
              }
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}

          {/* Travel services */}
          <div className="fm-header-more">
            <button
              type="button"
              className={
                servicesOpen ||
                isTravelServiceActive()
                  ? "fm-nav-link active"
                  : "fm-nav-link"
              }
              onClick={toggleServices}
              aria-expanded={servicesOpen}
              aria-haspopup="menu"
            >
              Travel Services
              <span
                aria-hidden="true"
                style={{
                  marginLeft: "4px",
                }}
              >
                ▾
              </span>
            </button>

            {servicesOpen && (
              <div
                className="fm-header-dropdown"
                role="menu"
                aria-label="Travel services"
              >
                {TRAVEL_SERVICES.map((item) => (
                  <button
                    type="button"
                    role="menuitem"
                    key={item.path}
                    className={
                      isActive(item.path)
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      navigate(item.path)
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Header actions */}
        <div className="fm-header-actions">
          <button
            type="button"
            className="fm-theme-toggle"
            onClick={toggleTheme}
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              darkMode
                ? "Light mode"
                : "Dark mode"
            }
          >
            {darkMode ? "☀" : "☾"}
          </button>

          <button
            type="button"
            className="fm-btn fm-primary fm-header-cta"
            onClick={() => navigate("/search")}
          >
            Search flights
          </button>

          <button
            type="button"
            className="fm-mobile-menu"
            onClick={() =>
              setMobileOpen((current) => !current)
            }
            aria-label={
              mobileOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={mobileOpen}
            aria-controls="flymatrix-mobile-navigation"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div
          id="flymatrix-mobile-navigation"
          className="fm-mobile-menu-panel"
        >
          <nav
            className="fm-mobile-nav"
            aria-label="Mobile navigation"
          >
            <button
              type="button"
              className={
                isActive("/")
                  ? "fm-mobile-nav-home active"
                  : "fm-mobile-nav-home"
              }
              onClick={() => navigate("/")}
            >
              Home
            </button>

            {/* Primary discovery */}
            <div className="fm-mobile-nav-section">
              <span>Explore</span>
            </div>

            {PRIMARY_NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.path}
                className={
                  isActive(item.path)
                    ? "active"
                    : ""
                }
                onClick={() =>
                  navigate(item.path)
                }
              >
                {item.label}
              </button>
            ))}

            {/* Travel services */}
            <div className="fm-mobile-nav-section">
              <span>Travel Services</span>
            </div>

            {TRAVEL_SERVICES.map((item) => (
              <button
                type="button"
                key={item.path}
                className={
                  isActive(item.path)
                    ? "active"
                    : ""
                }
                onClick={() =>
                  navigate(item.path)
                }
              >
                {item.label}
              </button>
            ))}

            {/* Appearance */}
            <div className="fm-mobile-nav-section">
              <span>Appearance</span>
            </div>

            <button
              type="button"
              className="fm-mobile-theme"
              onClick={toggleTheme}
            >
              {darkMode
                ? "☀ Switch to light mode"
                : "☾ Switch to dark mode"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
            }
