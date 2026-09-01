import { useEffect, useState } from "react";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

import { useLibrary } from "../../../context/LibraryContext.jsx";

const useWishlist = ({ onCountChange }) => {
  const { activeLibraryId } = useLibrary();

  const [books, setBooks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadWishlist = async () => {
      if (!hasToken()) {
        setBooks([]);
        setIsLoading(false);
        setError("");

        onCountChange?.(0);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const query = activeLibraryId
          ? `?libraryId=${encodeURIComponent(activeLibraryId)}`
          : "";

        const data = await apiFetch(`/api/user-books/wishlist${query}`);

        const items = Array.isArray(data?.books) ? data.books : [];

        setBooks(items);

        onCountChange?.(Number(data?.count) || items.length);
      } catch (loadError) {
        console.error("Load wishlist error:", loadError);

        setBooks([]);

        setError("Не вдалося завантажити список");

        onCountChange?.(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [activeLibraryId, onCountChange]);

  const removeFromWishlist = async (bookId) => {
    if (!bookId) {
      return;
    }

    try {
      await apiFetch(`/api/user-books/${bookId}/wishlist`, {
        method: "DELETE",
      });

      setBooks((currentBooks) => {
        const nextBooks = currentBooks.filter((book) => book.id !== bookId);

        onCountChange?.(nextBooks.length);

        return nextBooks;
      });
    } catch (removeError) {
      console.error("Remove wishlist error:", removeError);
    }
  };

  return {
    books,
    isLoading,
    error,
    removeFromWishlist,
  };
};

export default useWishlist;
