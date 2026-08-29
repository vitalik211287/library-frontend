import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useEffect, useState } from "react";

import { Toaster } from "react-hot-toast";

import "./App.css";

import CatalogPage from "./pages/CatalogPage/CatalogPage.jsx";
import AddBookPage from "./pages/AddBookPage/AddBookPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ReadingCalendarPage from "./pages/ReadingCalendarPage/ReadingCalendarPage.jsx";
import UserPage from "./pages/UserPage/UserPage.jsx";
import SettingsPage from "./pages/SettingsPage/SettingsPage.jsx";

import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import RightSidebar from "./components/RightSidebar/RightSidebar.jsx";
import ReadingModal from "./components/ReadingModal/ReadingModal.jsx";
import StatsPage from "./pages/StatsPage/StatsPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

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

/* =========================
   APP
========================= */

const App = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const location = useLocation();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [readingBook, setReadingBook] = useState(null);

  const [isReadingBookLoading, setIsReadingBookLoading] = useState(false);

  const readingBookId = searchParams.get("reading");

  const accountPath = isAuthenticated ? "/account" : "/login";

  const showRightSidebar = isAuthenticated && location.pathname === "/account";

  /* =========================
     GLOBAL READING MODAL
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

      try {
        setIsReadingBookLoading(true);

        const response = await fetch(`${API_URL}/api/books`);

        if (!response.ok) {
          throw new Error("Не вдалося завантажити книгу");
        }

        const data = await response.json();

        const books = Array.isArray(data)
          ? data
          : Array.isArray(data.books)
            ? data.books
            : [];

        const book =
          books.find((item) => String(item.id) === String(readingBookId)) ??
          null;

        if (!book) {
          const params = new URLSearchParams(searchParams);

          params.delete("reading");

          setSearchParams(params, {
            replace: true,
          });

          setReadingBook(null);

          return;
        }

        setReadingBook(book);
      } catch (error) {
        console.error("Load reading book error:", error);

        setReadingBook(null);
      } finally {
        setIsReadingBookLoading(false);
      }
    };

    loadReadingBook();
  }, [readingBookId, isAuthenticated, isAuthLoading]);

  const handleCloseReading = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("reading");

    setSearchParams(params, {
      replace: true,
    });

    setReadingBook(null);
  };

  return (
    <div className="app-shell">
      {/* =========================
          DESKTOP SIDEBAR
      ========================= */}

      <aside className="app-sidebar">
        <NavLink to="/" end className="app-brand">
          <CatalogIcon />

          <span>Бібліотека</span>
        </NavLink>

        <nav className="desktop-nav">
          <NavLink to="/" end className="desktop-nav__link">
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
          <NavLink to="/stats" className="desktop-nav__link">
            <svg className="nav__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19V9" />
              <path d="M10 19V5" />
              <path d="M16 19v-7" />
              <path d="M22 19V3" />
            </svg>

            <span className="nav__text">Статистика</span>
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

          {isAuthenticated && (
            <NavLink to="/settings" className="desktop-nav__link">
              <SettingsIcon />

              <span>Налаштування</span>
            </NavLink>
          )}
        </nav>

        <div className="app-sidebar__bottom">
          <div className="app-theme">
            <ThemeToggle />

            <span>Тема</span>
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
              <Route path="/" element={<CatalogPage />} />

              <Route path="/add" element={<AddBookPage />} />

              <Route path="/calendar" element={<ReadingCalendarPage />} />

              <Route path="/register" element={<RegisterPage />} />

              <Route path="/login" element={<LoginPage />} />

              <Route path="/account" element={<UserPage />} />

              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </div>

          {showRightSidebar && <RightSidebar />}
        </div>
      </div>

      {/* =========================
          MOBILE NAVIGATION
      ========================= */}

      <nav className="mobile-nav">
        <NavLink to="/" end className="mobile-nav__link">
          <CatalogIcon />

          <span>Каталог</span>
        </NavLink>

        <NavLink to="/add" className="mobile-nav__link">
          <AddIcon />

          <span>Додати</span>
        </NavLink>

        <NavLink to="/calendar" className="mobile-nav__link">
          <CalendarIcon />

          <span>Календар</span>
        </NavLink>

        <NavLink
          to={accountPath}
          className={`mobile-nav__link ${
            isAuthLoading ? "mobile-nav__link--loading" : ""
          }`}
        >
          <ProfileIcon />

          <span>{isAuthenticated ? "Профіль" : "Увійти"}</span>
        </NavLink>
      </nav>

      {/* =========================
          GLOBAL READING MODAL
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
