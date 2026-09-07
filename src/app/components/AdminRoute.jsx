import { Navigate } from "react-router-dom";

import { useAuth } from "../../modules/auth/context/AuthContext.jsx";

const AdminRoute = ({ children }) => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
