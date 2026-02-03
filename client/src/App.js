import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import VerifyOtp from "./pages/verifyOtp";
import VideoCall from "./pages/VideoCall";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import MentorDashboard from "./pages/mentor/MentorDashboard";
import MenteeDashboard from "./pages/mentee/menteeDashboard";
import Chat from "./pages/chat/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Public / optional */}
        <Route
          path="/video-call"
          element={<VideoCall roomId="svmp-room-1" />}
        />

        {/* Any authenticated user */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <h1>Dashboard (Protected)</h1>
            </ProtectedRoute>
          }
        />

        {/* Mentor-only */}
        <Route
          path="/mentor"
          element={
            <RoleRoute allowedRoles={["mentor"]}>
              <MentorDashboard />
            </RoleRoute>
          }
        />

        {/* Mentee-only */}
        <Route
          path="/mentee"
          element={
            <RoleRoute allowedRoles={["mentee"]}>
              <MenteeDashboard />
            </RoleRoute>
          }
        />

        {/* Chat (any authenticated user) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat toUserId="OTHER_USER_ID" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
