import React, { useEffect, useMemo, useState } from "react";
import {
  navigate,
  getCurrentSearchParams,
} from "../router/AppRouter.jsx";

const AFFILIATES = {
  flights:
    "https://aviasales.tpk.lv/zXqbkMmK",
  hotels:
    "https://booking.tpk.lv/zXqbkMmK",
  activities:
    "https://getyourguide.tpk.lv/zXqbkMmK",
  esim:
    "https://airalo.tpk.lv/SMhYBmH2",
  luggage:
    "https://radicalstorage.tpk.lv/LwLfrsRU",
  assistance:
    "https://airhelp.tpk.lv/vuZpde9f",
  visa:
    "https://ivisa.tpk.lv/zXqbkMmK",
};

function formatCurrency(value, currency = "USD") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(
      amount
    ).toLocaleString()}`;
  }
}

function getApiUrl(path) {
  const normalized = String(path || "").replace(
    /^\/+/,
    ""
  );

  return `/api/${normalized}`;
}

async function fetchTourismOptions(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.set(key, String(value));
      }
    }
  );

  const response = await fetch(
    `${getApiUrl(
      "tourism/leisure"
    )}?${query.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Tourism service returned ${response.status}.`
    );
  }

  return response.json();
}

function normalizeOptions(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  return (
    payload.options ||
    payload.results ||
    payload.data ||
    payload.items ||
    []
  );
}

function getOptionPrice(option) {
  const price =
    option?.price ||
    option?.totalPrice ||
    option?.total_price;

  if (typeof price === "number") {
    return {
      amount: price,
      currency:
        option?.currency || "USD",
    };
  }

  if (price && typeof price === "object") {
    return {
      amount:
        price.amount ??
        price.total ??
        price.value,
      currency:
        price.currency ||
        option?.currency ||
        "USD",
    };
  }

  return {
    amount:
      option?.amount ??
      option?.estimatedPrice ??
      null,
    currency:
      option?.currency || "USD",
  };
}

function getProviderName(option) {
  return (
    option?.provider?.name ||
    option?.providerName ||
    option?.supplier ||
    "Travel provider"
  );
}

function getOptionTitle(option) {
  return (
    option?.title ||
    option?.name ||
    option?.hotelName ||
    option?.activityName ||
    "Travel option"
  );
}

function getOptionDescription(option) {
  return (
    option?.description ||
    option?.summary ||
    "Provider information is available through the connected travel service."
  );
}

function getCategoryLabel(option) {
  return (
    option?.category ||
    option?.type ||
    option?.service ||
    "Travel option"
  );
}

function getBookingUrl(option, category) {
  if (option?.trackingUrl) {
    return option.trackingUrl;
  }

  if (option?.affiliateUrl) {
    return option.affiliateUrl;
  }

  if (option?.bookingUrl) {
    return option.bookingUrl;
  }

  return AFFILIATES[category] || null;
}

function normalizeCategory(option) {
  const value = String(
    option?.category ||
      option?.type ||
      option?.service ||
      ""
  ).toLowerCase();

  if (
    value.includes("hotel") ||
    value.includes("stay") ||
    value.includes("accommodation")
  ) {
    return "hotels";
  }

  if (
    value.includes("activity") ||
    value.includes("tour")
  ) {
    return "activities";
  }

  if (
    value.includes("flight") ||
    value.includes("air")
  ) {
    return "flights";
  }

  return "general";
}

function sortByPrice(options) {
  return [...options].sort((a, b) => {
    const aPrice = getOptionPrice(a).amount;
    const bPrice = getOptionPrice(b).amount;

    const aNumber = Number.isFinite(
      Number(aPrice)
    )
      ? Number(aPrice)
      : Infinity;

    const bNumber = Number.isFinite(
      Number(bPrice)
    )
      ? Number(bPrice)
      : Infinity;

    return aNumber - bNumber;
  });
}

function ProviderStatus({ source }) {
  if (!source) {
    return (
      <span className="provider-status">
        Provider data
      </span>
    );
  }

  return (
    <span className="provider-status">
      {source === "live"
        ? "Live provider data"
        : source === "cached"
        ? "Cached provider data"
        : "Provider estimate"}
    </span>
  );
}

function OptionCard({ option, onOpen }) {
  const price = getOptionPrice(option);
  const category = normalizeCategory(option);
  const bookingUrl = getBookingUrl(
    option,
    category
  );

  return (
    <article className="tourism-option-card fm-leisure-option-card">
      <div className="tourism-option-top fm-leisure-option-top">
        <span className="fm-badge">
          {getCategoryLabel(option)}
        </span>

        <ProviderStatus
          source={
            option?.source ||
            option?.dataSource
          }
        />
      </div>

      <h3>
        {getOptionTitle(option)}
      </h3>

      <p>
        {getOptionDescription(option)}
      </p>

      <div className="tourism-option-provider">
        <span>Provider</span>

        <strong>
          {getProviderName(option)}
        </strong>
      </div>

      <div className="tourism-option-bottom">
        <div>
          <span className="tourism-option-price-label">
            Price
          </span>

          <strong className="tourism-option-price">
            {formatCurrency(
              price.amount,
              price.currency
            )}
          </strong>
        </div>

        {bookingUrl && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              onOpen(bookingUrl)
            }
          >
            View provider
          </button>
        )}
      </div>
    </article>
  );
}

export default function LeisureResultsPage() {
  const params = useMemo(
    () => getCurrentSearchParams(),
    []
  );

  const country =
    params.get("country") || "";

  const city =
    params.get("city") || "";

  const budget =
    params.get("budget") || "";

  const days =
    params.get("days") || "7";

  const lifestyle =
    params.get("lifestyle") || "Budget";

  const facilities =
    params.get("facilities")
      ? params
          .get("facilities")
          .split(",")
          .filter(Boolean)
      : [];

  const [options, setOptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [source, setSource] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [sortOrder, setSortOrder] =
    useState("price");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetchTourismOptions({
            country,
            city,
            budget,
            days,
            lifestyle,
            facilities:
              facilities.join(","),
          });

        if (!active) {
          return;
        }

        const normalized =
          normalizeOptions(response);

        setOptions(normalized);

        setSource(
          response?.source ||
            response?.dataSource ||
            ""
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError?.message ||
            "Unable to load live tourism options."
        );

        setOptions([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [
    country,
    city,
    budget,
    days,
    lifestyle,
    facilities.join(","),
  ]);

  const filteredOptions = useMemo(() => {
    let result = [...options];

    if (categoryFilter !== "all") {
      result = result.filter(
        (option) =>
          normalizeCategory(option) ===
          categoryFilter
      );
    }

    if (sortOrder === "price") {
      result = sortByPrice(result);
    }

    if (sortOrder === "name") {
      result.sort((a, b) =>
        getOptionTitle(a).localeCompare(
          getOptionTitle(b)
        )
      );
    }

    return result;
  }, [
    options,
    categoryFilter,
    sortOrder,
  ]);

  function openProvider(url) {
    if (!url) {
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="page-container fm-leisure-results-page">
      <section className="tourism-results-header fm-leisure-results-header">
        <button
          type="button"
          className="btn btn-secondary fm-leisure-change-trip"
          onClick={() =>
            navigate("/tourism/leisure")
          }
        >
          ← Change trip
        </button>

        <div className="fm-leisure-results-title">
          <span className="fm-badge">
            Leisure Tourism
          </span>

          <h1>
            {city || "Your destination"}
          </h1>

          <p>
            {country
              ? `Travel options for ${
                  city || country
                }`
              : "Travel options based on your selected preferences."}
          </p>
        </div>
      </section>

      <section className="tourism-search-summary fm-leisure-search-summary">
        <div>
          <span>Trip length</span>
          <strong>
            {days} days
          </strong>
        </div>

        <div>
          <span>Budget</span>
          <strong>
            {budget || "Not specified"}
          </strong>
        </div>

        <div>
          <span>Lifestyle</span>
          <strong>
            {lifestyle}
          </strong>
        </div>

        <div>
          <span>Services</span>
          <strong>
            {facilities.length
              ? facilities.length
              : "None selected"}
          </strong>
        </div>
      </section>

      <section className="tourism-results-toolbar fm-leisure-results-toolbar">
        <div className="fm-leisure-results-status">
          <span className="section-kicker">
            Search results
          </span>

          <strong>
            {loading
              ? "Loading options..."
              : `${filteredOptions.length} options`}
          </strong>

          {!loading && source && (
            <ProviderStatus source={source} />
          )}
        </div>

        <div className="tourism-results-controls fm-leisure-results-controls">
          <label htmlFor="tourism-category">
            Category
          </label>

          <select
            id="tourism-category"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All
            </option>

            <option value="flights">
              Flights
            </option>

            <option value="hotels">
              Hotels
            </option>

            <option value="activities">
              Activities
            </option>
          </select>

          <label htmlFor="tourism-sort">
            Sort
          </label>

          <select
            id="tourism-sort"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value
              )
            }
          >
            <option value="price">
              Lowest price
            </option>

            <option value="name">
              Name
            </option>
          </select>
        </div>
      </section>

      {loading && (
        <section className="flight-results-loading fm-leisure-loading">
          {[1, 2, 3].map((item) => (
            <div
              className="loading-card"
              key={item}
            >
              <div className="loading-line loading-line-large" />
              <div className="loading-line" />
              <div className="loading-line loading-line-short" />
            </div>
          ))}
        </section>
      )}

      {!loading && error && (
        <section className="empty-state fm-leisure-empty-state">
          <div
            className="empty-state-icon"
            aria-hidden="true"
          >
            !
          </div>

          <span className="section-kicker">
            SEARCH UNAVAILABLE
          </span>

          <h2>
            Live tourism data is unavailable
          </h2>

          <p>
            {error}
          </p>

          <p>
            No provider price has been invented
            as a fallback. You can change your
            trip requirements and try again.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              window.location.reload()
            }
          >
            Try again
          </button>
        </section>
      )}

      {!loading &&
        !error &&
        !filteredOptions.length && (
          <section className="empty-state fm-leisure-empty-state">
            <div
              className="empty-state-icon"
              aria-hidden="true"
            >
              🌍
            </div>

            <span className="section-kicker">
              SEARCH COMPLETE
            </span>

            <h2>
              No matching options found
            </h2>

            <p>
              There are currently no connected
              provider options matching these
              filters.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/tourism/leisure"
                )
              }
            >
              Change preferences
            </button>
          </section>
        )}

      {!loading &&
        !error &&
        filteredOptions.length > 0 && (
          <section className="tourism-options-grid fm-leisure-options-grid">
            {filteredOptions.map(
              (option, index) => (
                <OptionCard
                  key={
                    option?.id ||
                    option?.offerId ||
                    option?.reference ||
                    `${getOptionTitle(
                      option
                    )}-${index}`
                  }
                  option={option}
                  onOpen={openProvider}
                />
              )
            )}
          </section>
        )}

      <section className="tourism-results-notice fm-leisure-results-notice">
        <strong>
          Important pricing information
        </strong>

        <p>
          Provider prices and availability can
          change. A price shown here should be
          treated according to its source as live,
          cached, or an estimate. Final price,
          availability, taxes, cancellation
          conditions and booking terms are
          confirmed by the provider before
          purchase.
        </p>
      </section>
    </main>
  );
}
