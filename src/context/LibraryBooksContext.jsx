import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch } from "../utils/apiClient.js";

import { useAuth } from "./AuthContext.jsx";
import { useLibrary } from "./LibraryContext.jsx";

const LibraryBooksContext = createContext(null);

export const LibraryBooksProvider = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const { activeLibraryId, isLibrariesLoading } = useLibrary();

  const [books, setBooks] = useState([]);
  const [isBooksLoading, setIsBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState("");

  const refreshBooks = useCallback(async () => {
    if (isAuthLoading || isLibrariesLoading) {
      return [];
    }

    if (!isAuthenticated || !activeLibraryId) {
      setBooks([]);
      setBooksError("");

      return [];
    }

    try {
      setIsBooksLoading(true);
      setBooksError("");

      const data = await apiFetch(`/api/libraries/${activeLibraryId}/books`);

      const nextBooks = Array.isArray(data)
        ? data
        : Array.isArray(data?.books)
          ? data.books
          : [];

      setBooks(nextBooks);

      return nextBooks;
    } catch (error) {
      console.error("Load library books error:", error);

      setBooks([]);
      setBooksError("Не вдалося завантажити книги бібліотеки");

      return [];
    } finally {
      setIsBooksLoading(false);
    }
  }, [activeLibraryId, isAuthenticated, isAuthLoading, isLibrariesLoading]);

  useEffect(() => {
    if (isAuthLoading || isLibrariesLoading) {
      return;
    }

    refreshBooks();
  }, [isAuthLoading, isLibrariesLoading, refreshBooks]);

  const updateBook = useCallback((updatedBook) => {
    if (!updatedBook?.id) {
      return;
    }

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

  const updateBookFields = useCallback((bookId, fields) => {
    if (!bookId) {
      return;
    }

    setBooks((currentBooks) =>
      currentBooks.map((book) =>
        book.id === bookId
          ? {
              ...book,
              ...fields,
            }
          : book,
      ),
    );
  }, []);

  const getBookById = useCallback(
    (bookId) => books.find((book) => book.id === bookId) ?? null,
    [books],
  );

  const value = useMemo(
    () => ({
      books,
      isBooksLoading,
      booksError,

      refreshBooks,
      updateBook,
      updateBookFields,
      getBookById,
    }),
    [
      books,
      isBooksLoading,
      booksError,
      refreshBooks,
      updateBook,
      updateBookFields,
      getBookById,
    ],
  );

  return (
    <LibraryBooksContext.Provider value={value}>
      {children}
    </LibraryBooksContext.Provider>
  );
};

export const useLibraryBooks = () => {
  const context = useContext(LibraryBooksContext);

  if (!context) {
    throw new Error("useLibraryBooks must be used inside LibraryBooksProvider");
  }

  return context;
};

export default LibraryBooksContext;
