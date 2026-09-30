const API_BASE = "/api";

const FALLBACK_AIRPORTS = [
  {
    code: "LOS",
    name: "Murtala Muhammed International Airport",
    city: "Lagos",
    country: "Nigeria",
  },
  {
    code: "ABV",
    name: "Nnamdi Azikiwe International Airport",
    city: "Abuja",
    country: "Nigeria",
  },
  {
    code: "KAN",
    name: "Mallam Aminu Kano International Airport",
    city: "Kano",
    country: "Nigeria",
  },
  {
    code: "PHC",
    name: "Port Harcourt International Airport",
    city: "Port Harcourt",
    country: "Nigeria",
  },
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "LGW",
    name: "London Gatwick Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "STN",
    name: "London Stansted Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "LTN",
    name: "London Luton Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "LCY",
    name: "London City Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "LON",
    name: "London All Airports",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
  },
  {
    code: "EWR",
    name: "Newark Liberty International Airport",
    city: "Newark",
    country: "United States",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
  },
  {
    code: "CDG",
    name: "Paris Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
  },
  {
    code: "ORY",
    name: "Paris Orly Airport",
    city: "Paris",
    country: "France",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
  },
  {
    code: "AUH",
    name: "Zayed International Airport",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
  },
  {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    city: "Toronto",
    country: "Canada",
  },
  {
    code: "YVR",
    name: "Vancouver International Airport",
    city: "Vancouver",
    country: "Canada",
  },
  {
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
  },
  {
    code: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
  },
  {
    code: "MAD",
    name: "Adolfo Suárez Madrid–Barajas Airport",
    city: "Madrid",
    country: "Spain",
  },
  {
    code: "FCO",
    name: "Leonardo da Vinci–Fiumicino Airport",
    city: "Rome",
    country: "Italy",
  },
  {
    code: "IST",
    name: "Istanbul Airport",
    city: "Istanbul",
    country: "Türkiye",
  },
  {
    code: "DOH",
    name: "Hamad International Airport",
    city: "Doha",
    country: "Qatar",
  },
  {
    code: "JNB",
    name: "O. R. Tambo International Airport",
    city: "Johannesburg",
    country: "South Africa",
  },
  {
    code: "CAI",
    name: "Cairo International Airport",
    city: "Cairo",
    country: "Egypt",
  },
  {
    code: "NBO",
    name: "Jomo Kenyatta International Airport",
    city: "Nairobi",
    country: "Kenya",
  },
];

function clean(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function normalizeAirport(item) {
  if (!item) {
    return null;
  }

  if (typeof item === "string") {
    const code =
      item
        .trim()
        .toUpperCase();

    return {
      code,
      name: "",
      city: "",
      country: "",
    };
  }

  const code = clean(
    item.code ||
      item.iata ||
      item.iataCode ||
      item.airportCode ||
      item.iata_code
  ).toUpperCase();

  const name = clean(
    item.name ||
      item.airportName ||
      item.airport_name
  );

  const city = clean(
    item.city ||
      item.cityName ||
      item.city_name
  );

  const country = clean(
    item.country ||
      item.countryName ||
      item.country_name
  );

  if (
    !code &&
    !name &&
    !city
  ) {
    return null;
  }

  return {
    code,
    name,
    city,
    country,
  };
}

function normalizeAirportList(
  response
) {
  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(
      response?.airports
    )
  ) {
    return response.airports;
  }

  if (
    Array.isArray(
      response?.destinations
    )
  ) {
    return response.destinations;
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
      response?.data
    )
  ) {
    return response.data;
  }

  return [];
}

