import { useEffect, useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";

const useCurrentBooks = ({ readingBookId, onBooksChange }) => {
  const [currentBooks, setCurrentBooks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadCurrentBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCurrentBooks([]);
        setIsLoading(false);
        setError("");

        onBooksChange?.(0);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await apiFetch("/api/user-books/current");

        const books = Array.isArray(data?.books) ? data.books : [];

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
  }, [readingBookId, onBooksChange]);

  return {
    currentBooks,
    isLoading,
    error,
  };
};

export default useCurrentBooks;
