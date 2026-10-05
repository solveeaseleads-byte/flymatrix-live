import React, { useState } from "react";

const LUGGAGE_AFFILIATE_URL =
  "https://radicalstorage.tpk.lv/LwLfrsRU";

const STORAGE_TYPES = [
  {
    value: "any",
    label: "Any storage option",
  },
  {
    value: "nearby",
    label: "Near my location",
  },
  {
    value: "airport",
    label: "Near airport",
  },
  {
    value: "station",
    label: "Near train/bus station",
  },
];

function normalizeLocations(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.locations)) {
    return payload.locations;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.storage)) {
    return payload.storage;
  }

  return [];
}

function getName(item) {
  return (
    item?.name ||
    item?.title ||
    item?.locationName ||
    item?.location_name ||
    "Luggage storage location"
  );
}

function getAddress(item) {
  return (
    item?.address ||
    item?.location ||
    item?.formattedAddress ||
    item?.formatted_address ||
    "Address supplied by provider"
  );
}

function getProvider(item) {
  return (
    item?.provider ||
    item?.brand ||
    item?.company ||
    "Storage provider"
  );
}

function getRating(item) {
  return (
    item?.rating ??
    item?.reviewRating ??
    item?.review_rating ??
    null
  );
}

function getPrice(item) {
  const value =
    item?.price?.amount ??
    item?.price ??
    item?.amount ??
    item?.dailyPrice ??
    item?.daily_price;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function getCurrency(item) {
  return (
    item?.price?.currency ||
    item?.currency ||
    "EUR"
  );
}

function getDistance(item) {
  return (
    item?.distance ||
    item?.distanceKm ||
    item?.distance_km ||
    null
  );
}

function getImage(item) {
  return (
    item?.image ||
    item?.imageUrl ||
    item?.image_url ||
    item?.photo ||
    null
  );
}

export default function LuggagePage() {
  const [destination, setDestination] =
    useState("");

  const [storageType, setStorageType] =
    useState("any");

  const [date, setDate] =
    useState("");

  const [bags, setBags] =
    useState(1);

  const [locations, setLocations] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  function buildProviderUrl() {
    const params = new URLSearchParams();

    if (destination.trim()) {
      params.set(
        "destination",
        destination.trim()
      );
    }

    if (date) {
      params.set("date", date);
    }

    params.set(
      "bags",
      String(bags)
    );

    if (storageType !== "any") {
      params.set(
        "type",
        storageType
      );
    }

    const query = params.toString();

    return query
      ? `${LUGGAGE_AFFILIATE_URL}?${query}`
      : LUGGAGE_AFFILIATE_URL;
  }

  async function searchStorage(event) {
    event?.preventDefault();

    setSearched(true);
    setLoading(true);
    setError("");
    setLocations([]);

    try {
      if (!destination.trim()) {
        throw new Error(
          "Enter a destination before searching."
        );
      }

      const params = new URLSearchParams({
        destination:
          destination.trim(),
        bags: String(bags),
      });

      if (date) {
        params.set("date", date);
      }

      if (storageType !== "any") {
        params.set(
          "type",
          storageType
        );
      }

      const response = await fetch(
        `/api/luggage/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Luggage search returned HTTP ${response.status}.`
        );
      }

      const payload =
        await response.json();

      setLocations(
        normalizeLocations(payload)
      );
    } catch (requestError) {
      setLocations([]);

      setError(
        requestError?.message ||
          "Luggage-storage search is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  function openProvider() {
    window.open(
      buildProviderUrl(),
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openPlanner() {
    const params =
      new URLSearchParams();

    if (destination.trim()) {
      params.set(
        "destination",
        destination.trim()
      );
    }

    window.location.href =
      `/planner?${params.toString()}`;
  }

  return (
    <main className="fm-page fm-luggage-page">
      <section className="fm-section fm-luggage-section">
        <div className="fm-container">

          <header className="fm-page-header fm-luggage-header">
            <div className="fm-luggage-header-content">
              <span className="fm-eyebrow">
                LUGGAGE STORAGE
              </span>

              <h1>
                Store Your Luggage While You Travel
              </h1>

              <p>
                Find luggage-storage options at your
                destination and continue to the
                configured storage provider for current
                availability and booking.
              </p>
            </div>

            <div className="fm-luggage-header-badge">
              <span className="fm-luggage-header-badge-icon">
                🧳
              </span>

              <div>
                <strong>
                  Travel lighter
                </strong>

                <span>
                  Keep your bags out of the way
                </span>
              </div>
            </div>
          </header>

          <form
            className="fm-card fm-search-panel fm-luggage-search-card"
            onSubmit={searchStorage}
          >
            <div className="fm-luggage-search-heading">
              <div>
                <span className="fm-eyebrow">
                  SEARCH STORAGE
                </span>

                <h2>
                  Find a place for your bags
                </h2>

                <p>
                  Search by destination, preferred
                  location and number of bags.
                </p>
              </div>

              <div className="fm-luggage-search-summary">
                <span>SEARCH</span>
                <strong>
                  Storage options
                </strong>
              </div>
            </div>

            <div className="fm-search-grid fm-luggage-form-grid">

              <div className="fm-field fm-luggage-field-primary">
                <label htmlFor="luggage-destination">
                  Destination
                </label>

                <input
                  id="luggage-destination"
                  type="text"
                  value={destination}
                  onChange={(event) =>
                    setDestination(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Lisbon, London or Paris"
                  autoComplete="address-level2"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="luggage-type">
                  Preferred location
                </label>

                <select
                  id="luggage-type"
                  value={storageType}
                  onChange={(event) =>
                    setStorageType(
                      event.target.value
                    )
                  }
                >
                  {STORAGE_TYPES.map(
                    (item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="fm-field">
                <label htmlFor="luggage-date">
                  Storage date
                </label>

                <input
                  id="luggage-date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="fm-field">
                <label htmlFor="luggage-bags">
                  Number of bags
                </label>

                <select
                  id="luggage-bags"
                  value={bags}
                  onChange={(event) =>
                    setBags(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  {Array.from(
                    { length: 10 },
                    (_, index) =>
                      index + 1
                  ).map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number}{" "}
                      {number === 1
                        ? "bag"
                        : "bags"}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="fm-actions fm-luggage-actions">

              <button
                type="submit"
                className="fm-btn fm-primary"
                disabled={loading}
              >
                {loading
                  ? "Searching..."
                  : "Find luggage storage"}
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
              className="fm-card fm-luggage-status-card fm-luggage-loading-card"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="fm-luggage-status-icon">
                <span>⌕</span>
              </div>

              <div className="fm-luggage-status-content">
                <span className="fm-eyebrow">
                  SEARCHING
                </span>

                <h2>
                  Checking storage locations
                </h2>

                <p>
                  FlyMatrix is checking the configured
                  luggage-storage data source.
                </p>
              </div>
            </section>
          )}

          {!loading && error && (
            <section className="fm-card fm-luggage-status-card fm-luggage-error-card">
              <div className="fm-luggage-status-icon">
                !
              </div>

              <div className="fm-luggage-status-content">
                <span className="fm-badge">
                  Search unavailable
                </span>

                <h2>
                  Continue with the storage provider
                </h2>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  className="fm-btn fm-primary"
                  onClick={openProvider}
                >
                  Open storage provider
                </button>
              </div>
            </section>
          )}

          {!loading &&
            searched &&
            !error &&
            locations.length === 0 && (
              <section className="fm-card fm-luggage-status-card fm-luggage-empty-card">
                <div className="fm-luggage-status-icon">
                  🧳
                </div>

                <div className="fm-luggage-status-content">
                  <span className="fm-badge">
                    No live locations returned
                  </span>

                  <h2>
                    No storage locations were returned
                  </h2>

                  <p>
                    The configured data source did not
                    return locations for this search.
                    Continue to the provider to check
                    current locations and availability.
                  </p>

                  <button
                    type="button"
                    className="fm-btn fm-primary"
                    onClick={openProvider}
                  >
                    Check provider locations
                  </button>
                </div>
              </section>
            )}

          {!loading &&
            locations.length > 0 && (
              <section className="fm-section-inner fm-luggage-results-section">

                <div className="fm-section-heading fm-luggage-results-heading">
                  <div>
                    <span className="fm-eyebrow">
                      STORAGE OPTIONS
                    </span>

                    <h2>
                      Available luggage storage
                    </h2>

                    <p className="fm-luggage-results-subtitle">
                      Compare returned locations before
                      continuing to the provider.
                    </p>
                  </div>

                  <span className="fm-meta fm-luggage-result-count">
                    {locations.length}{" "}
                    {locations.length === 1
                      ? "location"
                      : "locations"}
                  </span>
                </div>

                <div className="fm-grid fm-luggage-results-grid">

                  {locations.map(
                    (item, index) => {
                      const price =
                        getPrice(item);

                      const currency =
                        getCurrency(item);

                      const rating =
                        getRating(item);

                      const distance =
                        getDistance(item);

                      const image =
                        getImage(item);

                      const provider =
                        getProvider(item);

                      const url =
                        item?.url ||
                        item?.link ||
                        item?.bookingUrl ||
                        item?.booking_url ||
                        buildProviderUrl();

                      return (
                        <article
                          className="fm-card fm-luggage-result-card"
                          key={
                            item?.id ||
                            item?.locationId ||
                            item?.location_id ||
                            `luggage-${index}`
                          }
                        >

                          {image && (
                            <div className="fm-luggage-image-wrapper">
                              <img
                                src={image}
                                alt=""
                                loading="lazy"
                              />
                            </div>
                          )}

                          <div className="fm-luggage-result-body">

                            <div className="fm-luggage-result-top">
                              <span className="fm-badge">
                                Luggage storage
                              </span>

                              {rating !== null &&
                                rating !==
                                  undefined && (
                                  <span className="fm-luggage-rating">
                                    ★ {rating}
                                  </span>
                                )}
                            </div>

                            <h3>
                              {getName(item)}
                            </h3>

                            <div className="fm-luggage-location-line">
                              <span className="fm-luggage-detail-icon">
                                ⌖
                              </span>

                              <span>
                                {getAddress(item)}
                              </span>
                            </div>

                            <div className="fm-luggage-result-details">

                              <div>
                                <span>
                                  Provider
                                </span>

                                <strong>
                                  {provider}
                                </strong>
                              </div>

                              {distance && (
                                <div>
                                  <span>
                                    Distance
                                  </span>

                                  <strong>
                                    {distance}
                                  </strong>
                                </div>
                              )}

                            </div>

                            <div className="fm-luggage-result-footer">
                              <div className="fm-luggage-price-block">
                                <span>
                                  FROM
                                </span>

                                <div className="fm-price">
                                  {price === null
                                    ? "Provider pricing"
                                    : `${currency} ${price.toLocaleString()}`}
                                </div>
                              </div>

                              <a
                                className="fm-btn fm-primary"
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View / book
                              </a>
                            </div>

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              </section>
            )}

          <section className="fm-section-inner fm-luggage-use-section">

            <div className="fm-section-heading fm-luggage-section-heading">
              <div>
                <span className="fm-eyebrow">
                  WHEN STORAGE HELPS
                </span>

                <h2>
                  Useful situations for luggage storage
                </h2>

                <p className="fm-luggage-section-description">
                  A simple way to keep your itinerary
                  flexible when you cannot carry your
                  bags with you.
                </p>
              </div>
            </div>

            <div className="fm-grid fm-luggage-use-grid">

              <article className="fm-card fm-luggage-use-card">
                <div className="fm-luggage-use-icon">
                  🧳
                </div>

                <span className="fm-luggage-use-number">
                  01
                </span>

                <h3>
                  Early arrival
                </h3>

                <p>
                  If your accommodation is not ready,
                  storage can let you explore without
                  carrying your bags around.
                </p>
              </article>

              <article className="fm-card fm-luggage-use-card">
                <div className="fm-luggage-use-icon">
                  🕐
                </div>

                <span className="fm-luggage-use-number">
                  02
                </span>

                <h3>
                  Late departure
                </h3>

                <p>
                  Store your luggage after checkout
                  while you spend additional time at
                  your destination.
                </p>
              </article>

              <article className="fm-card fm-luggage-use-card">
                <div className="fm-luggage-use-icon">
                  🚆
                </div>

                <span className="fm-luggage-use-number">
                  03
                </span>

                <h3>
                  Long connections
                </h3>

                <p>
                  A storage location may be useful
                  when your itinerary gives you time
                  between transport connections.
                </p>
              </article>

            </div>
          </section>

          <section className="fm-card fm-section-inner fm-luggage-planner-card">

            <div className="fm-luggage-planner-content">
              <span className="fm-eyebrow">
                TRIP PLANNER
              </span>

              <h2>
                Add luggage storage to your trip
              </h2>

              <p>
                Keep your luggage plans together with
                flights, hotels, activities, transfers,
                connectivity and other travel
                requirements.
              </p>
            </div>

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

          <section className="fm-card fm-disclaimer fm-luggage-disclaimer">

            <div className="fm-luggage-disclaimer-heading">
              <span className="fm-eyebrow">
                PROVIDER INFORMATION
              </span>

              <strong>
                Current storage terms come from the provider
              </strong>
            </div>

            <div className="fm-luggage-disclaimer-copy">
              <p>
                FlyMatrix does not directly operate
                luggage-storage locations. Location
                availability, opening hours, baggage
                restrictions, insurance terms, pricing,
                cancellation rules and final booking
                conditions are determined by the selected
                provider.
              </p>

              <p>
                FlyMatrix does not invent current
                storage prices. Where a configured live
                or cached provider source does not return
                pricing, the interface directs you to
                the provider for current information.
              </p>
            </div>

          </section>

        </div>
      </section>
    </main>
  );
}
