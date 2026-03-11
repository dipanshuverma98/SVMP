import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRole }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // If a mentee tries to go to mentor dashboard, send them home
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Renders the child route (the dashboard)
};

export default ProtectedRoute;