import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  
  // Get the role and force it to uppercase just to be incredibly safe
  const userRole = localStorage.getItem("userRole")?.toUpperCase();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user's role doesn't match the route's allowed role
  if (allowedRole && userRole !== allowedRole.toUpperCase()) {
    // Redirect them to their proper dashboard instead of kicking them out completely
    return userRole === "MENTOR" ? <Navigate to="/mentor-dashboard" replace /> : <Navigate to="/mentee-dashboard" replace />;
  }

  // If they pass the checks, let them see the page!
  return <Outlet />;
}