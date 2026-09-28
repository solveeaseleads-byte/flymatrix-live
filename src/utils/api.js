const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/$/, "");

async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data.error || "API request failed"
    );
  }

  return data;
}

export async function apiFetch(
  endpoint,
  params = {},
  options = {}
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.set(key, value);
      }
    }
  );

  const queryString = query.toString();

  const url =
    `${API_BASE}/api/${endpoint.replace(/^\/+/, "")}` +
    (queryString ? `?${queryString}` : "");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  return parseResponse(response);
}

export async function apiPost(
  endpoint,
  body = {},
  options = {}
) {
  const url =
    `${API_BASE}/api/${endpoint.replace(/^\/+/, "")}`;

  const response = await fetch(url, {
    method: "POST",
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },

    body: JSON.stringify(body)
  });

  return parseResponse(response);
}
