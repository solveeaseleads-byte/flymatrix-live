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

const HOTEL_STYLES = [
  "Any",
  "Budget",
  "Business",
  "Family",
  "Boutique",
  "Luxury",
  "Resort",
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
  checkIn: "",
  checkOut: "",
  guests: 1,
  rooms: 1,
  style: "Any",
};

function normalizeHotels(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.hotels)) {
    return payload.hotels;
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

function getHotelName(hotel) {
  return (
    hotel?.name ||
    hotel?.hotelName ||
    hotel?.title ||
    "Hotel"
  );
}

function getHotelLocation(hotel) {
  return (
    hotel?.location ||
    hotel?.address ||
    hotel?.city ||
    ""
  );
}

function getHotelPrice(hotel) {
  return Number(
    hotel?.price?.amount ??
      hotel?.price?.total ??
      hotel?.price ??
      hotel?.amount ??
      Infinity
  );
}

function getHotelCurrency(hotel) {
  return (
    hotel?.price?.currency ||
    hotel?.currency ||
    "USD"
  );
}

function getHotelRating(hotel) {
  const rating = Number(
    hotel?.rating ??
      hotel?.reviewScore ??
      hotel?.stars ??
      0
  );

  return Number.isFinite(rating)
    ? rating
    : 0;
}

function getHotelUrl(hotel) {
  return (
    hotel?.url ||
    hotel?.bookingUrl ||
    hotel?.link ||
    hotel?.deepLink ||
    ""
  );
}

function getSourceLabel(hotel) {
  if (
    hotel?.source ||
    hotel?.provider ||
    hotel?.partner
  ) {
    return (
      hotel.source ||
      hotel.provider ||
      hotel.partner
    );
  }

  return "Booking provider";
}

function getImage(hotel) {
  return (
    hotel?.image ||
    hotel?.imageUrl ||
    hotel?.photo ||
    ""
  );
}

function buildBookingUrl(form) {
  const params = new URLSearchParams();

  if (form.destination) {
    params.set(
      "destination",
      form.destination
    );
  }

  if (form.checkIn) {
    params.set(
      "checkIn",
      form.checkIn
    );
  }

  if (form.checkOut) {
    params.set(
      "checkOut",
      form.checkOut
    );
  }

  params.set(
    "guests",
    String(form.guests)
  );

  params.set(
    "rooms",
    String(form.rooms)
  );

  return `https://booking.tpk.lv/zXqbkMmK?${params.toString()}`;
}

export default function HotelsPage() {
  const [form, setForm] =
    useState(DEFAULT_FORM);

  const [hotels, setHotels] =
    useState([]);

  const [sortBy, setSortBy] =
    useState("recommended");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searched, setSearched] =
    useState(false);

  const [selectedHotel, setSelectedHotel] =
    useState(null);

  const canSearch =
    Boolean(
      form.destination &&
        form.checkIn &&
        form.checkOut
    );

  const bookingUrl = useMemo(
    () => buildBookingUrl(form),
    [form]
  );

  const sortedHotels = useMemo(() => {
    const list = [...hotels];

    if (sortBy === "price") {
      return list.sort(
        (a, b) =>
          getHotelPrice(a) -
          getHotelPrice(b)
      );
    }

    if (sortBy === "rating") {
      return list.sort(
        (a, b) =>
          getHotelRating(b) -
          getHotelRating(a)
      );
    }

    return list;
  }, [hotels, sortBy]);

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

  async function searchHotels() {
    if (!canSearch) {
      setError(
        "Select a destination, check-in date and check-out date."
      );

      return;
    }

    if (
      new Date(form.checkOut) <=
      new Date(form.checkIn)
    ) {
      setError(
        "Check-out must be after check-in."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setSelectedHotel(null);

    try {
      const params =
        new URLSearchParams({
          destination:
            form.destination,
          checkIn:
            form.checkIn,
          checkOut:
            form.checkOut,
          guests: String(
            form.guests
          ),
          rooms: String(
            form.rooms
          ),
          style: form.style,
        });

      const response = await fetch(
        `/api/hotels/search?${params.toString()}`,
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
          `Hotel service returned ${response.status}.`
        );
      }

      const payload =
        await response.json();

      setHotels(
        normalizeHotels(payload)
      );
    } catch (requestError) {
      setHotels([]);

      setError(
        requestError?.message ||
          "Hotel search is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  function openProvider() {
    window.open(
      bookingUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openHotel(hotel) {
    const url =
      getHotelUrl(hotel);

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
        "flymatrix:hotelSearch",
        JSON.stringify(form)
      );
    } catch {
      // Storage is optional.
    }

    navigate("/planner");
  }

  return (
    <main className="page-container fm-hotels-page">
      <section className="hotels-hero fm-hotels-hero">
        <div className="fm-hotels-hero-content">
          <span className="fm-badge">
            Hotels
          </span>

          <h1>
            Find accommodation for your trip
          </h1>

          <p>
            Search available accommodation
            options and continue to the relevant
            booking provider for current prices,
            availability and final terms.
          </p>
        </div>
      </section>

      <section className="hotels-search-card fm-hotels-search-card">
        <div className="planner-card-heading fm-hotels-search-heading">
          <div>
            <span className="section-kicker">
              Accommodation search
            </span>

            <h2>
              Where are you staying?
            </h2>
          </div>
        </div>

        <div className="tourism-form-grid fm-hotels-form-grid">
          <div className="form-field">
            <label htmlFor="hotel-destination">
              Destination
            </label>

            <input
              id="hotel-destination"
              list="hotel-destinations"
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

            <datalist id="hotel-destinations">
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
            <label htmlFor="hotel-check-in">
              Check-in
            </label>

            <input
              id="hotel-check-in"
              type="date"
              value={form.checkIn}
              onChange={(event) =>
                updateField(
                  "checkIn",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="hotel-check-out">
              Check-out
            </label>

            <input
              id="hotel-check-out"
              type="date"
              min={
                form.checkIn ||
                undefined
              }
              value={form.checkOut}
              onChange={(event) =>
                updateField(
                  "checkOut",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="hotel-guests">
              Guests
            </label>

            <input
              id="hotel-guests"
              type="number"
              min="1"
              max="20"
              value={form.guests}
              onChange={(event) =>
                updateField(
                  "guests",
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
            <label htmlFor="hotel-rooms">
              Rooms
            </label>

            <input
              id="hotel-rooms"
              type="number"
              min="1"
              max="10"
              value={form.rooms}
              onChange={(event) =>
                updateField(
                  "rooms",
                  Math.min(
                    Math.max(
                      Number(
                        event.target.value
                      ) || 1,
                      1
                    ),
                    10
                  )
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="hotel-style">
              Accommodation style
            </label>

            <select
              id="hotel-style"
              value={form.style}
              onChange={(event) =>
                updateField(
                  "style",
                  event.target.value
                )
              }
            >
              {HOTEL_STYLES.map(
                (style) => (
                  <option
                    value={style}
                    key={style}
                  >
                    {style}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {error && (
          <div
            className="visa-error fm-hotels-error"
            role="alert"
          >
            <strong>
              Hotel search unavailable
            </strong>

            <p>{error}</p>
          </div>
        )}

        <div className="planner-actions fm-hotels-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              !canSearch || loading
            }
            onClick={searchHotels}
          >
            {loading
              ? "Searching..."
              : "Search hotels"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={!form.destination}
            onClick={openProvider}
          >
            Open booking provider
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
        <section className="hotel-results-section fm-hotels-results-section">
          <div className="flight-results-header fm-hotels-results-header">
            <div className="fm-hotels-results-title">
              <span className="section-kicker">
                Results
              </span>

              <h2>
                {sortedHotels.length
                  ? `${sortedHotels.length} accommodation ${
                      sortedHotels.length ===
                      1
                        ? "option"
                        : "options"
                    }`
                  : "No accommodation options found"}
              </h2>

              <p>
                {form.destination} ·{" "}
                {form.checkIn} →{" "}
                {form.checkOut}
              </p>
            </div>

            {sortedHotels.length > 0 && (
              <div className="form-field-inline fm-hotels-sort">
                <label htmlFor="hotel-sort">
                  Sort
                </label>

                <select
                  id="hotel-sort"
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

          {sortedHotels.length > 0 ? (
            <div className="hotel-results-grid fm-hotels-results-grid">
              {sortedHotels.map(
                (hotel, index) => {
                  const image =
                    getImage(hotel);

                  const price =
                    getHotelPrice(
                      hotel
                    );

                  const rating =
                    getHotelRating(
                      hotel
                    );

                  return (
                    <article
                      className="hotel-result-card fm-hotel-result-card"
                      key={
                        hotel?.id ||
                        hotel?.hotelId ||
                        `${getHotelName(
                          hotel
                        )}-${index}`
                      }
                    >
                      {image ? (
                        <div className="hotel-image-wrapper fm-hotel-image-wrapper">
                          <img
                            src={image}
                            alt={getHotelName(
                              hotel
                            )}
                            className="hotel-image"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="hotel-image-placeholder fm-hotel-image-placeholder">
                          <span>
                            🏨
                          </span>
                        </div>
                      )}

                      <div className="hotel-result-body fm-hotel-result-body">
                        <span className="fm-badge">
                          {getSourceLabel(
                            hotel
                          )}
                        </span>

                        <h3>
                          {getHotelName(
                            hotel
                          )}
                        </h3>

                        {getHotelLocation(
                          hotel
                        ) && (
                          <p className="hotel-location">
                            {
                              getHotelLocation(
                                hotel
                              )
                            }
                          </p>
                        )}

                        {rating > 0 && (
                          <div className="hotel-rating">
                            ★ {rating}
                          </div>
                        )}

                        <div className="hotel-result-footer fm-hotel-result-footer">
                          <div>
                            {Number.isFinite(
                              price
                            ) ? (
                              <>
                                <strong>
                                  {
                                    getHotelCurrency(
                                      hotel
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
                              openHotel(
                                hotel
                              )
                            }
                          >
                            View deal
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="empty-state fm-hotels-empty-state">
              <div
                className="empty-state-icon"
                aria-hidden="true"
              >
                🏨
              </div>

              <h2>
                No hotel results
              </h2>

              <p>
                Try different dates or
                destination details, or continue
                directly to the booking provider.
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

      <section className="hotel-info-grid fm-hotels-info-grid">
        <article className="service-card">
          <div className="service-card-icon">
            ✓
          </div>

          <h3>
            Current provider availability
          </h3>

          <p>
            Prices and availability should be
            treated as provider-supplied data.
            Final totals can change before
            booking.
          </p>
        </article>

        <article className="service-card">
          <div className="service-card-icon">
            $
          </div>

          <h3>
            Compare before booking
          </h3>

          <p>
            Review the available options,
            cancellation terms, taxes and other
            conditions on the booking provider
            before paying.
          </p>
        </article>

        <article className="service-card">
          <div className="service-card-icon">
            →
          </div>

          <h3>
            Complete booking with provider
          </h3>

          <p>
            FlyMatrix can send you to the
            relevant booking partner. The
            provider handles the final reservation
            and payment.
          </p>
        </article>
      </section>

      <section className="planner-notice fm-hotels-notice">
        <strong>
          Hotel pricing notice
        </strong>

        <p>
          FlyMatrix does not invent hotel prices.
          Where provider data is unavailable, the
          page does not display a fabricated price.
          Always confirm the final room price,
          taxes, fees, cancellation policy and
          availability on the booking provider.
        </p>
      </section>
    </main>
  );
              }
