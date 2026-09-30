import { config } from "../config.js";

const TRAVELPAYOUTS_BASE_URL =
  "https://api.travelpayouts.com";

const PARTNER_LINKS_URL =
  `${TRAVELPAYOUTS_BASE_URL}/links/v1/create`;

function getTravelpayoutsConfig() {
  const providerConfig =
    config?.providers?.travelpayouts || {};

  return {
    apiKey:
      providerConfig.apiKey ||
      process.env.TRAVELPAYOUTS_API_KEY ||
      process.env.TRAVELPAYOUTS_TOKEN ||
      "",

    marker:
      providerConfig.marker ||
      process.env.TRAVELPAYOUTS_MARKER ||
      "",

    baseUrl:
      providerConfig.baseUrl ||
      TRAVELPAYOUTS_BASE_URL,
  };
}

function requireApiKey() {
  const { apiKey } =
    getTravelpayoutsConfig();

  if (!apiKey) {
    throw new Error(
      "Travelpayouts API token is not configured."
    );
  }

  return apiKey;
}

function getHeaders() {
  return {
    Accept:
      "application/json",
    "Content-Type":
      "application/json",
    "X-Access-Token":
      requireApiKey(),
  };
}

async function parseResponse(response) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  return {
    raw: text,
  };
}

async function request(
  endpoint,
  options = {}
) {
  const {
    baseUrl
  } =
    getTravelpayoutsConfig();

  const response =
    await fetch(
      `${baseUrl}${endpoint}`,
      {
        ...options,
        headers: {
          ...getHeaders(),
          ...(options.headers || {}),
        },
      }
    );

  const data =
    await parseResponse(
      response
    );

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      data?.raw ||
      `Travelpayouts request failed with status ${response.status}.`;

    const error =
      new Error(message);

    error.statusCode =
      response.status;

    error.provider =
      "Travelpayouts";

    error.response =
      data;

    throw error;
  }

  return data;
}

/**
 * Return the central Travelpayouts
 * account configuration status.
 *
 * The API token authenticates the
 * Travelpayouts API.
 *
 * The marker identifies the
 * affiliate tracking account/traffic.
 */
export function getTravelpayoutsStatus() {
  const {
    apiKey,
    marker,
  } =
    getTravelpayoutsConfig();

  return {
    configured:
      Boolean(apiKey),

    hasApiKey:
      Boolean(apiKey),

    hasMarker:
      Boolean(marker),

    provider:
      "Travelpayouts",

    baseUrl:
      TRAVELPAYOUTS_BASE_URL,
  };
}

/**
 * Make an authenticated request to
 * a Travelpayouts API endpoint.
 */
export async function travelpayoutsRequest(
  endpoint,
  options = {}
) {
  return request(
    endpoint,
    options
  );
}

/**
 * Create affiliate partner links
 * through the Travelpayouts Partner
 * Links API.
 *
 * Maximum:
 * - 10 links per request
 *
 * Optional:
 * - sub_id
 */
export async function createPartnerLinks({
  trs,
  links,
  subId = null,
  shorten = false,
  marker = null,
} = {}) {
  const {
    marker:
      configuredMarker,
  } =
    getTravelpayoutsConfig();

  const activeMarker =
    marker ||
    configuredMarker;

  if (!activeMarker) {
    throw new Error(
      "Travelpayouts marker is not configured."
    );
  }

  if (!trs) {
    throw new Error(
      "Travelpayouts TRS is required."
    );
  }

  if (
    !Array.isArray(links) ||
    links.length === 0
  ) {
    throw new Error(
      "At least one partner link is required."
    );
  }

  if (links.length > 10) {
    throw new Error(
      "Travelpayouts allows a maximum of 10 links per request."
    );
  }

  const payload = {
    trs,
    marker:
      activeMarker,
    shorten:
      Boolean(shorten),
    links,
  };

  if (subId) {
    payload.sub_id =
      String(subId);
  }

  return request(
    "/links/v1/create",
    {
      method: "POST",
      body:
        JSON.stringify(
          payload
        ),
    }
  );
}

/**
 * Build a single tracked partner
 * link using the Partner Links API.
 */
export async function createPartnerLink({
  trs,
  link,
  subId = null,
  shorten = false,
  marker = null,
} = {}) {
  if (!link) {
    throw new Error(
      "Partner link URL is required."
    );
  }

  const response =
    await createPartnerLinks({
      trs,
      links: [link],
      subId,
      shorten,
      marker,
    });

  return {
    response,
    link:
      response?.links?.[0] ||
      response?.data?.links?.[0] ||
      null,
  };
}

/**
 * Return the configured affiliate
 * marker without exposing the API token.
 */
export function getAffiliateMarker() {
  const {
    marker
  } =
    getTravelpayoutsConfig();

  return (
    marker || null
  );
}

/**
 * Return configuration suitable for
 * diagnostics. Never expose the
 * actual API token.
 */
export function getSafeConfiguration() {
  const {
    apiKey,
    marker,
    baseUrl,
  } =
    getTravelpayoutsConfig();

  return {
    provider:
      "Travelpayouts",

    configured:
      Boolean(apiKey),

    hasApiKey:
      Boolean(apiKey),

    hasMarker:
      Boolean(marker),

    apiKeyPreview:
      apiKey
        ? `${apiKey.slice(
            0,
            4
          )}••••${apiKey.slice(
            -4
          )}`
        : null,

    marker:
      marker || null,

    baseUrl:
      baseUrl ||
      TRAVELPAYOUTS_BASE_URL,
  };
}

export default {
  travelpayoutsRequest,
  createPartnerLinks,
  createPartnerLink,
  getAffiliateMarker,
  getTravelpayoutsStatus,
  getSafeConfiguration,
};
