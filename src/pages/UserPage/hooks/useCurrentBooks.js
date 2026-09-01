import { useEffect, useState } from "react";

import { useLibrary } from "../../../context/LibraryContext.jsx";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useCurrentBooks = ({ readingBookId, onBooksChange }) => {
  const { activeLibraryId } = useLibrary();

  const [currentBooks, setCurrentBooks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadCurrentBooks = async () => {
      if (!hasToken() || !activeLibraryId) {
        setCurrentBooks([]);
        setIsLoading(false);
        setError("");

        onBooksChange?.(0);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await apiFetch(`/api/libraries/${activeLibraryId}/books`);

        const books = Array.isArray(data)
          ? data.filter((book) => book.status === "READING")
          : [];

        setCurrentBooks(books);

        onBooksChange?.(books.length);
      } catch (loadError) {
        console.error("Load current reading error:", loadError);

        setCurrentBooks([]);

        setError("Не вдалося завантажити поточне читання");

        onBooksChange?.(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentBooks();
  }, [readingBookId, onBooksChange, activeLibraryId]);

  return {
    currentBooks,
    isLoading,
    error,
  };
};

export default useCurrentBooks;
