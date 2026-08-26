import {
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import "./App.css";

import CatalogPage from "./pages/CatalogPage/CatalogPage.jsx";
import AddBookPage from "./pages/AddBookPage/AddBookPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ReadingCalendarPage from "./pages/ReadingCalendarPage/ReadingCalendarPage.jsx";
import UserPage from "./pages/UserPage/UserPage.jsx";

import ThemeToggle from "./components/ThemeToggle/ThemeToggle";

function App() {
  const isLoggedIn = Boolean(
    localStorage.getItem("token"),
  );

  return (
    <>
      <header className="header">
        <nav className="nav">

          {/* CATALOG */}
          <NavLink
            to="/"
            aria-label="Каталог"
            title="Каталог"
          >
            <svg
              className="nav__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"
              />

              <path
                d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"
              />
            </svg>

            <span className="nav__text">
              Каталог
            </span>
          </NavLink>

          {/* ADD BOOK */}
          <NavLink
            to="/add"
            aria-label="Додати книгу"
            title="Додати книгу"
          >
            <svg
              className="nav__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>

            <span className="nav__text">
              Додати книгу
            </span>
          </NavLink>

          {/* CALENDAR */}
          <NavLink
            to="/calendar"
            aria-label="Календар"
            title="Календар"
          >
            <svg
              className="nav__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
              />

              <path d="M16 3v4" />
              <path d="M8 3v4" />
              <path d="M3 10h18" />
            </svg>

            <span className="nav__text">
              Календар
            </span>
          </NavLink>

          {/* USER / LOGIN */}
          <NavLink
            to={isLoggedIn ? "/account" : "/login"}
            aria-label={
              isLoggedIn
                ? "Мій акаунт"
                : "Увійти"
            }
            title={
              isLoggedIn
                ? "Мій акаунт"
                : "Увійти"
            }
          >
            <svg
              className="nav__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
              />

              <path
                d="M4 21a8 8 0 0 1 16 0"
              />
            </svg>

            <span className="nav__text">
              {isLoggedIn
                ? "Мій акаунт"
                : "Увійти"}
            </span>
          </NavLink>

        </nav>

        <ThemeToggle />
      </header>

      <Toaster position="top-right" />

      <Routes>

        {/* CATALOG */}
        <Route
          path="/"
          element={<CatalogPage />}
        />

        {/* ADD BOOK */}
        <Route
          path="/add"
          element={<AddBookPage />}
        />

        {/* CALENDAR */}
        <Route
          path="/calendar"
          element={
            <ReadingCalendarPage />
          }
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* ACCOUNT */}
        <Route
          path="/account"
          element={<UserPage />}
        />

      </Routes>
    </>
  );
}

export default App;