import { config }
  from "../config.js";

export async function sendEmail({
  to,
  subject,
  html
}) {
  if (
    !config.email.apiKey ||
    !to
  ) {
    return {
      sent: false,
      reason: "not_configured"
    };
  }

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${config.email.apiKey}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          from:
            config.email.from,

          to,

          subject,

          html
        })
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "Email delivery failed."
    );
  }

  return {
    sent: true,
    id: data.id
  };
}
