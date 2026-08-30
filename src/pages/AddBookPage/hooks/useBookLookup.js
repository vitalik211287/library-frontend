import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { apiFetch } from "../../../utils/apiClient.js";

import { isValidIsbnLength, normalizeIsbn } from "../utils/bookHelpers.js";

const useBookLookup = ({ isbn, setIsbn, book, setBook, focusIsbnInput }) => {
  const [isSearching, setIsSearching] = useState(false);

  const searchTimerRef = useRef(null);

  const lastSearchedIsbnRef = useRef("");

  const resetLastSearch = useCallback(() => {
    lastSearchedIsbnRef.current = "";
  }, []);

  const lookupBook = useCallback(
    async (isbnValue) => {
      const cleanIsbn = normalizeIsbn(isbnValue);

      if (!cleanIsbn) {
        toast.error("Введіть ISBN");

        focusIsbnInput();

        return;
      }

      if (!isValidIsbnLength(cleanIsbn)) {
        return;
      }

      if (lastSearchedIsbnRef.current === cleanIsbn && book) {
        return;
      }

      lastSearchedIsbnRef.current = cleanIsbn;

      setIsbn(cleanIsbn);
      setBook(null);
      setIsSearching(true);

      try {
        const data = await apiFetch(
          `/api/books/lookup/${encodeURIComponent(cleanIsbn)}`,
          {
            auth: false,
          },
        );

        setBook(data);
      } catch (error) {
        console.error("Помилка пошуку книги:", error);

        resetLastSearch();

        if (error.status === 404 || error.status === 500) {
          toast.error("Книгу з таким ISBN не знайдено");

          return;
        }

        toast.error(error.message || "Не вдалося з'єднатися із сервером");
      } finally {
        setIsSearching(false);
        focusIsbnInput();
      }
    },
    [book, focusIsbnInput, resetLastSearch, setBook, setIsbn],
  );

  useEffect(() => {
    const cleanIsbn = normalizeIsbn(isbn);

    if (!isValidIsbnLength(cleanIsbn)) {
      return undefined;
    }

    if (lastSearchedIsbnRef.current === cleanIsbn) {
      return undefined;
    }

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      lookupBook(cleanIsbn);
    }, 200);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [isbn, lookupBook]);

  return {
    isSearching,
    lookupBook,
    resetLastSearch,
  };
};

export default useBookLookup;
