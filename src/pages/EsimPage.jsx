import React, { useMemo, useState } from "react";

const AIRALO_AFFILIATE_URL =
  "https://airalo.tpk.lv/SMhYBmH2";

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "TR", name: "Türkiye" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "AU", name: "Australia" },
];

const REGIONS = [
  "Africa",
  "Europe",
  "North America",
  "South America",
  "Asia",
  "Middle East",
  "Oceania",
  "Global",
];

function buildAffiliateUrl({
  destination,
  region,
  dataNeed,
  duration,
}) {
  const params = new URLSearchParams();

  if (destination) {
    params.set("destination", destination);
  }

  if (region) {
    params.set("region", region);
  }

  if (dataNeed) {
    params.set("data", dataNeed);
  }

  if (duration) {
    params.set("duration", duration);
  }

  const query = params.toString();

  return query
    ? `${AIRALO_AFFILIATE_URL}?${query}`
    : AIRALO_AFFILIATE_URL;
}

function normalizePackages(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.packages)) {
    return payload.packages;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.offers)) {
    return payload.offers;
  }

  return [];
}

function getPackageName(item) {
  return (
    item?.name ||
    item?.packageName ||
    item?.title ||
    item?.plan ||
    "eSIM package"
  );
}

function getData(item) {
  return (
    item?.data ||
    item?.dataAmount ||
    item?.data_amount ||
    item?.allowance ||
    "Data amount shown by provider"
  );
}

function getValidity(item) {
  return (
    item?.validity ||
    item?.validityDays ||
    item?.validity_days ||
    item?.duration ||
    "Validity shown by provider"
  );
}

function getPrice(item) {
  const value =
    item?.price?.amount ??
    item?.price ??
    item?.amount ??
    item?.cost;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  return Number(value);
}

function getCurrency(item) {
  return (
    item?.price?.currency ||
    item?.currency ||
    "USD"
  );
}

function getProvider(item) {
  return (
    item?.provider ||
    item?.brand ||
    item?.network ||
    "Provider"
  );
}

