import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "../../shared/components/Loader/Loader.jsx";

import LandingPage from "../../modules/landing/pages/LandingPage/LandingPage.jsx";
import LoginPage from "../../modules/auth/pages/LoginPage/LoginPage.jsx";
import RegisterPage from "../../modules/auth/pages/RegisterPage/RegisterPage.jsx";

const HomePage = lazy(
  () => import("../../modules/home/pages/HomePage/HomePage.jsx"),
);
const CommunityPage = lazy(
  () => import("../../modules/social/pages/CommunityPage/CommunityPage.jsx"),
);
const CatalogPage = lazy(
  () => import("../../modules/books/pages/CatalogPage/CatalogPage.jsx"),
);
const AddBookPage = lazy(
  () => import("../../modules/books/pages/AddBookPage/AddBookPage.jsx"),
);
const ReadingCalendarPage = lazy(
  () =>
    import("../../modules/reading/pages/ReadingCalendarPage/ReadingCalendarPage.jsx"),
);
const StatsPage = lazy(
  () => import("../../modules/stats/pages/StatsPage/StatsPage.jsx"),
);
const AchievementsPage = lazy(
  () =>
    import("../../modules/stats/pages/AchievementsPage/AchievementsPage.jsx"),
);
const UserPage = lazy(
  () => import("../../modules/users/pages/UserPage/UserPage.jsx"),
);
const WishlistPage = lazy(
  () => import("../../modules/user-books/pages/WishlistPage/WishlistPage.jsx"),
);
const FinishedBooksPage = lazy(
  () =>
    import("../../modules/user-books/pages/FinishedBooksPage/FinishedBooksPage.jsx"),
);
const SettingsPage = lazy(
  () => import("../../modules/users/pages/SettingsPage/SettingsPage.jsx"),
);
const LibraryManagementPage = lazy(
  () =>
    import("../../modules/libraries/pages/LibraryManagementPage/LibraryManagementPage.jsx"),
);
const UserSearchPage = lazy(
  () => import("../../modules/users/pages/UserSearchPage/UserSearchPage.jsx"),
);
const FollowingPage = lazy(
  () => import("../../modules/users/pages/FollowingPage/FollowingPage.jsx"),
);
const FollowersPage = lazy(
  () => import("../../modules/users/pages/FollowersPage/FollowersPage.jsx"),
);
const NotificationsPage = lazy(
  () =>
    import("../../modules/notifications/pages/NotificationsPage/NotificationsPage.jsx"),
);
const PublicUserProfilePage = lazy(
  () =>
    import("../../modules/users/pages/PublicUserProfilePage/PublicUserProfilePage.jsx"),
);
const PublicUserAchievementsPage = lazy(
  () =>
    import("../../modules/users/pages/PublicUserAchievementsPage/PublicUserAchievementsPage.jsx"),
);
const AdminUsersPage = lazy(
  () => import("../../modules/admin/pages/AdminUsersPage/AdminUsersPage.jsx"),
);

import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";

export const PublicRoutes = ({ isAuthenticated }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />
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
          isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />
        }
      />
    </Routes>
  );
};

export const PrivateRoutes = ({ onOpenReading }) => {
  return (
    <Suspense fallback={<Loader text="Завантаження…" />}>
      <Routes>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage onOpenReading={onOpenReading} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <ProtectedRoute>
              <CatalogPage onOpenReading={onOpenReading} />
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
              <UserPage onOpenReading={onOpenReading} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage onOpenReading={onOpenReading} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finished"
          element={
            <ProtectedRoute>
              <FinishedBooksPage onOpenReading={onOpenReading} />
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
        <Route
          path="/users/:userId/following"
          element={
            <ProtectedRoute>
              <FollowingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:userId/followers"
          element={
            <ProtectedRoute>
              <FollowersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:userId/achievements"
          element={
            <ProtectedRoute>
              <PublicUserAchievementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:userId"
          element={
            <ProtectedRoute>
              <PublicUserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:userSlug/:userId"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
};
