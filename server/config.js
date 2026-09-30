import "dotenv/config";

function getEnv(
  name,
  fallback = ""
) {
  const value =
    process.env[name];

  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  return String(value).trim();
}

function getBoolean(
  name,
  fallback = false
) {
  const value =
    getEnv(name);

  if (!value) {
    return fallback;
  }

  return [
    "true",
    "1",
    "yes",
    "on"
  ].includes(
    value.toLowerCase()
  );
}

function getNumber(
  name,
  fallback
) {
  const value =
    Number(
      getEnv(name)
    );

  return Number.isFinite(value)
    ? value
    : fallback;
}

const travelpayoutsApiKey =
  getEnv(
    "TRAVELPAYOUTS_API_KEY"
  ) ||
  getEnv(
    "TRAVELPAYOUTS_TOKEN"
  );

const travelpayoutsMarker =
  getEnv(
    "TRAVELPAYOUTS_MARKER"
  );

export const config = {
  nodeEnv:
    getEnv(
      "NODE_ENV",
      "development"
    ),

  port:
    getNumber(
      "PORT",
      3000
    ),

  /*
   * ------------------------------------------------------
   * Supabase
   * ------------------------------------------------------
   */
  supabase: {
    url:
      getEnv(
        "SUPABASE_URL"
      ),

    serviceRoleKey:
      getEnv(
        "SUPABASE_SERVICE_ROLE_KEY"
      ),

    anonKey:
      getEnv(
        "SUPABASE_ANON_KEY"
      )
  },

  /*
   * ------------------------------------------------------
   * Travelpayouts
   * ------------------------------------------------------
   *
   * One central API token and marker.
   *
   * Individual TRS values belong to the connected
   * provider/program where required.
   */
  providers: {
    travelpayouts: {
      apiKey:
        travelpayoutsApiKey,

      token:
        travelpayoutsApiKey,

      marker:
        travelpayoutsMarker,

      baseUrl:
        getEnv(
          "TRAVELPAYOUTS_BASE_URL",
          "https://api.travelpayouts.com"
        ),

      brands: {
        aviasales: {
          trs:
            getEnv(
              "TRAVELPAYOUTS_AVIASALES_TRS"
            )
        },

        booking: {
          trs:
            getEnv(
              "TRAVELPAYOUTS_BOOKING_TRS"
            )
        },

        getyourguide: {
          trs:
            getEnv(
              "TRAVELPAYOUTS_GETYOURGUIDE_TRS"
            )
        },

        airalo: {
          trs:
            getEnv(
              "TRAVELPAYOUTS_AIRALO_TRS"
            )
        },

        airhelp: {
          trs:
            getEnv(
              "TRAVELPAYOUTS_AIRHELP_TRS"
            )
        },

        radicalStorage: {
          trs:
            getEnv(
              "TRAVELPAYOUTS_RADICAL_STORAGE_TRS"
            )
        },

        ivisa: {
          trs:
            getEnv(
              "TRAVELPAYOUTS_IVISA_TRS"
            )
        }
      }
    },

    /*
     * ----------------------------------------------------
     * Duffel
     * ----------------------------------------------------
     */
    duffel: {
      apiKey:
        getEnv(
          "DUFFEL_API_KEY"
        )
    }
  },

  /*
   * ------------------------------------------------------
   * Paystack
   * ------------------------------------------------------
   */
  paystack: {
    secretKey:
      getEnv(
        "PAYSTACK_SECRET_KEY"
      ),

    publicKey:
      getEnv(
        "PAYSTACK_PUBLIC_KEY"
      )
  },

  /*
   * ------------------------------------------------------
   * Email
   * ------------------------------------------------------
   */
  resend: {
    apiKey:
      getEnv(
        "RESEND_API_KEY"
      ),

    fromEmail:
      getEnv(
        "RESEND_FROM_EMAIL"
      )
  },

  /*
   * ------------------------------------------------------
   * Telegram
   * ------------------------------------------------------
   */
  telegram: {
    botToken:
      getEnv(
        "TELEGRAM_BOT_TOKEN"
      ),

    chatId:
      getEnv(
        "TELEGRAM_CHAT_ID"
      )
  },

  /*
   * ------------------------------------------------------
   * Security
   * ------------------------------------------------------
   */
  security: {
    sessionSecret:
      getEnv(
        "SESSION_SECRET"
      ),

    webhookSecret:
      getEnv(
        "WEBHOOK_SECRET"
      )
  },

  /*
   * ------------------------------------------------------
   * Feature flags
   * ------------------------------------------------------
   */
  features: {
    liveTravelpayouts:
      getBoolean(
        "ENABLE_LIVE_TRAVELPAYOUTS",
        true
      ),

    liveFlightSearch:
      getBoolean(
        "ENABLE_LIVE_FLIGHT_SEARCH",
        true
      ),

    affiliateTracking:
      getBoolean(
        "ENABLE_AFFILIATE_TRACKING",
        true
      )
  }
};

export function isProduction() {
  return (
    config.nodeEnv ===
    "production"
  );
}

export function isDevelopment() {
  return (
    config.nodeEnv ===
    "development"
  );
}

export function hasSupabaseConfig() {
  return Boolean(
    config.supabase.url &&
    config.supabase.serviceRoleKey
  );
}

export function hasTravelpayoutsConfig() {
  return Boolean(
    config.providers
      .travelpayouts
      .apiKey
  );
}

export function hasTravelpayoutsMarker() {
  return Boolean(
    config.providers
      .travelpayouts
      .marker
  );
}

export function getTravelpayoutsBrand(
  brand
) {
  const brands =
    config.providers
      .travelpayouts
      .brands;

  if (
    !brand ||
    !brands
  ) {
    return null;
  }

  const key =
    String(brand)
      .trim()
      .toLowerCase();

  return (
    brands[key] ||
    null
  );
}

export default config;
