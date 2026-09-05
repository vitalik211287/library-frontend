import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
  getToken,
} from "../../../shared/api/apiClient.js";

const AuthContext =
  createContext(null);

const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [
    isAuthLoading,
    setIsAuthLoading,
  ] = useState(true);

  useEffect(() => {
    const checkAuth =
      async () => {
        const token =
          getToken();

        if (!token) {
          setIsAuthLoading(
            false,
          );

          return;
        }

        try {
          const data =
            await apiFetch(
              "/api/auth/me",
            );

          setUser(
            data?.user ??
              null,
          );
        } catch (error) {
          console.error(
            "Auth check error:",
            error,
          );

          localStorage.removeItem(
            "token",
          );

          setUser(null);
        } finally {
          setIsAuthLoading(
            false,
          );
        }
      };

    checkAuth();
  }, []);

  const login = (
    userData,
    token,
  ) => {
    localStorage.setItem(
      "token",
      token,
    );

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(
      "token",
    );

    setUser(null);
  };

  const updateUser = (
    userData,
  ) => {
    setUser(
      (currentUser) => ({
        ...currentUser,
        ...userData,
      }),
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthLoading,
        isAuthenticated:
          Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(
    AuthContext,
  );
};

export {
  AuthProvider,
  useAuth,
};

