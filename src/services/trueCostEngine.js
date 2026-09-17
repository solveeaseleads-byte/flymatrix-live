const DEFAULTS = {
  currency: "USD", stopPenalty: 15, longLayoverHours: 4, veryLongLayoverHours: 8,
  overnightRiskPenalty: 25, longJourneyHours: 12, longJourneyPenalty: 20
};

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function parseDuration(duration) {
  if (typeof duration !== "string") return null;
  const match = duration.match(/^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!match) return null;
  const days = Number(match[1] || 0), hours = Number(match[2] || 0), minutes = Number(match[3] || 0);
  return days * 1440 + hours * 60 + minutes;
}

function getTotalDuration(offer) {
  const slices = Array.isArray(offer?.slices) ? offer.slices : [];
  const sliceDurations = slices.map(slice => Number.isFinite(slice.durationMinutes) ? slice.durationMinutes : parseDuration(slice.duration)).filter(value => Number.isFinite(value));
  if (!sliceDurations.length) return null;
  return sliceDurations.reduce((sum, value) => sum + value, 0);
}

function getStops(offer) {
  const slices = Array.isArray(offer?.slices) ? offer.slices : [];
  if (!slices.length) return null;
  return slices.reduce((total, slice) => {
    if (Number.isFinite(slice.stops)) return total + slice.stops;
    const segments = Array.isArray(slice.segments) ? slice.segments.length : 0;
    return total + Math.max(segments - 1, 0);
  }, 0);
}

function calculateConnectionRisk(offer) {
  const stops = getStops(offer);
  if (stops === null) return { score: null, label: "Unknown", reasons: [] };
  const reasons = [];
  let score = 0;
  if (stops === 0) return { score: 0, label: "Low", reasons: ["Non-stop itinerary"] };
  score += Math.min(stops * 20, 60);
  reasons.push(`${stops} connection${stops === 1 ? "" : "s"}`);
  const totalDuration = getTotalDuration(offer);
  if (totalDuration !== null && totalDuration > DEFAULTS.longJourneyHours * 60) {
    score += 15;
    reasons.push("Long total journey");
  }
  score = clamp(score, 0, 100);
  let label = "Low";
  if (score >= 60) label = "High"; else if (score >= 30) label = "Moderate";
  return { score, label, reasons };
}

function calculateJourneyPenalty(offer) {
  const duration = getTotalDuration(offer);
  if (duration === null) return { amount: 0, durationMinutes: null, reason: null };
  const hours = duration / 60;
  if (hours <= DEFAULTS.longJourneyHours) return { amount: 0, durationMinutes: duration, reason: null };
  return { amount: DEFAULTS.longJourneyPenalty, durationMinutes: duration, reason: `Journey exceeds ${DEFAULTS.longJourneyHours} hours` };
}

function calculateStopPenalty(offer) {
  const stops = getStops(offer);
  if (stops === null || stops === 0) return 0;
  return stops * DEFAULTS.stopPenalty;
}

function getKnownBaggageCost(offer) {
  const baggage = offer?.baggage;
  if (!baggage) return { amount: null, status: "unknown" };
  const amount = numberOrNull(baggage.totalAmount);
  if (amount === null) return { amount: null, status: "unknown" };
  return { amount, currency: baggage.currency || offer?.price?.currency || null, status: "known" };
}

export function calculateTrueCost(offer, options = {}) {
  const baseFare = numberOrNull(offer?.price?.amount);
  const currency = offer?.price?.currency || options.currency || DEFAULTS.currency;
  const baggage = getKnownBaggageCost(offer);
  const stopPenalty = calculateStopPenalty(offer);
  const journeyPenalty = calculateJourneyPenalty(offer);
  const analyticalPenalty = stopPenalty + journeyPenalty.amount;
  let knownTotal = null;
  if (baseFare !== null) knownTotal = baseFare + (baggage.amount || 0);
  let comparableCost = null;
  if (knownTotal !== null) comparableCost = knownTotal + analyticalPenalty;
  const connectionRisk = calculateConnectionRisk(offer);
  const stops = getStops(offer);
  const durationMinutes = getTotalDuration(offer);
  const confidenceFactors = [];
  if (baseFare !== null) confidenceFactors.push("Base fare supplied by provider");
  if (baggage.status === "known") confidenceFactors.push("Baggage cost supplied by provider");
  if (durationMinutes !== null) confidenceFactors.push("Journey duration available");
  if (stops !== null) confidenceFactors.push("Connection count available");
  const unknowns = [];
  if (baggage.status === "unknown") unknowns.push("Baggage cost");
  let confidence = "Low";
  if (confidenceFactors.length >= 4 && unknowns.length === 0) confidence = "High";
  else if (confidenceFactors.length >= 3) confidence = "Moderate";
  return {
    currency, baseFare,
    baggage: { amount: baggage.amount, status: baggage.status },
    analyticalAdjustments: { stopPenalty, longJourneyPenalty: journeyPenalty.amount, total: analyticalPenalty },
    knownTotal, comparableCost, durationMinutes, stops, connectionRisk,
    confidence: { level: confidence, known: confidenceFactors, unknown: unknowns },
    methodology: {
      baseFare: "Provider-supplied fare",
      baggage: "Included only when supplied by provider",
      stopPenalty: "Analytical inconvenience adjustment; not an airline fee",
      longJourneyPenalty: "Analytical journey-duration adjustment; not an airline fee",
      comparableCost: "Known monetary cost plus analytical adjustments"
    }
  };
}
