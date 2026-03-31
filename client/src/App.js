import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MenteeDashboard from "./pages/mentee/MenteeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// 👇 1. IMPORT YOUR GROUPSPACE PAGE HERE 👇
// (Make sure this path matches exactly where your GroupSpace file is saved!)
import GroupSpace from "./pages/mentor/GroupSpace"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        
        {/* Note: I removed the SetPassword route because we integrated that into Signup! */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRole="MENTOR" />}>
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRole="MENTEE" />}>
          <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
        </Route>

        {/* 👇 2. ADD THE GROUP SPACE ROUTE HERE 👇 */}
        {/* We are putting this here so both Mentors and Mentees can access their groups */}
        <Route path="/group/:groupId" element={<GroupSpace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;