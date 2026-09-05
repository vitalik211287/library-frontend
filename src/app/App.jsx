import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import "./App.css";

import { PrivateRoutes, PublicRoutes } from "./components/AppRoutes.jsx";
import useMobileMenu from "./hooks/useMobileMenu.js";
import useReadingRouter from "./hooks/useReadingRouter.js";

import RightSidebar from "../shared/components/RightSidebar/RightSidebar.jsx";
import ReadingModal from "../modules/reading/components/ReadingModal/ReadingModal.jsx";
import ReadingBookPicker from "../modules/reading/components/ReadingBookPicker/ReadingBookPicker.jsx";

import MobileNavigation from "../shared/components/AppNavigation/MobileNavigation.jsx";
import DesktopNavigation from "../shared/components/AppNavigation/DesktopNavigation.jsx";

import { API_URL } from "../shared/api/apiClient.js";

import { useAuth } from "../modules/auth/context/AuthContext.jsx";

import { useTheme } from "../shared/context/ThemeContext.jsx";

/* =========================
   APP
========================= */

const App = () => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  const { themeMode, setThemeMode } = useTheme();

  const location = useLocation();

  const {
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
  } = useMobileMenu(location.pathname);
  const {
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
  } = useReadingRouter({
    closeMobileMenu,
  });

  const showRightSidebar = isAuthenticated && location.pathname === "/account";

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

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
        <PublicRoutes isAuthenticated={isAuthenticated} />

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
        onOpen={openMobileMenu}
        onClose={closeMobileMenu}
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
            <PrivateRoutes />
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

