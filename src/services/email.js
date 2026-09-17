import { config } from "../config.js";

export async function sendEmail({ to, subject, html, text }) {
  if (!config.email.apiKey) {
    console.warn("RESEND_API_KEY is not configured - email not sent.");
    return { sent: false, reason: "not_configured" };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.email.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.email.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {})
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Resend request failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return { sent: true, id: data.id };
}
