import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VerifyOtp from "./pages/verifyOtp";
import VideoCall from "./pages/VideoCall";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route
          path="/video-call"
          element={<VideoCall roomId="svmp-room-1" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
