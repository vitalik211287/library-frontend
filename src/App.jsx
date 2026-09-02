import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useEffect, useState } from "react";

import { Toaster, toast } from "react-hot-toast";

import "./App.css";

import CatalogPage from "./pages/CatalogPage/CatalogPage.jsx";
import AddBookPage from "./pages/AddBookPage/AddBookPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ReadingCalendarPage from "./pages/ReadingCalendarPage/ReadingCalendarPage.jsx";
import UserPage from "./pages/UserPage/UserPage.jsx";
import SettingsPage from "./pages/SettingsPage/SettingsPage.jsx";
import StatsPage from "./pages/StatsPage/StatsPage.jsx";
import AchievementsPage from "./pages/AchievementsPage/AchievementsPage.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import LibraryManagementPage from "./pages/LibraryManagementPage/LibraryManagementPage.jsx";

import UserSearchPage from "./pages/UserPage/components/Users/UserSearchPage/UserSearchPage.jsx";
import FollowingPage from "./pages/UserPage/components/Users/FollowingPage/FollowingPage.jsx";
import FollowersPage from "./pages/UserPage/components/Users/FollowersPage/FollowersPage.jsx";

import RightSidebar from "./components/RightSidebar/RightSidebar.jsx";
import ReadingModal from "./components/ReadingModal/ReadingModal.jsx";

import MobileNavigation from "./components/AppNavigation/MobileNavigation.jsx";
import DesktopNavigation from "./components/AppNavigation/DesktopNavigation.jsx";

import { API_URL, apiFetch, hasToken } from "./utils/apiClient.js";

import { useAuth } from "./context/AuthContext.jsx";

import { useTheme } from "./context/ThemeContext.jsx";

import { useLibrary } from "./context/LibraryContext.jsx";

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

  const location = useLocation();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [readingBook, setReadingBook] = useState(null);

  const [isReadingBookLoading, setIsReadingBookLoading] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const readingBookId = searchParams.get("reading");

  const showRightSidebar = isAuthenticated && location.pathname === "/account";

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

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

        params.set("reading", bookId);

        setSearchParams(params, {
          replace: true,
        });

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!activeLibraryId) {
        setReadingBook(null);

        return;
      }

      try {
        setIsReadingBookLoading(true);

        const book = await apiFetch(
          `/api/libraries/${activeLibraryId}/books/${readingBookId}`,
        );

        setReadingBook(book);
      } catch (error) {
        console.error("Load reading book error:", error);

        const params = new URLSearchParams(searchParams);

        params.delete("reading");

        setSearchParams(params, {
          replace: true,
        });

        setReadingBook(null);
      } finally {
        setIsReadingBookLoading(false);
      }
    };

    loadReadingBook();
  }, [readingBookId, activeLibraryId, isAuthenticated, isAuthLoading]);

  /* =========================
     CLOSE READER
  ========================= */

  const handleCloseReading = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("reading");

    setSearchParams(params, {
      replace: true,
    });

    setReadingBook(null);
  };

  /* =========================
     UPDATE READING BOOK
  ========================= */

  const handleReadingBookUpdated = (updatedBook) => {
    setReadingBook(updatedBook);

    window.dispatchEvent(
      new CustomEvent("library-book-updated", {
        detail: updatedBook,
      }),
    );
  };

  /* =========================
     OPEN CURRENT READER
  ========================= */

  const handleOpenReader = async () => {
    setIsMobileMenuOpen(false);

    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      toast.error("Спочатку увійдіть в акаунт");

      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (!hasToken()) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      const query = activeLibraryId
        ? `?libraryId=${encodeURIComponent(activeLibraryId)}`
        : "";

      const data = await apiFetch(`/api/user-books/current${query}`);

      const books = Array.isArray(data?.books) ? data.books : [];

      const currentBook = books[0];

      const bookId = currentBook?.id;

      if (!bookId) {
        toast("Немає активного читання");

        return;
      }

      const params = new URLSearchParams(searchParams);

      params.set("reading", bookId);

      setSearchParams(params, {
        replace: true,
      });
    } catch (error) {
      console.error("Open reader error:", error);

      toast.error("Не вдалося відкрити читалку");
    }
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

      {/* =========================
          MAIN CONTENT
      ========================= */}

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

      {/* =========================
          READING MODAL
      ========================= */}

      {readingBook &&
        isAuthenticated &&
        !isAuthLoading &&
        !isReadingBookLoading && (
          <ReadingModal
            book={readingBook}
            apiUrl={API_URL}
            onClose={handleCloseReading}
            onBookUpdated={handleReadingBookUpdated}
          />
        )}

      <Toaster position="top-right" />
    </div>
  );
};

export default App;
