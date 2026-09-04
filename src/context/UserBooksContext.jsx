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
import { useLibraryBooks } from "./LibraryBooksContext.jsx";

const UserBooksContext = createContext(null);

export const UserBooksProvider = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const { activeLibraryId, isLibrariesLoading } = useLibrary();

  const { updateBookFields } = useLibraryBooks();

  const [currentBooks, setCurrentBooks] = useState([]);
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [finishedBooks, setFinishedBooks] = useState([]);

  const [finishedTotal, setFinishedTotal] = useState(0);

  const [isCurrentBooksLoading, setIsCurrentBooksLoading] = useState(false);

  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const [isFinishedBooksLoading, setIsFinishedBooksLoading] = useState(false);

  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  const [currentBooksError, setCurrentBooksError] = useState("");

  const [wishlistError, setWishlistError] = useState("");

  const [finishedBooksError, setFinishedBooksError] = useState("");

  const resetUserBooks = useCallback(() => {
    setCurrentBooks([]);
    setWishlistBooks([]);
    setFinishedBooks([]);

    setFinishedTotal(0);

    setCurrentBooksError("");
    setWishlistError("");
    setFinishedBooksError("");
  }, []);

  const refreshCurrentBooks = useCallback(async () => {
    if (isAuthLoading || isLibrariesLoading) {
      return [];
    }

    if (!isAuthenticated) {
      setCurrentBooks([]);
      setCurrentBooksError("");

      return [];
    }

    try {
      setIsCurrentBooksLoading(true);
      setCurrentBooksError("");

      const params = new URLSearchParams();

      if (activeLibraryId) {
        params.set("libraryId", activeLibraryId);
      }

      const query = params.toString();

      const data = await apiFetch(
        `/api/user-books/current${query ? `?${query}` : ""}`,
      );

      const books = Array.isArray(data?.books) ? data.books : [];

      setCurrentBooks(books);

      return books;
    } catch (error) {
      console.error("Load current reading error:", error);

      setCurrentBooks([]);

      setCurrentBooksError("Не вдалося завантажити поточне читання");

      return [];
    } finally {
      setIsCurrentBooksLoading(false);
    }
  }, [activeLibraryId, isAuthenticated, isAuthLoading, isLibrariesLoading]);

  const refreshWishlist = useCallback(async () => {
    if (isAuthLoading || isLibrariesLoading) {
      return [];
    }

    if (!isAuthenticated) {
      setWishlistBooks([]);
      setWishlistError("");

      return [];
    }

    try {
      setIsWishlistLoading(true);
      setWishlistError("");

      const params = new URLSearchParams();

      if (activeLibraryId) {
        params.set("libraryId", activeLibraryId);
      }

      const query = params.toString();

      const data = await apiFetch(
        `/api/user-books/wishlist${query ? `?${query}` : ""}`,
      );

      const books = Array.isArray(data?.books) ? data.books : [];

      setWishlistBooks(books);

      return books;
    } catch (error) {
      console.error("Load wishlist error:", error);

      setWishlistBooks([]);

      setWishlistError("Не вдалося завантажити список");

      return [];
    } finally {
      setIsWishlistLoading(false);
    }
  }, [activeLibraryId, isAuthenticated, isAuthLoading, isLibrariesLoading]);

  const refreshFinishedBooks = useCallback(async () => {
    if (isAuthLoading || isLibrariesLoading) {
      return [];
    }

    if (!isAuthenticated) {
      setFinishedBooks([]);
      setFinishedTotal(0);
      setFinishedBooksError("");

      return [];
    }

    try {
      setIsFinishedBooksLoading(true);
      setFinishedBooksError("");

      const params = new URLSearchParams();

      params.set("page", "1");
      params.set("limit", "100");

      if (activeLibraryId) {
        params.set("libraryId", activeLibraryId);
      }

      const data = await apiFetch(
        `/api/user-books/finished?${params.toString()}`,
      );

      const books = Array.isArray(data?.books) ? data.books : [];

      const total = Number(data?.total) || Number(data?.count) || books.length;

      setFinishedBooks(books);
      setFinishedTotal(total);

      return books;
    } catch (error) {
      console.error("Load finished books error:", error);

      setFinishedBooks([]);
      setFinishedTotal(0);

      setFinishedBooksError("Не вдалося завантажити прочитані книги");

      return [];
    } finally {
      setIsFinishedBooksLoading(false);
    }
  }, [activeLibraryId, isAuthenticated, isAuthLoading, isLibrariesLoading]);

  const refreshUserBooks = useCallback(async () => {
    await Promise.all([
      refreshCurrentBooks(),
      refreshWishlist(),
      refreshFinishedBooks(),
    ]);
  }, [refreshCurrentBooks, refreshWishlist, refreshFinishedBooks]);

  const updateWishlistFlag = useCallback(
    (bookId, isWishlist) => {
      updateBookFields(bookId, {
        isWishlist,
      });

      setCurrentBooks((books) =>
        books.map((book) =>
          book.id === bookId
            ? {
                ...book,
                isWishlist,
              }
            : book,
        ),
      );

      setFinishedBooks((books) =>
        books.map((book) =>
          book.id === bookId
            ? {
                ...book,
                isWishlist,
              }
            : book,
        ),
      );
    },
    [updateBookFields],
  );

  const removeFromWishlist = useCallback(
    async (bookId) => {
      if (!bookId) {
        return false;
      }

      try {
        setWishlistLoadingId(bookId);

        await apiFetch(`/api/user-books/${bookId}/wishlist`, {
          method: "DELETE",
        });

        setWishlistBooks((books) => books.filter((book) => book.id !== bookId));

        updateWishlistFlag(bookId, false);

        return true;
      } catch (error) {
        console.error("Remove wishlist error:", error);

        return false;
      } finally {
        setWishlistLoadingId(null);
      }
    },
    [updateWishlistFlag],
  );

  const addToWishlist = useCallback(
    async (book) => {
      if (!book?.id) {
        return false;
      }

      try {
        setWishlistLoadingId(book.id);

        await apiFetch(`/api/user-books/${book.id}/wishlist`, {
          method: "POST",
        });

        updateWishlistFlag(book.id, true);

        await refreshWishlist();

        return true;
      } catch (error) {
        console.error("Add wishlist error:", error);

        return false;
      } finally {
        setWishlistLoadingId(null);
      }
    },
    [refreshWishlist, updateWishlistFlag],
  );

  const toggleWishlist = useCallback(
    async (book) => {
      if (!book?.id) {
        return false;
      }

      if (book.isWishlist) {
        return removeFromWishlist(book.id);
      }

      return addToWishlist(book);
    },
    [addToWishlist, removeFromWishlist],
  );

  useEffect(() => {
    if (isAuthLoading || isLibrariesLoading) {
      return;
    }

    if (!isAuthenticated) {
      resetUserBooks();

      return;
    }

    refreshUserBooks();
  }, [
    activeLibraryId,
    isAuthenticated,
    isAuthLoading,
    isLibrariesLoading,
    refreshUserBooks,
    resetUserBooks,
  ]);

  const value = useMemo(
    () => ({
      currentBooks,
      wishlistBooks,
      finishedBooks,
      finishedTotal,

      isCurrentBooksLoading,
      isWishlistLoading,
      isFinishedBooksLoading,

      currentBooksError,
      wishlistError,
      finishedBooksError,

      wishlistLoadingId,

      refreshCurrentBooks,
      refreshWishlist,
      refreshFinishedBooks,
      refreshUserBooks,

      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    }),
    [
      currentBooks,
      wishlistBooks,
      finishedBooks,
      finishedTotal,

      isCurrentBooksLoading,
      isWishlistLoading,
      isFinishedBooksLoading,

      currentBooksError,
      wishlistError,
      finishedBooksError,

      wishlistLoadingId,

      refreshCurrentBooks,
      refreshWishlist,
      refreshFinishedBooks,
      refreshUserBooks,

      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    ],
  );

  return (
    <UserBooksContext.Provider value={value}>
      {children}
    </UserBooksContext.Provider>
  );
};

export const useUserBooks = () => {
  const context = useContext(UserBooksContext);

  if (!context) {
    throw new Error("useUserBooks must be used inside UserBooksProvider");
  }

  return context;
};

export default UserBooksContext;
