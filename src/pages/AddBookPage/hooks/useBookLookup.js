import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { apiFetch } from "../../../utils/apiClient.js";

import { isValidIsbnLength, normalizeIsbn } from "../utils/bookHelpers.js";

const useBookLookup = ({ isbn, setIsbn, setBook, focusIsbnInput }) => {
  const [isSearching, setIsSearching] = useState(false);

  const searchTimerRef = useRef(null);

  const activeSearchRef = useRef("");

  const lastAutoSearchRef = useRef("");

  const resetLastSearch = useCallback(() => {
    lastAutoSearchRef.current = "";
  }, []);

  const lookupBook = useCallback(
    async (isbnValue, options = {}) => {
      const { force = false } = options;

      const cleanIsbn = normalizeIsbn(isbnValue);

      if (!cleanIsbn) {
        toast.error("Введіть ISBN");

        focusIsbnInput();

        return;
      }

      if (!isValidIsbnLength(cleanIsbn)) {
        return;
      }

      /*
       * Не запускаємо другий такий самий
       * запит, поки перший ще виконується.
       */
      if (activeSearchRef.current === cleanIsbn) {
        return;
      }

      /*
       * Автоматичний пошук одного ISBN
       * вдруге не запускаємо.
       *
       * Ручний submit може повторити
       * пошук через force: true.
       */
      if (!force && lastAutoSearchRef.current === cleanIsbn) {
        return;
      }

      activeSearchRef.current = cleanIsbn;

      if (!force) {
        lastAutoSearchRef.current = cleanIsbn;
      }

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

        if (error?.status === 404 || error?.status === 500) {
          toast.error("Книгу з таким ISBN не знайдено", {
            id: `isbn-not-found-${cleanIsbn}`,
          });

          return;
        }

        toast.error(error?.message || "Не вдалося з'єднатися із сервером", {
          id: `isbn-error-${cleanIsbn}`,
        });
      } finally {
        if (activeSearchRef.current === cleanIsbn) {
          activeSearchRef.current = "";
        }

        setIsSearching(false);

        focusIsbnInput();
      }
    },
    [focusIsbnInput, setBook, setIsbn],
  );

  useEffect(() => {
    const cleanIsbn = normalizeIsbn(isbn);

    if (!isValidIsbnLength(cleanIsbn)) {
      return undefined;
    }

    if (lastAutoSearchRef.current === cleanIsbn) {
      return undefined;
    }

    if (activeSearchRef.current === cleanIsbn) {
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
