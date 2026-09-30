import {
  getTravelProvider,
  buildAffiliateUrl,
} from "./travelProviders.js";

const PROVIDER_CATEGORY = "assistance";

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeAssistanceSearch(
  query = {}
) {
  return {
    origin: clean(
      query.origin ||
      query.departure ||
      query.from ||
      ""
    ),

    destination: clean(
      query.destination ||
      query.arrival ||
      query.to ||
      ""
    ),

    departureDate: clean(
      query.departureDate ||
      query.departure_date ||
      query.date ||
      ""
    ),

    returnDate: clean(
      query.returnDate ||
      query.return_date ||
      ""
    ),

    passengers: Math.min(
      Math.max(
        Number(
          query.passengers ||
          query.travelers ||
          1
        ),
        1
      ),
      20
    ),

    service: clean(
      query.service ||
      query.type ||
      "flight assistance"
    ),
  };
}

function buildProviderUrl(
  search
) {
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
      origin:
        search.origin,

      destination:
        search.destination,

      departureDate:
        search.departureDate,

      returnDate:
        search.returnDate,

      passengers:
        search.passengers,

      service:
        search.service,
    }
  );
}

export function validateAssistanceSearch(
  search
) {
  if (
    !search.origin &&
    !search.destination
  ) {
    throw new Error(
      "Origin or destination is required."
    );
  }

  if (
    !Number.isInteger(
      search.passengers
    ) ||
    search.passengers < 1
  ) {
    throw new Error(
      "At least one passenger is required."
    );
  }

  return true;
}

export function normalizeAssistanceResult(
  item = {},
  search = {}
) {
  return {
    id:
      item.id ||
      item.assistanceId ||
      item.assistance_id ||
      null,

    provider:
      item.provider ||
      getTravelProvider(
        PROVIDER_CATEGORY
      )?.name ||
      null,

    service:
      item.service ||
      item.type ||
      search.service ||
      "flight assistance",

    origin:
      item.origin ||
      search.origin ||
      "",

    destination:
      item.destination ||
      search.destination ||
      "",

    departureDate:
      item.departureDate ||
      search.departureDate ||
      null,

    returnDate:
      item.returnDate ||
      search.returnDate ||
      null,

    passengers:
      item.passengers ||
      search.passengers ||
      1,

    price:
      item.price ??
      item.amount ??
      null,

    currency:
      item.currency ||
      null,

    description:
      item.description ||
      "",

    source:
      item.source ||
      "provider",

    live:
      item.live === true,

    cached:
      item.cached === true,

    estimated:
      item.estimated === true,

    url:
      item.url ||
      item.link ||
      null,
  };
}

export function createAssistanceResult(
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
      "No live assistance inventory is configured yet. Use the verified AirHelp partner link for current assistance services and availability.",
  };
}

export async function searchAssistance(
  query = {}
) {
  const search =
    normalizeAssistanceSearch(
      query
    );

  validateAssistanceSearch(
    search
  );

  return createAssistanceResult(
    search
  );
}

export {
  normalizeAssistanceSearch,
};

export default {
  searchAssistance,
  normalizeAssistanceSearch,
  validateAssistanceSearch,
  normalizeAssistanceResult,
  createAssistanceResult,
};
