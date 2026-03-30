import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("userRole")?.toUpperCase();

  // 1. If not logged in, go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. If a specific role is required (like MENTOR) and user doesn't have it
  if (allowedRole && userRole !== allowedRole.toUpperCase()) {
    // Check if they are authorized for the OTHER dashboard
    // If they are a MENTEE trying to access a MENTOR-only route, send them to their own dashboard
    const homePath = userRole === "MENTOR" ? "/mentor-dashboard" : "/mentee-dashboard";
    return <Navigate to={homePath} replace />;
  }

  // 3. Otherwise, let them through
  return <Outlet />;
}