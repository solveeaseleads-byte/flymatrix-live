import React, { useEffect, useState } from "react";

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

function normalizePath(pathname) {
  if (!pathname) return "/";

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

  return normalizePath(window.location.pathname);
}

export function getCurrentSearchParams() {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.search);
}

export function navigate(path, options = {}) {
  if (typeof window === "undefined") return;

  const {
    replace = false,
    state = null,
  } = options;

  const target = path || "/";

  if (replace) {
    window.history.replaceState(state, "", target);
  } else {
    window.history.pushState(state, "", target);
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

function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="page-hero-inner">
          <span className="eyebrow">FLYMATRIX</span>

          <h1>Page not found</h1>

          <p>
            The page you requested does not exist or may have moved.
          </p>

          <div className="page-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              Back to FlyMatrix
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/search")}
            >
              Search Flights
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function RouteRenderer({ path, searchParams }) {
  switch (path) {
    case "/":
      return <HomePage />;

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

    case "/tourism/leisure":
      return <LeisureTourismPage />;

    case "/tourism/leisure/results":
      return (
        <LeisureResultsPage
          searchParams={searchParams}
        />
      );

    case "/tourism/education":
      return <EducationTourismPage />;

    case "/tourism/education/results":
      return (
        <EducationResultsPage
          searchParams={searchParams}
        />
      );

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

    default:
      return <NotFoundPage />;
  }
}

export default function AppRouter() {
  const [path, setPath] = useState(getCurrentPath);
  const [searchParams, setSearchParams] = useState(
    getCurrentSearchParams
  );

  useEffect(() => {
    const handleNavigation = () => {
      setPath(getCurrentPath());
      setSearchParams(getCurrentSearchParams());
    };

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener(
        "popstate",
        handleNavigation
      );
    };
  }, []);

  useEffect(() => {
    const handleLinkClick = (event) => {
      const target = event.target.closest("a");

      if (!target) return;

      const href = target.getAttribute("href");

      if (!href) return;

      /*
       * Only intercept internal FlyMatrix links.
       * External affiliate/provider links continue normally.
       */
      if (
        href.startsWith("/") &&
        !href.startsWith("//")
      ) {
        event.preventDefault();
        navigate(href);
      }
    };

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

  return (
    <RouteRenderer
      path={path}
      searchParams={searchParams}
    />
  );
}
