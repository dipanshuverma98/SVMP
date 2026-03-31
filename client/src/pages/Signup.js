import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mentee");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // FIXED URL: Added /api/auth/ to match your backend perfectly
    const response = await fetch("http://localhost:5000/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      // Saving ALL details so the Verify page can use them to create the account
      localStorage.setItem("temp_name", name);
      localStorage.setItem("temp_email", email);
      localStorage.setItem("temp_password", password);
      localStorage.setItem("temp_role", role.toUpperCase()); // Made uppercase to match DB
      
      alert("OTP Sent Successfully!");
      navigate("/verify-otp");
    } else {
      alert("Failed to send OTP");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Sign Up</h2>

      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <input
          type="text"
          placeholder="Full Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "10px" }}
        />

        <input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px" }}
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={() => setRole("mentor")}
            style={{ flex: 1, padding: "10px", background: role === "mentor" ? "lightblue" : "#f0f0f0", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Mentor
          </button>

          <button
            type="button"
            onClick={() => setRole("mentee")}
            style={{ flex: 1, padding: "10px", background: role === "mentee" ? "lightblue" : "#f0f0f0", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Mentee
          </button>
        </div>

        <button type="submit" style={{ marginTop: "15px", padding: "12px", background: "#007bff", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>
          Send OTP
        </button>
      </form>
    </div>
  );
}