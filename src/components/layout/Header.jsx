import React, { useEffect, useState } from "react";
import { navigate } from "../../router/AppRouter.jsx";

/* =========================================================
   PRIMARY NAVIGATION
   ========================================================= */

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

/* =========================================================
   TRAVEL SERVICES
   ========================================================= */

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

/* =========================================================
   ACTIVE ROUTE
   ========================================================= */

function getCurrentPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return window.location.pathname;
}

function isActive(path) {
  const current = getCurrentPath();

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

/* =========================================================
   HEADER
   ========================================================= */

export default function Header() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [servicesOpen, setServicesOpen] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(() => {
      try {
        return (
          localStorage.getItem(
            "flymatrix:theme"
          ) === "dark"
        );
      } catch {
        return false;
      }
    });

  /* =======================================================
     THEME
     ======================================================= */

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
      // Storage may be unavailable.
    }
  }, [darkMode]);

  /* =======================================================
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
     ======================================================= */

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

  /* =======================================================
     KEYBOARD CONTROLS
     ======================================================= */

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

  /* =======================================================
     CLOSE MENUS AFTER ROUTE CHANGE
     ======================================================= */

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

  /* =======================================================
     NAVIGATION HANDLER
     ======================================================= */

  function goTo(path) {
    setMobileOpen(false);
    setServicesOpen(false);

    navigate(path);
  }

  /* =======================================================
     THEME HANDLER
     ======================================================= */

  function toggleTheme() {
    setDarkMode((current) => !current);
  }

  /* =======================================================
     SERVICES DROPDOWN
     ======================================================= */

  function toggleServices(event) {
    event.stopPropagation();

    setServicesOpen(
      (current) => !current
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <header className="fm-header">
      <div className="fm-header-inner">

        {/* =================================================
            BRAND
            ================================================= */}

        <button
          type="button"
          className="fm-brand"
          onClick={() => goTo("/")}
          aria-label="FlyMatrix home"
        >
          <span
            className="fm-brand-mark"
            aria-hidden="true"
          >
            ✈
          </span>

          <span className="fm-brand-text">
            <strong>
              FlyMatrix
            </strong>

            <small>
              Search smarter. Travel prepared.
            </small>
          </span>
        </button>

        {/* =================================================
            DESKTOP NAVIGATION
            ================================================= */}

        <nav
          className="fm-desktop-nav"
          aria-label="Main navigation"
        >
          {PRIMARY_NAV_ITEMS.map(
            (item) => (
              <button
                type="button"
                key={item.path}
                className={
                  isActive(item.path)
                    ? "fm-nav-link active"
                    : "fm-nav-link"
                }
                onClick={() =>
                  goTo(item.path)
                }
              >
                {item.label}
              </button>
            )
          )}

          {/* ===============================================
              TRAVEL SERVICES
              =============================================== */}

          <div className="fm-header-more">
            <button
              type="button"
              className={
                servicesOpen ||
                isTravelServiceActive()
                  ? "fm-nav-link active"
                  : "fm-nav-link"
              }
              onClick={
                toggleServices
              }
              aria-expanded={
                servicesOpen
              }
              aria-haspopup="menu"
            >
              Travel Services

              <span
                aria-hidden="true"
                className="fm-dropdown-arrow"
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
                {TRAVEL_SERVICES.map(
                  (item) => (
                    <button
                      type="button"
                      role="menuitem"
                      key={item.path}
                      className={
                        isActive(
                          item.path
                        )
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        goTo(
                          item.path
                        )
                      }
                    >
                      {item.label}
                    </button>
                  )
                )}
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
            className="fm-theme-toggle"
            onClick={
              toggleTheme
            }
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
            {darkMode
              ? "☀"
              : "☾"}
          </button>

          {/* Search */}
          <button
            type="button"
            className="fm-btn fm-primary fm-header-cta"
            onClick={() =>
              goTo("/search")
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
                (current) =>
                  !current
              )
            }
            aria-label={
              mobileOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={
              mobileOpen
            }
            aria-controls="flymatrix-mobile-navigation"
          >
            {mobileOpen
              ? "✕"
              : "☰"}
          </button>
        </div>
      </div>

      {/* ===================================================
          MOBILE NAVIGATION
          =================================================== */}

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
                isActive("/")
                  ? "fm-mobile-nav-home active"
                  : "fm-mobile-nav-home"
              }
              onClick={() =>
                goTo("/")
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
                      item.path
                    )
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    goTo(
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
                      item.path
                    )
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    goTo(
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
              onClick={
                toggleTheme
              }
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
