const AFFILIATE_PROVIDERS = {
  flights: {
    name: "Aviasales",
    network: "Travelpayouts",
    category: "flights",
    market: "GLOBAL",
    trs:
      process.env.TRAVELPAYOUTS_AVIASALES_TRS ||
      null,
    url:
      "https://aviasales.tpk.lv/zXqbkMmK",
  },

  hotels: {
    name: "Booking.com",
    network: "Travelpayouts",
    category: "hotels",
    market: "GLOBAL",
    trs:
      process.env.TRAVELPAYOUTS_BOOKING_TRS ||
      null,
    url:
      "https://booking.tpk.lv/zXqbkMmK",
  },

  activities: {
    name: "GetYourGuide",
    network: "Travelpayouts",
    category: "activities",
    market: "GLOBAL",
    trs:
      process.env.TRAVELPAYOUTS_GETYOURGUIDE_TRS ||
      null,
    url:
      "https://getyourguide.tpk.lv/zXqbkMmK",
  },

  esim: {
    name: "Airalo",
    network: "Travelpayouts",
    category: "esim",
    market: "GLOBAL",
    trs:
      process.env.TRAVELPAYOUTS_AIRALO_TRS ||
      null,
    url:
      "https://airalo.tpk.lv/SMhYBmH2",
  },

  assistance: {
    name: "AirHelp",
    network: "Travelpayouts",
    category: "assistance",
    market: "GLOBAL",
    trs:
      process.env.TRAVELPAYOUTS_AIRHELP_TRS ||
      null,
    url:
      "https://airhelp.tpk.lv/vuZpde9f",
  },

  luggage: {
    name: "Radical Storage",
    network: "Travelpayouts",
    category: "luggage",
    market: "GLOBAL",
    trs:
      process.env.TRAVELPAYOUTS_RADICAL_STORAGE_TRS ||
      null,
    url:
      "https://radicalstorage.tpk.lv/LwLfrsRU",
  },

  visa: {
    name: "iVisa",
    network: "Travelpayouts",
    category: "visa",
    market: "GLOBAL",
    trs:
      process.env.TRAVELPAYOUTS_IVISA_TRS ||
      null,
    url:
      "https://ivisa.tpk.lv/zXqbkMmK",
  },
};

const ALIASES = {
  flight: "flights",
  flights: "flights",

  hotel: "hotels",
  hotels: "hotels",
  accommodation: "hotels",

  activity: "activities",
  activities: "activities",
  tour: "activities",
  tours: "activities",
  experience: "activities",
  experiences: "activities",

  esim: "esim",
  connectivity: "esim",

  assistance: "assistance",
  support: "assistance",

  luggage: "luggage",
  baggage: "luggage",
  storage: "luggage",

  visa: "visa",
  visas: "visa",
};

function normalizeCategory(category) {
  const value =
    String(category || "")
      .trim()
      .toLowerCase();

  return ALIASES[value] || value;
}

function getProvider(category) {
  const normalized =
    normalizeCategory(category);

  return (
    AFFILIATE_PROVIDERS[
      normalized
    ] || null
  );
}

function isValidProvider(provider) {
  return Boolean(
    provider &&
      provider.name &&
      provider.network &&
      provider.category &&
      provider.market &&
      provider.url
  );
}

export function getTravelProvider(category) {
  const provider =
    getProvider(category);

  if (
    !isValidProvider(provider)
  ) {
    return null;
  }

  return {
    ...provider,
  };
}

export function getTravelProviders() {
  return Object.values(
    AFFILIATE_PROVIDERS
  ).map((provider) => ({
    ...provider,
  }));
}

export function hasTravelProvider(category) {
  return Boolean(
    getTravelProvider(category)
  );
}

export function buildAffiliateUrl(
  category,
  parameters = {}
) {
  const provider =
    getTravelProvider(category);

  if (!provider) {
    return null;
  }

  try {
    const url =
      new URL(provider.url);

    Object.entries(
      parameters || {}
    ).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      url.searchParams.set(
        key,
        String(value)
      );
    });

    return url.toString();
  } catch {
    return provider.url;
  }
}

export async function createTrackedAffiliateUrl(
  category,
  {
    link = null,
    subId = null,
    shorten = false,
  } = {}
) {
  const provider =
    getTravelProvider(category);

  if (!provider) {
    return null;
  }

  /*
   * The full Travelpayouts Partner Links
   * API is not configured in this project.
   *
   * Therefore we safely return the verified
   * configured partner URL instead of
   * attempting an unavailable API call.
   */

  void subId;
  void shorten;

  return {
    url:
      link ||
      provider.url,

    provider:
      provider.name,

    network:
      provider.network,

    tracked: false,

    method:
      "configured-partner-url",
  };
}

export function normalizeProviderResult(
  category,
  data = {}
) {
  const provider =
    getTravelProvider(category);

  return {
    provider:
      provider?.name ||
      null,

    network:
      provider?.network ||
      null,

    category:
      provider?.category ||
      normalizeCategory(category),

    market:
      provider?.market ||
      "GLOBAL",

    source:
      data.source ||
      "affiliate",

    live:
      data.live === true,

    cached:
      data.cached === true,

    estimated:
      data.estimated === true,

    name:
      data.name ||
      data.title ||
      provider?.name ||
      "Travel provider",

    url:
      data.url ||
      provider?.url ||
      null,

    price:
      data.price ??
      null,

    currency:
      data.currency ||
      null,

    metadata:
      data.metadata ||
      {},
  };
}

export function getProviderCatalog() {
  return getTravelProviders().map(
    (provider) => ({
      name:
        provider.name,

      network:
        provider.network,

      category:
        provider.category,

      market:
        provider.market,

      url:
        provider.url,

      trsConfigured:
        Boolean(provider.trs),
    })
  );
}

export function getProviderStatus() {
  const providers =
    getProviderCatalog();

  return {
    travelpayoutsConfigured:
      providers.some(
        (provider) =>
          provider.trsConfigured
      ),

    hasApiKey: false,

    hasMarker: false,

    marker: null,

    providers,
  };
}

export function getProviderDiagnostics() {
  return {
    travelpayouts: {
      configured: true,
      apiAvailable: false,
      partnerLinksApiConfigured: false,
      markerConfigured: false,
    },

    providers:
      getTravelProviders().map(
        (provider) => ({
          name:
            provider.name,

          category:
            provider.category,

          market:
            provider.market,

          trsConfigured:
            Boolean(provider.trs),

          partnerUrlConfigured:
            Boolean(provider.url),
        })
      ),

    environment:
      process.env.NODE_ENV ||
      "production",
  };
}

export default {
  getTravelProvider,
  getTravelProviders,
  hasTravelProvider,
  buildAffiliateUrl,
  createTrackedAffiliateUrl,
  normalizeProviderResult,
  getProviderCatalog,
  getProviderStatus,
  getProviderDiagnostics,
};
