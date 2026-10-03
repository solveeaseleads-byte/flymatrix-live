import React, { useMemo, useState } from "react";
import { navigate } from "../router/AppRouter.jsx";

const DESTINATIONS = [
  "Lagos",
  "London",
  "Dubai",
  "Paris",
  "Lisbon",
  "Madrid",
  "Rome",
  "Istanbul",
  "Toronto",
  "New York",
  "Cape Town",
  "Nairobi",
  "Kuala Lumpur",
  "Tokyo",
  "Bangkok",
  "Bali",
];

const CATEGORIES = [
  "All",
  "Tours",
  "Food & Culture",
  "Museums",
  "Outdoor",
  "Family",
  "Nightlife",
  "Day Trips",
  "Attractions",
];

const SORT_OPTIONS = [
  {
    value: "recommended",
    label: "Recommended",
  },
  {
    value: "price",
    label: "Lowest available price",
  },
  {
    value: "rating",
    label: "Highest rating",
  },
];

const DEFAULT_FORM = {
  destination: "",
  date: "",
  travelers: 1,
  category: "All",
};

function normalizeActivities(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.activities)) {
    return payload.activities;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.offers)) {
    return payload.offers;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function getActivityName(activity) {
  return (
    activity?.name ||
    activity?.title ||
    activity?.activityName ||
    "Activity"
  );
}

function getActivityDescription(activity) {
  return (
    activity?.description ||
    activity?.summary ||
    activity?.shortDescription ||
    ""
  );
}

function getActivityPrice(activity) {
  return Number(
    activity?.price?.amount ??
      activity?.price?.value ??
      activity?.price ??
      activity?.amount ??
      Infinity
  );
}

function getActivityCurrency(activity) {
  return (
    activity?.price?.currency ||
    activity?.currency ||
    "USD"
  );
}

function getActivityRating(activity) {
  const rating = Number(
    activity?.rating ??
      activity?.reviewScore ??
      activity?.score ??
      0
  );

  return Number.isFinite(rating)
    ? rating
    : 0;
}

function getActivityCategory(activity) {
  return (
    activity?.category ||
    activity?.type ||
    activity?.categoryName ||
    "Activity"
  );
}

function getActivityLocation(activity) {
  return (
    activity?.location ||
    activity?.city ||
    activity?.destination ||
    ""
  );
}

function getActivityUrl(activity) {
  return (
    activity?.url ||
    activity?.link ||
    activity?.bookingUrl ||
    activity?.deepLink ||
    ""
  );
}

function getActivityImage(activity) {
  return (
    activity?.image ||
    activity?.imageUrl ||
    activity?.photo ||
    ""
  );
}

function getProvider(activity) {
  return (
    activity?.provider ||
    activity?.source ||
    activity?.partner ||
    "Activity provider"
  );
}

function buildProviderUrl(form) {
  const params = new URLSearchParams();

  if (form.destination) {
    params.set(
      "destination",
      form.destination
    );
  }

  if (form.date) {
    params.set("date", form.date);
  }

  params.set(
    "travelers",
    String(form.travelers)
  );

  if (form.category !== "All") {
    params.set(
      "category",
      form.category
    );
  }

  return `https://getyourguide.tpk.lv/zXqbkMmK?${params.toString()}`;
}

export default function ActivitiesPage() {
  const [form, setForm] =
    useState(DEFAULT_FORM);

  const [activities, setActivities] =
    useState([]);

  const [sortBy, setSortBy] =
    useState("recommended");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searched, setSearched] =
    useState(false);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const canSearch =
    Boolean(form.destination);

  const providerUrl = useMemo(
    () => buildProviderUrl(form),
    [form]
  );

  const sortedActivities = useMemo(() => {
    const list = [...activities];

    if (sortBy === "price") {
      return list.sort(
        (a, b) =>
          getActivityPrice(a) -
          getActivityPrice(b)
      );
    }

    if (sortBy === "rating") {
      return list.sort(
        (a, b) =>
          getActivityRating(b) -
          getActivityRating(a)
      );
    }

    return list;
  }, [activities, sortBy]);

  function updateField(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  async function searchActivities() {
    if (!canSearch) {
      setError(
        "Select a destination first."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setSelectedActivity(null);

    try {
      const params =
        new URLSearchParams({
          destination:
            form.destination,
          travelers: String(
            form.travelers
          ),
          category: form.category,
        });

      if (form.date) {
        params.set(
          "date",
          form.date
        );
      }

      const response = await fetch(
        `/api/activities/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Activities service returned ${response.status}.`
        );
      }

      const payload =
        await response.json();

      setActivities(
        normalizeActivities(payload)
      );
    } catch (requestError) {
      setActivities([]);

      setError(
        requestError?.message ||
          "Activity search is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  function openProvider() {
    window.open(
      providerUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openActivity(activity) {
    const url =
      getActivityUrl(activity);

    if (url) {
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    openProvider();
  }

  function saveToPlanner() {
    try {
      sessionStorage.setItem(
        "flymatrix:activitySearch",
        JSON.stringify(form)
      );
    } catch {
      // Storage is optional.
    }

    navigate("/planner");
  }

  return (
    <main className="page-container fm-activities-page">
      <section className="activities-hero fm-activities-hero">
        <div className="fm-activities-hero-content">
          <span className="fm-badge">
            Activities & Tours
          </span>

          <h1>
            Discover things to do
          </h1>

          <p>
            Explore tours, attractions, cultural
            experiences, food activities and day
            trips. Where available, results can be
            supplied by connected travel providers.
          </p>
        </div>
      </section>

      <section className="activities-search-card fm-activities-search-card">
        <div className="planner-card-heading fm-activities-search-heading">
          <div>
            <span className="section-kicker">
              Experience search
            </span>

            <h2>
              What do you want to explore?
            </h2>
          </div>
        </div>

        <div className="tourism-form-grid fm-activities-form-grid">
          <div className="form-field">
            <label htmlFor="activity-destination">
              Destination
            </label>

            <input
              id="activity-destination"
              list="activity-destinations"
              type="text"
              value={form.destination}
              placeholder="City or destination"
              onChange={(event) =>
                updateField(
                  "destination",
                  event.target.value
                )
              }
            />

            <datalist id="activity-destinations">
              {DESTINATIONS.map(
                (destination) => (
                  <option
                    key={destination}
                    value={destination}
                  />
                )
              )}
            </datalist>
          </div>

          <div className="form-field">
            <label htmlFor="activity-date">
              Activity date
            </label>

            <input
              id="activity-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                updateField(
                  "date",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="activity-travelers">
              Travelers
            </label>

            <input
              id="activity-travelers"
              type="number"
              min="1"
              max="20"
              value={form.travelers}
              onChange={(event) =>
                updateField(
                  "travelers",
                  Math.min(
                    Math.max(
                      Number(
                        event.target.value
                      ) || 1,
                      1
                    ),
                    20
                  )
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="activity-category">
              Category
            </label>

            <select
              id="activity-category"
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
            >
              {CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {error && (
          <div
            className="visa-error fm-activities-error"
            role="alert"
          >
            <strong>
              Activity search unavailable
            </strong>

            <p>{error}</p>
          </div>
        )}

        <div className="planner-actions fm-activities-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              !canSearch || loading
            }
            onClick={searchActivities}
          >
            {loading
              ? "Searching..."
              : "Search activities"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={!form.destination}
            onClick={openProvider}
          >
            Open activity provider
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={saveToPlanner}
          >
            Save to trip plan
          </button>
        </div>
      </section>

      {searched && !loading && (
        <section className="activity-results-section fm-activities-results-section">
          <div className="flight-results-header fm-activities-results-header">
            <div className="fm-activities-results-title">
              <span className="section-kicker">
                Results
              </span>

              <h2>
                {sortedActivities.length
                  ? `${sortedActivities.length} ${
                      sortedActivities.length ===
                      1
                        ? "experience"
                        : "experiences"
                    }`
                  : "No activities found"}
              </h2>

              <p>
                {form.destination}
                {form.date
                  ? ` · ${form.date}`
                  : ""}
              </p>
            </div>

            {sortedActivities.length > 0 && (
              <div className="form-field-inline fm-activities-sort">
                <label htmlFor="activity-sort">
                  Sort
                </label>

                <select
                  id="activity-sort"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                >
                  {SORT_OPTIONS.map(
                    (option) => (
                      <option
                        value={option.value}
                        key={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </div>

          {sortedActivities.length > 0 ? (
            <div className="activity-results-grid fm-activities-results-grid">
              {sortedActivities.map(
                (activity, index) => {
                  const image =
                    getActivityImage(
                      activity
                    );

                  const price =
                    getActivityPrice(
                      activity
                    );

                  const rating =
                    getActivityRating(
                      activity
                    );

                  return (
                    <article
                      className="activity-result-card fm-activity-result-card"
                      key={
                        activity?.id ||
                        activity?.activityId ||
                        `${getActivityName(
                          activity
                        )}-${index}`
                      }
                    >
                      {image ? (
                        <div className="activity-image-wrapper fm-activity-image-wrapper">
                          <img
                            src={image}
                            alt={getActivityName(
                              activity
                            )}
                            className="activity-image"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="activity-image-placeholder fm-activity-image-placeholder">
                          <span>
                            ★
                          </span>
                        </div>
                      )}

                      <div className="activity-result-body fm-activity-result-body">
                        <div className="activity-card-topline fm-activity-card-topline">
                          <span className="fm-badge">
                            {getProvider(
                              activity
                            )}
                          </span>

                          <span className="activity-category">
                            {getActivityCategory(
                              activity
                            )}
                          </span>
                        </div>

                        <h3>
                          {getActivityName(
                            activity
                          )}
                        </h3>

                        {getActivityLocation(
                          activity
                        ) && (
                          <p className="activity-location">
                            {
                              getActivityLocation(
                                activity
                              )
                            }
                          </p>
                        )}

                        {getActivityDescription(
                          activity
                        ) && (
                          <p className="activity-description">
                            {getActivityDescription(
                              activity
                            )}
                          </p>
                        )}

                        {rating > 0 && (
                          <div className="activity-rating">
                            ★ {rating}
                          </div>
                        )}

                        <div className="activity-result-footer fm-activity-result-footer">
                          <div>
                            {Number.isFinite(
                              price
                            ) ? (
                              <>
                                <strong>
                                  {
                                    getActivityCurrency(
                                      activity
                                    )
                                  }{" "}
                                  {price.toLocaleString()}
                                </strong>

                                <small>
                                  Provider price
                                </small>
                              </>
                            ) : (
                              <small>
                                Current price
                                available
                                from provider
                              </small>
                            )}
                          </div>

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              openActivity(
                                activity
                              )
                            }
                          >
                            View experience
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="empty-state fm-activities-empty-state">
              <div
                className="empty-state-icon"
                aria-hidden="true"
              >
                ★
              </div>

              <h2>
                No activity results
              </h2>

              <p>
                Try another destination or
                category, or continue directly to
                the activity provider.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={openProvider}
              >
                Search provider
              </button>
            </div>
          )}
        </section>
      )}

      {selectedActivity && (
        <section className="activity-detail-card fm-activity-detail-card">
          <div>
            <span className="section-kicker">
              Selected experience
            </span>

            <h2>
              {getActivityName(
                selectedActivity
              )}
            </h2>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              openActivity(
                selectedActivity
              )
            }
          >
            Continue
          </button>
        </section>
      )}

      <section className="activity-info-grid fm-activities-info-grid">
        <article className="service-card">
          <div className="service-card-icon">
            ★
          </div>

          <h3>
            Tours and experiences
          </h3>

          <p>
            Explore sightseeing, guided tours,
            attractions and local experiences
            where provider data is available.
          </p>
        </article>

        <article className="service-card">
          <div className="service-card-icon">
            $
          </div>

          <h3>
            Provider pricing
          </h3>

          <p>
            Displayed prices should come from
            connected providers. FlyMatrix does
            not fabricate current activity prices.
          </p>
        </article>

        <article className="service-card">
          <div className="service-card-icon">
            →
          </div>

          <h3>
            Complete with the provider
          </h3>

          <p>
            When an activity has a booking URL,
            you can continue directly to the
            relevant provider.
          </p>
        </article>
      </section>

      <section className="planner-notice fm-activities-notice">
        <strong>
          Activity availability notice
        </strong>

        <p>
          Activity schedules, prices,
          availability, cancellation conditions
          and final booking terms are controlled
          by the relevant provider and may change
          before purchase.
        </p>
      </section>
    </main>
  );
}
