import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. Actually call your backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 2. Save the REAL data from the server
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userId", data.userId); // This is critical!

        // 3. Redirect based on the real role from DB
        if (data.role === "mentor") {
          navigate("/mentor-dashboard");
        } else {
          navigate("/mentee-dashboard");
        }
      } else {
        alert(data.message || "Invalid Email or Password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server is not responding. Make sure your backend is running.");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        /><br/><br/>
        <input 
          type="password" 
          placeholder="Password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        /><br/><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}