import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../modules/auth/context/AuthContext.jsx";

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

export default ProtectedRoute;
