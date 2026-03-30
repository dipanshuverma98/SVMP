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
import GroupSpace from "./pages/mentor/GroupSpace";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* --- 1. SHARED Protected Route (No allowedRole check) --- */}
        {/* This allows both MENTOR and MENTEE to enter the GroupSpace */}
        <Route element={<ProtectedRoute />}> 
          <Route path="/group/:groupId" element={<GroupSpace />} />
        </Route>

        {/* --- 2. MENTOR ONLY Routes --- */}
        <Route element={<ProtectedRoute allowedRole="MENTOR" />}>
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        </Route>
        
        {/* --- 3. MENTEE ONLY Routes --- */}
        <Route element={<ProtectedRoute allowedRole="MENTEE" />}>
          <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;