import { config } from "../../config.js";

/**
 * Converts a raw brand URL into a Travelpayouts-tracked partner link.
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/25289759198226
 *
 * Only works for brands actually connected to your Travelpayouts
 * account - if the brand isn't recognized, Travelpayouts still
 * returns success but the link won't carry real tracking. Falls
 * back to the raw URL on any failure so callers never get a broken
 * link, just an untracked one.
 */
export async function convertToTrackedLink(rawUrl, subId = null) {
  const { marker, trs } = config.providers.travelpayoutsLinks;

  if (!marker || !trs) {
    console.warn("TRAVELPAYOUTS_MARKER/TRS not configured - returning raw URL.");
    return rawUrl;
  }

  try {
    const response = await fetch("https://api.travelpayouts.com/links/v1/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": config.providers.flightApiKey
      },
      body: JSON.stringify({
        trs: Number(trs),
        marker: Number(marker),
        shorten: false,
        links: [{ url: rawUrl, ...(subId ? { sub_id: subId } : {}) }]
      })
    });

    const data = await response.json();
    const converted = data?.result?.links?.[0]?.partner_url;

    return converted || rawUrl;

  } catch (error) {
    console.error("Travelpayouts link conversion failed:", error);
    return rawUrl;
  }
}
