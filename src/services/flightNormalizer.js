function safeArray(value) { return Array.isArray(value) ? value : []; }

function getDurationMinutes(duration) {
  if (!duration || typeof duration !== "string") return null;
  const match = duration.match(/^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!match) return null;
  const days = Number(match[1] || 0), hours = Number(match[2] || 0), minutes = Number(match[3] || 0);
  return days * 1440 + hours * 60 + minutes;
}

function normalizeSegment(segment) {
  return {
    id: segment.id || null,
    marketingCarrier: { code: segment.marketing_carrier?.iata_code || null, name: segment.marketing_carrier?.name || null },
    operatingCarrier: { code: segment.operating_carrier?.iata_code || null, name: segment.operating_carrier?.name || null },
    flightNumber: segment.marketing_carrier_flight_number || null,
    origin: { code: segment.origin?.iata_code || null, name: segment.origin?.name || null },
    destination: { code: segment.destination?.iata_code || null, name: segment.destination?.name || null },
    departingAt: segment.departing_at || null,
    arrivingAt: segment.arriving_at || null,
    duration: segment.duration || null,
    durationMinutes: getDurationMinutes(segment.duration)
  };
}

function normalizeSlice(slice) {
  const segments = safeArray(slice?.segments).map(normalizeSegment);
  return {
    origin: slice?.origin?.iata_code || null,
    destination: slice?.destination?.iata_code || null,
    duration: slice?.duration || null,
    durationMinutes: getDurationMinutes(slice?.duration),
    segments,
    stops: Math.max(segments.length - 1, 0)
  };
}

export function normalizeDuffelOffer(offer) {
  const slices = safeArray(offer?.slices).map(normalizeSlice);
  const firstSegment = slices[0]?.segments?.[0] || null;
  const lastSlice = slices[slices.length - 1];
  const lastSegment = lastSlice?.segments?.[lastSlice.segments.length - 1] || null;
  return {
    id: offer?.id || null,
    provider: "duffel",
    liveMode: offer?.live_mode === true,
    price: { amount: Number(offer?.total_amount) || null, currency: offer?.total_currency || null },
    expiresAt: offer?.expires_at || null,
    owner: { code: offer?.owner?.iata_code || null, name: offer?.owner?.name || null },
    airline: {
      code: firstSegment?.operatingCarrier?.code || offer?.owner?.iata_code || null,
      name: firstSegment?.operatingCarrier?.name || offer?.owner?.name || null
    },
    departure: firstSegment?.departingAt || null,
    arrival: lastSegment?.arrivingAt || null,
    slices
  };
}

export function normalizeDuffelSearch(data) {
  const offers = safeArray(data?.data?.offers);
  return {
    provider: "duffel",
    requestId: data?.data?.id || null,
    liveMode: data?.data?.live_mode === true,
    offers: offers.map(normalizeDuffelOffer)
  };
}

function normalizeTravelpayoutsOffer(item) {
  return {
    id: null, provider: "travelpayouts", liveMode: false,
    price: { amount: item.price ?? null, currency: item.currency || null },
    expiresAt: null,
    owner: { code: null, name: null },
    airline: { code: null, name: null },
    departure: item.departureDate || null,
    arrival: null,
    link: item.link || null,
    slices: [{ origin: item.origin || null, destination: item.destination || null, duration: null, durationMinutes: null, segments: [], stops: null }]
  };
}

export function normalizeTravelpayoutsSearch({ results = [] } = {}) {
  return { provider: "travelpayouts", requestId: null, liveMode: false, offers: results.map(normalizeTravelpayoutsOffer) };
}
