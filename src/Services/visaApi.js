const API_BASE = "/api";

function clean(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function normalizeVisaQuery(
  query = {}
) {
  return {
    nationality: clean(
      query.nationality ||
        query.citizenship ||
        query.passportCountry
    ),

    destination: clean(
      query.destination ||
        query.destinationCountry ||
        query.country
    ),

    purpose: clean(
      query.purpose ||
        query.travelPurpose ||
        "tourism"
    ),

    passportType: clean(
      query.passportType ||
        query.passport ||
        "ordinary"
    ),

    residenceCountry: clean(
      query.residenceCountry ||
        query.residence
    ),

    departureDate: clean(
      query.departureDate ||
        query.travelDate
    ),
  };
}

function encodeParams(
  values
) {
  const params =
    new URLSearchParams();

  Object.entries(values).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      params.set(
        key,
        String(value)
      );
    }
  );

  return params;
}

async function parseResponse(
  response
) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  try {
    return JSON.parse(
      text
    );
  } catch {
    return {
      message: text,
    };
  }
}

export function normalizeVisaResult(
  response,
  query = {}
) {
  const data =
    response || {};

  const normalizedQuery =
    normalizeVisaQuery(
      query
    );

  const rawStatus = clean(
    data.status ||
      data.visaStatus ||
      data.visa_status ||
      data.result ||
      data.requirement ||
      data.requirements
  ).toLowerCase();

  let status =
    rawStatus;

  if (
    [
      "visa_free",
      "visa-free",
      "visafree",
      "free",
    ].includes(
      rawStatus
    )
  ) {
    status = "visa-free";
  } else if (
    [
      "visa_on_arrival",
      "visa-on-arrival",
      "on_arrival",
      "arrival",
    ].includes(
      rawStatus
    )
  ) {
    status =
      "visa-on-arrival";
  } else if (
    [
      "evisa",
      "e-visa",
      "electronic visa",
    ].includes(
      rawStatus
    )
  ) {
    status = "e-visa";
  } else if (
    [
      "visa_required",
      "visa-required",
      "required",
    ].includes(
      rawStatus
    )
  ) {
    status =
      "visa-required";
  }

  return {
    ...data,

    status,

    statusLabel:
      clean(
        data.statusLabel ||
          data.status_label ||
          data.label
      ) ||
      getStatusLabel(
        status
      ),

    nationality:
      data.nationality ||
      normalizedQuery.nationality,

    destination:
      data.destination ||
      normalizedQuery.destination,

    purpose:
      data.purpose ||
      normalizedQuery.purpose,

    passportType:
      data.passportType ||
      data.passport_type ||
      normalizedQuery.passportType,

    summary:
      clean(
        data.summary ||
          data.description ||
          data.message
      ),

    requirements:
      normalizeList(
        data.requirements ||
          data.documents ||
          data.documentRequirements
      ),

    documents:
      normalizeList(
        data.documents ||
          data.requiredDocuments
      ),

    notes:
      normalizeList(
        data.notes ||
          data.importantNotes
      ),

    processingTime:
      clean(
        data.processingTime ||
          data.processing_time
      ),

    validity:
      clean(
        data.validity ||
          data.validFor
      ),

    source:
      clean(
        data.source ||
          data.provider
      ),

    sourceUrl:
      data.sourceUrl ||
      data.source_url ||
      data.url ||
      null,

    checkedAt:
      data.checkedAt ||
      data.checked_at ||
      new Date().toISOString(),

    raw: data,
  };
}

function normalizeList(
  value
) {
  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        (item) =>
          typeof item ===
          "string"
            ? item.trim()
            : item?.name ||
              item?.label ||
              item?.description ||
              ""
      )
      .filter(Boolean);
  }

  if (
    typeof value ===
    "string"
  ) {
    return value
      .split(/\r?\n|,/)
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);
  }

  return [];
}

function getStatusLabel(
  status
) {
  switch (status) {
    case "visa-free":
      return "Visa-free";

    case "visa-on-arrival":
      return "Visa on arrival";

    case "e-visa":
      return "eVisa / electronic visa";

    case "visa-required":
      return "Visa required";

    default:
      return "Check current requirements";
  }
}

export function getVisaStatusTone(
  status
) {
  switch (
    clean(status).toLowerCase()
  ) {
    case "visa-free":
      return "positive";

    case "visa-on-arrival":
      return "info";

    case "e-visa":
      return "info";

    case "visa-required":
      return "warning";

    default:
      return "neutral";
  }
}

export function validateVisaQuery(
  query
) {
  const normalized =
    normalizeVisaQuery(
      query
    );

  const errors = [];

  if (
    !normalized.nationality
  ) {
    errors.push(
      "Select your nationality or passport country."
    );
  }

  if (
    !normalized.destination
  ) {
    errors.push(
      "Select a destination country."
    );
  }

  if (
    normalized.nationality &&
    normalized.destination &&
    normalized.nationality
      .toLowerCase() ===
      normalized.destination
        .toLowerCase()
  ) {
    errors.push(
      "Nationality and destination cannot be the same country."
    );
  }

  return {
    valid:
      errors.length === 0,

    errors,

    query:
      normalized,
  };
}

export async function checkVisa(
  query,
  options = {}
) {
  const validation =
    validateVisaQuery(
      query
    );

  if (!validation.valid) {
    const error =
      new Error(
        validation.errors.join(
          " "
        )
      );

    error.code =
      "INVALID_VISA_QUERY";

    error.validation =
      validation;

    throw error;
  }

  const params =
    encodeParams(
      validation.query
    );

  const controller =
    new AbortController();

  const timeout =
    Number(
      options.timeout || 15000
    );

  const timeoutId =
    window.setTimeout(
      () =>
        controller.abort(),
      timeout
    );

  try {
    const response =
      await fetch(
        `${API_BASE}/visa/check?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",
          },

          credentials:
            "include",

          signal:
            options.signal ||
            controller.signal,
        }
      );

    const data =
      await parseResponse(
        response
      );

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
            data?.error ||
            `Visa check failed (${response.status}).`
        );

      error.status =
        response.status;

      error.response =
        data;

      throw error;
    }

    return normalizeVisaResult(
      data,
      validation.query
    );
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      const timeoutError =
        new Error(
          "The visa check timed out. Please try again."
        );

      timeoutError.code =
        "VISA_TIMEOUT";

      throw timeoutError;
    }

    throw error;
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

export function buildVisaProviderUrl(
  query = {}
) {
  const normalized =
    normalizeVisaQuery(
      query
    );

  const baseUrl =
    "https://ivisa.tpk.lv/zXqbkMmK";

  const params =
    encodeParams({
      nationality:
        normalized.nationality,

      destination:
        normalized.destination,

      purpose:
        normalized.purpose,

      passportType:
        normalized.passportType,
    });

  const queryString =
    params.toString();

  return queryString
    ? `${baseUrl}?${queryString}`
    : baseUrl;
}

export default {
  checkVisa,
  normalizeVisaResult,
  normalizeVisaQuery,
  validateVisaQuery,
  getVisaStatusTone,
  buildVisaProviderUrl,
};
