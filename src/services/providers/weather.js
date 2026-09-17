async function geocode(place) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", place);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding request failed: ${response.status}`);
  const data = await response.json();
  const match = data?.results?.[0];
  if (!match) return null;
  return {
    name: match.name, country: match.country || null,
    latitude: match.latitude, longitude: match.longitude, timezone: match.timezone || null
  };
}

async function fetchForecast({ latitude, longitude }) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("current", "temperature_2m,precipitation,weather_code,wind_speed_10m");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast request failed: ${response.status}`);
  return response.json();
}

export async function getWeather(place) {
  const location = await geocode(place);
  if (!location) return { found: false, place, reason: "Location not found." };
  const forecast = await fetchForecast(location);
  return {
    found: true, location, timezone: forecast.timezone || location.timezone,
    current: forecast.current || null, daily: forecast.daily || null
  };
}
