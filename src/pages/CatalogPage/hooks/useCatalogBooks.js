import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";

import { getDefaultUserBookData } from "../utils/catalogHelpers.js";

const useCatalogBooks = ({
  isAuthenticated,
  isAuthLoading,
  activeLibraryId,
  isLibrariesLoading,
}) => {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState("");
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  const fetchBooks = useCallback(async () => {
    if (!isAuthenticated) {
      setBooks([]);
      setMessage("");
      return;
    }

    if (!activeLibraryId) {
      setBooks([]);
      setMessage("Створіть або виберіть бібліотеку");
      return;
    }

    try {
      setMessage("");

      const data = await apiFetch(`/api/libraries/${activeLibraryId}/books`);

      const catalogBooks = Array.isArray(data) ? data : [];

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
  }, [isAuthenticated, activeLibraryId]);

  useEffect(() => {
    if (isAuthLoading || isLibrariesLoading) {
      return;
    }

    fetchBooks();
  }, [isAuthLoading, isLibrariesLoading, fetchBooks]);

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
