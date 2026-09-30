import {
  getTravelProvider,
  buildAffiliateUrl,
} from "./travelProviders.js";

const PROVIDER_CATEGORY = "activities";

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeTravelers(value) {
  const travelers = Math.max(
    Number(value || 1),
    1
  );

  return Math.min(travelers, 20);
}

function normalizeActivitySearch(query = {}) {
  return {
    destination: clean(
      query.destination ||
      query.city ||
      query.location
    ),

    date: clean(
      query.date ||
      query.activityDate ||
      query.activity_date
    ),

    travelers: normalizeTravelers(
      query.travelers ||
      query.guests ||
      query.people
    ),

    category: clean(
      query.category ||
      "all"
    ),
  };
}

function buildProviderUrl(search) {
  return buildAffiliateUrl(
    PROVIDER_CATEGORY,
    {
      destination:
        search.destination,

      date:
        search.date,

      travelers:
        search.travelers,

      category:
        search.category !== "all"
          ? search.category
          : undefined,
    }
  );
}

export function validateActivitySearch(
  search
) {
  if (!search.destination) {
    throw new Error(
      "Activity destination is required."
    );
  }

  if (!search.date) {
    throw new Error(
      "Activity date is required."
    );
  }

  if (
    !Number.isInteger(
      search.travelers
    ) ||
    search.travelers < 1
  ) {
    throw new Error(
      "At least one traveler is required."
    );
  }

  return true;
}

export function normalizeActivityResult(
  activity = {},
  search = {}
) {
  const provider =
    getTravelProvider(
      PROVIDER_CATEGORY
    );

  return {
    id:
      activity.id ||
      activity.activityId ||
      activity.activity_id ||
      null,

    name:
      activity.name ||
      activity.title ||
      "Activity",

    description:
      activity.description ||
      "",

    destination:
      activity.destination ||
      search.destination ||
      "",

    category:
      activity.category ||
      search.category ||
      "all",

    date:
      activity.date ||
      search.date ||
      null,

    duration:
      activity.duration ||
      activity.durationText ||
      null,

    image:
      activity.image ||
      activity.imageUrl ||
      activity.image_url ||
      null,

    rating:
      activity.rating ??
      activity.stars ??
      null,

    reviews:
      activity.reviews ??
      activity.reviewCount ??
      null,

    price:
      activity.price ??
      activity.amount ??
      activity.totalPrice ??
      activity.total_price ??
      null,

    currency:
      activity.currency ||
      null,

    provider:
      activity.provider ||
      provider?.name ||
      null,

    source:
      activity.source ||
      "affiliate",

    live:
      activity.live === true,

    cached:
      activity.cached === true,

    estimated:
      activity.estimated === true,

    url:
      activity.url ||
      activity.link ||
      buildProviderUrl(search),
  };
}

export function createActivitySearchResult(
  search
) {
  const provider =
    getTravelProvider(
      PROVIDER_CATEGORY
    );

  return {
    success: true,

    search,

    source:
      provider?.name ||
      "Activity provider",

    provider:
      provider?.name ||
      null,

    live: false,

    cached: false,

    estimated: false,

    results: [],

    providerUrl:
      buildProviderUrl(search),

    message:
      "No live activity feed is configured. Use the provider link to check current experiences, availability, and pricing.",
  };
}

export async function searchActivities(
  query = {}
) {
  const search =
    normalizeActivitySearch(
      query
    );

  validateActivitySearch(
    search
  );

  /*
   * No live activities API is currently
   * configured in the existing backend.
   *
   * Do not manufacture prices,
   * availability, ratings, or reviews.
   */
  return createActivitySearchResult(
    search
  );
}

export {
  normalizeActivitySearch,
};

export default {
  searchActivities,
  normalizeActivitySearch,
  validateActivitySearch,
  normalizeActivityResult,
  createActivitySearchResult,
};
