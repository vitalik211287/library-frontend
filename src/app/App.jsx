import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useEffect, useMemo, useState } from "react";

import { Toaster, toast } from "react-hot-toast";

import "./App.css";

import CatalogPage from "../modules/books/pages/CatalogPage/CatalogPage.jsx";
import AddBookPage from "../modules/books/pages/AddBookPage/AddBookPage.jsx";
import LoginPage from "../modules/auth/pages/LoginPage/LoginPage.jsx";
import RegisterPage from "../modules/auth/pages/RegisterPage/RegisterPage.jsx";
import ReadingCalendarPage from "../modules/reading/pages/ReadingCalendarPage/ReadingCalendarPage.jsx";
import UserPage from "../modules/users/pages/UserPage/UserPage.jsx";
import SettingsPage from "../modules/users/pages/SettingsPage/SettingsPage.jsx";
import StatsPage from "../modules/stats/pages/StatsPage/StatsPage.jsx";
import AchievementsPage from "../modules/stats/pages/AchievementsPage/AchievementsPage.jsx";
import HomePage from "../pages/HomePage/HomePage.jsx";
import LandingPage from "../pages/LandingPage/LandingPage.jsx";
import LibraryManagementPage from "../modules/libraries/pages/LibraryManagementPage/LibraryManagementPage.jsx";
import WishlistPage from "../modules/user-books/pages/WishlistPage/WishlistPage.jsx";
import FinishedBooksPage from "../modules/user-books/pages/FinishedBooksPage/FinishedBooksPage.jsx";

import UserSearchPage from "../modules/users/pages/UserPage/components/Users/UserSearchPage/UserSearchPage.jsx";
import FollowingPage from "../modules/users/pages/UserPage/components/Users/FollowingPage/FollowingPage.jsx";
import FollowersPage from "../modules/users/pages/UserPage/components/Users/FollowersPage/FollowersPage.jsx";

import RightSidebar from "../shared/components/RightSidebar/RightSidebar.jsx";
import ReadingModal from "../modules/reading/components/ReadingModal/ReadingModal.jsx";
import ReadingBookPicker from "../modules/reading/components/ReadingBookPicker/ReadingBookPicker.jsx";

import MobileNavigation from "../shared/components/AppNavigation/MobileNavigation.jsx";
import DesktopNavigation from "../shared/components/AppNavigation/DesktopNavigation.jsx";

import useRefreshReadingData from "../modules/reading/hooks/useRefreshReadingData.js";

import { API_URL, apiFetch, hasToken } from "../shared/api/apiClient.js";

import { useAuth } from "../modules/auth/context/AuthContext.jsx";

import { useTheme } from "../shared/context/ThemeContext.jsx";

import { useLibrary } from "../modules/libraries/context/LibraryContext.jsx";

import { useLibraryBooks } from "../modules/libraries/context/LibraryBooksContext.jsx";

import { useUserBooks } from "../modules/user-books/context/UserBooksContext.jsx";

/* =========================
   PROTECTED ROUTE
========================= */

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const location = useLocation();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  return children;
};

/* =========================
   APP
========================= */

