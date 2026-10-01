import React, { useEffect, useMemo, useState } from "react";
import {
  getCurrentSearchParams,
  navigate,
} from "../router/AppRouter.jsx";

const AFFILIATES = {
  flights: "https://aviasales.tpk.lv/zXqbkMmK",
  hotels: "https://booking.tpk.lv/zXqbkMmK",
  activities: "https://getyourguide.tpk.lv/zXqbkMmK",
  esim: "https://airalo.tpk.lv/SMhYBmH2",
  assistance: "https://airhelp.tpk.lv/vuZpde9f",
  luggage: "https://radicalstorage.tpk.lv/LwLfrsRU",
  visa: "https://ivisa.tpk.lv/zXqbkMmK",
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
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
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
    payload.programs ||
    payload.institutions ||
    payload.data ||
    payload.items ||
    []
  );
}

function getPrice(option) {
  const price =
    option?.price ||
    option?.tuition ||
    option?.estimatedCost ||
    option?.totalPrice ||
    option?.total_price;

  if (typeof price === "number") {
    return {
      amount: price,
      currency: option?.currency || "USD",
    };
  }

  if (price && typeof price === "object") {
    return {
      amount: price.amount ?? price.total ?? price.value,
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
    currency: option?.currency || "USD",
  };
}

function getTitle(option) {
  return (
    option?.title ||
    option?.name ||
    option?.programName ||
    option?.courseName ||
    option?.institutionName ||
    "Education option"
  );
}

function getInstitution(option) {
  return (
    option?.institution?.name ||
    option?.institutionName ||
    option?.school ||
    option?.university ||
    option?.college ||
    "Education provider"
  );
}

function getDescription(option) {
  return (
    option?.description ||
    option?.summary ||
    "Education information supplied by the connected provider."
  );
}

function getCategory(option) {
  return (
    option?.category ||
    option?.level ||
    option?.studyLevel ||
    "Education"
  );
}

function getSource(option) {
  return (
    option?.source ||
    option?.dataSource ||
    option?.providerType ||
    ""
  );
}

function getBookingUrl(option) {
  return (
    option?.trackingUrl ||
    option?.affiliateUrl ||
    option?.bookingUrl ||
    option?.website ||
    null
  );
}

function getTravelAffiliate(category) {
  return AFFILIATES[category] || null;
}

async function fetchEducationOptions(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  const response = await fetch(
    `/api/tourism/education?${query.toString()}`,
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
      `Education service returned ${response.status}.`
    );
  }

  return response.json();
}

function ProviderStatus({ source }) {
  if (!source) {
    return null;
  }

  const normalized = String(source).toLowerCase();

  let label = "Provider data";

  if (normalized === "live") {
    label = "Live provider data";
  } else if (normalized === "cached") {
    label = "Cached provider data";
  } else if (
    normalized === "estimate" ||
    normalized === "estimated"
  ) {
    label = "Provider estimate";
  }

  return (
    <span className="provider-status">
      {label}
    </span>
  );
}

function OptionCard({ option, onOpen }) {
  const price = getPrice(option);
  const title = getTitle(option);
  const institution = getInstitution(option);
  const category = getCategory(option);
  const source = getSource(option);

  const directUrl = getBookingUrl(option);

  return (
    <article className="tourism-option-card">
      <div className="tourism-option-top">
        <span className="fm-badge">
          {category}
        </span>

        <ProviderStatus source={source} />
      </div>

      <h3>{title}</h3>

      <div className="education-institution">
        {institution}
      </div>

      <p>{getDescription(option)}</p>

      {option?.city && (
        <div className="tourism-option-provider">
          <span>Location</span>

          <strong>
            {option.city}
            {option.country
              ? `, ${option.country}`
              : ""}
          </strong>
        </div>
      )}

      <div className="tourism-option-provider">
        <span>Study level</span>

        <strong>
          {option?.level ||
            option?.studyLevel ||
            "Not specified"}
        </strong>
      </div>

      {option?.duration && (
        <div className="tourism-option-provider">
          <span>Duration</span>

          <strong>{option.duration}</strong>
        </div>
      )}

      {option?.studyMode && (
        <div className="tourism-option-provider">
          <span>Study mode</span>

          <strong>{option.studyMode}</strong>
        </div>
      )}

      <div className="tourism-option-bottom">
        <div>
          <span className="tourism-option-price-label">
            Published / provider cost
          </span>

          <strong className="tourism-option-price">
            {formatCurrency(
              price.amount,
              price.currency
            )}
          </strong>
        </div>

        {directUrl && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpen(directUrl)}
          >
            View provider
          </button>
        )}
      </div>
    </article>
  );
}

