import React, { useMemo, useState } from "react";

const TRANSFER_AFFILIATE_URL =
  "https://gettransfer.tpk.lv/zXqbkMmK";

const TRANSFER_TYPES = [
  {
    value: "airport",
    label: "Airport transfer",
  },
  {
    value: "city",
    label: "City transfer",
  },
  {
    value: "private",
    label: "Private transfer",
  },
  {
    value: "shared",
    label: "Shared transfer",
  },
];

function normalizeTransfers(payload) {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.transfers)) {
    return payload.transfers;
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

function getTransferName(item) {
  return (
    item?.name ||
    item?.title ||
    item?.vehicleName ||
    item?.vehicle_name ||
    "Transfer option"
  );
}

function getProvider(item) {
  return (
    item?.provider ||
    item?.supplier ||
    item?.company ||
    "Provider"
  );
}

function getVehicle(item) {
  return (
    item?.vehicle ||
    item?.vehicleType ||
    item?.vehicle_type ||
    item?.carType ||
    "Vehicle details from provider"
  );
}

function getCapacity(item) {
  return (
    item?.capacity ||
    item?.passengers ||
    item?.maxPassengers ||
    item?.max_passengers ||
    "Capacity from provider"
  );
}

function getPrice(item) {
  const value =
    item?.price?.amount ??
    item?.price ??
    item?.amount ??
    item?.totalPrice ??
    item?.total_price;

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
    "USD"
  );
}

