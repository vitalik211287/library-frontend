import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import useRefreshReadingData from "../../modules/reading/hooks/useRefreshReadingData.js";
import { listOfflineManualSessions } from "../../modules/reading/offline/offlineReadingQueue.js";

import { apiFetch, hasToken } from "../../shared/api/apiClient.js";
import { getBookFiles } from "../../modules/books/api/bookFilesApi.js";
import { getOfflineEpubsForBook } from "../../modules/books/offline/offlineEpubStorage.js";

import { useAuth } from "../../modules/auth/context/AuthContext.jsx";
import { useLibrary } from "../../modules/libraries/context/LibraryContext.jsx";
import { useLibraryBooks } from "../../modules/libraries/context/LibraryBooksContext.jsx";
import { useUserBooks } from "../../modules/user-books/context/UserBooksContext.jsx";

// Derive a temporary on-device page from completed, not-yet-synced sessions.
// The queue remains the only durable source of the offline overlay.
const withPendingOfflineProgress = async (book, userId) => {
  if (!book || !userId || book.progressMode === "PERCENT") return book;

  try {
    const queued = await listOfflineManualSessions(userId);
    const pendingPage = queued.reduce((maximum, record) => {
      if (record.bookId !== book.id) return maximum;
      const page = record.session?.endPage;
      return Number.isSafeInteger(page) && page >= 0
        ? Math.max(maximum, page)
        : maximum;
    }, book.currentPage ?? 0);

    if (pendingPage <= (book.currentPage ?? 0)) return book;
    return { ...book, progressMode: "PAGES", currentPage: pendingPage };
  } catch (error) {
    console.warn("Cannot read pending offline book progress", error);
    return book;
  }
};

// A saved EPUB must be discoverable without calling the server.
// HTTP permission errors are never bypassed with offline storage.
const getAvailableEpubs = async ({ userId, libraryId, bookId }) => {
  if (navigator.onLine !== false) {
    try {
      const files = await getBookFiles(libraryId, bookId);
      return {
        epubs: Array.isArray(files)
          ? files.filter((file) => file.format === "EPUB")
          : [],
        offline: false,
      };
    } catch (error) {
      if (typeof error?.status === "number") throw error;
      console.warn("Using offline EPUB list after network failure", error);
    }
  }

  if (!userId) return { epubs: [], offline: true };

  const cached = await getOfflineEpubsForBook({ userId, libraryId, bookId });
  return {
    epubs: cached.map((record) => ({
      id: record.fileId,
      format: "EPUB",
      fileName: record.file?.fileName || "EPUB",
      sizeBytes: record.blob.size,
    })),
    offline: true,
  };
};

