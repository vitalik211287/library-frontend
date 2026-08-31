import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { apiFetch } from "../../../utils/apiClient.js";

import { isValidIsbnLength, normalizeIsbn } from "../utils/bookHelpers.js";

const useBookLookup = ({ isbn, setIsbn, setBook, focusIsbnInput }) => {
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
        toast.error("Введіть ISBN", {
          id: "isbn-empty",
        });

        focusIsbnInput();

        return;
      }

      if (!isValidIsbnLength(cleanIsbn)) {
        return;
      }

      /*
       * Якщо цей ISBN уже шукається
       * або вже був знайдений /
       * не знайдений — автоматично
       * повторний запит не робимо.
       *
       * Для ручного повторного
       * пошуку AddBookPage викликає
       * resetLastSearch().
       */
      if (lastSearchedIsbnRef.current === cleanIsbn) {
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

        /*
         * Тут НЕ скидаємо
         * lastSearchedIsbnRef.
         *
         * Інакше useEffect одразу
         * повторно шукає той самий
         * ISBN і показує ще один toast.
         */

        if (error.status === 404 || error.status === 500) {
          toast.error("Книгу з таким ISBN не знайдено", {
            id: `isbn-not-found-${cleanIsbn}`,
          });

          return;
        }

        toast.error(error.message || "Не вдалося з'єднатися із сервером", {
          id: `isbn-error-${cleanIsbn}`,
        });
      } finally {
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
