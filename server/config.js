import "dotenv/config";

export const config = {
  port: Number(
    process.env.PORT || 10000
  ),

  nodeEnv:
    process.env.NODE_ENV ||
    "development",

  frontendUrl:
    process.env.FRONTEND_URL ||
    "http://localhost:5173",

  supabase: {
    url:
      process.env.SUPABASE_URL || "",

    serviceRoleKey:
      process.env
        .SUPABASE_SERVICE_ROLE_KEY || ""
  },

  internalApiKey:
    process.env.INTERNAL_API_KEY || "",

  providers: {
    duffel: {
      apiKey:
        process.env.DUFFEL_API_KEY || "",

      baseUrl:
        process.env.DUFFEL_API_BASE_URL ||
        "https://api.duffel.com",

      version:
        process.env.DUFFEL_API_VERSION ||
        "v2"
    },

    travelpayouts: {
      apiKey:
        process.env.TRAVELPOUTS_API_KEY ||
        "",

      marker:
        process.env.TRAVELPOUTS_MARKER ||
        "",

      trs:
        process.env.TRAVELPOUTS_TRS ||
        ""
    }
  },

  paystackSecretKey:
    process.env.PAYSTACK_SECRET_KEY ||
    "",

  email: {
    apiKey:
      process.env.RESEND_API_KEY || "",

    from:
      process.env.RESEND_FROM || ""
  },

  telegram: {
    botToken:
      process.env.TELEGRAM_BOT_TOKEN ||
      "",

    chatId:
      process.env.TELEGRAM_CHAT_ID ||
      ""
  },

  weatherApiKey:
    process.env.WEATHER_API_KEY ||
    "",

  getYourGuideUrl:
    process.env.GETYOURGUIDE_URL ||
    "https://www.getyourguide.com/"
};
