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

function toNumber(
  value,
  fallback = null
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function encodeParams(
  values = {}
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

async function request(
  path,
  options = {}
) {
  const controller =
    new AbortController();

  const timeout =
    Number(
      options.timeout || 20000
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
        `${API_BASE}${path}`,
        {
          method:
            options.method ||
            "GET",

          headers: {
            Accept:
              "application/json",

            ...(options.body
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),
          },

          credentials:
            "include",

          body:
            options.body
              ? JSON.stringify(
                  options.body
                )
              : undefined,

          signal:
            options.signal ||
            controller.signal,
        }
      );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let data;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      try {
        data =
          JSON.parse(text);
      } catch {
        data = {
          message: text,
        };
      }
    }

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
            data?.error ||
            `Tourism request failed (${response.status}).`
        );

      error.status =
        response.status;

      error.response =
        data;

      throw error;
    }

    return data;
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      const timeoutError =
        new Error(
          "The tourism data request timed out. Please try again."
        );

      timeoutError.code =
        "TOURISM_TIMEOUT";

      throw timeoutError;
    }

    throw error;
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

function normalizeProvider(
  item
) {
  if (!item) {
    return null;
  }

  return {
    id:
      item.id ||
      item.providerId ||
      item.provider_id ||
      null,

    name:
      clean(
        item.provider ||
          item.providerName ||
          item.provider_name ||
          item.source
      ),

    logo:
      item.logo ||
      item.logoUrl ||
      item.logo_url ||
      null,

    url:
      item.url ||
      item.link ||
      item.bookingUrl ||
      item.booking_url ||
      null,
  };
}

function normalizePrice(
  item
) {
  const price =
    item?.price;

  if (
    price &&
    typeof price ===
      "object"
  ) {
    return {
      amount: toNumber(
        price.amount ??
          price.value ??
          price.total
      ),

      currency:
        clean(
          price.currency ||
            price.currencyCode ||
            price.currency_code ||
            "USD"
        ).toUpperCase(),

      type:
        clean(
          price.type ||
            price.priceType
        ),

      source:
        clean(
          price.source
        ),

      isLive:
        price.isLive ??
        price.live ??
        false,
    };
  }

  return {
    amount: toNumber(
      item?.amount ??
        item?.priceValue ??
        item?.price_value
    ),

    currency:
      clean(
        item?.currency ||
          item?.currencyCode ||
          item?.currency_code ||
          "USD"
      ).toUpperCase(),

    type:
      clean(
        item?.priceType
      ),

    source:
      clean(
        item?.priceSource
      ),

    isLive:
      item?.isLive ??
      item?.live ??
      false,
  };
}

function normalizeOption(
  item,
  index,
  category
) {
  if (!item) {
    return null;
  }

  const provider =
    normalizeProvider(
      item
    );

  const price =
    normalizePrice(
      item
    );

  return {
    id:
      item.id ||
      item.offerId ||
      item.offer_id ||
      item.reference ||
      `${category}-${index}`,

    category,

    name:
      clean(
        item.name ||
          item.title ||
          item.label ||
          item.schoolName ||
          item.propertyName
      ),

    description:
      clean(
        item.description ||
          item.summary ||
          item.excerpt
      ),

    destination:
      clean(
        item.destination ||
          item.destinationName
      ),

    city:
      clean(
        item.city ||
          item.cityName
      ),

    country:
      clean(
        item.country ||
          item.countryName
      ),

    image:
      item.image ||
      item.imageUrl ||
      item.image_url ||
      item.thumbnail ||
      null,

    rating:
      toNumber(
        item.rating ??
          item.reviewScore ??
          item.review_score
      ),

    reviews:
      toNumber(
        item.reviews ??
          item.reviewCount ??
          item.review_count,
        0
      ),

    price,

    duration:
      clean(
        item.duration ||
          item.durationText
      ),

    facilities:
      Array.isArray(
        item.facilities
      )
        ? item.facilities
        : Array.isArray(
            item.amenities
          )
        ? item.amenities
        : [],

    lifestyle:
      Array.isArray(
        item.lifestyle
      )
        ? item.lifestyle
        : item.lifestyle
        ? [item.lifestyle]
        : [],

    provider,

    url:
      item.url ||
      item.link ||
      item.bookingUrl ||
      item.booking_url ||
      provider?.url ||
      null,

    source:
      clean(
        item.source ||
          provider?.name
      ),

    dataStatus:
      clean(
        item.dataStatus ||
          item.data_status ||
          (price.isLive
            ? "live"
            : "cached")
      ).toLowerCase(),

    publishedAt:
      item.publishedAt ||
      item.published_at ||
      null,

    raw: item,
  };
}

