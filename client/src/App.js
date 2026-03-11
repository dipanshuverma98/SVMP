import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import SetPassword from "./pages/SetPassword";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MenteeDashboard from "./pages/mentee/MenteeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRole="mentor" />}>
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="mentee" />}>
          <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;