const useReadingRouter = ({ closeMobileMenu }) => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

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
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const [readingBook, setReadingBook] = useState(null);

  const [isReadingBookLoading, setIsReadingBookLoading] =
    useState(false);
  const [isSelectingBook, setIsSelectingBook] = useState(false);
  const [readerFilePicker, setReaderFilePicker] = useState(null);
  const [readerMethodChoice, setReaderMethodChoice] = useState(null);

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

      // Reuse the existing library snapshot only for the selected library.
      // Never treat another library's book as a match.
      const offlineBook = libraryId === activeLibraryId
        ? libraryBooks.find((book) => book.id === readingBookId)
        : null;

      try {
        setIsReadingBookLoading(true);

        // An offline draft must remain accessible even without an API response.
        if (typeof navigator !== "undefined" && !navigator.onLine && offlineBook) {
          setReadingBook(await withPendingOfflineProgress(offlineBook, user?.id));
          return;
        }

        const book = await apiFetch(
          `/api/libraries/${libraryId}/books/${readingBookId}`,
        );

        setReadingBook(await withPendingOfflineProgress(book, user?.id));
      } catch (error) {
        // Network failures can use the already-cached library listing.
        // Do not mask HTTP errors (e.g. 401/403/404).
        if (typeof error?.status !== "number" && offlineBook) {
          setReadingBook(await withPendingOfflineProgress(offlineBook, user?.id));
          return;
        }

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
    libraryBooks,
    isAuthenticated,
    isAuthLoading,
    user?.id,
    navigate,
    searchParams,
    setSearchParams,
  ]);

  const handleOpenReadingBook = async (bookId, libraryId = null, options = {}) => {
    if (!bookId) return;

    if (options.preferEpub) {
      const targetLibraryId = libraryId || activeLibraryId;
      if (!targetLibraryId) {
        toast.error("Спочатку оберіть бібліотеку.");
        return;
      }

      try {
        const { epubs, offline } = await getAvailableEpubs({
          userId: user?.id,
          libraryId: targetLibraryId,
          bookId,
        });

        if (epubs.length === 1) {
          openEbookFile({ id: bookId }, epubs[0], targetLibraryId);
          return;
        }

        if (epubs.length > 1) {
          const book =
            currentBooks.find((item) => item.id === bookId) ||
            libraryBooks.find((item) => item.id === bookId) ||
            { id: bookId, title: "Книга" };
          setReaderFilePicker({
            book,
            libraryId: targetLibraryId,
            returnToPicker: false,
            offlineFiles: offline ? epubs : null,
          });
          return;
        }
      } catch (error) {
        console.error("Cannot check available EPUB files:", error);
        if (typeof error?.status === "number") {
          toast.error("Не вдалося перевірити файли книги.");
          return;
        }
        // Local storage unavailable: manual reading remains accessible.
      }
    }

    const params = new URLSearchParams(searchParams);
    params.delete("readerPicker");
    params.set("reading", bookId);
    if (libraryId) {
      params.set("readingLibrary", libraryId);
    } else {
      params.delete("readingLibrary");
    }
    setSearchParams(params, {
      state: { ...location.state, readingOverlay: true },
    });
  };

  const handleCloseReading = () => {
    if (location.state?.readingOverlay) {
      navigate(-1);

      return;
    }

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

      const libraryId =
        readingLibraryId || activeLibraryId;

      if (readingBookId && libraryId) {
        const updatedBook = await apiFetch(
          `/api/libraries/${libraryId}/books/${readingBookId}`,
        );

        setReadingBook(updatedBook);

        if (
          !readingLibraryId ||
          readingLibraryId === activeLibraryId
        ) {
          updateBook(updatedBook);
        }
      }
    } catch (error) {
      console.error(
        "Refresh reading data error:",
        error,
      );
    }
  };

  const handleOpenReader = async () => {
    closeMobileMenu();
    setReaderMethodChoice(null);

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

    setSearchParams(params, {
      state: {
        ...location.state,
        readingOverlay: true,
      },
    });

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

  const handleSelectManualReadingBook = (book) => {
    if (!book?.id) return;
    setReaderMethodChoice(null);
    setReaderFilePicker(null);
    const params = new URLSearchParams(searchParams);
    params.delete("readerPicker");
    params.delete("readingLibrary");
    params.set("reading", book.id);
    setSearchParams(params, { replace: true, state: location.state });
  };

  const openEbookFile = (book, file, libraryId) => {
    if (!book?.id || !file?.id || !libraryId) return;
    const params = new URLSearchParams(searchParams);
    params.delete("readerPicker");
    params.delete("reading");
    params.delete("readingLibrary");
    const query = params.toString();
    const ebookFrom = location.pathname + (query ? "?" + query : "");
    setReaderFilePicker(null);
    setReaderMethodChoice(null);
    navigate(
      "/reader/" + encodeURIComponent(libraryId) + "/" + encodeURIComponent(book.id) + "/" + encodeURIComponent(file.id),
      { state: { ebookFrom } },
    );
  };

  // The same EPUB lookup is used online and offline; a cached EPUB still
  // presents the existing "EPUB / manual session" chooser.
  const handleSelectReadingBook = async (book) => {
    if (!book?.id || !activeLibraryId || isSelectingBook) return;
    setIsSelectingBook(true);
    try {
      const { epubs, offline } = await getAvailableEpubs({
        userId: user?.id,
        libraryId: activeLibraryId,
        bookId: book.id,
      });
      if (epubs.length > 0) {
        setReaderMethodChoice({
          book,
          epubs,
          libraryId: activeLibraryId,
          offline,
        });
      } else {
        handleSelectManualReadingBook(book);
      }
    } catch (error) {
      console.error("Failed to check available EPUB files:", error);
      if (typeof error?.status === "number") {
        toast.error("Не вдалося перевірити файли книги");
      } else {
        handleSelectManualReadingBook(book);
      }
    } finally {
      setIsSelectingBook(false);
    }
  };

  const handleReadSelectedEbook = () => {
    const choice = readerMethodChoice;
    if (!choice) return;
    if (choice.epubs.length === 1) {
      openEbookFile(choice.book, choice.epubs[0], choice.libraryId);
      return;
    }
    setReaderFilePicker({
      book: choice.book,
      libraryId: choice.libraryId,
      offlineFiles: choice.offline ? choice.epubs : null,
    });
    const params = new URLSearchParams(searchParams);
    params.delete("readerPicker");
    setSearchParams(params, { replace: true, state: location.state });
  };

  const handleBackToReadingBooks = () => setReaderMethodChoice(null);

  const handleSelectReaderFile = (file) => {
    if (readerFilePicker && file?.format === "EPUB") {
      openEbookFile(readerFilePicker.book, file, readerFilePicker.libraryId);
    }
  };

  const handleCloseReaderFilePicker = () => {
    const returnToPicker = readerFilePicker?.returnToPicker !== false;
    setReaderFilePicker(null);
    if (!returnToPicker) return;
    const params = new URLSearchParams(searchParams);
    params.set("readerPicker", "1");
    setSearchParams(params, { replace: true, state: location.state });
  };

  const handleCloseReadingBookPicker = () => {
    setReaderMethodChoice(null);
    navigate(-1);
  };

  return {
    readingBook,
    isReadingBookLoading,
    isReadingBookPickerOpen,
    isSelectingBook,
    readerMethodChoice,
    readerFilePicker,
    readingBookPickerBooks,
    isBooksLoading,
    handleOpenReader,
    handleOpenReadingBook,
    handleCloseReading,
    handleReadingBookUpdated,
    handleReadingDataChanged,
    handleSelectReadingBook,
    handleSelectManualReadingBook,
    handleReadSelectedEbook,
    handleBackToReadingBooks,
    handleSelectReaderFile,
    handleCloseReaderFilePicker,
    handleCloseReadingBookPicker,
  };
};

export default useReadingRouter;
