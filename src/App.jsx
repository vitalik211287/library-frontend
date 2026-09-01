import {
  NavLink,
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

import { API_URL, apiFetch, hasToken } from "./utils/apiClient.js";

import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import { useLibrary } from "./context/LibraryContext.jsx";

/* =========================
   ICONS
========================= */

const CatalogIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const AddIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
    <path d="M3 10h18" />
  </svg>
);

const ReaderIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h4a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6a2.5 2.5 0 0 0-2.5 2.5v-15Z" />
    <path d="M20.5 5.5A2.5 2.5 0 0 0 18 3h-4a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h4a2.5 2.5 0 0 1 2.5 2.5v-15Z" />
    <path d="M7 7h2" />
    <path d="M15 7h2" />
  </svg>
);

const StatsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 19V9" />
    <path d="M10 19V5" />
    <path d="M16 19v-7" />
    <path d="M22 19V3" />
  </svg>
);

const AchievementsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="9" r="5" />
    <path d="M8.5 13 7 22l5-3 5 3-1.5-9" />
    <path d="m10 9 1.3 1.3L14 7.5" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />

    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3v-4h.08A1.7 1.7 0 0 0 4.64 8.9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.53a1.7 1.7 0 0 0 1.03-1.56V3h4v.08a1.7 1.7 0 0 0 1.07 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
  </svg>
);

const SystemIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 18v3" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M6.34 17.66l-1.41 1.41" />
    <path d="M19.07 4.93l1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

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

  const accountPath = isAuthenticated ? "/account" : "/login";

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

        params.delete("reading");

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
     OPEN CURRENT READER
  ========================= */

  const handleOpenReader = async () => {
    setIsMobileMenuOpen(false);

    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      toast.error("Спочатку увійдіть в акаунт");

      navigate("/login");

      return;
    }

    if (!hasToken()) {
      navigate("/login");

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
      {/* =========================
          MOBILE HEADER
      ========================= */}

      <header className="mobile-header">
        <NavLink to="/home" className="mobile-header__brand">
          <CatalogIcon />

          <span>Бібліотека</span>
        </NavLink>

        <div className="mobile-header__actions">
          {isAuthenticated && (
            <NavLink
              to="/account"
              className="mobile-header__avatar"
              aria-label="Відкрити профіль"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name || "Профіль"} />
              ) : (
                <span>{(user?.name || "К").charAt(0).toUpperCase()}</span>
              )}
            </NavLink>
          )}

          <button
            type="button"
            className={`mobile-menu-button ${
              isMobileMenuOpen ? "mobile-menu-button--open" : ""
            }`}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label={isMobileMenuOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={isMobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      <div
        className={`mobile-menu-overlay ${
          isMobileMenuOpen ? "mobile-menu-overlay--open" : ""
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* =========================
          MOBILE DRAWER
      ========================= */}

      {isMobileMenuOpen && (
        <aside className="mobile-drawer mobile-drawer--open">
          <div className="mobile-drawer__header">
            <div className="mobile-drawer__brand">
              <CatalogIcon />

              <span>Бібліотека</span>
            </div>

            <button
              type="button"
              className="mobile-drawer__close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Закрити меню"
            >
              ×
            </button>
          </div>

          <nav className="mobile-drawer__nav">
            <NavLink to="/catalog" className="mobile-drawer__link">
              <CatalogIcon />

              <span>Каталог</span>
            </NavLink>

            <NavLink to="/add" className="mobile-drawer__link">
              <AddIcon />

              <span>Додати книгу</span>
            </NavLink>

            <NavLink to="/calendar" className="mobile-drawer__link">
              <CalendarIcon />

              <span>Календар</span>
            </NavLink>

            <button
              type="button"
              className="mobile-drawer__link"
              onClick={handleOpenReader}
            >
              <ReaderIcon />

              <span>Читалка</span>
            </button>

            <NavLink to="/stats" className="mobile-drawer__link">
              <StatsIcon />

              <span>Статистика</span>
            </NavLink>

            <NavLink to="/achievements" className="mobile-drawer__link">
              <AchievementsIcon />

              <span>Досягнення</span>
            </NavLink>

            <NavLink
              to={accountPath}
              className={`mobile-drawer__link ${
                isAuthLoading ? "mobile-drawer__link--loading" : ""
              }`}
            >
              <ProfileIcon />

              <span>{isAuthenticated ? "Профіль" : "Увійти"}</span>
            </NavLink>
          </nav>

          <div className="mobile-drawer__settings">
            <NavLink
              to="/settings"
              className="mobile-drawer__link mobile-drawer__settings-link"
            >
              <SettingsIcon />

              <span>Налаштування</span>
            </NavLink>
          </div>

          <div className="mobile-theme">
            <span className="mobile-theme__title">Тема</span>

            <div className="mobile-theme__options">
              <button
                type="button"
                className={`mobile-theme__option ${
                  themeMode === "system" ? "mobile-theme__option--active" : ""
                }`}
                onClick={() => handleThemeChange("system")}
              >
                <SystemIcon />

                <span>Системна</span>
              </button>

              <button
                type="button"
                className={`mobile-theme__option ${
                  themeMode === "light" ? "mobile-theme__option--active" : ""
                }`}
                onClick={() => handleThemeChange("light")}
              >
                <SunIcon />

                <span>Світла</span>
              </button>

              <button
                type="button"
                className={`mobile-theme__option ${
                  themeMode === "dark" ? "mobile-theme__option--active" : ""
                }`}
                onClick={() => handleThemeChange("dark")}
              >
                <MoonIcon />

                <span>Темна</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* =========================
          DESKTOP SIDEBAR
      ========================= */}

      <aside className="app-sidebar">
        <NavLink to="/home" className="app-brand">
          <CatalogIcon />

          <span>Бібліотека</span>
        </NavLink>

        <nav className="desktop-nav">
          <NavLink to="/catalog" className="desktop-nav__link">
            <CatalogIcon />

            <span>Каталог</span>
          </NavLink>

          <NavLink to="/add" className="desktop-nav__link">
            <AddIcon />

            <span>Додати книгу</span>
          </NavLink>

          <NavLink to="/calendar" className="desktop-nav__link">
            <CalendarIcon />

            <span>Календар</span>
          </NavLink>

          <button
            type="button"
            className="desktop-nav__link"
            onClick={handleOpenReader}
          >
            <ReaderIcon />

            <span>Читалка</span>
          </button>

          <NavLink to="/stats" className="desktop-nav__link">
            <StatsIcon />

            <span>Статистика</span>
          </NavLink>

          <NavLink to="/achievements" className="desktop-nav__link">
            <AchievementsIcon />

            <span>Досягнення</span>
          </NavLink>

          <NavLink
            to={accountPath}
            className={`desktop-nav__link ${
              isAuthLoading ? "desktop-nav__link--loading" : ""
            }`}
          >
            <ProfileIcon />

            <span>{isAuthenticated ? "Мій профіль" : "Увійти"}</span>
          </NavLink>

          <NavLink to="/settings" className="desktop-nav__link">
            <SettingsIcon />

            <span>Налаштування</span>
          </NavLink>
        </nav>

        {/* =========================
            DESKTOP THEME
        ========================= */}

        <div className="desktop-theme">
          <span className="desktop-theme__title">Тема</span>

          <div className="desktop-theme__options">
            <button
              type="button"
              className={themeMode === "system" ? "active" : ""}
              onClick={() => handleThemeChange("system")}
              title="Системна тема"
            >
              <SystemIcon />
            </button>

            <button
              type="button"
              className={themeMode === "light" ? "active" : ""}
              onClick={() => handleThemeChange("light")}
              title="Світла тема"
            >
              <SunIcon />
            </button>

            <button
              type="button"
              className={themeMode === "dark" ? "active" : ""}
              onClick={() => handleThemeChange("dark")}
              title="Темна тема"
            >
              <MoonIcon />
            </button>
          </div>
        </div>
      </aside>

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
          />
        )}

      <Toaster position="top-right" />
    </div>
  );
};

export default App;
