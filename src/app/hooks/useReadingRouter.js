import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import useRefreshReadingData from "../../modules/reading/hooks/useRefreshReadingData.js";

import { apiFetch, hasToken } from "../../shared/api/apiClient.js";

import { useAuth } from "../../modules/auth/context/AuthContext.jsx";
import { useLibrary } from "../../modules/libraries/context/LibraryContext.jsx";
import { useLibraryBooks } from "../../modules/libraries/context/LibraryBooksContext.jsx";
import { useUserBooks } from "../../modules/user-books/context/UserBooksContext.jsx";

const useReadingRouter = ({ closeMobileMenu }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const { activeLibraryId } = useLibrary();

  const {
    books: libraryBooks,
    isBooksLoading,
    refreshBooks,
    updateBook,
  } = useLibraryBooks();

  const {
    currentBooks,
    refreshCurrentBooks,
  } = useUserBooks();

  const refreshReadingData = useRefreshReadingData();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [readingBook, setReadingBook] = useState(null);

  const [isReadingBookLoading, setIsReadingBookLoading] =
    useState(false);

  const isReadingBookPickerOpen =
    searchParams.get("readerPicker") === "1";

  const readingBookId =
    searchParams.get("reading");

  const readingLibraryId =
    searchParams.get("readingLibrary");

  const readingBookPickerBooks = useMemo(() => {
    const currentBookOrder = new Map(
      currentBooks.map((book, index) => [
        book.id,
        index,
      ]),
    );

    return libraryBooks.map((book) => ({
      ...book,

      readingOrder: currentBookOrder.has(book.id)
        ? currentBookOrder.get(book.id)
        : null,
    }));
  }, [libraryBooks, currentBooks]);

  useEffect(() => {
    const loadReadingBook = async () => {
      if (!readingBookId) {
        setReadingBook(null);

        return;
      }

      if (isAuthLoading) {
        return;
      }

      if (!isAuthenticated) {
        const params =
          new URLSearchParams(searchParams);

        params.delete("reading");
        params.delete("readingLibrary");

        setSearchParams(params, {
          replace: true,
        });

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const libraryId =
        readingLibraryId || activeLibraryId;

      if (!libraryId) {
        setReadingBook(null);

        return;
      }

      try {
        setIsReadingBookLoading(true);

        const book = await apiFetch(
          `/api/libraries/${libraryId}/books/${readingBookId}`,
        );

        setReadingBook(book);
      } catch (error) {
        console.error(
          "Load reading book error:",
          error,
        );

        const params =
          new URLSearchParams(searchParams);

        params.delete("reading");
        params.delete("readingLibrary");

        setSearchParams(params, {
          replace: true,
        });

        setReadingBook(null);

        toast.error(
          "Не вдалося відкрити книгу",
        );
      } finally {
        setIsReadingBookLoading(false);
      }
    };

    loadReadingBook();
  }, [
    readingBookId,
    readingLibraryId,
    activeLibraryId,
    isAuthenticated,
    isAuthLoading,
  ]);

  const handleCloseReading = () => {
    const params =
      new URLSearchParams(searchParams);

    params.delete("reading");
    params.delete("readingLibrary");

    setSearchParams(params, {
      replace: true,
    });

    setReadingBook(null);
  };

  const handleReadingBookUpdated = (
    updatedBook,
  ) => {
    if (!updatedBook?.id) {
      return;
    }

    setReadingBook(updatedBook);

    if (
      !readingLibraryId ||
      readingLibraryId === activeLibraryId
    ) {
      updateBook(updatedBook);
    }
  };

  const handleReadingDataChanged = async () => {
    try {
      await refreshReadingData();
    } catch (error) {
      console.error(
        "Refresh reading data error:",
        error,
      );
    }
  };

  const handleOpenReader = async () => {
    closeMobileMenu();

    if (isAuthLoading) {
      return;
    }

    if (
      !isAuthenticated ||
      !hasToken()
    ) {
      toast.error(
        "Спочатку увійдіть в акаунт",
      );

      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (!activeLibraryId) {
      toast.error(
        "Спочатку оберіть бібліотеку",
      );

      return;
    }

    const params =
      new URLSearchParams(searchParams);

    params.delete("reading");
    params.delete("readingLibrary");
    params.set("readerPicker", "1");

    setSearchParams(params);

    try {
      const requests = [
        refreshCurrentBooks(),
      ];

      if (libraryBooks.length === 0) {
        requests.push(refreshBooks());
      }

      await Promise.all(requests);
    } catch (error) {
      console.error(
        "Load reader books error:",
        error,
      );

      toast.error(
        "Не вдалося завантажити книги",
      );

      const nextParams =
        new URLSearchParams(searchParams);

      nextParams.delete("readerPicker");

      setSearchParams(nextParams, {
        replace: true,
      });
    }
  };

  const handleSelectReadingBook = (
    book,
  ) => {
    if (!book?.id) {
      return;
    }

    const params =
      new URLSearchParams(searchParams);

    params.delete("readerPicker");
    params.delete("readingLibrary");
    params.set("reading", book.id);

    setSearchParams(params, {
      replace: true,
    });
  };

  const handleCloseReadingBookPicker = () => {
    navigate(-1);
  };

  return {
    readingBook,
    isReadingBookLoading,
    isReadingBookPickerOpen,
    readingBookPickerBooks,
    isBooksLoading,
    handleOpenReader,
    handleCloseReading,
    handleReadingBookUpdated,
    handleReadingDataChanged,
    handleSelectReadingBook,
    handleCloseReadingBookPicker,
  };
};

export default useReadingRouter;