function extractItems(
  response
) {
  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(
      response?.options
    )
  ) {
    return response.options;
  }

  if (
    Array.isArray(
      response?.results
    )
  ) {
    return response.results;
  }

  if (
    Array.isArray(
      response?.offers
    )
  ) {
    return response.offers;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.items
    )
  ) {
    return response.items;
  }

  return [];
}

function normalizeResponse(
  response,
  category,
  query
) {
  const items =
    extractItems(
      response
    )
      .map(
        (item, index) =>
          normalizeOption(
            item,
            index,
            category
          )
      )
      .filter(Boolean);

  return {
    items,

    results:
      items,

    query,

    source:
      response?.source ||
      response?.provider ||
      null,

    dataStatus:
      clean(
        response?.dataStatus ||
          response?.data_status ||
          response?.status ||
          "unknown"
      ).toLowerCase(),

    generatedAt:
      response?.generatedAt ||
      response?.generated_at ||
      null,

    cachedAt:
      response?.cachedAt ||
      response?.cached_at ||
      null,

    raw: response,
  };
}

export function normalizeTourismQuery(
  query = {}
) {
  return {
    destinationCountry:
      clean(
        query.destinationCountry ||
          query.country
      ),

    destinationCity:
      clean(
        query.destinationCity ||
          query.city
      ),

    startDate:
      clean(
        query.startDate ||
          query.checkIn ||
          query.from
      ),

    endDate:
      clean(
        query.endDate ||
          query.checkOut ||
          query.to
      ),

    tripLength:
      toNumber(
        query.tripLength ||
          query.days
      ),

    travelers:
      toNumber(
        query.travelers ||
          query.guests ||
          query.adults,
        1
      ),

    budget:
      toNumber(
        query.budget ||
          query.maxBudget
      ),

    minBudget:
      toNumber(
        query.minBudget
      ),

    maxBudget:
      toNumber(
        query.maxBudget
      ),

    currency:
      clean(
        query.currency ||
          "USD"
      ).toUpperCase(),

    lifestyle:
      Array.isArray(
        query.lifestyle
      )
        ? query.lifestyle
        : clean(
            query.lifestyle
          )
        ? [
            query.lifestyle,
          ]
        : [],

    facilities:
      Array.isArray(
        query.facilities
      )
        ? query.facilities
        : clean(
            query.facilities
          )
        ? [
            query.facilities,
          ]
        : [],

    studyLevel:
      clean(
        query.studyLevel ||
          query.level
      ),

    field:
      clean(
        query.field ||
          query.studyField
      ),

    duration:
      clean(
        query.duration ||
          query.studyDuration
      ),

    studyMode:
      clean(
        query.studyMode ||
          query.mode
      ),
  };
}

export async function searchLeisureTourism(
  query = {},
  options = {}
) {
  const normalized =
    normalizeTourismQuery(
      query
    );

  const params =
    encodeParams({
      destinationCountry:
        normalized.destinationCountry,

      destinationCity:
        normalized.destinationCity,

      startDate:
        normalized.startDate,

      endDate:
        normalized.endDate,

      tripLength:
        normalized.tripLength,

      travelers:
        normalized.travelers,

      budget:
        normalized.budget,

      minBudget:
        normalized.minBudget,

      maxBudget:
        normalized.maxBudget,

      currency:
        normalized.currency,

      lifestyle:
        normalized.lifestyle.join(","),

      facilities:
        normalized.facilities.join(","),
    });

  const response =
    await request(
      `/tourism/leisure?${params.toString()}`,
      options
    );

  return normalizeResponse(
    response,
    "leisure",
    normalized
  );
}