export default function EsimPage() {
  const [destination, setDestination] = useState("GB");
  const [region, setRegion] = useState("Europe");
  const [dataNeed, setDataNeed] = useState("5 GB");
  const [duration, setDuration] = useState("15 days");

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const selectedCountry = useMemo(
    () =>
      COUNTRIES.find(
        (country) => country.code === destination
      ),
    [destination]
  );

  async function searchEsimPackages(event) {
    event?.preventDefault();

    setLoading(true);
    setSearched(true);
    setError("");
    setPackages([]);

    try {
      const params = new URLSearchParams({
        destination,
        region,
        data: dataNeed,
        duration,
      });

      const response = await fetch(
        `/api/esim/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `eSIM search returned HTTP ${response.status}.`
        );
      }

      const payload = await response.json();
      const normalized = normalizePackages(payload);

      setPackages(normalized);
    } catch (requestError) {
      setPackages([]);

      setError(
        requestError?.message ||
          "Live eSIM package search is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  function openProvider() {
    const url = buildAffiliateUrl({
      destination:
        selectedCountry?.code || destination,
      region,
      dataNeed,
      duration,
    });

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openPlanner() {
    const params = new URLSearchParams();

    if (selectedCountry?.name) {
      params.set(
        "destination",
        selectedCountry.name
      );
    }

    params.set("travelStyle", "connected");

    window.location.href =
      `/planner?${params.toString()}`;
  }

  return (
    <main className="fm-page">
      <section className="fm-section">
        <div className="fm-container">

          <div className="fm-page-header">
            <span className="fm-eyebrow">
              CONNECTIVITY
            </span>

            <h1>
              eSIM & Travel Connectivity
            </h1>

            <p>
              Find mobile-data options for your
              destination and continue to the
              connectivity provider.
            </p>
          </div>

          <form
            className="fm-card fm-search-panel"
            onSubmit={searchEsimPackages}
          >
            <div className="fm-search-grid">

              <div className="fm-field">
                <label htmlFor="esim-destination">
                  Destination
                </label>

                <select
                  id="esim-destination"
                  value={destination}
                  onChange={(event) =>
                    setDestination(
                      event.target.value
                    )
                  }
                >
                  {COUNTRIES.map((country) => (
                    <option
                      key={country.code}
                      value={country.code}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fm-field">
                <label htmlFor="esim-region">
                  Region
                </label>

                <select
                  id="esim-region"
                  value={region}
                  onChange={(event) =>
                    setRegion(event.target.value)
                  }
                >
                  {REGIONS.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fm-field">
                <label htmlFor="esim-data">
                  Data requirement
                </label>

                <select
                  id="esim-data"
                  value={dataNeed}
                  onChange={(event) =>
                    setDataNeed(event.target.value)
                  }
                >
                  <option value="1 GB">
                    1 GB
                  </option>
                  <option value="3 GB">
                    3 GB
                  </option>
                  <option value="5 GB">
                    5 GB
                  </option>
                  <option value="10 GB">
                    10 GB
                  </option>
                  <option value="20 GB">
                    20 GB+
                  </option>
                  <option value="unlimited">
                    Unlimited / provider options
                  </option>
                </select>
              </div>

              <div className="fm-field">
                <label htmlFor="esim-duration">
                  Trip duration
                </label>

                <select
                  id="esim-duration"
                  value={duration}
                  onChange={(event) =>
                    setDuration(event.target.value)
                  }
                >
                  <option value="7 days">
                    7 days
                  </option>
                  <option value="15 days">
                    15 days
                  </option>
                  <option value="30 days">
                    30 days
                  </option>
                  <option value="60 days">
                    60 days
                  </option>
                  <option value="90 days">
                    90 days+
                  </option>
                </select>
              </div>

            </div>

            <div className="fm-actions">

              <button
                type="submit"
                className="fm-btn fm-primary"
                disabled={loading}
              >
                {loading
                  ? "Checking packages..."
                  : "Search eSIM options"}
              </button>

              <button
                type="button"
                className="fm-btn fm-secondary"
                onClick={openProvider}
              >
                Browse provider
              </button>

            </div>
          </form>

          {loading && (
            <section
              className="fm-card"
              aria-live="polite"
            >
              <h2>
                Checking available connectivity
              </h2>

              <p>
                FlyMatrix is checking the configured
                eSIM data source. Provider prices and
                availability can change.
              </p>
            </section>
          )}

          {!loading && error && (
            <section className="fm-card">
              <div className="fm-badge">
                Provider search unavailable
              </div>

              <h2>
                Continue with the provider
              </h2>

              <p>
                {error}
              </p>

              <div className="fm-actions">
                <button
                  type="button"
                  className="fm-btn fm-primary"
                  onClick={openProvider}
                >
                  Open eSIM provider
                </button>
              </div>
            </section>
          )}

          {!loading &&
            searched &&
            !error &&
            packages.length === 0 && (
              <section className="fm-card">
                <div className="fm-badge">
                  No live packages returned
                </div>

                <h2>
                  No provider packages were returned
                </h2>

                <p>
                  The configured data source did not
                  return packages for this combination.
                  You can continue to the provider to
                  check its current inventory.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-primary"
                  onClick={openProvider}
                >
                  Check provider options
                </button>
              </section>
            )}

          {!loading && packages.length > 0 && (
            <section className="fm-section-inner">

              <div className="fm-section-heading">
                <div>
                  <span className="fm-eyebrow">
                    LIVE / CACHED DATA
                  </span>

                  <h2>
                    Available eSIM options
                  </h2>
                </div>

                <span className="fm-meta">
                  {packages.length}{" "}
                  {packages.length === 1
                    ? "option"
                    : "options"}
                </span>
              </div>

              <div className="fm-grid">
                {packages.map(
                  (item, index) => {
                    const price =
                      getPrice(item);

                    const currency =
                      getCurrency(item);

                    const provider =
                      getProvider(item);

                    const providerUrl =
                      item?.url ||
                      item?.link ||
                      item?.bookingUrl ||
                      item?.booking_url ||
                      AIRALO_AFFILIATE_URL;

                    return (
                      <article
                        className="fm-card"
                        key={
                          item?.id ||
                          item?.packageId ||
                          item?.package_id ||
                          `esim-${index}`
                        }
                      >
                        <span className="fm-badge">
                          eSIM
                        </span>

                        <h3>
                          {getPackageName(item)}
                        </h3>

                        <div className="fm-meta">
                          Provider: {provider}
                        </div>

                        <div className="fm-meta">
                          Data: {getData(item)}
                        </div>

                        <div className="fm-meta">
                          Validity: {getValidity(item)}
                        </div>

                        <div className="fm-price">
                          {price === null
                            ? "Price from provider"
                            : `${currency} ${price.toLocaleString()}`}
                        </div>

                        <a
                          className="fm-btn fm-primary"
                          href={providerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View provider
                        </a>
                      </article>
                    );
                  }
                )}
              </div>

            </section>
          )}

          <section className="fm-section-inner">

            <div className="fm-section-heading">
              <div>
                <span className="fm-eyebrow">
                  CONNECTIVITY GUIDE
                </span>

                <h2>
                  Choose connectivity around your trip
                </h2>
              </div>
            </div>

            <div className="fm-grid">

              <article className="fm-card">
                <h3>
                  Short city trip
                </h3>

                <p>
                  A smaller data package can be
                  suitable when you mainly need maps,
                  messaging and occasional browsing.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-secondary"
                  onClick={() => {
                    setDataNeed("3 GB");
                    setDuration("7 days");
                  }}
                >
                  Use 3 GB / 7 days
                </button>
              </article>

              <article className="fm-card">
                <h3>
                  Two-week holiday
                </h3>

                <p>
                  A medium package can be considered
                  when using maps, messaging, social
                  apps and travel services regularly.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-secondary"
                  onClick={() => {
                    setDataNeed("5 GB");
                    setDuration("15 days");
                  }}
                >
                  Use 5 GB / 15 days
                </button>
              </article>

              <article className="fm-card">
                <h3>
                  Heavy connectivity
                </h3>

                <p>
                  Larger packages may be more suitable
                  for frequent video, hotspot use,
                  navigation and extended travel.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-secondary"
                  onClick={() => {
                    setDataNeed("20 GB");
                    setDuration("30 days");
                  }}
                >
                  Use 20 GB / 30 days
                </button>
              </article>

            </div>
          </section>

          <section className="fm-card fm-section-inner">

            <div className="fm-section-heading">
              <div>
                <span className="fm-eyebrow">
                  TRIP PLANNING
                </span>

                <h2>
                  Add connectivity to your itinerary
                </h2>
              </div>
            </div>

            <p>
              Your eSIM choice is only one part of
              travel preparation. Combine connectivity
              with flights, accommodation, activities,
              documents and other trip requirements.
            </p>

            <div className="fm-actions">

              <button
                type="button"
                className="fm-btn fm-primary"
                onClick={openPlanner}
              >
                Add to trip planner
              </button>

              <button
                type="button"
                className="fm-btn fm-secondary"
                onClick={() =>
                  (window.location.href =
                    "/essentials")
                }
              >
                Travel essentials
              </button>

            </div>
          </section>

          <section className="fm-card fm-disclaimer">

            <strong>
              Provider information
            </strong>

            <p>
              FlyMatrix does not manufacture or
              directly supply eSIM connectivity. Package
              availability, network coverage, supported
              devices, activation requirements, validity,
              pricing and final purchase terms are
              determined by the provider.
            </p>

            <p>
              Prices are not hard-coded as current
              consumer prices. Where a live or cached
              provider data source is unavailable,
              FlyMatrix sends you to the configured
              affiliate provider instead.
            </p>

          </section>

        </div>
      </section>
    </main>
  );
}
