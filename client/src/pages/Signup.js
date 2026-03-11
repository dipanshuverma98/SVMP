import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("mentee");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
  e.preventDefault();
  const response = await fetch("http://localhost:5000/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    localStorage.setItem("temp_email", email);
    localStorage.setItem("temp_role", role);
    navigate("/verify-otp");
  } else {
    alert("Failed to send OTP");
  }
};

  return (
    <div style={{ padding: "40px" }}>
      <h2>Sign Up</h2>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <label>Select Role: </label>

        <button
          type="button"
          onClick={() => setRole("mentor")}
          style={{ background: role === "mentor" ? "lightblue" : "white" }}
        >
          Mentor
        </button>

        <button
          type="button"
          onClick={() => setRole("mentee")}
          style={{ background: role === "mentee" ? "lightblue" : "white" }}
        >
          Mentee
        </button>

        <br />
        <br />

        <button type="submit">Send OTP</button>
      </form>
    </div>
  );
}