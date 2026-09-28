import { config }
  from "../config.js";

export async function sendTelegramMessage(
  text
) {
  if (
    !config.telegram.botToken ||
    !config.telegram.chatId
  ) {
    return {
      sent: false,
      reason: "not_configured"
    };
  }

  const response =
    await fetch(
      `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          chat_id:
            config.telegram.chatId,

          text,

          parse_mode: "HTML"
        })
      }
    );

  if (!response.ok) {
    throw new Error(
      "Telegram delivery failed."
    );
  }

  return {
    sent: true
  };
}
