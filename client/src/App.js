import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MenteeDashboard from "./pages/mentee/MenteeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import VideoCall from "./pages/VideoCall";
import GroupSpace from "./pages/mentor/GroupSpace"; 
import GroupResources from "./pages/mentor/GroupResources";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Protected Mentor Routes */}
        <Route element={<ProtectedRoute allowedRole="MENTOR" />}>
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        </Route>
        
        {/* Protected Mentee Routes */}
        <Route element={<ProtectedRoute allowedRole="MENTEE" />}>
          <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
        </Route>

        {/* Protected Group, Call & Resource Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/group/:groupId" element={<GroupSpace />} />
          <Route path="/group/:groupId/call" element={<VideoCall />} />
          <Route path="/group/:groupId/resources" element={<GroupResources />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;