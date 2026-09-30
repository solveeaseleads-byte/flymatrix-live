import React, { useEffect, useMemo, useState } from "react";

const AFFILIATES = {
  flights: "https://aviasales.tpk.lv/zXqbkMmK",
  hotels: "https://booking.tpk.lv/zXqbkMmK",
  activities: "https://getyourguide.tpk.lv/zXqbkMmK",
  esim: "https://airalo.tpk.lv/SMhYBmH2",
  assistance: "https://airhelp.tpk.lv/vuZpde9f",
  luggage: "https://radicalstorage.tpk.lv/LwLfrsRU",
  visa: "https://ivisa.tpk.lv/zXqbkMmK"
};

const QUICK_ROUTES = [
  ["Lagos", "London", "LOS", "LON"],
  ["Lagos", "New York", "LOS", "JFK"],
  ["Lagos", "Toronto", "LOS", "YYZ"],
  ["Lagos", "Dubai", "LOS", "DXB"],
  ["Abuja", "Dubai", "ABV", "DXB"]
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN"];

function formatMoney(value, currency = "USD") {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(number);
  } catch {
    return `${currency} ${Math.round(number).toLocaleString()}`;
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeResults(payload) {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.flights)) {
    return payload.flights;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function getFlightPrice(flight) {
  return (
    flight?.price?.amount ??
    flight?.price?.total ??
    flight?.total_amount ??
    flight?.total ??
    flight?.amount ??
    flight?.fare ??
    null
  );
}

function getCurrency(flight, fallback = "USD") {
  return (
    flight?.price?.currency ??
    flight?.currency ??
    flight?.total_currency ??
    fallback
  );
}

function getAirline(flight) {
  return (
    flight?.airline ??
    flight?.carrier ??
    flight?.marketing_carrier ??
    flight?.owner ??
    "Airline"
  );
}

function getOrigin(flight) {
  return (
    flight?.origin ??
    flight?.from ??
    flight?.departure?.airport ??
    flight?.departure?.iata ??
    "—"
  );
}

function getDestination(flight) {
  return (
    flight?.destination ??
    flight?.to ??
    flight?.arrival?.airport ??
    flight?.arrival?.iata ??
    "—"
  );
}

function getDuration(flight) {
  return (
    flight?.duration ??
    flight?.total_duration ??
    flight?.duration_text ??
    "—"
  );
}

function getStops(flight) {
  if (typeof flight?.stops === "number") {
    return flight.stops;
  }

  if (typeof flight?.stops === "string") {
    return flight.stops;
  }

  if (Array.isArray(flight?.segments)) {
    return Math.max(flight.segments.length - 1, 0);
  }

  return "—";
}

export default function App() {
  const [dark, setDark] = useState(false);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [tripType, setTripType] = useState("round-trip");
  const [cabin, setCabin] = useState("economy");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const [currency, setCurrency] = useState("USD");
  const [stops, setStops] = useState("any");
  const [sort, setSort] = useState("price");

  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [health, setHealth] = useState("checking");

  const [destinationData, setDestinationData] = useState([]);
  const [destinationLoading, setDestinationLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);

  const minDate = todayISO();

  useEffect(() => {
    let active = true;

    fetch("/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("Health check failed");
        return response.json();
      })
      .then((data) => {
        if (active && data?.ok) {
          setHealth("online");
        } else if (active) {
          setHealth("offline");
        }
      })
      .catch(() => {
        if (active) setHealth("offline");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setDestinationLoading(true);

    fetch("/api/destinations")
      .then((response) => {
        if (!response.ok) throw new Error("Destination request failed");
        return response.json();
      })
      .then((data) => {
        if (!active) return;

        const items =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.destinations)
              ? data.destinations
              : Array.isArray(data?.data)
                ? data.data
                : [];

        setDestinationData(items.slice(0, 8));
      })
      .catch(() => {
        if (active) setDestinationData([]);
      })
      .finally(() => {
        if (active) setDestinationLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const sortedResults = useMemo(() => {
    const copy = [...results];

    if (sort === "duration") {
      return copy.sort((a, b) => {
        const da = Number(a?.duration_minutes ?? a?.duration ?? 999999);
        const db = Number(b?.duration_minutes ?? b?.duration ?? 999999);
        return da - db;
      });
    }

    return copy.sort((a, b) => {
      const pa = Number(getFlightPrice(a) ?? Number.MAX_SAFE_INTEGER);
      const pb = Number(getFlightPrice(b) ?? Number.MAX_SAFE_INTEGER);
      return pa - pb;
    });
  }, [results, sort]);

  const searchFlights = async (event) => {
    event?.preventDefault();

    setError("");
    setSearched(true);
    setResults([]);

    if (!origin.trim() || !destination.trim()) {
      setError("Enter both an origin and destination.");
      return;
    }

    if (!departureDate) {
      setError("Select a departure date.");
      return;
    }

    if (tripType === "round-trip" && !returnDate) {
      setError("Select a return date for a round trip.");
      return;
    }

    if (
      tripType === "round-trip" &&
      returnDate &&
      departureDate &&
      returnDate < departureDate
    ) {
      setError("Return date cannot be before departure date.");
      return;
    }

    setLoading(true);

    const payload = {
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      returnDate: tripType === "round-trip" ? returnDate : null,
      tripType,
      cabin,
      passengers: {
        adults,
        children,
        infants
      },
      currency,
      stops
    };

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "The flight search could not be completed."
        );
      }

      const normalized = normalizeResults(data);

      setResults(normalized);

      if (!normalized.length) {
        setError(
          "No flight results were returned for this search. Try different dates or airports."
        );
      }
    } catch (err) {
      console.error("FlyMatrix flight search error:", err);

      setError(
        err?.message ||
          "Unable to search flights right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const useQuickRoute = (route) => {
    setOrigin(route[2]);
    setDestination(route[3]);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const openAffiliate = async (type, metadata = {}) => {
    const url = AFFILIATES[type];

    if (!url) return;

    try {
      await fetch("/api/affiliate/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          program: type,
          metadata
        })
      }).catch(() => {});
    } finally {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const submitLead = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setLeadMessage("Enter your email address.");
      return;
    }

    setLeadLoading(true);
    setLeadMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          source: "flymatrix"
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to save your email."
        );
      }

      setEmail("");
      setLeadMessage("You're subscribed. Watch your inbox for FlyMatrix updates.");
    } catch (err) {
      setLeadMessage(
        err?.message ||
          "We couldn't complete the subscription. Please try again."
      );
    } finally {
      setLeadLoading(false);
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    background: dark ? "#07111f" : "#f8fafc",
    color: dark ? "#f8fafc" : "#0f172a",
    transition: "background .2s ease, color .2s ease"
  };

  const cardStyle = {
    background: dark ? "#0d1a2b" : "#ffffff",
    border: `1px solid ${dark ? "#1e344d" : "#e2e8f0"}`,
    borderRadius: 18,
    boxShadow: dark
      ? "0 10px 35px rgba(0,0,0,.2)"
      : "0 10px 35px rgba(15,23,42,.07)"
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 12,
    border: `1px solid ${dark ? "#29415c" : "#cbd5e1"}`,
    background: dark ? "#081421" : "#ffffff",
    color: dark ? "#ffffff" : "#0f172a",
    outline: "none"
  };

  return (
    <div style={pageStyle}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(14px)",
          background: dark
            ? "rgba(7,17,31,.92)"
            : "rgba(248,250,252,.92)",
          borderBottom: `1px solid ${
            dark ? "#1e344d" : "#e2e8f0"
          }`
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}
        >
          <a
            href="#top"
            style={{
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: "-.04em"
            }}
          >
            FlyMatrix
          </a>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap"
            }}
          >
            <a href="#search">Flights</a>
            <a href="#prepare">Prepare</a>
            <a href="#destinations">Destinations</a>
            <a href="#tools">Travel Tools</a>

            <button
              type="button"
              onClick={() => setDark((value) => !value)}
              style={{
                border: `1px solid ${
                  dark ? "#29415c" : "#cbd5e1"
                }`,
                borderRadius: 10,
                padding: "8px 10px",
                background: dark ? "#0d1a2b" : "#fff",
                color: dark ? "#fff" : "#0f172a"
              }}
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "58px 20px 34px"
          }}
        >
          <div
            style={{
              maxWidth: 800
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 11px",
                borderRadius: 999,
                background: dark ? "#102a42" : "#e0f2fe",
                fontSize: 13,
                fontWeight: 700
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    health === "online"
                      ? "#22c55e"
                      : health === "checking"
                        ? "#f59e0b"
                        : "#ef4444"
                }}
              />
              Travel intelligence for smarter journeys
            </div>

            <h1
              style={{
                fontSize: "clamp(42px, 7vw, 76px)",
                lineHeight: 0.98,
                letterSpacing: "-.06em",
                margin: "20px 0 18px"
              }}
            >
              Search smarter.
              <br />
              Travel prepared.
            </h1>

            <p
              style={{
                fontSize: 19,
                lineHeight: 1.65,
                maxWidth: 720,
                opacity: 0.78
              }}
            >
              Search flights, compare options and prepare the important
              parts of your trip from one travel intelligence platform.
            </p>
          </div>
        </section>

        <section
          id="search"
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 20px 46px"
          }}
        >
          <div style={{ ...cardStyle, padding: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 20,
                flexWrap: "wrap"
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 25 }}>
                  Flight search
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    opacity: 0.65
                  }}
                >
                  Search through the FlyMatrix backend.
                </p>
              </div>

              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                style={{
                  ...inputStyle,
                  width: "auto",
                  minWidth: 105
                }}
              >
                {CURRENCIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={searchFlights}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(180px,1fr))",
                  gap: 12
                }}
              >
                <label>
                  <span>From</span>
                  <input
                    style={inputStyle}
                    value={origin}
                    onChange={(event) =>
                      setOrigin(event.target.value)
                    }
                    placeholder="LOS"
                    autoComplete="off"
                  />
                </label>

                <label>
                  <span>To</span>
                  <input
                    style={inputStyle}
                    value={destination}
                    onChange={(event) =>
                      setDestination(event.target.value)
                    }
                    placeholder="LON"
                    autoComplete="off"
                  />
                </label>

                <label>
                  <span>Trip</span>
                  <select
                    value={tripType}
                    onChange={(event) =>
                      setTripType(event.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="round-trip">Round trip</option>
                    <option value="one-way">One way</option>
                    <option value="multi-city">Multi-city</option>
                  </select>
                </label>

                <label>
                  <span>Departure</span>
                  <input
                    type="date"
                    min={minDate}
                    value={departureDate}
                    onChange={(event) =>
                      setDepartureDate(event.target.value)
                    }
                    style={inputStyle}
                  />
                </label>

                {tripType === "round-trip" && (
                  <label>
                    <span>Return</span>
                    <input
                      type="date"
                      min={departureDate || minDate}
                      value={returnDate}
                      onChange={(event) =>
                        setReturnDate(event.target.value)
                      }
                      style={inputStyle}
                    />
                  </label>
                )}

                <label>
                  <span>Cabin</span>
                  <select
                    value={cabin}
                    onChange={(event) =>
                      setCabin(event.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="economy">Economy</option>
                    <option value="premium_economy">
                      Premium economy
                    </option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                </label>

                <label>
                  <span>Adults</span>
                  <select
                    value={adults}
                    onChange={(event) =>
                      setAdults(Number(event.target.value))
                    }
                    style={inputStyle}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Children</span>
                  <select
                    value={children}
                    onChange={(event) =>
                      setChildren(Number(event.target.value))
                    }
                    style={inputStyle}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Infants</span>
                  <select
                    value={infants}
                    onChange={(event) =>
                      setInfants(Number(event.target.value))
                    }
                    style={inputStyle}
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Stops</span>
                  <select
                    value={stops}
                    onChange={(event) =>
                      setStops(event.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="any">Any stops</option>
                    <option value="0">Nonstop</option>
                    <option value="1">Up to 1 stop</option>
                    <option value="2">Up to 2 stops</option>
                  </select>
                </label>
              </div>

              {error && (
                <div
                  role="alert"
                  style={{
                    marginTop: 16,
                    padding: 13,
                    borderRadius: 12,
                    background: dark ? "#3b1b20" : "#fef2f2",
                    color: dark ? "#fecaca" : "#991b1b"
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 18,
                  width: "100%",
                  border: 0,
                  borderRadius: 13,
                  padding: "15px 20px",
                  fontWeight: 800,
                  fontSize: 16,
                  background: "#0f172a",
                  color: "#fff",
                  opacity: loading ? 0.65 : 1
                }}
              >
                {loading ? "Searching flights…" : "Search flights"}
              </button>
            </form>

            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 9,
                  opacity: 0.7
                }}
              >
                Quick routes
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap"
                }}
              >
                {QUICK_ROUTES.map((route) => (
                  <button
                    key={`${route[2]}-${route[3]}`}
                    type="button"
                    onClick={() => useQuickRoute(route)}
                    style={{
                      border: `1px solid ${
                        dark ? "#29415c" : "#cbd5e1"
                      }`,
                      borderRadius: 999,
                      padding: "8px 12px",
                      background: dark ? "#0d1a2b" : "#fff",
                      color: "inherit"
                    }}
                  >
                    {route[0]} → {route[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {searched && (
          <section
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              padding: "0 20px 50px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 15
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Flight results</h2>
                <p style={{ margin: "5px 0", opacity: 0.65 }}>
                  {sortedResults.length} result
                  {sortedResults.length === 1 ? "" : "s"} returned
                </p>
              </div>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                style={{
                  ...inputStyle,
                  width: "auto"
                }}
              >
                <option value="price">Sort by price</option>
                <option value="duration">
                  Sort by duration
                </option>
              </select>
            </div>

            {sortedResults.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: 13
                }}
              >
                {sortedResults.map((flight, index) => {
                  const price = getFlightPrice(flight);
                  const resultCurrency = getCurrency(
                    flight,
                    currency
                  );

                  return (
                    <article
                      key={
                        flight?.id ||
                        flight?.offer_id ||
                        `flight-${index}`
                      }
                      style={{
                        ...cardStyle,
                        padding: 18
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(0,1fr) auto",
                          gap: 20,
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 17
                            }}
                          >
                            {getAirline(flight)}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              flexWrap: "wrap",
                              marginTop: 9,
                              opacity: 0.8
                            }}
                          >
                            <span>
                              {getOrigin(flight)} →{" "}
                              {getDestination(flight)}
                            </span>
                            <span>
                              {getStops(flight)} stop
                              {getStops(flight) === 1
                                ? ""
                                : "s"}
                            </span>
                            <span>{getDuration(flight)}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 900
                            }}
                          >
                            {formatMoney(
                              price,
                              resultCurrency
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openAffiliate("flights", {
                                origin,
                                destination
                              })
                            }
                            style={{
                              marginTop: 8,
                              border: 0,
                              borderRadius: 10,
                              padding: "10px 14px",
                              background: "#0f172a",
                              color: "#fff",
                              fontWeight: 700
                            }}
                          >
                            Compare / book
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div
              style={{
                marginTop: 15,
                padding: 13,
                borderRadius: 12,
                fontSize: 12,
                opacity: 0.65
              }}
            >
              Partner prices, availability and final booking terms
              are confirmed by the provider.
            </div>
          </section>
        )}

        <section
          id="prepare"
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "20px 20px 55px"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: 14
            }}
          >
            <ToolCard
              title="Hotels"
              description="Find accommodation for your trip."
              button="Explore hotels"
              onClick={() => openAffiliate("hotels")}
              dark={dark}
            />

            <ToolCard
              title="Activities"
              description="Discover activities and experiences."
              button="Find activities"
              onClick={() => openAffiliate("activities")}
              dark={dark}
            />

            <ToolCard
              title="eSIM"
              description="Prepare mobile connectivity before departure."
              button="Get an eSIM"
              onClick={() => openAffiliate("esim")}
              dark={dark}
            />

            <ToolCard
              title="Visa information"
              description="Check visa-related travel information."
              button="Open visa service"
              onClick={() => openAffiliate("visa")}
              dark={dark}
            />

            <ToolCard
              title="Travel assistance"
              description="Explore travel assistance options."
              button="Explore assistance"
              onClick={() => openAffiliate("assistance")}
              dark={dark}
            />

            <ToolCard
              title="Luggage storage"
              description="Find luggage storage options."
              button="Find storage"
              onClick={() => openAffiliate("luggage")}
              dark={dark}
            />
          </div>
        </section>

        <section
          id="destinations"
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "20px 20px 55px"
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: 0 }}>Destination intelligence</h2>
            <p style={{ opacity: 0.68 }}>
              Explore destination information supplied by the
              FlyMatrix backend.
            </p>
          </div>

          {destinationLoading ? (
            <div style={{ ...cardStyle, padding: 20 }}>
              Loading destinations…
            </div>
          ) : destinationData.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: 14
              }}
            >
              {destinationData.map((destination, index) => {
                const name =
                  destination?.name ||
                  destination?.city ||
                  destination?.destination ||
                  "Destination";

                const country =
                  destination?.country ||
                  destination?.country_name ||
                  "";

                return (
                  <article
                    key={
                      destination?.id ||
                      destination?.slug ||
                      `${name}-${index}`
                    }
                    style={{
                      ...cardStyle,
                      padding: 20
                    }}
                  >
                    <h3 style={{ marginTop: 0 }}>{name}</h3>

                    {country && (
                      <p style={{ opacity: 0.65 }}>{country}</p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        openAffiliate("hotels", {
                          destination: name
                        })
                      }
                      style={{
                        border: `1px solid ${
                          dark ? "#29415c" : "#cbd5e1"
                        }`,
                        borderRadius: 10,
                        padding: "9px 12px",
                        background: "transparent",
                        color: "inherit",
                        fontWeight: 700
                      }}
                    >
                      Explore
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: 20 }}>
              Destination data is currently unavailable.
            </div>
          )}
        </section>

        <section
          id="tools"
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "20px 20px 55px"
          }}
        >
          <div style={{ ...cardStyle, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>
              Travel planning toolkit
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: 12
              }}
            >
              <MiniFeature
                title="True Cost"
                text="Evaluate more than the headline fare when planning a journey."
              />

              <MiniFeature
                title="Weather"
                text="Check destination conditions before you travel."
              />

              <MiniFeature
                title="Visa"
                text="Prepare documentation and entry requirements."
              />

              <MiniFeature
                title="Fare Alerts"
                text="Prepare for monitoring and travel-price changes."
              />

              <MiniFeature
                title="Travel Essentials"
                text="Organize connectivity, luggage and assistance."
              />

              <MiniFeature
                title="Leisure + Education"
                text="Support both leisure tourism and education-focused travel planning."
              />
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "20px 20px 70px"
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: 24,
              display: "grid",
              gridTemplateColumns:
                "minmax(0,1fr) minmax(280px,420px)",
              gap: 25,
              alignItems: "center"
            }}
          >
            <div>
              <h2 style={{ marginTop: 0 }}>
                Travel updates from FlyMatrix
              </h2>

              <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
                Get useful travel intelligence and updates by email.
              </p>
            </div>

            <form onSubmit={submitLead}>
              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                style={inputStyle}
              />

              <button
                type="submit"
                disabled={leadLoading}
                style={{
                  marginTop: 9,
                  width: "100%",
                  border: 0,
                  borderRadius: 11,
                  padding: "12px 14px",
                  background: "#0f172a",
                  color: "#fff",
                  fontWeight: 800,
                  opacity: leadLoading ? 0.65 : 1
                }}
              >
                {leadLoading
                  ? "Subscribing…"
                  : "Subscribe"}
              </button>

              {leadMessage && (
                <p
                  style={{
                    fontSize: 13,
                    marginBottom: 0,
                    opacity: 0.75
                  }}
                >
                  {leadMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${
            dark ? "#1e344d" : "#e2e8f0"
          }`,
          padding: "28px 20px"
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            fontSize: 13,
            opacity: 0.65
          }}
        >
          <span>
            © {new Date().getFullYear()} FlyMatrix
          </span>

          <span>
            Search smarter. Travel prepared.
          </span>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({
  title,
  description,
  button,
  onClick,
  dark
}) {
  return (
    <article
      style={{
        background: dark ? "#0d1a2b" : "#fff",
        border: `1px solid ${
          dark ? "#1e344d" : "#e2e8f0"
        }`,
        borderRadius: 16,
        padding: 20
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>

      <p
        style={{
          opacity: 0.68,
          lineHeight: 1.55,
          minHeight: 48
        }}
      >
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        style={{
          border: 0,
          borderRadius: 10,
          padding: "10px 13px",
          background: "#0f172a",
          color: "#fff",
          fontWeight: 700
        }}
      >
        {button}
      </button>
    </article>
  );
}

function MiniFeature({ title, text }) {
  return (
    <div
      style={{
        padding: 17,
        borderRadius: 13,
        background: "rgba(148,163,184,.08)"
      }}
    >
      <strong>{title}</strong>
      <p
        style={{
          marginBottom: 0,
          opacity: 0.68,
          lineHeight: 1.5,
          fontSize: 14
        }}
      >
        {text}
      </p>
    </div>
  );
      }
