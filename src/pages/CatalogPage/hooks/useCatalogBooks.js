import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";

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

      setBooks(Array.isArray(data) ? data : []);
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

  const updateBook = useCallback((updatedBook) => {
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
  }, []);

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
