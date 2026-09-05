import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../../modules/landing/pages/LandingPage/LandingPage.jsx";
import LoginPage from "../../modules/auth/pages/LoginPage/LoginPage.jsx";
import RegisterPage from "../../modules/auth/pages/RegisterPage/RegisterPage.jsx";

import HomePage from "../../modules/home/pages/HomePage/HomePage.jsx";
import CatalogPage from "../../modules/books/pages/CatalogPage/CatalogPage.jsx";
import AddBookPage from "../../modules/books/pages/AddBookPage/AddBookPage.jsx";
import ReadingCalendarPage from "../../modules/reading/pages/ReadingCalendarPage/ReadingCalendarPage.jsx";
import StatsPage from "../../modules/stats/pages/StatsPage/StatsPage.jsx";
import AchievementsPage from "../../modules/stats/pages/AchievementsPage/AchievementsPage.jsx";
import UserPage from "../../modules/users/pages/UserPage/UserPage.jsx";
import WishlistPage from "../../modules/user-books/pages/WishlistPage/WishlistPage.jsx";
import FinishedBooksPage from "../../modules/user-books/pages/FinishedBooksPage/FinishedBooksPage.jsx";
import SettingsPage from "../../modules/users/pages/SettingsPage/SettingsPage.jsx";
import LibraryManagementPage from "../../modules/libraries/pages/LibraryManagementPage/LibraryManagementPage.jsx";
import UserSearchPage from "../../modules/users/pages/UserSearchPage/UserSearchPage.jsx";
import FollowingPage from "../../modules/users/pages/FollowingPage/FollowingPage.jsx";
import FollowersPage from "../../modules/users/pages/FollowersPage/FollowersPage.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";

export const PublicRoutes = ({ isAuthenticated }) => {
  return (
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
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <LoginPage />
          )
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
  );
};

export const PrivateRoutes = () => {
  return (
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
  );
};
