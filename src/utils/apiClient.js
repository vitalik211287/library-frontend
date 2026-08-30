const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://library-backend-production-5d60.up.railway.app";

const getToken = () => localStorage.getItem("token");

const hasToken = () => Boolean(getToken());

const apiFetch = async (path, options = {}) => {
  const {
    auth = true,
    headers: customHeaders = {},
    body,
    ...fetchOptions
  } = options;

  const headers = new Headers(customHeaders);

  if (auth) {
    const token = getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let requestBody = body;

  const isFormData = body instanceof FormData;

  const isPlainObject =
    body && typeof body === "object" && !isFormData && !(body instanceof Blob);

  if (isPlainObject) {
    headers.set("Content-Type", "application/json");

    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    body: requestBody,
  });

  const contentType = response.headers.get("content-type");

  let data = null;

  if (response.status !== 204) {
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && data.message
        ? data.message
        : `HTTP error ${response.status}`;

    throw new Error(message);
  }

  return data;
};

export { API_URL, apiFetch, getToken, hasToken };
