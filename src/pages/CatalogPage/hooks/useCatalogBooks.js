import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";

import { getDefaultUserBookData } from "../utils/catalogHelpers.js";

const useCatalogBooks = ({ isAuthenticated, isAuthLoading }) => {
  const [books, setBooks] = useState([]);

  const [message, setMessage] = useState("");

  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      setMessage("");

      const data = await apiFetch("/api/books", {
        auth: false,
      });

      const catalogBooks = Array.isArray(data) ? data : [];

      if (!isAuthenticated) {
        setBooks(catalogBooks);

        return;
      }

      const booksWithReadingData = await Promise.all(
        catalogBooks.map(async (book) => {
          try {
            const userBook = await apiFetch(`/api/user-books/${book.id}`);

            return {
              ...book,

              currentPage: userBook?.currentPage ?? 0,

              status: userBook?.status ?? "NOT_STARTED",

              rating: userBook?.rating ?? null,

              isWishlist: userBook?.isWishlist ?? false,
            };
          } catch (loadError) {
            console.error(
              `Помилка отримання даних читання для ${book.id}:`,
              loadError,
            );

            return {
              ...book,
              ...getDefaultUserBookData(),
            };
          }
        }),
      );

      setBooks(booksWithReadingData);
    } catch (loadError) {
      console.error("Помилка завантаження книг:", loadError);

      setBooks([]);

      setMessage("Помилка завантаження бібліотеки");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    fetchBooks();
  }, [isAuthLoading, fetchBooks]);

  const toggleWishlist = async (book) => {
    try {
      setWishlistLoadingId(book.id);

      setMessage("");

      const isWishlist = Boolean(book.isWishlist);

      await apiFetch(`/api/user-books/${book.id}/wishlist`, {
        method: isWishlist ? "DELETE" : "POST",
      });

      setBooks((currentBooks) =>
        currentBooks.map((currentBook) =>
          currentBook.id === book.id
            ? {
                ...currentBook,

                isWishlist: !isWishlist,
              }
            : currentBook,
        ),
      );

      return true;
    } catch (wishlistError) {
      console.error("Wishlist toggle error:", wishlistError);

      setMessage("Не вдалося оновити «Хочу прочитати»");

      return false;
    } finally {
      setWishlistLoadingId(null);
    }
  };

  const updateBook = (updatedBook) => {
    setBooks((currentBooks) =>
      currentBooks.map((book) =>
        book.id === updatedBook.id
          ? {
              ...book,
              ...updatedBook,
            }
          : book,
      ),
    );
  };

  return {
    books,
    message,
    wishlistLoadingId,

    toggleWishlist,
    updateBook,
    fetchBooks,
  };
};

export default useCatalogBooks;
