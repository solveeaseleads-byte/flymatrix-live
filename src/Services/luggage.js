import {
  getTravelProvider,
  buildAffiliateUrl,
} from "./travelProviders.js";

const PROVIDER_CATEGORY = "luggage";

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeLuggageSearch(query = {}) {
  return {
    destination: clean(
      query.destination ||
      query.city ||
      ""
    ),

    location: clean(
      query.location ||
      query.storageLocation ||
      query.storage_location ||
      ""
    ),

    date: clean(
      query.date ||
      query.storageDate ||
      query.storage_date ||
      ""
    ),

    startDate: clean(
      query.startDate ||
      query.start_date ||
      ""
    ),

    endDate: clean(
      query.endDate ||
      query.end_date ||
      ""
    ),

    bags: Math.min(
      Math.max(
        Number(
          query.bags ||
          query.quantity ||
          1
        ),
        1
      ),
      20
    ),
  };
}

function buildProviderUrl(search) {
  const provider =
    getTravelProvider(
      PROVIDER_CATEGORY
    );

  if (!provider) {
    return null;
  }

  return buildAffiliateUrl(
    PROVIDER_CATEGORY,
    {
      destination:
        search.destination,
      city:
        search.destination,
      location:
        search.location,
      date:
        search.date ||
        search.startDate,
      bags:
        search.bags,
    }
  );
}

export function validateLuggageSearch(
  search
) {
  if (!search.destination) {
    throw new Error(
      "Luggage storage destination is required."
    );
  }

  if (
    !search.location &&
    !search.destination
  ) {
    throw new Error(
      "Luggage storage location is required."
    );
  }

  if (
    !search.date &&
    !search.startDate
  ) {
    throw new Error(
      "Luggage storage date is required."
    );
  }

  if (
    !Number.isInteger(
      search.bags
    ) ||
    search.bags < 1
  ) {
    throw new Error(
      "At least one bag is required."
    );
  }

  return true;
}

export function normalizeLuggageResult(
  luggage = {},
  search = {}
) {
  return {
    id:
      luggage.id ||
      luggage.storageId ||
      luggage.storage_id ||
      null,

    provider:
      luggage.provider ||
      getTravelProvider(
        PROVIDER_CATEGORY
      )?.name ||
      null,

    name:
      luggage.name ||
      luggage.title ||
      luggage.locationName ||
      "Luggage storage",

    destination:
      luggage.destination ||
      search.destination ||
      "",

    location:
      luggage.location ||
      luggage.address ||
      search.location ||
      "",

    address:
      luggage.address ||
      null,

    distance:
      luggage.distance ||
      luggage.distanceKm ||
      null,

    date:
      luggage.date ||
      search.date ||
      search.startDate ||
      null,

    startDate:
      luggage.startDate ||
      search.startDate ||
      null,

    endDate:
      luggage.endDate ||
      search.endDate ||
      null,

    bags:
      luggage.bags ||
      search.bags ||
      1,

    price:
      luggage.price ??
      luggage.amount ??
      null,

    currency:
      luggage.currency ||
      null,

    rating:
      luggage.rating ??
      null,

    reviews:
      luggage.reviews ??
      luggage.reviewCount ??
      null,

    source:
      luggage.source ||
      "provider",

    live:
      luggage.live === true,

    cached:
      luggage.cached === true,

    estimated:
      luggage.estimated === true,

    url:
      luggage.url ||
      luggage.link ||
      null,
  };
}

export function createLuggageSearchResult(
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
      null,

    provider:
      provider?.name ||
      null,

    network:
      provider?.network ||
      null,

    live: false,

    cached: false,

    estimated: false,

    results: [],

    providerUrl:
      buildProviderUrl(search),

    message:
      "No live luggage-storage feed is configured yet. Use the verified Radical Storage partner link to continue with current availability and pricing.",
  };
}

export async function searchLuggage(
  query = {}
) {
  const search =
    normalizeLuggageSearch(
      query
    );

  validateLuggageSearch(
    search
  );

  return createLuggageSearchResult(
    search
  );
}

export {
  normalizeLuggageSearch,
};

export default {
  searchLuggage,
  normalizeLuggageSearch,
  validateLuggageSearch,
  normalizeLuggageResult,
  createLuggageSearchResult,
};
