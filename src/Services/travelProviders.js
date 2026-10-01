import { config } from "../config.js";

import {
  getTravelpayoutsStatus,
  getSafeConfiguration,
  getAffiliateMarker,
  createPartnerLink
} from "./travelpayoutsClient.js";

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
      "https://aviasales.tpk.lv/zXqbkMmK"
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
      "https://booking.tpk.lv/zXqbkMmK"
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
      "https://getyourguide.tpk.lv/zXqbkMmK"
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
      "https://airalo.tpk.lv/SMhYBmH2"
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
      "https://airhelp.tpk.lv/vuZpde9f"
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
      "https://radicalstorage.tpk.lv/LwLfrsRU"
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
      "https://ivisa.tpk.lv/zXqbkMmK"
  }
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
  visas: "visa"
};

function normalizeCategory(category) {
  const value =
    String(category || "")
      .trim()
      .toLowerCase();

  return (
    ALIASES[value] ||
    value
  );
}

function getProvider(category) {
  const normalized =
    normalizeCategory(
      category
    );

  return (
    AFFILIATE_PROVIDERS[
      normalized
    ] || null
  );
}

function isValidProvider(
  provider
) {
  return Boolean(
    provider &&
      provider.name &&
      provider.network &&
      provider.category &&
      provider.market &&
      provider.url
  );
}

export function getTravelProvider(
  category
) {
  const provider =
    getProvider(category);

  if (
    !isValidProvider(
      provider
    )
  ) {
    return null;
  }

  return {
    ...provider
  };
}

export function getTravelProviders() {
  return Object.values(
    AFFILIATE_PROVIDERS
  ).map(
    (provider) => ({
      ...provider
    })
  );
}

export function hasTravelProvider(
  category
) {
  return Boolean(
    getTravelProvider(
      category
    )
  );
}

export function buildAffiliateUrl(
  category,
  parameters = {}
) {
  const provider =
    getTravelProvider(
      category
    );

  if (!provider) {
    return null;
  }

  try {
    const url =
      new URL(
        provider.url
      );

    Object.entries(
      parameters || {}
    ).forEach(
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

/**
 * Creates a tracked Travelpayouts
 * partner link when the provider's
 * TRS is configured.
 *
 * Falls back to the confirmed
 * partner URL when no TRS is
 * configured.
 */
export async function createTrackedAffiliateUrl(
  category,
  {
    link = null,
    subId = null,
    shorten = false
  } = {}
) {
  const provider =
    getTravelProvider(
      category
    );

  if (!provider) {
    return null;
  }

  const sourceUrl =
    link ||
    provider.url;

  if (!provider.trs) {
    return {
      url: sourceUrl,
      provider:
        provider.name,
      network:
        provider.network,
      tracked:
        false,
      method:
        "configured-partner-url"
    };
  }

  try {
    const result =
      await createPartnerLink({
        trs:
          provider.trs,
        link:
          sourceUrl,
        subId,
        shorten
      });

    return {
      url:
        result.link ||
        sourceUrl,

      provider:
        provider.name,

      network:
        provider.network,

      tracked:
        Boolean(
          result.link
        ),

      method:
        "travelpayouts-partner-links-api"
    };
  } catch (error) {
    console.error(
      "[Travelpayouts Partner Link Error]",
      {
        category,
        provider:
          provider.name,
        message:
          error?.message
      }
    );

    return {
      url:
        sourceUrl,

      provider:
        provider.name,

      network:
        provider.network,

      tracked:
        false,

      method:
        "configured-partner-url",

      warning:
        "Partner Links API failed; configured partner URL returned."
    };
  }
}

export function normalizeProviderResult(
  category,
  data = {}
) {
  const provider =
    getTravelProvider(
      category
    );

  return {
    provider:
      provider?.name ||
      null,

    network:
      provider?.network ||
      null,

    category:
      provider?.category ||
      normalizeCategory(
        category
      ),

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
      {}
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
        Boolean(
          provider.trs
        )
    })
  );
}

export function getProviderStatus() {
  const travelpayouts =
    getTravelpayoutsStatus();

  return {
    travelpayoutsConfigured:
      travelpayouts.configured,

    hasApiKey:
      travelpayouts.hasApiKey,

    hasMarker:
      travelpayouts.hasMarker,

    marker:
      getAffiliateMarker(),

    providers:
      getProviderCatalog()
  };
}

export function getProviderDiagnostics() {
  return {
    travelpayouts:
      getSafeConfiguration(),

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
            Boolean(
              provider.trs
            ),

          partnerUrlConfigured:
            Boolean(
              provider.url
            )
        })
      ),

    environment:
      config.nodeEnv
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
  getProviderDiagnostics
};