export default function TransfersPage() {
  const [destination, setDestination] =
    useState("");

  const [pickup, setPickup] =
    useState("");

  const [dropoff, setDropoff] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [passengers, setPassengers] =
    useState(1);

  const [transferType, setTransferType] =
    useState("airport");

  const [transfers, setTransfers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  const destinationLabel = useMemo(
    () => destination.trim(),
    [destination]
  );

  function buildProviderUrl() {
    const params = new URLSearchParams();

    if (destination.trim()) {
      params.set(
        "destination",
        destination.trim()
      );
    }

    if (pickup.trim()) {
      params.set(
        "pickup",
        pickup.trim()
      );
    }

    if (dropoff.trim()) {
      params.set(
        "dropoff",
        dropoff.trim()
      );
    }

    if (date) {
      params.set("date", date);
    }

    if (time) {
      params.set("time", time);
    }

    params.set(
      "passengers",
      String(passengers)
    );

    params.set(
      "type",
      transferType
    );

    const query = params.toString();

    return query
      ? `${TRANSFER_AFFILIATE_URL}?${query}`
      : TRANSFER_AFFILIATE_URL;
  }

  async function searchTransfers(event) {
    event?.preventDefault();

    setLoading(true);
    setSearched(true);
    setError("");
    setTransfers([]);

    try {
      if (!destination.trim()) {
        throw new Error(
          "Enter your destination before searching."
        );
      }

      if (!pickup.trim()) {
        throw new Error(
          "Enter a pickup location."
        );
      }

      if (!dropoff.trim()) {
        throw new Error(
          "Enter a drop-off location."
        );
      }

      const params = new URLSearchParams({
        destination:
          destination.trim(),
        pickup: pickup.trim(),
        dropoff: dropoff.trim(),
        passengers:
          String(passengers),
        type: transferType,
      });

      if (date) {
        params.set("date", date);
      }

      if (time) {
        params.set("time", time);
      }

      const response = await fetch(
        `/api/transfers/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Transfer search returned HTTP ${response.status}.`
        );
      }

      const payload =
        await response.json();

      setTransfers(
        normalizeTransfers(payload)
      );
    } catch (requestError) {
      setTransfers([]);

      setError(
        requestError?.message ||
          "Transfer search is currently unavailable."
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
    <main className="fm-page fm-transfers-page">
      <section className="fm-section fm-transfers-section">
        <div className="fm-container">

          <header className="fm-page-header fm-transfers-header">
            <span className="fm-eyebrow">
              GROUND TRANSPORTATION
            </span>

            <div className="fm-transfers-header-row">
              <div>
                <h1>
                  Airport & City Transfers
                </h1>

                <p>
                  Plan the ground-transfer part of
                  your journey and continue to a
                  configured transfer provider for
                  availability and booking.
                </p>
              </div>

              <div className="fm-badge fm-transfers-header-badge">
                Transfer planning
              </div>
            </div>
          </header>

          <form
            className="fm-card fm-search-panel fm-transfers-search-card"
            onSubmit={searchTransfers}
          >
            <div className="fm-transfers-search-heading">
              <div>
                <span className="fm-eyebrow">
                  SEARCH TRANSFERS
                </span>

                <h2>
                  Find ground transportation
                </h2>

                <p>
                  Enter your route, travel date and
                  passenger count to check the
                  configured transfer source.
                </p>
              </div>

              <div className="fm-transfers-search-note">
                <span>BOOKING FLOW</span>
                <strong>
                  Search → Compare → Provider
                </strong>
              </div>
            </div>

            <div className="fm-search-grid fm-transfers-form-grid">

              <div className="fm-field">
                <label htmlFor="transfer-destination">
                  Destination
                </label>

                <input
                  id="transfer-destination"
                  type="text"
                  value={destination}
                  onChange={(event) =>
                    setDestination(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Lisbon"
                  autoComplete="address-level2"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="transfer-pickup">
                  Pickup location
                </label>

                <input
                  id="transfer-pickup"
                  type="text"
                  value={pickup}
                  onChange={(event) =>
                    setPickup(
                      event.target.value
                    )
                  }
                  placeholder="Airport, hotel or address"
                  autoComplete="off"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="transfer-dropoff">
                  Drop-off location
                </label>

                <input
                  id="transfer-dropoff"
                  type="text"
                  value={dropoff}
                  onChange={(event) =>
                    setDropoff(
                      event.target.value
                    )
                  }
                  placeholder="Hotel, station or address"
                  autoComplete="off"
                />
              </div>

              <div className="fm-field">
                <label htmlFor="transfer-type">
                  Transfer type
                </label>

                <select
                  id="transfer-type"
                  value={transferType}
                  onChange={(event) =>
                    setTransferType(
                      event.target.value
                    )
                  }
                >
                  {TRANSFER_TYPES.map(
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
                <label htmlFor="transfer-date">
                  Date
                </label>

                <input
                  id="transfer-date"
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
                <label htmlFor="transfer-time">
                  Pickup time
                </label>

                <input
                  id="transfer-time"
                  type="time"
                  value={time}
                  onChange={(event) =>
                    setTime(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="fm-field">
                <label htmlFor="transfer-passengers">
                  Passengers
                </label>

                <select
                  id="transfer-passengers"
                  value={passengers}
                  onChange={(event) =>
                    setPassengers(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  {Array.from(
                    { length: 9 },
                    (_, index) =>
                      index + 1
                  ).map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number}{" "}
                      {number === 1
                        ? "passenger"
                        : "passengers"}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="fm-actions fm-transfers-actions">

              <button
                type="submit"
                className="fm-btn fm-primary"
                disabled={loading}
              >
                {loading
                  ? "Searching..."
                  : "Search transfers"}
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
              className="fm-card fm-transfers-status-card fm-transfers-loading-card"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="fm-transfers-status-icon">
                ↗
              </div>

              <div>
                <span className="fm-eyebrow">
                  SEARCHING
                </span>

                <h2>
                  Checking transfer options
                </h2>

                <p>
                  FlyMatrix is checking the
                  configured transfer data source.
                </p>
              </div>
            </section>
          )}

          {!loading && error && (
            <section className="fm-card fm-transfers-status-card fm-transfers-error-card">

              <div className="fm-transfers-status-icon">
                !
              </div>

              <div className="fm-transfers-status-content">
                <span className="fm-badge">
                  Search unavailable
                </span>

                <h2>
                  Continue with the provider
                </h2>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  className="fm-btn fm-primary"
                  onClick={openProvider}
                >
                  Open transfer provider
                </button>
              </div>

            </section>
          )}

          {!loading &&
            searched &&
            !error &&
            transfers.length === 0 && (
              <section className="fm-card fm-transfers-status-card">

                <div className="fm-transfers-status-icon">
                  —
                </div>

                <div className="fm-transfers-status-content">
                  <span className="fm-badge">
                    No live results returned
                  </span>

                  <h2>
                    No transfer options were returned
                  </h2>

                  <p>
                    The configured data source did
                    not return transfer options for
                    this search. You can continue to
                    the provider to check current
                    availability.
                  </p>

                  <button
                    type="button"
                    className="fm-btn fm-primary"
                    onClick={openProvider}
                  >
                    Check provider availability
                  </button>
                </div>

              </section>
            )}

          {!loading &&
            transfers.length > 0 && (
              <section className="fm-section-inner fm-transfers-results-section">

                <div className="fm-section-heading fm-transfers-results-heading">
                  <div>
                    <span className="fm-eyebrow">
                      PROVIDER OPTIONS
                    </span>

                    <h2>
                      Available transfers
                    </h2>

                    <p className="fm-transfers-results-description">
                      Review returned options before
                      continuing to the provider for
                      final availability and booking
                      terms.
                    </p>
                  </div>

                  <span className="fm-meta fm-transfers-result-count">
                    {transfers.length}{" "}
                    {transfers.length === 1
                      ? "option"
                      : "options"}
                  </span>
                </div>

                <div className="fm-grid fm-transfers-results-grid">

                  {transfers.map(
                    (item, index) => {
                      const price =
                        getPrice(item);

                      const currency =
                        getCurrency(item);

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
                          className="fm-card fm-transfer-result-card"
                          key={
                            item?.id ||
                            item?.transferId ||
                            item?.transfer_id ||
                            `transfer-${index}`
                          }
                        >
                          <div className="fm-transfer-result-top">
                            <span className="fm-badge">
                              Transfer
                            </span>

                            <span className="fm-transfer-result-type">
                              {transferType}
                            </span>
                          </div>

                          <h3>
                            {getTransferName(
                              item
                            )}
                          </h3>

                          <div className="fm-transfer-result-details">

                            <div>
                              <span>
                                Provider
                              </span>

                              <strong>
                                {provider}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Vehicle
                              </span>

                              <strong>
                                {getVehicle(
                                  item
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Capacity
                              </span>

                              <strong>
                                {getCapacity(
                                  item
                                )}
                              </strong>
                            </div>

                          </div>

                          <div className="fm-transfer-result-bottom">
                            <div>
                              <span className="fm-transfer-price-label">
                                Provider price
                              </span>

                              <div className="fm-price">
                                {price === null
                                  ? "Price from provider"
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
                        </article>
                      );
                    }
                  )}

                </div>
              </section>
            )}

          <section className="fm-section-inner fm-transfers-planning-section">

            <div className="fm-section-heading fm-transfers-section-heading">
              <div>
                <span className="fm-eyebrow">
                  TRANSFER PLANNING
                </span>

                <h2>
                  Match the transfer to your journey
                </h2>

                <p>
                  Choose a transfer style based on
                  your arrival, group size and
                  preferred travel arrangement.
                </p>
              </div>
            </div>

            <div className="fm-grid fm-transfers-type-grid">

              <article className="fm-card fm-transfer-type-card">
                <div className="fm-transfer-type-icon">
                  ✈
                </div>

                <span className="fm-section-kicker">
                  OPTION 01
                </span>

                <h3>
                  Airport arrival
                </h3>

                <p>
                  Use the airport as your pickup
                  point and your accommodation or
                  destination as the drop-off.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-secondary"
                  onClick={() =>
                    setTransferType(
                      "airport"
                    )
                  }
                >
                  Select airport transfer
                </button>
              </article>

              <article className="fm-card fm-transfer-type-card">
                <div className="fm-transfer-type-icon">
                  🚘
                </div>

                <span className="fm-section-kicker">
                  OPTION 02
                </span>

                <h3>
                  Private transfer
                </h3>

                <p>
                  A private transfer can be useful
                  when you want a dedicated vehicle
                  for your group.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-secondary"
                  onClick={() =>
                    setTransferType(
                      "private"
                    )
                  }
                >
                  Select private transfer
                </button>
              </article>

              <article className="fm-card fm-transfer-type-card">
                <div className="fm-transfer-type-icon">
                  👥
                </div>

                <span className="fm-section-kicker">
                  OPTION 03
                </span>

                <h3>
                  Shared transfer
                </h3>

                <p>
                  Shared services may be available
                  where providers operate them for
                  your destination.
                </p>

                <button
                  type="button"
                  className="fm-btn fm-secondary"
                  onClick={() =>
                    setTransferType(
                      "shared"
                    )
                  }
                >
                  Select shared transfer
                </button>
              </article>

            </div>
          </section>

          <section className="fm-card fm-section-inner fm-transfers-planner-card">

            <div className="fm-transfers-planner-content">
              <span className="fm-eyebrow">
                TRIP PLANNER
              </span>

              <h2>
                Add the transfer to your trip plan
              </h2>

              <p>
                Keep your ground transportation
                together with flights, hotels,
                activities, connectivity and other
                travel requirements.
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

          <section className="fm-card fm-disclaimer fm-transfers-disclaimer">

            <div className="fm-transfers-disclaimer-heading">
              <span className="fm-section-kicker">
                IMPORTANT
              </span>

              <strong>
                Provider information
              </strong>
            </div>

            <p>
              FlyMatrix does not directly operate
              transfer services. Vehicle type,
              pickup conditions, availability,
              cancellation terms, pricing and final
              booking conditions are determined by
              the selected provider.
            </p>

            <p>
              FlyMatrix does not invent current
              transfer prices. Where a configured
              live or cached provider source does not
              return pricing, the interface directs
              you to the provider for current
              availability and terms.
            </p>

            {destinationLabel && (
              <p className="fm-transfers-current-destination">
                Current destination:
                {" "}
                <strong>
                  {destinationLabel}
                </strong>
              </p>
            )}

          </section>

        </div>
      </section>
    </main>
  );
}