export async function searchEducationTourism(
  query = {},
  options = {}
) {
  const normalized =
    normalizeTourismQuery(
      query
    );

  const params =
    encodeParams({
      destinationCountry:
        normalized.destinationCountry,

      destinationCity:
        normalized.destinationCity,

      startDate:
        normalized.startDate,

      endDate:
        normalized.endDate,

      tripLength:
        normalized.tripLength,

      travelers:
        normalized.travelers,

      budget:
        normalized.budget,

      minBudget:
        normalized.minBudget,

      maxBudget:
        normalized.maxBudget,

      currency:
        normalized.currency,

      studyLevel:
        normalized.studyLevel,

      field:
        normalized.field,

      duration:
        normalized.duration,

      studyMode:
        normalized.studyMode,

      facilities:
        normalized.facilities.join(","),
    });

  const response =
    await request(
      `/tourism/education?${params.toString()}`,
      options
    );

  return normalizeResponse(
    response,
    "education",
    normalized
  );
}

export function sortTourismOptions(
  items = [],
  sortBy = "price"
) {
  const list = [
    ...items,
  ];

  switch (sortBy) {
    case "price":
      return list.sort(
        (a, b) =>
          (a.price?.amount ??
            Infinity) -
          (b.price?.amount ??
            Infinity)
      );

    case "rating":
      return list.sort(
        (a, b) =>
          (b.rating ?? 0) -
          (a.rating ?? 0)
      );

    case "name":
      return list.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    case "provider":
      return list.sort(
        (a, b) =>
          (
            a.provider?.name ||
            ""
          ).localeCompare(
            b.provider?.name ||
              ""
          )
      );

    default:
      return list;
  }
}

export function filterTourismOptions(
  items = [],
  filters = {}
) {
  const {
    maxPrice,
    minPrice,
    lifestyle = [],
    facilities = [],
  } = filters;

  return items.filter(
    (item) => {
      const amount =
        item.price?.amount;

      if (
        maxPrice !==
          undefined &&
        maxPrice !==
          null &&
        amount !==
          null &&
        amount !==
          undefined &&
        amount > Number(maxPrice)
      ) {
        return false;
      }

      if (
        minPrice !==
          undefined &&
        minPrice !==
          null &&
        amount !==
          null &&
        amount !==
          undefined &&
        amount < Number(minPrice)
      ) {
        return false;
      }

      if (
        lifestyle.length
      ) {
        const itemLifestyle =
          Array.isArray(
            item.lifestyle
          )
            ? item.lifestyle
            : [];

        const matches =
          lifestyle.some(
            (value) =>
              itemLifestyle
                .map(
                  (entry) =>
                    String(
                      entry
                    ).toLowerCase()
                )
                .includes(
                  String(
                    value
                  ).toLowerCase()
                )
          );

        if (!matches) {
          return false;
        }
      }

      if (
        facilities.length
      ) {
        const itemFacilities =
          Array.isArray(
            item.facilities
          )
            ? item.facilities
            : [];

        const normalizedFacilities =
          itemFacilities.map(
            (value) =>
              String(
                value
              ).toLowerCase()
          );

        const matches =
          facilities.every(
            (value) =>
              normalizedFacilities.includes(
                String(
                  value
                ).toLowerCase()
              )
          );

        if (!matches) {
          return false;
        }
      }

      return true;
    }
  );
}

export function getPriceRange(
  items = []
) {
  const prices =
    items
      .map(
        (item) =>
          item.price?.amount
      )
      .filter(
        (value) =>
          Number.isFinite(
            Number(value)
          )
      )
      .map(Number);

  if (!prices.length) {
    return {
      min: null,
      max: null,
    };
  }

  return {
    min: Math.min(
      ...prices
    ),

    max: Math.max(
      ...prices
    ),
  };
}

export function groupByProvider(
  items = []
) {
  return items.reduce(
    (groups, item) => {
      const key =
        item.provider?.name ||
        item.source ||
        "Unknown provider";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(
        item
      );

      return groups;
    },
    {}
  );
}

export default {
  normalizeTourismQuery,

  searchLeisureTourism,

  searchEducationTourism,

  sortTourismOptions,

  filterTourismOptions,

  getPriceRange,

  groupByProvider,
};
