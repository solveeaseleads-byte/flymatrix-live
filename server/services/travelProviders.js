import { config } from "../config.js";

/*
 * FlyMatrix Travel Provider Registry
 *
 * This module is intentionally separate from the existing:
 * - travelpayouts.js
 * - affiliateTracking.js
 * - bookingRouter.js
 *
 * It provides one normalized provider configuration layer for
 * non-flight travel services.
 */

const AFFILIATE_PROVIDERS = {
  flights: {
    name: "Aviasales",
    network: "Travelpayouts",
    category: "flights",
    market: "GLOBAL",
    url: "https://aviasales.tpk.lv/zXqbkMmK",
  },

  hotels: {
    name: "Booking.com",
    network: "Travelpayouts",
    category: "hotels",
    market: "GLOBAL",
    url: "https://booking.tpk.lv/zXqbkMmK",
  },

  activities: {
    name: "GetYourGuide",
    network: "Travelpayouts",
    category: "activities",
    market: "GLOBAL",
    url: "https://getyourguide.tpk.lv/zXqbkMmK",
  },

  esim: {
    name: "Airalo",
    network: "Travelpayouts",
    category: "esim",
    market: "GLOBAL",
    url: "https://airalo.tpk.lv/SMhYBmH2",
  },

  assistance: {
    name: "AirHelp",
    network: "Travelpayouts",
    category: "assistance",
    market: "GLOBAL",
    url: "https://airhelp.tpk.lv/vuZpde9f",
  },

  luggage: {
    name: "Radical Storage",
    network: "Travelpayouts",
    category: "luggage",
    market: "GLOBAL",
    url: "https://radicalstorage.tpk.lv/LwLfrsRU",
  },

  visa: {
    name: "iVisa",
    network: "Travelpayouts",
    category: "visa",
    market: "GLOBAL",
    url: "https://ivisa.tpk.lv/zXqbkMmK",
  },
};

/*
 * Provider aliases allow frontend/backend requests to use
 * either the service name or a common alias.
 */
const ALIASES = {
  flight: "flights",
  flights: "flights",

  hotel: "hotels",
  hotels: "hotels",
  accommodation: "hotels",

  activity: "activities",
  activities: "activities",
  tours: "activities",
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
    AFFILIATE_PROVIDERS[normalized] ||
    null
  );
}

function isValidProvider(provider) {
  return Boolean(
    provider &&
    provider.name &&
    provider.category &&
    provider.market &&
    provider.url
  );
}

/*
 * Build a provider record without exposing private
 * credentials or environment variables.
 */
export function getTravelProvider(category) {
  const provider =
    getProvider(category);

  if (!isValidProvider(provider)) {
    return null;
  }

  return {
    ...provider,
  };
}

/*
 * Return all configured providers.
 */
export function getTravelProviders() {
  return Object.values(
    AFFILIATE_PROVIDERS
  ).map((provider) => ({
    ...provider,
  }));
}

/*
 * Return providers for a particular service.
 */
export function hasTravelProvider(category) {
  return Boolean(
    getTravelProvider(category)
  );
}

/*
 * Construct an affiliate URL while preserving the
 * original tracking link.
 *
 * Additional query parameters are appended only when
 * supplied by the caller.
 */
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

    Object.entries(parameters || {}).forEach(
      ([key, value]) => {
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
      }
    );

    return url.toString();
  } catch {
    return provider.url;
  }
}

/*
 * Create a normalized provider response.
 */
export function normalizeProviderResult(
  category,
  data = {}
) {
  const provider =
    getTravelProvider(category);

  return {
    provider: provider?.name || null,

    network:
      provider?.network || null,

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
      buildAffiliateUrl(category),

    price:
      data.price ??
      null,

    currency:
      data.currency ||
      null,

    metadata:
      data.metadata || {},
  };
}

/*
 * Generate a provider catalog suitable for API responses.
 */
export function getProviderCatalog() {
  return getTravelProviders().map(
    (provider) => ({
      name: provider.name,
      network: provider.network,
      category: provider.category,
      market: provider.market,
      url: provider.url,
    })
  );
}

/*
 * Optional configuration visibility.
 *
 * This intentionally reports only whether the relevant
 * Travelpayouts configuration exists. It never returns
 * API keys or secrets.
 */
export function getProviderStatus() {
  const travelpayoutsConfigured =
    Boolean(
      config?.providers
        ?.travelpayouts
        ?.apiKey
    );

  return {
    travelpayoutsConfigured,
    providers:
      getProviderCatalog(),
  };
}

export default {
  getTravelProvider,
  getTravelProviders,
  hasTravelProvider,
  buildAffiliateUrl,
  normalizeProviderResult,
  getProviderCatalog,
  getProviderStatus,
};
