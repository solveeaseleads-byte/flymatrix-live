import "dotenv/config";

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not configured.`);
  }
}

export const config = {
  port: Number(process.env.PORT || 10000),

  nodeEnv: process.env.NODE_ENV || "development",

  frontendUrl:
    process.env.FRONTEND_URL || "http://localhost:3000",

  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
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
        process.env.DUFFEL_API_VERSION || "v2"
    },

    flightApiKey:
      process.env.FLIGHT_API_KEY || "",

    flightApiBaseUrl:
      process.env.FLIGHT_API_BASE_URL || "",

    fxApiKey:
      process.env.FX_API_KEY || "",

    fxApiBaseUrl:
      process.env.FX_API_BASE_URL || ""
  },

  paystackSecretKey:
    process.env.PAYSTACK_SECRET_KEY || "",

  email: {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.RESEND_FROM || "FlyMatrix <alerts@flymatrix.app>"
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || ""
  }
};
