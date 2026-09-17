import { getSupabase } from "./supabase.js";
import { searchDuffelFlights } from "./providers/duffel.js";
import { normalizeDuffelSearch } from "./flightNormalizer.js";
import { sendEmail } from "./email.js";
import { sendTelegramMessage } from "./telegram.js";

/**
 * FlyMatrix Fare Monitoring Worker.
 *
 * For each active fare_alerts row: re-searches Duffel for the same
 * route/date, finds the lowest live price, and compares it against
 * the alert's target_price (if set) or its own last_price (if not).
 * On a match, notifies by email + Telegram and marks the alert
 * 'triggered' so it won't fire again. Always records last_checked_at
 * / last_price, triggered or not, so /api/fare-alert rows aren't
 * silent forever.
 *
 * Not scheduled by anything in this codebase - call runFareMonitor()
 * from a cron trigger (Render Cron Job, GitHub Actions, cron-job.org
 * hitting the protected /api/internal/run-fare-check route, etc).
 */

function getLowestPrice(offers) {
  const priced = offers
    .map((offer) => Number(offer?.price?.amount))
    .filter((amount) => Number.isFinite(amount));

  if (!priced.length) return null;

  return Math.min(...priced);
}

async function checkOneAlert(alert) {
  const supabase = getSupabase();

  if (!alert.departure_date) {
    return { alertId: alert.id, skipped: true, reason: "no_departure_date" };
  }

  let lowestPrice = null;

  try {
    const raw = await searchDuffelFlights({
      origin: alert.origin,
      destination: alert.destination,
      departureDate: alert.departure_date,
      returnDate: null,
      passengers: 1
    });

    const normalized = normalizeDuffelSearch(raw);
    lowestPrice = getLowestPrice(normalized.offers);
  } catch (error) {
    console.error(
      `Fare check failed for alert ${alert.id}:`,
      error.message
    );

    await supabase
      .from("fare_alerts")
      .update({ last_checked_at: new Date().toISOString() })
      .eq("id", alert.id);

    return { alertId: alert.id, skipped: true, reason: "search_failed" };
  }

  const now = new Date().toISOString();

  if (lowestPrice === null) {
    await supabase
      .from("fare_alerts")
      .update({ last_checked_at: now })
      .eq("id", alert.id);

    return { alertId: alert.id, triggered: false, reason: "no_offers" };
  }

  const targetPrice = alert.target_price ? Number(alert.target_price) : null;

  const triggered =
    targetPrice !== null
      ? lowestPrice <= targetPrice
      : alert.last_price !== null && lowestPrice < Number(alert.last_price);

  await supabase
    .from("fare_alerts")
    .update({
      last_checked_at: now,
      last_price: lowestPrice,
      ...(triggered ? { status: "triggered" } : {})
    })
    .eq("id", alert.id);

  if (triggered) {
    const message =
      `FlyMatrix fare alert: ${alert.origin} -> ${alert.destination} ` +
      `on ${alert.departure_date} is now ${lowestPrice} ${alert.currency}` +
      (targetPrice !== null ? ` (target was ${targetPrice}).` : ".");

    try {
      await sendEmail({
        to: alert.email,
        subject: `Fare drop: ${alert.origin} to ${alert.destination}`,
        text: message
      });
    } catch (error) {
      console.error(
        `Email notification failed for alert ${alert.id}:`,
        error.message
      );
    }

    try {
      await sendTelegramMessage(message);
    } catch (error) {
      console.error(
        `Telegram notification failed for alert ${alert.id}:`,
        error.message
      );
    }
  }

  return { alertId: alert.id, triggered, lowestPrice };
}

export async function runFareMonitor({ limit = 50 } = {}) {
  const supabase = getSupabase();

  const { data: alerts, error } = await supabase
    .from("fare_alerts")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  const results = [];

  for (const alert of alerts || []) {
    const result = await checkOneAlert(alert);
    results.push(result);
  }

  return {
    checked: results.length,
    triggered: results.filter((r) => r.triggered).length,
    results
  };
}
