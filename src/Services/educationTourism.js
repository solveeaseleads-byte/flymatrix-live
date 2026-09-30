import {
  getTravelProvider,
  buildAffiliateUrl,
} from "./travelProviders.js";

const HOTEL_CATEGORY = "hotels";
const ACTIVITIES_CATEGORY = "activities";
const VISA_CATEGORY = "visa";

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeNumber(
  value,
  fallback = 1,
  minimum = 1,
  maximum = 20
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(
    Math.max(
      Math.floor(number),
      minimum
    ),
    maximum
  );
}

function normalizeEducationSearch(
  query = {}
) {
  return {
    destination: clean(
      query.destination ||
      query.city ||
      query.country ||
      ""
    ),

    city: clean(
      query.city ||
      ""
    ),

    country: clean(
      query.country ||
      ""
    ),

    startDate: clean(
      query.startDate ||
      query.start_date ||
      query.arrivalDate ||
      ""
    ),

    endDate: clean(
      query.endDate ||
      query.end_date ||
      query.departureDate ||
      ""
    ),

    travelers:
      normalizeNumber(
        query.travelers ||
        query.passengers ||
        1
      ),

    students:
      normalizeNumber(
        query.students ||
        query.studentCount ||
        1
      ),

    programType: clean(
      query.programType ||
      query.studyType ||
      "education"
    ),

    studyLevel: clean(
      query.studyLevel ||
      query.level ||
      ""
    ),

    subject: clean(
      query.subject ||
      query.field ||
      query.course ||
      ""
    ),

    institution: clean(
      query.institution ||
      query.school ||
      ""
    ),

    duration: clean(
      query.duration ||
      ""
    ),

    budget: clean(
      query.budget ||
      ""
    ),

    visaRequired:
      query.visaRequired !== false,
  };
}

function buildHotelUrl(
  search
) {
  return buildAffiliateUrl(
    HOTEL_CATEGORY,
    {
      destination:
        search.destination,

      city:
        search.city,

      country:
        search.country,

      checkin:
        search.startDate,

      checkout:
        search.endDate,

      guests:
        search.travelers,
    }
  );
}

function buildActivityUrl(
  search
) {
  return buildAffiliateUrl(
    ACTIVITIES_CATEGORY,
    {
      destination:
        search.destination,

      city:
        search.city,

      country:
        search.country,

      startDate:
        search.startDate,

      endDate:
        search.endDate,

      travelers:
        search.travelers,
    }
  );
}

function buildVisaUrl(
  search
) {
  return buildAffiliateUrl(
    VISA_CATEGORY,
    {
      destination:
        search.destination,

      country:
        search.country,
    }
  );
}

function createEducationPlan(
  search
) {
  return {
    destination:
      search.destination,

    city:
      search.city,

    country:
      search.country,

    programType:
      search.programType,

    studyLevel:
      search.studyLevel,

    subject:
      search.subject,

    institution:
      search.institution,

    duration:
      search.duration,

    students:
      search.students,

    travel: {
      startDate:
        search.startDate,

      endDate:
        search.endDate,

      travelers:
        search.travelers,
    },

    accommodation: {
      provider:
        getTravelProvider(
          HOTEL_CATEGORY
        )?.name ||
        null,

      url:
        buildHotelUrl(search),
    },

    activities: {
      provider:
        getTravelProvider(
          ACTIVITIES_CATEGORY
        )?.name ||
        null,

      url:
        buildActivityUrl(search),
    },

    visa: {
      provider:
        getTravelProvider(
          VISA_CATEGORY
        )?.name ||
        null,

      url:
        buildVisaUrl(search),
    },
  };
}

export function validateEducationSearch(
  search
) {
  if (!search.destination) {
    throw new Error(
      "Education tourism destination is required."
    );
  }

  if (!search.startDate) {
    throw new Error(
      "Education tourism start date is required."
    );
  }

  if (!search.endDate) {
    throw new Error(
      "Education tourism end date is required."
    );
  }

  if (search.students < 1) {
    throw new Error(
      "At least one student is required."
    );
  }

  if (search.travelers < 1) {
    throw new Error(
      "At least one traveler is required."
    );
  }

  return true;
}

export function normalizeEducationResult(
  item = {},
  search = {}
) {
  return {
    id:
      item.id ||
      item.programId ||
      item.institutionId ||
      null,

    type:
      item.type ||
      "education",

    title:
      item.title ||
      item.name ||
      "Education opportunity",

    institution:
      item.institution ||
      item.school ||
      null,

    destination:
      item.destination ||
      search.destination ||
      "",

    city:
      item.city ||
      search.city ||
      "",

    country:
      item.country ||
      search.country ||
      "",

    programType:
      item.programType ||
      search.programType ||
      null,

    studyLevel:
      item.studyLevel ||
      search.studyLevel ||
      null,

    subject:
      item.subject ||
      search.subject ||
      null,

    duration:
      item.duration ||
      search.duration ||
      null,

    description:
      item.description ||
      "",

    tuition:
      item.tuition ??
      item.tuitionFee ??
      null,

    currency:
      item.currency ||
      null,

    rating:
      item.rating ??
      null,

    url:
      item.url ||
      item.link ||
      null,

    source:
      item.source ||
      "provider",

    live:
      item.live === true,

    cached:
      item.cached === true,

    estimated:
      item.estimated === true,
  };
}

export function createEducationResult(
  search
) {
  const hotelProvider =
    getTravelProvider(
      HOTEL_CATEGORY
    );

  const activityProvider =
    getTravelProvider(
      ACTIVITIES_CATEGORY
    );

  const visaProvider =
    getTravelProvider(
      VISA_CATEGORY
    );

  return {
    success: true,

    mode: "education",

    search,

    live: false,

    cached: false,

    estimated: false,

    results: [],

    plan:
      createEducationPlan(
        search
      ),

    providers: {
      hotels:
        hotelProvider
          ? {
              name:
                hotelProvider.name,

              network:
                hotelProvider.network,

              url:
                buildHotelUrl(
                  search
                ),
            }
          : null,

      activities:
        activityProvider
          ? {
              name:
                activityProvider.name,

              network:
                activityProvider.network,

              url:
                buildActivityUrl(
                  search
                ),
            }
          : null,

      visa:
        visaProvider
          ? {
              name:
                visaProvider.name,

              network:
                visaProvider.network,

              url:
                buildVisaUrl(
                  search
                ),
            }
          : null,
    },

    message:
      "No live education-program inventory is configured yet. Travel preparation links for accommodation, activities, and visa services are provided where verified providers are available.",
  };
}

export async function searchEducationTourism(
  query = {}
) {
  const search =
    normalizeEducationSearch(
      query
    );

  validateEducationSearch(
    search
  );

  return createEducationResult(
    search
  );
}

export {
  normalizeEducationSearch,
};

export default {
  searchEducationTourism,
  normalizeEducationSearch,
  validateEducationSearch,
  normalizeEducationResult,
  createEducationResult,
};
