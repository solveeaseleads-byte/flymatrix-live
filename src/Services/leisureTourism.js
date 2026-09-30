import {
  getTravelProvider,
  buildAffiliateUrl,
} from "./travelProviders.js";

const ACTIVITY_CATEGORY = "activities";
const HOTEL_CATEGORY = "hotels";

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeTravelers(value) {
  const travelers = Number(value || 1);

  if (!Number.isFinite(travelers)) {
    return 1;
  }

  return Math.min(
    Math.max(Math.floor(travelers), 1),
    20
  );
}

function normalizeLeisureSearch(query = {}) {
  return {
    destination: clean(
      query.destination ||
      query.city ||
      query.country ||
      ""
    ),

    country: clean(
      query.country || ""
    ),

    city: clean(
      query.city ||
      query.destination ||
      ""
    ),

    startDate: clean(
      query.startDate ||
      query.start_date ||
      query.fromDate ||
      ""
    ),

    endDate: clean(
      query.endDate ||
      query.end_date ||
      query.toDate ||
      ""
    ),

    travelers:
      normalizeTravelers(
        query.travelers ||
        query.passengers ||
        query.guests
      ),

    budget: clean(
      query.budget ||
      ""
    ),

    interests:
      Array.isArray(
        query.interests
      )
        ? query.interests
        : clean(
            query.interests ||
            ""
          )
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),
  };
}

function buildActivityUrl(
  search
) {
  return buildAffiliateUrl(
    ACTIVITY_CATEGORY,
    {
      destination:
        search.destination,
      city:
        search.city,
      country:
        search.country,
      startDate:
        search.startDate,
      endDate:
        search.endDate,
      travelers:
        search.travelers,
    }
  );
}

function buildHotelUrl(
  search
) {
  return buildAffiliateUrl(
    HOTEL_CATEGORY,
    {
      destination:
        search.destination,
      city:
        search.city,
      country:
        search.country,
      checkin:
        search.startDate,
      checkout:
        search.endDate,
      guests:
        search.travelers,
    }
  );
}

function createGuide(
  search
) {
  return {
    destination:
      search.destination,

    country:
      search.country,

    city:
      search.city,

    startDate:
      search.startDate,

    endDate:
      search.endDate,

    travelers:
      search.travelers,

    interests:
      search.interests,

    accommodation: {
      provider:
        getTravelProvider(
          HOTEL_CATEGORY
        )?.name ||
        null,

      url:
        buildHotelUrl(search),
    },

    activities: {
      provider:
        getTravelProvider(
          ACTIVITY_CATEGORY
        )?.name ||
        null,

      url:
        buildActivityUrl(search),
    },
  };
}

export function validateLeisureSearch(
  search
) {
  if (!search.destination) {
    throw new Error(
      "Leisure tourism destination is required."
    );
  }

  if (!search.startDate) {
    throw new Error(
      "Leisure tourism start date is required."
    );
  }

  if (!search.endDate) {
    throw new Error(
      "Leisure tourism end date is required."
    );
  }

  if (
    search.travelers < 1
  ) {
    throw new Error(
      "At least one traveler is required."
    );
  }

  return true;
}

export function normalizeLeisureResult(
  item = {},
  search = {}
) {
  return {
    id:
      item.id ||
      item.activityId ||
      item.hotelId ||
      null,

    type:
      item.type ||
      "activity",

    title:
      item.title ||
      item.name ||
      "Leisure experience",

    destination:
      item.destination ||
      search.destination ||
      "",

    city:
      item.city ||
      search.city ||
      "",

    country:
      item.country ||
      search.country ||
      "",

    description:
      item.description ||
      "",

    category:
      item.category ||
      "leisure",

    price:
      item.price ??
      item.amount ??
      null,

    currency:
      item.currency ||
      null,

    rating:
      item.rating ??
      null,

    reviews:
      item.reviews ??
      item.reviewCount ??
      null,

    image:
      item.image ||
      item.imageUrl ||
      null,

    url:
      item.url ||
      item.link ||
      null,

    source:
      item.source ||
      "provider",

    live:
      item.live === true,

    cached:
      item.cached === true,

    estimated:
      item.estimated === true,
  };
}

export function createLeisureResult(
  search
) {
  const activityProvider =
    getTravelProvider(
      ACTIVITY_CATEGORY
    );

  const hotelProvider =
    getTravelProvider(
      HOTEL_CATEGORY
    );

  return {
    success: true,

    search,

    mode: "leisure",

    live: false,

    cached: false,

    estimated: false,

    results: [],

    guide:
      createGuide(search),

    providers: {
      activities:
        activityProvider
          ? {
              name:
                activityProvider.name,
              network:
                activityProvider.network,
              url:
                buildActivityUrl(
                  search
                ),
            }
          : null,

      hotels:
        hotelProvider
          ? {
              name:
                hotelProvider.name,
              network:
                hotelProvider.network,
              url:
                buildHotelUrl(
                  search
                ),
            }
          : null,
    },

    message:
      "No live leisure-tourism inventory is configured yet. Verified hotel and activity partner links are provided for current availability, pricing, and booking.",
  };
}

export async function searchLeisureTourism(
  query = {}
) {
  const search =
    normalizeLeisureSearch(
      query
    );

  validateLeisureSearch(
    search
  );

  return createLeisureResult(
    search
  );
}

export {
  normalizeLeisureSearch,
};

export default {
  searchLeisureTourism,
  normalizeLeisureSearch,
  validateLeisureSearch,
  normalizeLeisureResult,
  createLeisureResult,
};