function TravelServiceCard({
  title,
  description,
  category,
  onOpen,
}) {
  const url = getTravelAffiliate(category);

  if (!url) {
    return null;
  }

  return (
    <article className="tourism-track-card">
      <span className="fm-badge">
        Travel service
      </span>

      <h3>{title}</h3>

      <p>{description}</p>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onOpen(url)}
      >
        Open provider
      </button>
    </article>
  );
}

export default function EducationResultsPage() {
  const params = useMemo(
    () => getCurrentSearchParams(),
    []
  );

  const country = params.get("country") || "";
  const city = params.get("city") || "";
  const level = params.get("level") || "";
  const field = params.get("field") || "";
  const budget = params.get("budget") || "";
  const duration = params.get("duration") || "";
  const studyMode = params.get("studyMode") || "";

  const facilities = params.get("facilities")
    ? params
        .get("facilities")
        .split(",")
        .filter(Boolean)
    : [];

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [sortOrder, setSortOrder] = useState("price");
  const [categoryFilter, setCategoryFilter] =
    useState("all");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetchEducationOptions({
            country,
            city,
            level,
            field,
            budget,
            duration,
            studyMode,
            facilities: facilities.join(","),
          });

        if (!active) {
          return;
        }

        setOptions(
          normalizeOptions(response)
        );

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
            "Unable to load education options."
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
    level,
    field,
    budget,
    duration,
    studyMode,
    facilities.join(","),
  ]);

  const sortedOptions = useMemo(() => {
    let result = [...options];

    if (categoryFilter !== "all") {
      const filter =
        categoryFilter.toLowerCase();

      result = result.filter((option) => {
        const category = String(
          option?.category ||
            option?.level ||
            option?.studyLevel ||
            ""
        ).toLowerCase();

        return category.includes(filter);
      });
    }

    if (sortOrder === "name") {
      result.sort((a, b) =>
        getTitle(a).localeCompare(
          getTitle(b)
        )
      );
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => {
        const aPrice = Number(
          getPrice(a).amount
        );

        const bPrice = Number(
          getPrice(b).amount
        );

        const aValue =
          Number.isFinite(aPrice)
            ? aPrice
            : -Infinity;

        const bValue =
          Number.isFinite(bPrice)
            ? bPrice
            : -Infinity;

        return bValue - aValue;
      });
    } else {
      result.sort((a, b) => {
        const aPrice = Number(
          getPrice(a).amount
        );

        const bPrice = Number(
          getPrice(b).amount
        );

        const aValue =
          Number.isFinite(aPrice)
            ? aPrice
            : Infinity;

        const bValue =
          Number.isFinite(bPrice)
            ? bPrice
            : Infinity;

        return aValue - bValue;
      });
    }

    return result;
  }, [
    options,
    sortOrder,
    categoryFilter,
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

  function retrySearch() {
    setError("");
    setLoading(true);

    const query = new URLSearchParams();

    if (country) query.set("country", country);
    if (city) query.set("city", city);
    if (level) query.set("level", level);
    if (field) query.set("field", field);
    if (budget) query.set("budget", budget);
    if (duration) query.set("duration", duration);
    if (studyMode) {
      query.set("studyMode", studyMode);
    }

    if (facilities.length) {
      query.set(
        "facilities",
        facilities.join(",")
      );
    }

    navigate(
      `/tourism/education/results?${query.toString()}`
    );
  }

  return (
    <main className="page-container">
      <section className="tourism-results-header">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate(
              "/tourism/education"
            )
          }
        >
          ← Change study plan
        </button>

        <div>
          <span className="fm-badge">
            Education Tourism
          </span>

          <h1>
            {city ||
              country ||
              "Education options"}
          </h1>

          <p>
            {field
              ? `${field} study options`
              : "Education options based on your selected requirements."}
          </p>
        </div>
      </section>

      <section className="tourism-search-summary">
        <div>
          <span>Destination</span>

          <strong>
            {city ||
              country ||
              "Not specified"}
          </strong>
        </div>

        <div>
          <span>Study level</span>

          <strong>
            {level || "Not specified"}
          </strong>
        </div>

        <div>
          <span>Duration</span>

          <strong>
            {duration || "Not specified"}
          </strong>
        </div>

        <div>
          <span>Study mode</span>

          <strong>
            {studyMode || "Not specified"}
          </strong>
        </div>
      </section>

      <section className="tourism-results-toolbar">
        <div>
          <strong>
            {loading
              ? "Loading options..."
              : `${sortedOptions.length} options`}
          </strong>

          {!loading && source && (
            <ProviderStatus
              source={source}
            />
          )}
        </div>

        <div className="tourism-results-controls">
          <label htmlFor="education-category">
            Category
          </label>

          <select
            id="education-category"
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

            <option value="certificate">
              Certificate
            </option>

            <option value="diploma">
              Diploma
            </option>

            <option value="bachelor">
              Bachelor's
            </option>

            <option value="master">
              Master's
            </option>

            <option value="doctorate">
              Doctorate
            </option>
          </select>

          <label htmlFor="education-sort">
            Sort
          </label>

          <select
            id="education-sort"
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

            <option value="price-desc">
              Highest price
            </option>

            <option value="name">
              Name
            </option>
          </select>
        </div>
      </section>

      {error && (
        <section className="tourism-error">
          <div>
            <strong>
              Education search unavailable
            </strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={retrySearch}
          >
            Try again
          </button>
        </section>
      )}

      {loading && (
        <section className="tourism-results-grid">
          <article className="tourism-option-card">
            <span className="fm-badge">
              Searching
            </span>

            <h3>
              Finding education options...
            </h3>

            <p>
              We are checking the connected
              education service using your
              selected requirements.
            </p>
          </article>
        </section>
      )}

      {!loading &&
        !error &&
        sortedOptions.length === 0 && (
          <section className="tourism-empty-state">
            <span className="fm-badge">
              No matching options
            </span>

            <h2>
              No education options were
              returned.
            </h2>

            <p>
              Try changing the destination,
              study level, field, duration,
              budget, or study mode.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/tourism/education"
                )
              }
            >
              Change study plan
            </button>
          </section>
        )}

      {!loading &&
        !error &&
        sortedOptions.length > 0 && (
          <section className="tourism-results-grid">
            {sortedOptions.map(
              (option, index) => (
                <OptionCard
                  key={
                    option?.id ||
                    option?.programId ||
                    option?.institutionId ||
                    `${getTitle(option)}-${index}`
                  }
                  option={option}
                  onOpen={openProvider}
                />
              )
            )}
          </section>
        )}

      {!loading && !error && (
        <section className="tourism-support-section">
          <div>
            <span className="fm-badge">
              Travel preparation
            </span>

            <h2>
              Prepare for your education
              journey
            </h2>

            <p>
              After selecting an education
              option, use the connected travel
              services to prepare flights,
              accommodation, activities, visa
              information, eSIM and assistance.
            </p>
          </div>

          <div className="tourism-track-grid">
            <TravelServiceCard
              title="Flights"
              description="Search flight options for your education destination."
              category="flights"
              onOpen={openProvider}
            />

            <TravelServiceCard
              title="Accommodation"
              description="Find accommodation options for your study stay."
              category="hotels"
              onOpen={openProvider}
            />

            <TravelServiceCard
              title="Activities"
              description="Explore activities and things to do at your destination."
              category="activities"
              onOpen={openProvider}
            />

            <TravelServiceCard
              title="eSIM"
              description="Prepare mobile connectivity before travelling."
              category="esim"
              onOpen={openProvider}
            />

            <TravelServiceCard
              title="Visa information"
              description="Check visa information and application requirements."
              category="visa"
              onOpen={openProvider}
            />

            <TravelServiceCard
              title="Travel assistance"
              description="Explore travel assistance options before departure."
              category="assistance"
              onOpen={openProvider}
            />

            <TravelServiceCard
              title="Luggage storage"
              description="Find luggage storage options when needed."
              category="luggage"
              onOpen={openProvider}
            />
          </div>
        </section>
      )}
    </main>
  );
}
