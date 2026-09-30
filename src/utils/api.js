const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "";

/*
 * Build a backend API URL.
 *
 * Examples:
 *   apiUrl("flights")
 *   -> /api/flights
 *
 *   apiUrl("booking/resolve")
 *   -> /api/booking/resolve
 */
export function apiUrl(path = "") {
  const cleanPath =
    String(path)
      .replace(/^\/+/, "");

  const base =
    API_BASE.replace(/\/+$/, "");

  if (!cleanPath) {
    return `${base}/api`;
  }

  return `${base}/api/${cleanPath}`;
}

/*
 * Safely parse a JSON response.
 */
async function parseResponse(response) {
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

  return text
    ? { data: text }
    : {};
}

/*
 * Common error extraction.
 */
function getErrorMessage(
  data,
  response
) {
  if (
    data &&
    typeof data === "object"
  ) {
    return (
      data.error ||
      data.message ||
      data.details ||
      `Request failed with status ${response.status}.`
    );
  }

  return (
    `Request failed with status ${response.status}.`
  );
}

/*
 * Generic request helper.
 */
export async function apiRequest(
  path,
  options = {}
) {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    ...rest
  } = options;

  const requestHeaders = {
    Accept:
      "application/json",
    ...headers,
  };

  let requestBody = body;

  /*
   * Automatically serialize plain objects.
   */
  if (
    body !== undefined &&
    body !== null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob)
  ) {
    requestHeaders[
      "Content-Type"
    ] =
      requestHeaders[
        "Content-Type"
      ] ||
      "application/json";

    requestBody =
      JSON.stringify(body);
  }

  const response =
    await fetch(
      apiUrl(path),
      {
        method,
        headers:
          requestHeaders,
        body:
          requestBody,
        signal,
        ...rest,
      }
    );

  const data =
    await parseResponse(
      response
    );

  if (!response.ok) {
    const error =
      new Error(
        getErrorMessage(
          data,
          response
        )
      );

    error.status =
      response.status;

    error.response =
      data;

    throw error;
  }

  return data;
}

/*
 * GET request.
 */
export function apiGet(
  path,
  options = {}
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "GET",
    }
  );
}

/*
 * POST request.
 */
export function apiPost(
  path,
  body,
  options = {}
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "POST",
      body,
    }
  );
}

/*
 * PUT request.
 */
export function apiPut(
  path,
  body,
  options = {}
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "PUT",
      body,
    }
  );
}

/*
 * PATCH request.
 */
export function apiPatch(
  path,
  body,
  options = {}
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "PATCH",
      body,
    }
  );
}

/*
 * DELETE request.
 */
export function apiDelete(
  path,
  options = {}
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "DELETE",
    }
  );
}

export default {
  apiUrl,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
};
