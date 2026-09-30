import {
  getTravelProvider,
  buildAffiliateUrl,
} from "./travelProviders.js";

const PROVIDER_CATEGORY = "transfers";

function clean(value) {
  return String(value ?? "").trim();
}

function normalizePassengers(value) {
  const passengers = Math.max(
    Number(value || 1),
    1
  );

  return Math.min(passengers, 20);
}

function normalizeTransferSearch(
  query = {}
) {
  return {
    destination: clean(
      query.destination ||
      query.city ||
      ""
    ),

    pickup: clean(
      query.pickup ||
      query.pickupLocation ||
      query.pickup_location
    ),

    dropoff: clean(
      query.dropoff ||
      query.dropoffLocation ||
      query.dropoff_location
    ),

    date: clean(
      query.date ||
      query.transferDate ||
      query.transfer_date
    ),

    time: clean(
      query.time ||
      query.pickupTime ||
      query.pickup_time
    ),

    passengers:
      normalizePassengers(
        query.passengers ||
        query.travelers ||
        query.guests
      ),

    transferType: clean(
      query.transferType ||
      query.type ||
      "private"
    ),
  };
}

function buildProviderUrl(search) {
  /*
   * No GetTransfer affiliate link is included here because
   * an active GetTransfer affiliate URL has not been
   * established in the confirmed FlyMatrix affiliate list.
   *
   * Therefore this function intentionally returns null
   * until a verified provider link/API is configured.
   */
  void search;

  return null;
}

export function validateTransferSearch(
  search
) {
  if (!search.destination) {
    throw new Error(
      "Transfer destination is required."
    );
  }

  if (!search.pickup) {
    throw new Error(
      "Pickup location is required."
    );
  }

  if (!search.dropoff) {
    throw new Error(
      "Drop-off location is required."
    );
  }

  if (!search.date) {
    throw new Error(
      "Transfer date is required."
    );
  }

  if (!search.time) {
    throw new Error(
      "Transfer time is required."
    );
  }

  if (
    !Number.isInteger(
      search.passengers
    ) ||
    search.passengers < 1
  ) {
    throw new Error(
      "At least one passenger is required."
    );
  }

  return true;
}

export function normalizeTransferResult(
  transfer = {},
  search = {}
) {
  /*
   * Transfers currently have no confirmed
   * active provider configuration in the
   * FlyMatrix affiliate registry.
   */

  return {
    id:
      transfer.id ||
      transfer.transferId ||
      transfer.transfer_id ||
      null,

    provider:
      transfer.provider ||
      null,

    destination:
      transfer.destination ||
      search.destination ||
      "",

    pickup:
      transfer.pickup ||
      search.pickup ||
      "",

    dropoff:
      transfer.dropoff ||
      search.dropoff ||
      "",

    date:
      transfer.date ||
      search.date ||
      null,

    time:
      transfer.time ||
      search.time ||
      null,

    transferType:
      transfer.transferType ||
      transfer.type ||
      search.transferType ||
      "private",

    vehicle:
      transfer.vehicle ||
      transfer.vehicleType ||
      null,

    capacity:
      transfer.capacity ||
      transfer.maxPassengers ||
      null,

    price:
      transfer.price ??
      transfer.amount ??
      null,

    currency:
      transfer.currency ||
      null,

    source:
      transfer.source ||
      "provider",

    live:
      transfer.live === true,

    cached:
      transfer.cached === true,

    estimated:
      transfer.estimated === true,

    url:
      transfer.url ||
      transfer.link ||
      null,
  };
}

export function createTransferSearchResult(
  search
) {
  return {
    success: true,

    search,

    source: null,

    provider: null,

    live: false,

    cached: false,

    estimated: false,

    results: [],

    providerUrl:
      buildProviderUrl(search),

    message:
      "No verified transfer API or active transfer affiliate provider is configured yet.",
  };
}

export async function searchTransfers(
  query = {}
) {
  const search =
    normalizeTransferSearch(
      query
    );

  validateTransferSearch(
    search
  );

  /*
   * Do not invent transfer prices,
   * vehicles, availability, or booking URLs.
   */
  return createTransferSearchResult(
    search
  );
}

export {
  normalizeTransferSearch,
};

export default {
  searchTransfers,
  normalizeTransferSearch,
  validateTransferSearch,
  normalizeTransferResult,
  createTransferSearchResult,
};
