// src/pages/UserPage/hooks/useFinishedBooks.js

import { useEffect, useState } from "react";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useFinishedBooks = ({ readingBookId, onCountChange }) => {
  const [books, setBooks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadFinishedBooks = async () => {
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

        const data = await apiFetch("/api/user-books/finished");

        const items = Array.isArray(data?.books) ? data.books : [];

        setBooks(items);

        onCountChange?.(Number(data?.count) || items.length);
      } catch (loadError) {
        console.error("Load finished books error:", loadError);

        setBooks([]);

        setError("Не вдалося завантажити прочитані книги");

        onCountChange?.(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinishedBooks();
  }, [readingBookId, onCountChange]);

  return {
    books,
    isLoading,
    error,
  };
};

export default useFinishedBooks;
