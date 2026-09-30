import React from "react";

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  function handleNavigation(event, path) {
    event.preventDefault();
    navigate(path);
  }

  return (
    <footer className="fm-footer">
      <div className="fm-container">
        <div className="fm-footer-grid">
          {/* Brand */}
          <div className="fm-footer-brand">
            <button
              type="button"
              className="fm-footer-logo"
              onClick={() => navigate("/")}
              aria-label="FlyMatrix home"
            >
              <span className="fm-logo-mark" aria-hidden="true">
                ✈
              </span>

              <span>
                <strong>FlyMatrix</strong>
                <small>Search smarter. Travel prepared.</small>
              </span>
            </button>

            <p>
              Global flight search and travel intelligence for comparing
              journeys, planning trips, discovering travel services, and
              connecting with booking providers.
            </p>

            <div className="fm-footer-trust">
              <span>🌍 Global</span>
              <span>🔎 Compare</span>
              <span>🧭 Plan</span>
            </div>
          </div>

          {/* Flights & Planning */}
          <div className="fm-footer-column">
            <h3>Flights &amp; Planning</h3>

            <ul>
              <li>
                <a
                  href="/search"
                  onClick={(event) => handleNavigation(event, "/search")}
                >
                  Search Flights
                </a>
              </li>

              <li>
                <a
                  href="/planner"
                  onClick={(event) => handleNavigation(event, "/planner")}
                >
                  Trip Planner
                </a>
              </li>

              <li>
                <a
                  href="/alerts"
                  onClick={(event) => handleNavigation(event, "/alerts")}
                >
                  Fare Alerts
                </a>
              </li>

              <li>
                <a
                  href="/essentials"
                  onClick={(event) =>
                    handleNavigation(event, "/essentials")
                  }
                >
                  Travel Essentials
                </a>
              </li>
            </ul>
          </div>

          {/* Tourism */}
          <div className="fm-footer-column">
            <h3>Tourism</h3>

            <ul>
              <li>
                <a
                  href="/tourism/leisure"
                  onClick={(event) =>
                    handleNavigation(event, "/tourism/leisure")
                  }
                >
                  Leisure Tourism
                </a>
              </li>

              <li>
                <a
                  href="/tourism/education"
                  onClick={(event) =>
                    handleNavigation(event, "/tourism/education")
                  }
                >
                  Education Tourism
                </a>
              </li>

              <li>
                <a
                  href="/hotels"
                  onClick={(event) => handleNavigation(event, "/hotels")}
                >
                  Hotels
                </a>
              </li>

              <li>
                <a
                  href="/activities"
                  onClick={(event) =>
                    handleNavigation(event, "/activities")
                  }
                >
                  Activities
                </a>
              </li>
            </ul>
          </div>

          {/* Travel Services */}
          <div className="fm-footer-column">
            <h3>Travel Services</h3>

            <ul>
              <li>
                <a
                  href="/visa"
                  onClick={(event) => handleNavigation(event, "/visa")}
                >
                  Visa Guidance
                </a>
              </li>

              <li>
                <a
                  href="/esim"
                  onClick={(event) => handleNavigation(event, "/esim")}
                >
                  eSIM
                </a>
              </li>

              <li>
                <a
                  href="/transfers"
                  onClick={(event) =>
                    handleNavigation(event, "/transfers")
                  }
                >
                  Transfers
                </a>
              </li>

              <li>
                <a
                  href="/luggage"
                  onClick={(event) =>
                    handleNavigation(event, "/luggage")
                  }
                >
                  Luggage Storage
                </a>
              </li>

              <li>
                <a
                  href="/assistance"
                  onClick={(event) =>
                    handleNavigation(event, "/assistance")
                  }
                >
                  Travel Assistance
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Provider disclosure */}
        <div className="fm-footer-disclosure">
          <strong>Provider information</strong>

          <p>
            FlyMatrix may connect you with airlines, hotels, travel
            providers, activity providers, visa-information services,
            connectivity providers, and other third-party booking
            platforms. Availability, prices, booking conditions, refunds,
            cancellations, and final terms are confirmed by the relevant
            provider before purchase.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="fm-footer-bottom">
          <div className="fm-footer-copy">
            © {currentYear} FlyMatrix. All rights reserved.
          </div>

          <div className="fm-footer-links">
            <a
              href="/"
              onClick={(event) => handleNavigation(event, "/")}
            >
              Home
            </a>

            <a
              href="/essentials"
              onClick={(event) =>
                handleNavigation(event, "/essentials")
              }
            >
              Travel Essentials
            </a>

            <a
              href="/planner"
              onClick={(event) => handleNavigation(event, "/planner")}
            >
              Plan a Trip
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
