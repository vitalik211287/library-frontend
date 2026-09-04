import { useLibraryBooks } from "../../../context/LibraryBooksContext.jsx";
import { useUserBooks } from "../../../context/UserBooksContext.jsx";

const useCatalogBooks = () => {
  const { books, isBooksLoading, booksError, refreshBooks, updateBook } =
    useLibraryBooks();

  const { toggleWishlist, wishlistLoadingId } = useUserBooks();

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
