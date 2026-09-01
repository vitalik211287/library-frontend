import { useEffect, useState } from "react";

import { useLibrary } from "../../../context/LibraryContext.jsx";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useFinishedBooks = ({ readingBookId, onCountChange }) => {
  const { activeLibraryId } = useLibrary();

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

        const params = new URLSearchParams();

        params.set("page", "1");

        params.set("limit", "12");

        if (activeLibraryId) {
          params.set("libraryId", activeLibraryId);
        }

        const data = await apiFetch(
          `/api/user-books/finished?${params.toString()}`,
        );

        const items = Array.isArray(data?.books) ? data.books : [];

        setBooks(items);

        onCountChange?.(
          Number(data?.total) || Number(data?.count) || items.length,
        );
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
  }, [readingBookId, activeLibraryId, onCountChange]);

  return {
    books,
    isLoading,
    error,
  };
};

export default useFinishedBooks;
