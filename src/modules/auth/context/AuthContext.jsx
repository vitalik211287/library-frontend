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

const OFFLINE_AUTH_KEY = "library-offline-user-v1";

const saveOfflineUser = (user) => {
  const token = getToken();

  if (!user?.id || !token) {
    localStorage.removeItem(OFFLINE_AUTH_KEY);
    return;
  }

  localStorage.setItem(
    OFFLINE_AUTH_KEY,
    JSON.stringify({
      user,
      tokenTail: token.slice(-24),
    })
  );
};

const readOfflineUser = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const record = JSON.parse(
      localStorage.getItem(OFFLINE_AUTH_KEY) || "null"
    );

    return record?.tokenTail === token.slice(-24) &&
      record?.user?.id
      ? record.user
      : null;
  } catch {
    return null;
  }
};

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

        const verifiedUser = data?.user ?? null;
        setUser(verifiedUser);
        saveOfflineUser(verifiedUser);
      } catch (error) {
        console.error("Auth check error:", error);

        if (error?.status === 401 || error?.status === 403) {
          localStorage.removeItem("token");
          saveOfflineUser(null);
          setUser(null);
        } else if (
          typeof error?.status !== "number" ||
          error.status >= 500
        ) {
          setUser(readOfflineUser());
        } else {
          setUser(null);
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("token", token);
    saveOfflineUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    saveOfflineUser(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...userData,
    }));
  }, []);

  useEffect(() => {
    if (user?.id && getToken()) {
      saveOfflineUser(user);
    }
  }, [user]);

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
