import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ allowedRoles, children }) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default RoleRoute;
