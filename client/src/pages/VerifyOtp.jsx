import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    
    // 1. Pull ALL the data we saved in the new Signup.js
    const name = localStorage.getItem("temp_name");
    const email = localStorage.getItem("temp_email");
    const password = localStorage.getItem("temp_password");
    const role = localStorage.getItem("temp_role");

    try {
      // 2. FIXED URL: Added /api/auth/ and sending all the data!
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Success! Clear the temporary data so it doesn't clutter the browser
        localStorage.removeItem("temp_name");
        localStorage.removeItem("temp_email");
        localStorage.removeItem("temp_password");
        localStorage.removeItem("temp_role");
        
        alert("Account verified and created successfully! You can now log in.");
        navigate("/login"); // Send straight to login!
      } else {
        alert(data.error || "Invalid OTP");
      }
    } catch (error) {
      alert("Server error. Check if the backend is running.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "50px auto", textAlign: "center", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Verify Your Email</h2>
      <p>Enter the 6-digit code sent to your Gmail.</p>
      
      <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="text" 
          placeholder="Enter 6-digit OTP" 
          value={otp} 
          onChange={(e) => setOtp(e.target.value)} 
          maxLength="6"
          required 
          style={{ padding: "10px", textAlign: "center", fontSize: "20px", letterSpacing: "5px" }} 
        />
        <button type="submit" style={{ padding: "12px", background: "#28a745", color: "white", border: "none", cursor: "pointer", fontWeight: "bold", borderRadius: "5px" }}>
          Verify & Create Account
        </button>
      </form>
    </div>
  );
}