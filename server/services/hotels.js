import { getTravelProvider, buildAffiliateUrl } from "./travelProviders.js";

const PROVIDER_CATEGORY = "hotels";

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeGuests(value) {
  const guests = Math.max(Number(value || 1), 1);

  return Math.min(guests, 20);
}

function normalizeRooms(value) {
  const rooms = Math.max(Number(value || 1), 1);

  return Math.min(rooms, 10);
}

function buildBookingUrl({
  destination,
  checkIn,
  checkOut,
  guests,
  rooms,
}) {
  return buildAffiliateUrl(PROVIDER_CATEGORY, {
    destination,
    checkin: checkIn,
    checkout: checkOut,
    guests,
    rooms,
  });
}

export function normalizeHotelResult(
  hotel = {},
  search = {}
) {
  const provider =
    getTravelProvider(PROVIDER_CATEGORY);

  const price =
    hotel.price ??
    hotel.pricePerNight ??
    hotel.price_per_night ??
    hotel.totalPrice ??
    hotel.total_price ??
    null;

  const currency =
    hotel.currency ||
    hotel.price?.currency ||
    null;

  const url =
    hotel.url ||
    hotel.link ||
    buildBookingUrl(search);

  return {
    id:
      hotel.id ||
      hotel.hotelId ||
      hotel.hotel_id ||
      null,

    name:
      hotel.name ||
      hotel.title ||
      "Hotel",

    city:
      hotel.city ||
      hotel.destination ||
      search.destination ||
      "",

    country:
      hotel.country ||
      "",

    address:
      hotel.address ||
      "",

    image:
      hotel.image ||
      hotel.imageUrl ||
      hotel.image_url ||
      null,

    rating:
      hotel.rating ??
      hotel.stars ??
      null,

    reviews:
      hotel.reviews ??
      hotel.reviewCount ??
      null,

    price,

    currency,

    priceType:
      hotel.priceType ||
      hotel.price_type ||
      "unknown",

    provider:
      hotel.provider ||
      provider?.name ||
      null,

    source:
      hotel.source ||
      "affiliate",

    live:
      hotel.live === true,

    cached:
      hotel.cached === true,

    estimated:
      hotel.estimated === true,

    url,
  };
}

export function normalizeHotelSearch(
  query = {}
) {
  return {
    destination:
      clean(
        query.destination ||
        query.city ||
        query.location
      ),

    checkIn:
      clean(
        query.checkIn ||
        query.checkin ||
        query.arrival
      ),

    checkOut:
      clean(
        query.checkOut ||
        query.checkout ||
        query.departure
      ),

    guests:
      normalizeGuests(
        query.guests
      ),

    rooms:
      normalizeRooms(
        query.rooms
      ),

    accommodation:
      clean(
        query.accommodation ||
        query.type ||
        "any"
      ),
  };
}

export function validateHotelSearch(
  search
) {
  if (!search.destination) {
    throw new Error(
      "Hotel destination is required."
    );
  }

  if (!search.checkIn) {
    throw new Error(
      "Hotel check-in date is required."
    );
  }

  if (!search.checkOut) {
    throw new Error(
      "Hotel check-out date is required."
    );
  }

  if (
    search.checkOut <=
    search.checkIn
  ) {
    throw new Error(
      "Hotel check-out date must be after check-in."
    );
  }

  return true;
}

export function createHotelSearchResult(
  search
) {
  const provider =
    getTravelProvider(PROVIDER_CATEGORY);

  return {
    success: true,

    search,

    source:
      provider?.name ||
      "Booking provider",

    provider:
      provider?.name ||
      null,

    live: false,

    cached: false,

    estimated: false,

    results: [],

    providerUrl:
      buildBookingUrl(search),

    message:
      "No live hotel feed is configured. Use the provider link to check current availability and pricing.",
  };
}

export async function searchHotels(
  query = {}
) {
  const search =
    normalizeHotelSearch(query);

  validateHotelSearch(search);

  /*
   * There is currently no hotel API provider configured
   * in the existing FlyMatrix backend.
   *
   * Therefore this service deliberately does NOT invent
   * hotel prices or availability.
   *
   * It returns the normalized search and the confirmed
   * Booking.com affiliate destination instead.
   */
  return createHotelSearchResult(search);
}

export default {
  searchHotels,
  normalizeHotelSearch,
  validateHotelSearch,
  normalizeHotelResult,
  createHotelSearchResult,
};
