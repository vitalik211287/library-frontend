import { useEffect, useState } from "react";

import { useLibrary } from "../../../context/LibraryContext.jsx";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useCurrentBooks = ({ readingBookId } = {}) => {
  const { activeLibraryId } = useLibrary();

  const [currentBooks, setCurrentBooks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadCurrentBooks = async () => {
      if (!hasToken()) {
        setCurrentBooks([]);
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

        const data = await apiFetch(`/api/user-books/current${query}`);

        const books = Array.isArray(data?.books) ? data.books : [];

        setCurrentBooks(books);
      } catch (loadError) {
        console.error("Load current reading error:", loadError);

        setCurrentBooks([]);

        setError("Не вдалося завантажити поточне читання");
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentBooks();
  }, [readingBookId, activeLibraryId]);

  return {
    currentBooks,
    isLoading,
    error,
  };
};

export default useCurrentBooks;
