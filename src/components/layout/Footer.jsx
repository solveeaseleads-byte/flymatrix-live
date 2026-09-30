import React from "react";

const FOOTER_GROUPS = [
  {
    title: "Explore",
    links: [
      {
        label: "Search Flights",
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
    ],
  },
  {
    title: "Travel Tools",
    links: [
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
        label: "Travel Essentials",
        path: "/essentials",
      },
      {
        label: "Fare Alerts",
        path: "/alerts",
      },
    ],
  },
  {
    title: "Travel Services",
    links: [
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
    ],
  },
];

export default function Footer() {
  function navigate(path) {
    if (
      path === window.location.pathname
    ) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    window.history.pushState(
      {},
      "",
      path
    );

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goHome() {
    navigate("/");
  }

  function handleKeyDown(event, path) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      navigate(path);
    }
  }

  return (
    <footer className="fm-footer">
      <div className="fm-container">

        <div className="fm-footer-main">

          <div className="fm-footer-brand">

            <button
              type="button"
              className="fm-brand"
              onClick={goHome}
              aria-label="FlyMatrix home"
            >
              <span className="fm-brand-mark">
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

            <p>
              Global flight search and travel
              intelligence for planning, comparing
              and preparing journeys.
            </p>

            <p className="fm-footer-note">
              Search → Compare → Prepare →
              Plan → Book → Monitor
            </p>

          </div>

          <div className="fm-footer-links">

            {FOOTER_GROUPS.map(
              (group) => (
                <div
                  className="fm-footer-column"
                  key={group.title}
                >
                  <h3>
                    {group.title}
                  </h3>

                  <nav
                    aria-label={
                      group.title
                    }
                  >
                    {group.links.map(
                      (link) => (
                        <button
                          type="button"
                          key={link.path}
                          onClick={() =>
                            navigate(
                              link.path
                            )
                          }
                          onKeyDown={(event) =>
                            handleKeyDown(
                              event,
                              link.path
                            )
                          }
                        >
                          {link.label}
                        </button>
                      )
                    )}
                  </nav>
                </div>
              )
            )}

          </div>

        </div>

        <div className="fm-footer-disclaimer">

          <strong>
            Travel provider notice
          </strong>

          <p>
            FlyMatrix may use third-party travel
            providers and affiliate partners for
            flights, hotels, activities, connectivity,
            transfers, luggage storage, assistance and
            other travel services. Prices, schedules,
            availability, eligibility, cancellation
            rules and final booking terms are
            determined by the relevant provider.
          </p>

          <p>
            Where provider data is available, FlyMatrix
            displays or uses that data according to
            the applicable integration. Where live
            provider data is unavailable, FlyMatrix
            does not represent a static estimate as a
            confirmed current price.
          </p>

        </div>

        <div className="fm-footer-bottom">

          <div>
            ©{" "}
            {new Date().getFullYear()}{" "}
            FlyMatrix. All rights reserved.
          </div>

          <div className="fm-footer-bottom-links">

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
            >
              Home
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/planner")
              }
            >
              Plan a trip
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/alerts")
              }
            >
              Fare alerts
            </button>

          </div>

        </div>

      </div>
    </footer>
  );
}
