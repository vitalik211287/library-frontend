import { apiFetch } from "../../../shared/api/apiClient.js";

export const getBookRecommendations = (libraryId, tags, limit = 5) => {
  const params = new URLSearchParams();

  params.set("tags", tags.join(","));
  params.set("limit", String(limit));

  return apiFetch(
    `/api/libraries/${libraryId}/recommendations?${params.toString()}`,
  );
};
