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
    code
