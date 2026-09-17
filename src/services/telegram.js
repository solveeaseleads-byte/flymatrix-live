import { config } from "../config.js";

export async function sendTelegramMessage(text, { chatId } = {}) {
  if (!config.telegram.botToken) {
    console.warn("TELEGRAM_BOT_TOKEN is not configured - message not sent.");
    return { sent: false, reason: "not_configured" };
  }
  const targetChat = chatId || config.telegram.chatId;
  if (!targetChat) {
    console.warn("TELEGRAM_CHAT_ID is not configured - message not sent.");
    return { sent: false, reason: "no_chat_id" };
  }
  const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: targetChat,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(`Telegram request failed: ${JSON.stringify(data)}`);
  }
  return { sent: true, messageId: data.result?.message_id || null };
}