const App = () => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  const { themeMode, setThemeMode } = useTheme();

  const { activeLibraryId } = useLibrary();

  const {
    books: libraryBooks,
    isBooksLoading,
    refreshBooks,
    updateBook,
  } = useLibraryBooks();

  const { currentBooks, refreshCurrentBooks } = useUserBooks();

  const refreshReadingData = useRefreshReadingData();

  const location = useLocation();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [readingBook, setReadingBook] = useState(null);

  const [isReadingBookLoading, setIsReadingBookLoading] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isReadingBookPickerOpen = searchParams.get("readerPicker") === "1";

  const readingBookId = searchParams.get("reading");

  const readingLibraryId = searchParams.get("readingLibrary");

  const showRightSidebar = isAuthenticated && location.pathname === "/account";

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  /*
   * Порядок поточних книг
   * більше не зберігається окремим state.
   *
   * Єдине джерело —
   * UserBooksContext.currentBooks.
   */
  const readingBookPickerBooks = useMemo(() => {
    const currentBookOrder = new Map(
      currentBooks.map((book, index) => [book.id, index]),
    );

    return libraryBooks.map((book) => ({
      ...book,

      readingOrder: currentBookOrder.has(book.id)
        ? currentBookOrder.get(book.id)
        : null,
    }));
  }, [libraryBooks, currentBooks]);

  /* =========================
     MOBILE MENU
  ========================= */

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  /* =========================
     LOAD READING BOOK
  ========================= */

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
        const params = new URLSearchParams(searchParams);

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

      const libraryId = readingLibraryId || activeLibraryId;

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
        console.error("Load reading book error:", error);

        const params = new URLSearchParams(searchParams);

        params.delete("reading");

        params.delete("readingLibrary");

        setSearchParams(params, {
          replace: true,
        });

        setReadingBook(null);

        toast.error("Не вдалося відкрити книгу");
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

  /* =========================
     CLOSE READER
  ========================= */

  const handleCloseReading = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("reading");

    params.delete("readingLibrary");

    setSearchParams(params, {
      replace: true,
    });

    setReadingBook(null);
  };

  /* =========================
     UPDATE READING BOOK
  ========================= */

  const handleReadingBookUpdated = (updatedBook) => {
    if (!updatedBook?.id) {
      return;
    }

    setReadingBook(updatedBook);

    if (!readingLibraryId || readingLibraryId === activeLibraryId) {
      updateBook(updatedBook);
    }
  };

  /*
   * Єдина точка синхронізації
   * після reading mutation.
   */
  const handleReadingDataChanged = async () => {
    try {
      await refreshReadingData();
    } catch (error) {
      console.error("Refresh reading data error:", error);
    }
  };

  /* =========================
     OPEN CURRENT READER
  ========================= */

  const handleOpenReader = async () => {
    setIsMobileMenuOpen(false);

    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated || !hasToken()) {
      toast.error("Спочатку увійдіть в акаунт");

      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (!activeLibraryId) {
      toast.error("Спочатку оберіть бібліотеку");

      return;
    }

    const params = new URLSearchParams(searchParams);

    params.delete("reading");

    params.delete("readingLibrary");

    params.set("readerPicker", "1");

    setSearchParams(params);

    try {
      /*
       * App більше НЕ робить
       * власний GET:
       *
       * /api/user-books/current
       *
       * Поточні книги належать
       * UserBooksContext.
       */
      const requests = [refreshCurrentBooks()];

      if (libraryBooks.length === 0) {
        requests.push(refreshBooks());
      }

      await Promise.all(requests);
    } catch (error) {
      console.error("Load reader books error:", error);

      toast.error("Не вдалося завантажити книги");

      const nextParams = new URLSearchParams(searchParams);

      nextParams.delete("readerPicker");

      setSearchParams(nextParams, {
        replace: true,
      });
    }
  };

  const handleSelectReadingBook = (book) => {
    if (!book?.id) {
      return;
    }

    const params = new URLSearchParams(searchParams);

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

  /* =========================
     THEME
  ========================= */

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
  };

  /* =========================
     PUBLIC ROUTES
  ========================= */

  if (isPublicPage) {
    return (
      <>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <LandingPage />
              )
            }
          />

          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />
            }
          />

          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <RegisterPage />
              )
            }
          />
        </Routes>

        <Toaster position="top-right" />
      </>
    );
  }

  /* =========================
     APP
  ========================= */

  return (
    <div className="app-shell">
      <MobileNavigation
        user={user}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        isOpen={isMobileMenuOpen}
        onOpen={() => setIsMobileMenuOpen(true)}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenReader={handleOpenReader}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
      />

      <DesktopNavigation
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        onOpenReader={handleOpenReader}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
      />

      <div className="app-content">
        <div
          className={`app-main-layout ${
            showRightSidebar ? "app-main-layout--with-sidebar" : ""
          }`}
        >
          <div className="app-main-column">
            <Routes>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/catalog"
                element={
                  <ProtectedRoute>
                    <CatalogPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <AddBookPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <ReadingCalendarPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <StatsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/achievements"
                element={
                  <ProtectedRoute>
                    <AchievementsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <UserPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/finished"
                element={
                  <ProtectedRoute>
                    <FinishedBooksPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/library/manage"
                element={
                  <ProtectedRoute>
                    <LibraryManagementPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UserSearchPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users/following"
                element={
                  <ProtectedRoute>
                    <FollowingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users/followers"
                element={
                  <ProtectedRoute>
                    <FollowersPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>

          {showRightSidebar && <RightSidebar />}
        </div>
      </div>

      {isReadingBookPickerOpen && (
        <ReadingBookPicker
          books={readingBookPickerBooks}
          isLoading={isBooksLoading}
          onSelect={handleSelectReadingBook}
          onClose={handleCloseReadingBookPicker}
        />
      )}

      {readingBook &&
        isAuthenticated &&
        !isAuthLoading &&
        !isReadingBookLoading && (
          <ReadingModal
            book={readingBook}
            apiUrl={API_URL}
            onClose={handleCloseReading}
            onBookUpdated={handleReadingBookUpdated}
            onReadingDataChanged={handleReadingDataChanged}
          />
        )}

      <Toaster position="top-right" />
    </div>
  );
};

export default App;









