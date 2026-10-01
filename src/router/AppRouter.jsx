import React, {
  useEffect,
  useState,
} from "react";

import HomePage from "../pages/HomePage.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import FlightDetailsPage from "../pages/FlightDetailsPage.jsx";

import LeisureTourismPage from "../pages/LeisureTourismPage.jsx";
import LeisureResultsPage from "../pages/LeisureResultsPage.jsx";

import EducationTourismPage from "../pages/EducationTourismPage.jsx";
import EducationResultsPage from "../pages/EducationResultsPage.jsx";

import PlannerPage from "../pages/PlannerPage.jsx";
import VisaPage from "../pages/VisaPage.jsx";
import HotelsPage from "../pages/HotelsPage.jsx";
import ActivitiesPage from "../pages/ActivitiesPage.jsx";
import EssentialsPage from "../pages/EssentialsPage.jsx";
import EsimPage from "../pages/EsimPage.jsx";
import TransfersPage from "../pages/TransfersPage.jsx";
import LuggagePage from "../pages/LuggagePage.jsx";
import AssistancePage from "../pages/AssistancePage.jsx";
import AlertsPage from "../pages/AlertsPage.jsx";

/* =========================================================
   PATH UTILITIES
========================================================= */

function normalizePath(pathname) {
  if (!pathname) {
    return "/";
  }

  let path = pathname;

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
}

export function getCurrentPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return normalizePath(
    window.location.pathname
  );
}

export function getCurrentSearchParams() {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  return new URLSearchParams(
    window.location.search
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

export function navigate(
  path = "/",
  options = {}
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const {
    replace = false,
    state = null,
  } = options;

  const target = String(path || "/");

  if (replace) {
    window.history.replaceState(
      state,
      "",
      target
    );
  } else {
    window.history.pushState(
      state,
      "",
      target
    );
  }

  window.dispatchEvent(
    new PopStateEvent("popstate", {
      state,
    })
  );

  window.scrollTo({
    top: 0,
    behavior: "auto",
  });
}

/* =========================================================
   ROUTE STATE HOOK
========================================================= */

export function usePath() {
  const [location, setLocation] =
    useState(() => ({
      pathname: getCurrentPath(),
      search:
        typeof window !== "undefined"
          ? window.location.search
          : "",
    }));

  useEffect(() => {
    function handleNavigation() {
      setLocation({
        pathname: getCurrentPath(),
        search:
          typeof window !== "undefined"
            ? window.location.search
            : "",
      });
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

  return {
    pathname: location.pathname,
    search: location.search,
  };
}

/* =========================================================
   INTERNAL LINK HANDLING
========================================================= */

function isInternalLink(href) {
  if (!href) {
    return false;
  }

  if (!href.startsWith("/")) {
    return false;
  }

  if (href.startsWith("//")) {
    return false;
  }

  return true;
}

/* =========================================================
   NOT FOUND
========================================================= */

function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="page-hero-inner">
          <span className="eyebrow">
            FLYMATRIX
          </span>

          <h1>
            Page not found
          </h1>

          <p>
            The page you requested does not
            exist or may have moved.
          </p>

          <div className="page-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate("/")
              }
            >
              Back to FlyMatrix
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate("/search")
              }
            >
              Search Flights
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   ROUTE RENDERER
========================================================= */

export function RouteRenderer({
  path,
  searchParams,
}) {
  switch (path) {
    /* -----------------------------------------
       HOME
    ----------------------------------------- */

    case "/":
      return <HomePage />;

    /* -----------------------------------------
       FLIGHTS
    ----------------------------------------- */

    case "/search":
      return (
        <SearchPage
          searchParams={searchParams}
        />
      );

    case "/flights/details":
      return (
        <FlightDetailsPage
          searchParams={searchParams}
        />
      );

    /* -----------------------------------------
       LEISURE TOURISM
    ----------------------------------------- */

    case "/tourism/leisure":
      return (
        <LeisureTourismPage />
      );

    case "/tourism/leisure/results":
      return (
        <LeisureResultsPage
          searchParams={searchParams}
        />
      );

    /* -----------------------------------------
       EDUCATION TOURISM
    ----------------------------------------- */

    case "/tourism/education":
      return (
        <EducationTourismPage />
      );

    case "/tourism/education/results":
      return (
        <EducationResultsPage
          searchParams={searchParams}
        />
      );

    /* -----------------------------------------
       TRAVEL PLANNING
    ----------------------------------------- */

    case "/planner":
      return <PlannerPage />;

    case "/visa":
      return <VisaPage />;

    case "/hotels":
      return <HotelsPage />;

    case "/activities":
      return <ActivitiesPage />;

    case "/essentials":
      return <EssentialsPage />;

    /* -----------------------------------------
       TRAVEL SERVICES
    ----------------------------------------- */

    case "/esim":
      return <EsimPage />;

    case "/transfers":
      return <TransfersPage />;

    case "/luggage":
      return <LuggagePage />;

    case "/assistance":
      return <AssistancePage />;

    case "/alerts":
      return <AlertsPage />;

    /* -----------------------------------------
       UNKNOWN
    ----------------------------------------- */

    default:
      return <NotFoundPage />;
  }
}

/* =========================================================
   GLOBAL INTERNAL-LINK INTERCEPTION
========================================================= */

function useInternalLinkNavigation() {
  useEffect(() => {
    function handleLinkClick(event) {
      /*
       * Only handle normal primary-button clicks.
       * Modified clicks such as Ctrl/Cmd-click,
       * middle-click and Shift-click retain normal
       * browser behavior.
       */
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target instanceof Element
          ? event.target.closest("a")
          : null;

      if (!target) {
        return;
      }

      const href =
        target.getAttribute("href");

      if (
        !isInternalLink(href)
      ) {
        return;
      }

      /*
       * Allow explicit downloads and new-tab
       * navigation to behave normally.
       */
      if (
        target.hasAttribute("download") ||
        target.target === "_blank"
      ) {
        return;
      }

      event.preventDefault();

      navigate(href);
    }

    document.addEventListener(
      "click",
      handleLinkClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleLinkClick
      );
    };
  }, []);
}

/* =========================================================
   DEFAULT ROUTER COMPONENT
========================================================= */

export default function AppRouter() {
  const {
    pathname,
    search,
  } = usePath();

  useInternalLinkNavigation();

  const searchParams =
    new URLSearchParams(search);

  return (
    <RouteRenderer
      path={pathname}
      searchParams={searchParams}
    />
  );
            }
