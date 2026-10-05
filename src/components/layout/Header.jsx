import React, { useEffect, useState } from "react";

import { navigate, getCurrentPath } from "../../router/AppRouter.jsx";

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

function isActive(path, currentPath) {
  if (path === "/") {
    return currentPath === "/";
  }

  return (
    currentPath === path ||
    currentPath.startsWith(`${path}/`)
  );
}

function isTravelServiceActive(currentPath) {
  return TRAVEL_SERVICES.some((item) =>
    isActive(item.path, currentPath)
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const [currentPath, setCurrentPath] = useState(
    () => getCurrentPath()
  );

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

  /*
   * Keep header active states synchronized
   * with the custom FlyMatrix router.
   */
  useEffect(() => {
    function handleNavigation() {
      setCurrentPath(getCurrentPath());
      setMobileOpen(false);
      setServicesOpen(false);
    }

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

  /*
   * Dark mode
   */
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
      // Storage is optional.
    }
  }, [darkMode]);

  /*
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    function handleDocumentClick(event) {
      const target = event.target;

      if (
        target instanceof Element &&
        !target.closest(".fm-header-more")
      ) {
        setServicesOpen(false);
      }
    }

    document.addEventListener(
      "click",
      handleDocumentClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleDocumentClick
      );
    };
  }, []);

  /*
   * Escape closes menus.
   */
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

  function handleNavigate(path) {
    setMobileOpen(false);
    setServicesOpen(false);

    if (path === currentPath) {
      return;
    }

    navigate(path);
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

        {/* =================================================
            BRAND
            ================================================= */}

        <button
          type="button"
          className="fm-brand"
          onClick={() => handleNavigate("/")}
          aria-label="FlyMatrix home"
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

        {/* =================================================
            DESKTOP NAVIGATION
            ================================================= */}

        <nav
          className="fm-nav"
          aria-label="Main navigation"
        >
          {PRIMARY_NAV_ITEMS.map((item) => {
            const active = isActive(
              item.path,
              currentPath
            );

            return (
              <button
                type="button"
                key={item.path}
                className={
                  active
                    ? "fm-nav-link active"
                    : "fm-nav-link"
                }
                onClick={() =>
                  handleNavigate(item.path)
                }
              >
                {item.label}
              </button>
            );
          })}

          {/* Travel Services dropdown */}

          <div className="fm-header-more">
            <button
              type="button"
              className={
                servicesOpen ||
                isTravelServiceActive(
                  currentPath
                )
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
                  marginLeft: "5px",
                  fontSize: "0.75rem",
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
                {TRAVEL_SERVICES.map((item) => {
                  const active = isActive(
                    item.path,
                    currentPath
                  );

                  return (
                    <button
                      type="button"
                      role="menuitem"
                      key={item.path}
                      className={
                        active ? "active" : ""
                      }
                      onClick={() =>
                        handleNavigate(
                          item.path
                        )
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* =================================================
            HEADER ACTIONS
            ================================================= */}

        <div className="fm-header-actions">

          {/* Theme */}

          <button
            type="button"
            className="fm-btn fm-btn-ghost"
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
            style={{
              minWidth: "44px",
              paddingInline: "10px",
              fontSize: "1.15rem",
            }}
          >
            {darkMode ? "☀" : "☾"}
          </button>

          {/* Search flights */}

          <button
            type="button"
            className="fm-btn fm-btn-primary"
            onClick={() =>
              handleNavigate("/search")
            }
          >
            Search flights
          </button>

          {/* Mobile menu */}

          <button
            type="button"
            className="fm-mobile-menu"
            onClick={() =>
              setMobileOpen(
                (current) => !current
              )
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

      {/* =================================================
          MOBILE NAVIGATION
          ================================================= */}

      {mobileOpen && (
        <div
          id="flymatrix-mobile-navigation"
          className="fm-mobile-menu-panel"
        >
          <nav
            className="fm-mobile-nav"
            aria-label="Mobile navigation"
          >

            {/* Home */}

            <button
              type="button"
              className={
                isActive(
                  "/",
                  currentPath
                )
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleNavigate("/")
              }
            >
              Home
            </button>

            {/* Explore */}

            <div className="fm-mobile-nav-section">
              <span>
                Explore
              </span>
            </div>

            {PRIMARY_NAV_ITEMS.map(
              (item) => (
                <button
                  type="button"
                  key={item.path}
                  className={
                    isActive(
                      item.path,
                      currentPath
                    )
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleNavigate(
                      item.path
                    )
                  }
                >
                  {item.label}
                </button>
              )
            )}

            {/* Travel Services */}

            <div className="fm-mobile-nav-section">
              <span>
                Travel Services
              </span>
            </div>

            {TRAVEL_SERVICES.map(
              (item) => (
                <button
                  type="button"
                  key={item.path}
                  className={
                    isActive(
                      item.path,
                      currentPath
                    )
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleNavigate(
                      item.path
                    )
                  }
                >
                  {item.label}
                </button>
              )
            )}

            {/* Appearance */}

            <div className="fm-mobile-nav-section">
              <span>
                Appearance
              </span>
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
