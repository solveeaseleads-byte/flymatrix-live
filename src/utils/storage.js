const PREFIX = "flymatrix:";

function getKey(key) {
  return `${PREFIX}${String(key)}`;
}

export function saveItem(
  key,
  value
) {
  try {
    localStorage.setItem(
      getKey(key),
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.warn(
      "FlyMatrix storage save failed:",
      error
    );

    return false;
  }
}

export function getItem(
  key,
  fallback = null
) {
  try {
    const raw =
      localStorage.getItem(
        getKey(key)
      );

    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.warn(
      "FlyMatrix storage read failed:",
      error
    );

    return fallback;
  }
}

export function removeItem(
  key
) {
  try {
    localStorage.removeItem(
      getKey(key)
    );

    return true;
  } catch (error) {
    console.warn(
      "FlyMatrix storage removal failed:",
      error
    );

    return false;
  }
}

export function clearFlyMatrixStorage() {
  try {
    const keys = [];

    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {
      const key =
        localStorage.key(
          index
        );

      if (
        key &&
        key.startsWith(
          PREFIX
        )
      ) {
        keys.push(key);
      }
    }

    keys.forEach(
      (key) =>
        localStorage.removeItem(
          key
        )
    );

    return true;
  } catch (error) {
    console.warn(
      "FlyMatrix storage clear failed:",
      error
    );

    return false;
  }
}

/* --------------------------------------------------
   SEARCH STATE
-------------------------------------------------- */

export function saveFlightSearch(
  search
) {
  return saveItem(
    "flight-search",
    {
      ...search,
      savedAt:
        new Date().toISOString(),
    }
  );
}

export function getFlightSearch() {
  return getItem(
    "flight-search",
    null
  );
}

export function clearFlightSearch() {
  return removeItem(
    "flight-search"
  );
}

/* --------------------------------------------------
   SEARCH RESULTS
-------------------------------------------------- */

export function saveFlightResults(
  results
) {
  return saveItem(
    "flight-results",
    {
      ...results,
      savedAt:
        new Date().toISOString(),
    }
  );
}

export function getFlightResults() {
  return getItem(
    "flight-results",
    null
  );
}

export function clearFlightResults() {
  return removeItem(
    "flight-results"
  );
}

/* --------------------------------------------------
   SEARCH SESSION
-------------------------------------------------- */

export function saveSearchSession(
  session
) {
  return saveItem(
    "search-session",
    session
  );
}

export function getSearchSession() {
  return getItem(
    "search-session",
    null
  );
}

export function clearSearchSession() {
  return removeItem(
    "search-session"
  );
}

/* --------------------------------------------------
   TOURISM SEARCH
-------------------------------------------------- */

export function saveTourismSearch(
  type,
  search
) {
  const key =
    type === "education"
      ? "education-search"
      : "leisure-search";

  return saveItem(
    key,
    {
      ...search,
      savedAt:
        new Date().toISOString(),
    }
  );
}

export function getTourismSearch(
  type
) {
  const key =
    type === "education"
      ? "education-search"
      : "leisure-search";

  return getItem(
    key,
    null
  );
}

/* --------------------------------------------------
   RECENT SEARCHES
-------------------------------------------------- */

export function getRecentSearches() {
  return getItem(
    "recent-searches",
    []
  );
}

export function addRecentSearch(
  search,
  limit = 10
) {
  const existing =
    getRecentSearches();

  const entry = {
    ...search,
    id:
      search.id ||
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    createdAt:
      new Date().toISOString(),
  };

  const updated = [
    entry,
    ...existing.filter(
      (item) =>
        JSON.stringify(item) !==
        JSON.stringify(search)
    ),
  ].slice(
    0,
    limit
  );

  saveItem(
    "recent-searches",
    updated
  );

  return updated;
}

export function clearRecentSearches() {
  return removeItem(
    "recent-searches"
  );
}

/* --------------------------------------------------
   RECENT DESTINATIONS
-------------------------------------------------- */

export function getRecentDestinations() {
  return getItem(
    "recent-destinations",
    []
  );
}

export function addRecentDestination(
  airport,
  limit = 10
) {
  if (!airport) {
    return getRecentDestinations();
  }

  const code =
    airport.code ||
    airport.iata;

  if (!code) {
    return getRecentDestinations();
  }

  const existing =
    getRecentDestinations();

  const normalized = {
    code:
      String(code)
        .trim()
        .toUpperCase(),

    name:
      airport.name || "",

    city:
      airport.city || "",

    country:
      airport.country || "",
  };

  const updated = [
    normalized,
    ...existing.filter(
      (item) =>
        String(
          item.code
        ).toUpperCase() !==
        normalized.code
    ),
  ].slice(
    0,
    limit
  );

  saveItem(
    "recent-destinations",
    updated
  );

  return updated;
}

/* --------------------------------------------------
   USER PREFERENCES
-------------------------------------------------- */

export function savePreferences(
  preferences
) {
  const existing =
    getPreferences();

  return saveItem(
    "preferences",
    {
      ...existing,
      ...preferences,
      updatedAt:
        new Date().toISOString(),
    }
  );
}

export function getPreferences() {
  return getItem(
    "preferences",
    {
      currency: "USD",
      theme: "dark",
      cabin: "economy",
      defaultTripType:
        "roundtrip",
    }
  );
}

/* --------------------------------------------------
   CURRENCY
-------------------------------------------------- */

export function saveCurrency(
  currency
) {
  return saveItem(
    "currency",
    String(
      currency || "USD"
    ).toUpperCase()
  );
}

export function getCurrency() {
  return getItem(
    "currency",
    "USD"
  );
}

/* --------------------------------------------------
   THEME
-------------------------------------------------- */

export function saveTheme(
  theme
) {
  return saveItem(
    "theme",
    theme === "light"
      ? "light"
      : "dark"
  );
}

export function getTheme() {
  return getItem(
    "theme",
    "dark"
  );
}

/* --------------------------------------------------
   SELECTED FLIGHT
-------------------------------------------------- */

export function saveSelectedFlight(
  flight
) {
  return saveItem(
    "selected-flight",
    flight
  );
}

export function getSelectedFlight() {
  return getItem(
    "selected-flight",
    null
  );
}

export function clearSelectedFlight() {
  return removeItem(
    "selected-flight"
  );
}

/* --------------------------------------------------
   SELECTED TOURISM OPTION
-------------------------------------------------- */

export function saveSelectedTourism(
  option
) {
  return saveItem(
    "selected-tourism",
    option
  );
}

export function getSelectedTourism() {
  return getItem(
    "selected-tourism",
    null
  );
}

export function clearSelectedTourism() {
  return removeItem(
    "selected-tourism"
  );
}

/* --------------------------------------------------
   VISA SEARCH
-------------------------------------------------- */

export function saveVisaSearch(
  search
) {
  return saveItem(
    "visa-search",
    {
      ...search,
      savedAt:
        new Date().toISOString(),
    }
  );
}

export function getVisaSearch() {
  return getItem(
    "visa-search",
    null
  );
}

/* --------------------------------------------------
   ALERTS
-------------------------------------------------- */

export function saveTravelAlerts(
  alerts
) {
  return saveItem(
    "travel-alerts",
    Array.isArray(alerts)
      ? alerts
      : []
  );
}

export function getTravelAlerts() {
  return getItem(
    "travel-alerts",
    []
  );
}

export function addTravelAlert(
  alert
) {
  const existing =
    getTravelAlerts();

  const item = {
    ...alert,

    id:
      alert?.id ||
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    createdAt:
      new Date().toISOString(),

    active:
      alert?.active !== false,
  };

  const updated = [
    item,
    ...existing,
  ];

  saveTravelAlerts(
    updated
  );

  return updated;
}

export function removeTravelAlert(
  id
) {
  const updated =
    getTravelAlerts().filter(
      (alert) =>
        alert.id !== id
    );

  saveTravelAlerts(
    updated
  );

  return updated;
}

/* --------------------------------------------------
   BUDGET PLANNER
-------------------------------------------------- */

export function saveBudgetPlan(
  plan
) {
  return saveItem(
    "budget-plan",
    {
      ...plan,
      savedAt:
        new Date().toISOString(),
    }
  );
}

export function getBudgetPlan() {
  return getItem(
    "budget-plan",
    null
  );
}

export function clearBudgetPlan() {
  return removeItem(
    "budget-plan"
  );
}

/* --------------------------------------------------
   GENERIC JSON EXPORT
-------------------------------------------------- */

export function exportStorageData() {
  const data = {};

  try {
    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {
      const key =
        localStorage.key(
          index
        );

      if (
        !key ||
        !key.startsWith(
          PREFIX
        )
      ) {
        continue;
      }

      const shortKey =
        key.slice(
          PREFIX.length
        );

      data[shortKey] =
        getItem(
          shortKey
        );
    }
  } catch (error) {
    console.warn(
      "Unable to export FlyMatrix storage:",
      error
    );
  }

  return data;
}

export function importStorageData(
  data
) {
  if (
    !data ||
    typeof data !==
      "object"
  ) {
    return false;
  }

  try {
    Object.entries(
      data
    ).forEach(
      ([key, value]) => {
        saveItem(
          key,
          value
        );
      }
    );

    return true;
  } catch (error) {
    console.warn(
      "Unable to import FlyMatrix storage:",
      error
    );

    return false;
  }
}

export default {
  saveItem,
  getItem,
  removeItem,
  clearFlyMatrixStorage,

  saveFlightSearch,
  getFlightSearch,
  clearFlightSearch,

  saveFlightResults,
  getFlightResults,
  clearFlightResults,

  saveSearchSession,
  getSearchSession,
  clearSearchSession,

  saveTourismSearch,
  getTourismSearch,

  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,

  getRecentDestinations,
  addRecentDestination,

  savePreferences,
  getPreferences,

  saveCurrency,
  getCurrency,

  saveTheme,
  getTheme,

  saveSelectedFlight,
  getSelectedFlight,
  clearSelectedFlight,

  saveSelectedTourism,
  getSelectedTourism,
  clearSelectedTourism,

  saveVisaSearch,
  getVisaSearch,

  saveTravelAlerts,
  getTravelAlerts,
  addTravelAlert,
  removeTravelAlert,

  saveBudgetPlan,
  getBudgetPlan,
  clearBudgetPlan,

  exportStorageData,
  importStorageData,
};
