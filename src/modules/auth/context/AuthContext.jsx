import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch, getToken } from "../../../shared/api/apiClient.js";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const data = await apiFetch("/api/auth/me");

        setUser(data?.user ?? null);
      } catch (error) {
        console.error("Auth check error:", error);

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...userData,
    }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
      isAuthLoading,
      isAuthenticated: Boolean(user),
    }),
    [user, login, logout, updateUser, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
