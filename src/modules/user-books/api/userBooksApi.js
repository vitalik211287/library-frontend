import { apiFetch } from "../../../shared/api/apiClient.js";

const buildLibraryQuery = (libraryId) => {
  const params = new URLSearchParams();

  if (libraryId) {
    params.set("libraryId", libraryId);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
};

export const getCurrentBooks = (libraryId) =>
  apiFetch(`/api/user-books/current${buildLibraryQuery(libraryId)}`);

export const getWishlistBooks = (libraryId) =>
  apiFetch(`/api/user-books/wishlist${buildLibraryQuery(libraryId)}`);

export const getFinishedBooks = (libraryId) => {
  const params = new URLSearchParams();

  params.set("page", "1");
  params.set("limit", "100");

  if (libraryId) {
    params.set("libraryId", libraryId);
  }

  return apiFetch(`/api/user-books/finished?${params.toString()}`);
};

export const addBookToWishlist = (bookId) =>
  apiFetch(`/api/user-books/${bookId}/wishlist`, {
    method: "POST",
  });

export const removeBookFromWishlist = (bookId) =>
  apiFetch(`/api/user-books/${bookId}/wishlist`, {
    method: "DELETE",
  });
