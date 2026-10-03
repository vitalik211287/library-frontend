import { API_URL } from "../api/apiClient.js";

export const resolveAssetUrl = (url) => {
  if (!url) {
    return null;
  }

  if (url.startsWith("/uploads")) {
    return `${API_URL}${url}`;
  }

  return url;
};
