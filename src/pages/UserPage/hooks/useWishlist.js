import { useEffect, useState } from "react";

import { useLibrary } from "../../../context/LibraryContext.jsx";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useWishlist = () => {
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
      } catch (loadError) {
        console.error("Load wishlist error:", loadError);

        setBooks([]);

        setError("Не вдалося завантажити список");
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [activeLibraryId]);

  const removeFromWishlist = async (bookId) => {
    if (!bookId) {
      return;
    }

    try {
      await apiFetch(`/api/user-books/${bookId}/wishlist`, {
        method: "DELETE",
      });

      setBooks((currentBooks) =>
        currentBooks.filter((book) => book.id !== bookId),
      );
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
