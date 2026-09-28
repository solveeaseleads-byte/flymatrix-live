import {
  getSupabase
} from "./supabase.js";

import {
  searchDuffelFlights
} from "./duffel.js";

import {
  sendEmail
} from "./resend.js";

import {
  sendTelegramMessage
} from "./telegram.js";

export async function runFareMonitor() {
  const supabase =
    getSupabase();

  const {
    data: alerts,
    error
  } =
    await supabase
      .from("fare_alerts")
      .select("*")
      .eq("status", "active");

  if (error) {
    throw error;
  }

  let checked = 0;
  let triggered = 0;

  for (const alert of alerts || []) {
    checked++;

    try {
      const offers =
        await searchDuffelFlights({
          origin:
            alert.origin,

          destination:
            alert.destination,

          departureDate:
            alert.departure_date,

          returnDate:
            alert.return_date,

          passengers:
            alert.passengers || 1,

          cabin:
            alert.cabin ||
            "economy"
        });

      const prices =
        offers
          .map(
            (offer) =>
              Number(
                offer?.price?.amount
              )
          )
          .filter(
            Number.isFinite
          );

      if (!prices.length) {
        continue;
      }

      const lowest =
        Math.min(...prices);

      await supabase
        .from("fare_alerts")
        .update({
          last_checked_at:
            new Date().toISOString(),

          last_price:
            lowest
        })
        .eq(
          "id",
          alert.id
        );

      if (
        lowest <=
        Number(
          alert.target_price
        )
      ) {
        triggered++;

        await supabase
          .from("fare_alerts")
          .update({
            status:
              "triggered"
          })
          .eq(
            "id",
            alert.id
          );

        await sendEmail({
          to: alert.email,

          subject:
            "FlyMatrix fare alert",

          html: `
            <p>Your fare target was reached.</p>
            <p>
              ${alert.origin}
              →
              ${alert.destination}
            </p>
            <p>
              Price: ${lowest}
            </p>
          `
        });

        await sendTelegramMessage(
          `<b>FlyMatrix fare alert</b>\n` +
          `${alert.origin} → ${alert.destination}\n` +
          `Price: ${lowest}`
        );
      }
    } catch {
      // One failed alert must not stop the monitor.
    }
  }

  return {
    checked,
    triggered
  };
}
