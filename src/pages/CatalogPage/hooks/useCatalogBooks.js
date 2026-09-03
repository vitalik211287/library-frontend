import { useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";
import { useLibraryBooks } from "../../../context/LibraryBooksContext.jsx";

const useCatalogBooks = () => {
  const {
    books,
    isBooksLoading,
    booksError,
    refreshBooks,
    updateBook,
    updateBookFields,
  } = useLibraryBooks();

  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  const toggleWishlist = async (book) => {
    if (!book?.id) {
      return false;
    }

    try {
      setWishlistLoadingId(book.id);

      const isWishlist = Boolean(book.isWishlist);

      await apiFetch(`/api/user-books/${book.id}/wishlist`, {
        method: isWishlist ? "DELETE" : "POST",
      });

      updateBookFields(book.id, {
        isWishlist: !isWishlist,
      });

      return true;
    } catch (error) {
      console.error("Wishlist toggle error:", error);

      return false;
    } finally {
      setWishlistLoadingId(null);
    }
  };

  return {
    books,
    message: booksError,
    isLoading: isBooksLoading,
    wishlistLoadingId,

    toggleWishlist,
    updateBook,
    fetchBooks: refreshBooks,
  };
};

export default useCatalogBooks;
