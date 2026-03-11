import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSaveUser = async (e) => {
  e.preventDefault();
  const email = localStorage.getItem("temp_email");
  const role = localStorage.getItem("temp_role");

  const response = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role, password }), // sending state 'password'
  });

  const data = await response.json();

  if (data.success) {
    alert("Account Created! You can now login.");
    // Clear temp storage
    localStorage.removeItem("temp_email");
    localStorage.removeItem("temp_role");
    navigate("/login");
  } else {
    alert(data.error || "Registration failed");
  }
};
  return (
    <div style={{ padding: "40px" }}>
      <h2>Set Your Password</h2>
      <form onSubmit={handleSaveUser}>
        <input type="password" placeholder="New Password" required onChange={(e) => setPassword(e.target.value)} /><br/><br/>
        <button type="submit">Finish Registration</button>
      </form>
    </div>
  );
}