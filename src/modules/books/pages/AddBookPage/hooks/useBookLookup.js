import { useCallback, useRef, useState } from "react";

import toast from "react-hot-toast";

import { apiFetch } from "../../../../../shared/api/apiClient.js";

import { isValidIsbnLength, normalizeIsbn } from "../utils/bookHelpers.js";

const useBookLookup = ({ setIsbn, setBook, focusIsbnInput }) => {
  const [isSearching, setIsSearching] = useState(false);

  const activeSearchRef = useRef("");

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
        toast.error("ISBN повинен містити 10 або 13 цифр", {
          id: "isbn-invalid",
        });

        focusIsbnInput();

        return;
      }

      /*
       * Якщо такий самий запит уже виконується,
       * другий не запускаємо.
       */
      if (activeSearchRef.current === cleanIsbn) {
        return;
      }

      activeSearchRef.current = cleanIsbn;

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

  const resetLastSearch = useCallback(() => {
    activeSearchRef.current = "";
  }, []);

  return {
    isSearching,
    lookupBook,
    resetLastSearch,
  };
};

export default useBookLookup;



