import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

const handleVerify = async (e) => {
  e.preventDefault();
  const email = localStorage.getItem("temp_email");

  const response = await fetch("http://localhost:5000/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  if (data.success) {
    navigate("/set-password");
  } else {
    alert("Invalid OTP");
  }
};

  return (
    <div style={{ padding: "40px" }}>
      <h2>Verify Your Email</h2>
      <p>Enter the 6-digit code sent to your Gmail.</p>
      <form onSubmit={handleVerify}>
        <input type="text" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}