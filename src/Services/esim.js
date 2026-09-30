import {
  getTravelProvider,
  buildAffiliateUrl,
} from "./travelProviders.js";

const PROVIDER_CATEGORY = "esim";

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeEsimSearch(query = {}) {
  return {
    destination: clean(
      query.destination ||
      query.country ||
      query.region
    ),

    region: clean(
      query.region || ""
    ),

    dataNeed: clean(
      query.dataNeed ||
      query.data ||
      "any"
    ),

    duration: clean(
      query.duration ||
      query.validity ||
      "any"
    ),
  };
}

function buildProviderUrl(search) {
  return buildAffiliateUrl(
    PROVIDER_CATEGORY,
    {
      destination:
        search.destination,

      region:
        search.region,

      data:
        search.dataNeed,

      validity:
        search.duration,
    }
  );
}

export function validateEsimSearch(
  search
) {
  if (
    !search.destination &&
    !search.region
  ) {
    throw new Error(
      "An eSIM destination or region is required."
    );
  }

  return true;
}

export function normalizeEsimResult(
  packageData = {},
  search = {}
) {
  const provider =
    getTravelProvider(
      PROVIDER_CATEGORY
    );

  return {
    id:
      packageData.id ||
      packageData.packageId ||
      packageData.package_id ||
      null,

    provider:
      packageData.provider ||
      provider?.name ||
      null,

    destination:
      packageData.destination ||
      search.destination ||
      "",

    region:
      packageData.region ||
      search.region ||
      "",

    operator:
      packageData.operator ||
      packageData.network ||
      null,

    data:
      packageData.data ||
      packageData.dataAmount ||
      packageData.data_amount ||
      null,

    validity:
      packageData.validity ||
      packageData.duration ||
      null,

    price:
      packageData.price ??
      packageData.amount ??
      null,

    currency:
      packageData.currency ||
      null,

    image:
      packageData.image ||
      packageData.imageUrl ||
      null,

    source:
      packageData.source ||
      "affiliate",

    live:
      packageData.live === true,

    cached:
      packageData.cached === true,

    estimated:
      packageData.estimated === true,

    url:
      packageData.url ||
      packageData.link ||
      buildProviderUrl(search),
  };
}

export function createEsimSearchResult(
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
      "eSIM provider",

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
      "No live eSIM feed is configured. Use the provider link to check current plans, network coverage, validity, and pricing.",
  };
}

export async function searchEsim(
  query = {}
) {
  const search =
    normalizeEsimSearch(query);

  validateEsimSearch(search);

  /*
   * The existing backend does not yet contain
   * an Airalo API/data-feed integration.
   *
   * Do not fabricate eSIM plans, prices,
   * operators, or availability.
   */
  return createEsimSearchResult(
    search
  );
}

export default {
  searchEsim,
  normalizeEsimSearch,
  validateEsimSearch,
  normalizeEsimResult,
  createEsimSearchResult,
};
