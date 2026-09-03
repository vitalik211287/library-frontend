import { useEffect, useState } from "react";

import { useLibrary } from "../../../context/LibraryContext.jsx";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useFinishedBooks = ({ readingBookId } = {}) => {
  const { activeLibraryId } = useLibrary();

  const [books, setBooks] = useState([]);

  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadFinishedBooks = async () => {
      if (!hasToken()) {
        setBooks([]);
        setTotal(0);
        setIsLoading(false);
        setError("");

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

        const nextTotal =
          Number(data?.total) || Number(data?.count) || items.length;

        setBooks(items);
        setTotal(nextTotal);
      } catch (loadError) {
        console.error("Load finished books error:", loadError);

        setBooks([]);
        setTotal(0);

        setError("Не вдалося завантажити прочитані книги");
      } finally {
        setIsLoading(false);
      }
    };

    loadFinishedBooks();
  }, [readingBookId, activeLibraryId]);

  return {
    books,
    total,
    isLoading,
    error,
  };
};

export default useFinishedBooks;