function scoreAirport(
  airport,
  query
) {
  const value =
    query
      .trim()
      .toLowerCase();

  if (!value) {
    return 0;
  }

  const code =
    airport.code.toLowerCase();

  const name =
    airport.name.toLowerCase();

  const city =
    airport.city.toLowerCase();

  const country =
    airport.country.toLowerCase();

  if (code === value) {
    return 1000;
  }

  if (
    code.startsWith(value)
  ) {
    return 900;
  }

  if (
    city === value
  ) {
    return 850;
  }

  if (
    city.startsWith(value)
  ) {
    return 800;
  }

  if (
    name.startsWith(value)
  ) {
    return 750;
  }

  if (
    name.includes(value)
  ) {
    return 650;
  }

  if (
    country.startsWith(value)
  ) {
    return 500;
  }

  if (
    country.includes(value)
  ) {
    return 400;
  }

  if (
    city.includes(value)
  ) {
    return 350;
  }

  return 0;
}

function matchesAirport(
  airport,
  query
) {
  if (!query) {
    return true;
  }

  const value =
    query
      .trim()
      .toLowerCase();

  return [
    airport.code,
    airport.name,
    airport.city,
    airport.country,
  ].some(
    (field) =>
      field
        .toLowerCase()
        .includes(value)
  );
}

function deduplicateAirports(
  airports
) {
  const seen =
    new Set();

  return airports.filter(
    (airport) => {
      const key =
        [
          airport.code,
          airport.name,
          airport.city,
          airport.country,
        ]
          .join("|")
          .toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    }
  );
}

function sortAirports(
  airports,
  query
) {
  return [
    ...airports,
  ].sort(
    (a, b) => {
      const scoreDifference =
        scoreAirport(
          b,
          query
        ) -
        scoreAirport(
          a,
          query
        );

      if (
        scoreDifference !== 0
      ) {
        return scoreDifference;
      }

      return (
        a.city.localeCompare(
          b.city
        ) ||
        a.name.localeCompare(
          b.name
        )
      );
    }
  );
}

async function requestAirports(
  query,
  options = {}
) {
  const params =
    new URLSearchParams();

  if (query) {
    params.set(
      "search",
      query
    );
  }

  const endpoint =
    `${API_BASE}/destinations?${params.toString()}`;

  const controller =
    new AbortController();

  const timeout =
    Number(
      options.timeout || 8000
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
        endpoint,
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

    if (!response.ok) {
      throw new Error(
        `Airport search failed (${response.status}).`
      );
    }

    const data =
      await response.json();

    return normalizeAirportList(
      data
    )
      .map(
        normalizeAirport
      )
      .filter(Boolean);
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

export async function searchAirports(
  query = "",
  options = {}
) {
  const normalizedQuery =
    clean(query);

  const limit =
    Math.max(
      1,
      Number(
        options.limit || 12
      )
    );

  let remoteAirports = [];

  try {
    remoteAirports =
      await requestAirports(
        normalizedQuery,
        options
      );
  } catch {
    remoteAirports = [];
  }

  const fallbackAirports =
    FALLBACK_AIRPORTS
      .map(
        normalizeAirport
      )
      .filter(Boolean);

  const combined =
    deduplicateAirports([
      ...remoteAirports,
      ...fallbackAirports,
    ]);

  const matching =
    combined.filter(
      (airport) =>
        matchesAirport(
          airport,
          normalizedQuery
        )
    );

  return sortAirports(
    matching,
    normalizedQuery
  ).slice(
    0,
    limit
  );
}

export async function findAirportByCode(
  code,
  options = {}
) {
  const normalizedCode =
    clean(code)
      .toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  const fallback =
    FALLBACK_AIRPORTS.find(
      (airport) =>
        airport.code ===
        normalizedCode
    );

  if (fallback) {
    return {
      ...fallback,
    };
  }

  const airports =
    await searchAirports(
      normalizedCode,
      {
        ...options,
        limit: 20,
      }
    );

  return (
    airports.find(
      (airport) =>
        airport.code ===
        normalizedCode
    ) || null
  );
}

export function getFallbackAirports() {
  return FALLBACK_AIRPORTS.map(
    (airport) => ({
      ...airport,
    })
  );
}

export function normalizeAirportData(
  airport
) {
  return normalizeAirport(
    airport
  );
}

export default {
  searchAirports,
  findAirportByCode,
  getFallbackAirports,
  normalizeAirportData,
};
