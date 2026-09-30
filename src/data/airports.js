/*
 * FlyMatrix airport fallback/search dataset.
 *
 * This is intentionally a fallback dataset, not the
 * complete global airport database. The AirportSearch
 * component should query the backend/global airport
 * source first and use this file when that source is
 * unavailable.
 */

export const AIRPORTS = [
  // --------------------------------------------------
  // NIGERIA
  // --------------------------------------------------

  {
    code: "LOS",
    name: "Murtala Muhammed International Airport",
    city: "Lagos",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "ABV",
    name: "Nnamdi Azikiwe International Airport",
    city: "Abuja",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "KAN",
    name: "Mallam Aminu Kano International Airport",
    city: "Kano",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "PHC",
    name: "Port Harcourt International Airport",
    city: "Port Harcourt",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "ENU",
    name: "Akanu Ibiam International Airport",
    city: "Enugu",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "ILR",
    name: "Ilorin International Airport",
    city: "Ilorin",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "BEN",
    name: "Benin Airport",
    city: "Benin City",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "domestic",
  },

  {
    code: "IBA",
    name: "Ibadan Airport",
    city: "Ibadan",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "domestic",
  },

  {
    code: "QOW",
    name: "Sam Mbakwe International Airport",
    city: "Owerri",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "CBQ",
    name: "Margaret Ekpo International Airport",
    city: "Calabar",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "SKO",
    name: "Sadiq Abubakar III International Airport",
    city: "Sokoto",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "YOL",
    name: "Yola Airport",
    city: "Yola",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "domestic",
  },

  {
    code: "MIU",
    name: "Maiduguri International Airport",
    city: "Maiduguri",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "international",
  },

  {
    code: "DKA",
    name: "Katsina Airport",
    city: "Katsina",
    country: "Nigeria",
    countryCode: "NG",
    region: "West Africa",
    type: "domestic",
  },

  // --------------------------------------------------
  // UNITED KINGDOM
  // --------------------------------------------------

  {
    code: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    type: "international",
  },

  {
    code: "LGW",
    name: "Gatwick Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    type: "international",
  },

  {
    code: "STN",
    name: "London Stansted Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    type: "international",
  },

  {
    code: "LTN",
    name: "London Luton Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    type: "international",
  },

  {
    code: "LCY",
    name: "London City Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    type: "international",
  },

  {
    code: "MAN",
    name: "Manchester Airport",
    city: "Manchester",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    type: "international",
  },

  {
    code: "BHX",
    name: "Birmingham Airport",
    city: "Birmingham",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    type: "international",
  },

  {
    code: "EDI",
    name: "Edinburgh Airport",
    city: "Edinburgh",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // UNITED STATES
  // --------------------------------------------------

  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "international",
  },

  {
    code: "EWR",
    name: "Newark Liberty International Airport",
    city: "New York",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "international",
  },

  {
    code: "LGA",
    name: "LaGuardia Airport",
    city: "New York",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "domestic",
  },

  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "international",
  },

  {
    code: "SFO",
    name: "San Francisco International Airport",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "international",
  },

  {
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "international",
  },

  {
    code: "ORD",
    name: "Chicago O'Hare International Airport",
    city: "Chicago",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "international",
  },

  {
    code: "ATL",
    name: "Hartsfield-Jackson Atlanta International Airport",
    city: "Atlanta",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "international",
  },

  {
    code: "DFW",
    name: "Dallas Fort Worth International Airport",
    city: "Dallas",
    country: "United States",
    countryCode: "US",
    region: "North America",
    type: "international",
  },

  // --------------------------------------------------
  // CANADA
  // --------------------------------------------------

  {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    region: "North America",
    type: "international",
  },

  {
    code: "YVR",
    name: "Vancouver International Airport",
    city: "Vancouver",
    country: "Canada",
    countryCode: "CA",
    region: "North America",
    type: "international",
  },

  {
    code: "YUL",
    name: "Montréal–Trudeau International Airport",
    city: "Montreal",
    country: "Canada",
    countryCode: "CA",
    region: "North America",
    type: "international",
  },

  {
    code: "YYC",
    name: "Calgary International Airport",
    city: "Calgary",
    country: "Canada",
    countryCode: "CA",
    region: "North America",
    type: "international",
  },

  // --------------------------------------------------
  // UNITED ARAB EMIRATES
  // --------------------------------------------------

  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Middle East",
    type: "international",
  },

  {
    code: "AUH",
    name: "Zayed International Airport",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Middle East",
    type: "international",
  },

  {
    code: "SHJ",
    name: "Sharjah International Airport",
    city: "Sharjah",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Middle East",
    type: "international",
  },

  // --------------------------------------------------
  // QATAR
  // --------------------------------------------------

  {
    code: "DOH",
    name: "Hamad International Airport",
    city: "Doha",
    country: "Qatar",
    countryCode: "QA",
    region: "Middle East",
    type: "international",
  },

  // --------------------------------------------------
  // SAUDI ARABIA
  // --------------------------------------------------

  {
    code: "RUH",
    name: "King Khalid International Airport",
    city: "Riyadh",
    country: "Saudi Arabia",
    countryCode: "SA",
    region: "Middle East",
    type: "international",
  },

  {
    code: "JED",
    name: "King Abdulaziz International Airport",
    city: "Jeddah",
    country: "Saudi Arabia",
    countryCode: "SA",
    region: "Middle East",
    type: "international",
  },

  // --------------------------------------------------
  // TURKEY
  // --------------------------------------------------

  {
    code: "IST",
    name: "Istanbul Airport",
    city: "Istanbul",
    country: "Turkey",
    countryCode: "TR",
    region: "Europe / Asia",
    type: "international",
  },

  {
    code: "SAW",
    name: "Istanbul Sabiha Gökçen International Airport",
    city: "Istanbul",
    country: "Turkey",
    countryCode: "TR",
    region: "Europe / Asia",
    type: "international",
  },

  // --------------------------------------------------
  // FRANCE
  // --------------------------------------------------

  {
    code: "CDG",
    name: "Paris Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    region: "Europe",
    type: "international",
  },

  {
    code: "ORY",
    name: "Paris Orly Airport",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // GERMANY
  // --------------------------------------------------

  {
    code: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
    type: "international",
  },

  {
    code: "MUC",
    name: "Munich Airport",
    city: "Munich",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
    type: "international",
  },

  {
    code: "BER",
    name: "Berlin Brandenburg Airport",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // NETHERLANDS
  // --------------------------------------------------

  {
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // SPAIN
  // --------------------------------------------------

  {
    code: "MAD",
    name: "Adolfo Suárez Madrid–Barajas Airport",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    region: "Europe",
    type: "international",
  },

  {
    code: "BCN",
    name: "Barcelona–El Prat Airport",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // ITALY
  // --------------------------------------------------

  {
    code: "FCO",
    name: "Leonardo da Vinci–Fiumicino Airport",
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
    region: "Europe",
    type: "international",
  },

  {
    code: "MXP",
    name: "Milan Malpensa Airport",
    city: "Milan",
    country: "Italy",
    countryCode: "IT",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // PORTUGAL
  // --------------------------------------------------

  {
    code: "LIS",
    name: "Humberto Delgado Airport",
    city: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    region: "Europe",
    type: "international",
  },

  {
    code: "OPO",
    name: "Francisco Sá Carneiro Airport",
    city: "Porto",
    country: "Portugal",
    countryCode: "PT",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // IRELAND
  // --------------------------------------------------

  {
    code: "DUB",
    name: "Dublin Airport",
    city: "Dublin",
    country: "Ireland",
    countryCode: "IE",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // SWITZERLAND
  // --------------------------------------------------

  {
    code: "ZRH",
    name: "Zurich Airport",
    city: "Zurich",
    country: "Switzerland",
    countryCode: "CH",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // AUSTRIA
  // --------------------------------------------------

  {
    code: "VIE",
    name: "Vienna International Airport",
    city: "Vienna",
    country: "Austria",
    countryCode: "AT",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // GREECE
  // --------------------------------------------------

  {
    code: "ATH",
    name: "Athens International Airport",
    city: "Athens",
    country: "Greece",
    countryCode: "GR",
    region: "Europe",
    type: "international",
  },

  // --------------------------------------------------
  // SOUTH AFRICA
  // --------------------------------------------------

  {
    code: "JNB",
    name: "O. R. Tambo International Airport",
    city: "Johannesburg",
    country: "South Africa",
    countryCode: "ZA",
    region: "Southern Africa",
    type: "international",
  },

  {
    code: "CPT",
    name: "Cape Town International Airport",
    city: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
    region: "Southern Africa",
    type: "international",
  },

  // --------------------------------------------------
  // GHANA
  // --------------------------------------------------

  {
    code: "ACC",
    name: "Kotoka International Airport",
    city: "Accra",
    country: "Ghana",
    countryCode: "GH",
    region: "West Africa",
    type: "international",
  },

  // --------------------------------------------------
  // KENYA
  // --------------------------------------------------

  {
    code: "NBO",
    name: "Jomo Kenyatta International Airport",
    city: "Nairobi",
    country: "Kenya",
    countryCode: "KE",
    region: "East Africa",
    type: "international",
  },

  // --------------------------------------------------
  // EGYPT
  // --------------------------------------------------

  {
    code: "CAI",
    name: "Cairo International Airport",
    city: "Cairo",
    country: "Egypt",
    countryCode: "EG",
    region: "North Africa",
    type: "international",
  },

  // --------------------------------------------------
  // INDIA
  // --------------------------------------------------

  {
    code: "DEL",
    name: "Indira Gandhi International Airport",
    city: "Delhi",
    country: "India",
    countryCode: "IN",
    region: "South Asia",
    type: "international",
  },

  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    country: "India",
    countryCode: "IN",
    region: "South Asia",
    type: "international",
  },

  // --------------------------------------------------
  // CHINA
  // --------------------------------------------------

  {
    code: "PEK",
    name: "Beijing Capital International Airport",
    city: "Beijing",
    country: "China",
    countryCode: "CN",
    region: "East Asia",
    type: "international",
  },

  {
    code: "PVG",
    name: "Shanghai Pudong International Airport",
    city: "Shanghai",
    country: "China",
    countryCode: "CN",
    region: "East Asia",
    type: "international",
  },

  // --------------------------------------------------
  // JAPAN
  // --------------------------------------------------

  {
    code: "NRT",
    name: "Narita International Airport",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "East Asia",
    type: "international",
  },

  {
    code: "HND",
    name: "Haneda Airport",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "East Asia",
    type: "international",
  },

  // --------------------------------------------------
  // SINGAPORE
  // --------------------------------------------------

  {
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    region: "Southeast Asia",
    type: "international",
  },

  // --------------------------------------------------
  // AUSTRALIA
  // --------------------------------------------------

  {
    code: "SYD",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    region: "Oceania",
    type: "international",
  },

  {
    code: "MEL",
    name: "Melbourne Airport",
    city: "Melbourne",
    country: "Australia",
    countryCode: "AU",
    region: "Oceania",
    type: "international",
  },

  // --------------------------------------------------
  // BRAZIL
  // --------------------------------------------------

  {
    code: "GRU",
    name: "São Paulo–Guarulhos International Airport",
    city: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    region: "South America",
    type: "international",
  },

  // --------------------------------------------------
  // MEXICO
  // --------------------------------------------------

  {
    code: "MEX",
    name: "Mexico City International Airport",
    city: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    region: "North America",
    type: "international",
  },
];

export const CITY_GROUPS = {
  Lagos: [
    "LOS",
  ],

  London: [
    "LHR",
    "LGW",
    "STN",
    "LTN",
    "LCY",
  ],

  NewYork: [
    "JFK",
    "EWR",
    "LGA",
  ],

  Paris: [
    "CDG",
    "ORY",
  ],

  Istanbul: [
    "IST",
    "SAW",
  ],

  Tokyo: [
    "NRT",
    "HND",
  ],

  Toronto: [
    "YYZ",
  ],

  Dubai: [
    "DXB",
  ],
};

/*
 * Search the local fallback dataset.
 *
 * Ranking:
 *
 * 1. Exact IATA match
 * 2. IATA starts with query
 * 3. City starts with query
 * 4. Airport name starts with query
 * 5. City/name contains query
 * 6. Nigerian airports receive additional
 *    relevance when the query relates to Nigeria
 */
export function searchLocalAirports(
  query,
  options = {}
) {
  const text =
    String(
      query || ""
    )
      .trim()
      .toLowerCase();

  const limit =
    Number(
      options.limit || 10
    );

  if (!text) {
    return [];
  }

  const nigeriaFirst =
    options.nigeriaFirst !==
      false;

  const ranked =
    AIRPORTS.map(
      (airport) => {
        const code =
          airport.code.toLowerCase();

        const name =
          airport.name.toLowerCase();

        const city =
          airport.city.toLowerCase();

        const country =
          airport.country.toLowerCase();

        let score = 0;

        if (
          code === text
        ) {
          score += 1000;
        }

        if (
          code.startsWith(
            text
          )
        ) {
          score += 800;
        }

        if (
          city === text
        ) {
          score += 700;
        }

        if (
          city.startsWith(
            text
          )
        ) {
          score += 500;
        }

        if (
          name.startsWith(
            text
          )
        ) {
          score += 400;
        }

        if (
          country === text
        ) {
          score += 300;
        }

        if (
          country.startsWith(
            text
          )
        ) {
          score += 200;
        }

        if (
          name.includes(
            text
          )
        ) {
          score += 100;
        }

        if (
          city.includes(
            text
          )
        ) {
          score += 100;
        }

        if (
          country.includes(
            text
          )
        ) {
          score += 50;
        }

        if (
          nigeriaFirst &&
          airport.countryCode ===
            "NG"
        ) {
          score += 5;
        }

        return {
          ...airport,
          score,
        };
      }
    )
      .filter(
        (airport) =>
          airport.score > 0
      )
      .sort(
        (a, b) => {
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            );
          }

          return a.name.localeCompare(
            b.name
          );
        }
      );

  return ranked
    .slice(0, limit)
    .map(
      ({
        score,
        ...airport
      }) => airport
    );
}

/*
 * Find an airport by exact IATA code.
 */
export function findAirportByCode(
  code
) {
  const normalized =
    String(
      code || ""
    )
      .trim()
      .toUpperCase();

  if (!normalized) {
    return null;
  }

  return (
    AIRPORTS.find(
      (airport) =>
        airport.code ===
        normalized
    ) || null
  );
}

/*
 * Find all airports belonging to a city.
 */
export function findAirportsByCity(
  city
) {
  const normalized =
    String(
      city || ""
    )
      .trim()
      .toLowerCase();

  if (!normalized) {
    return [];
  }

  return AIRPORTS.filter(
    (airport) =>
      airport.city.toLowerCase() ===
      normalized
  );
}

/*
 * Return a normalized airport object
 * suitable for the FlightSearchForm.
 */
export function normalizeAirport(
  airport
) {
  if (!airport) {
    return null;
  }

  if (
    typeof airport ===
    "string"
  ) {
    return (
      findAirportByCode(
        airport
      ) || {
        code:
          airport
            .trim()
            .toUpperCase(),

        name: "",

        city: "",

        country: "",
      }
    );
  }

  return {
    code: String(
      airport.code ||
        airport.iata ||
        airport.iataCode ||
        ""
    )
      .trim()
      .toUpperCase(),

    name:
      airport.name ||
      airport.airportName ||
      "",

    city:
      airport.city ||
      airport.cityName ||
      "",

    country:
      airport.country ||
      airport.countryName ||
      "",

    countryCode:
      airport.countryCode ||
      airport.country_code ||
      "",

    region:
      airport.region ||
      "",

    type:
      airport.type ||
      "airport",
  };
}

/*
 * Common multi-airport city aliases.
 */
export function expandCityCode(
  code
) {
  const normalized =
    String(
      code || ""
    )
      .trim()
      .toUpperCase();

  if (
    normalized ===
    "LON"
  ) {
    return CITY_GROUPS.London
      .map(
        (airportCode) =>
          findAirportByCode(
            airportCode
          )
      )
      .filter(Boolean);
  }

  if (
    normalized ===
    "NYC"
  ) {
    return CITY_GROUPS.NewYork
      .map(
        (airportCode) =>
          findAirportByCode(
            airportCode
          )
      )
      .filter(Boolean);
  }

  if (
    normalized ===
    "PAR"
  ) {
    return CITY_GROUPS.Paris
      .map(
        (airportCode) =>
          findAirportByCode(
            airportCode
          )
      )
      .filter(Boolean);
  }

  if (
    normalized ===
    "TYO"
  ) {
    return CITY_GROUPS.Tokyo
      .map(
        (airportCode) =>
          findAirportByCode(
            airportCode
          )
      )
      .filter(Boolean);
  }

  return [];
}

export function getAirportLabel(
  airport
) {
  const normalized =
    normalizeAirport(
      airport
    );

  if (!normalized) {
    return "";
  }

  const parts = [];

  if (
    normalized.code
  ) {
    parts.push(
      normalized.code
    );
  }

  if (
    normalized.city
  ) {
    parts.push(
      normalized.city
    );
  }

  if (
    normalized.name
  ) {
    parts.push(
      normalized.name
    );
  }

  if (
    normalized.country
  ) {
    parts.push(
      normalized.country
    );
  }

  return parts.join(
    " — "
  );
}

export default AIRPORTS;
