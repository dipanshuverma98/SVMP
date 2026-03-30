import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message on new attempt

    try {
      // 1. Call the Backend API
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 2. Save Session Data to LocalStorage
        // We store these so other pages (like Dashboards) know who is logged in
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userRole", data.role);

        // 3. Role-Based Redirection
        // Standardize to Uppercase to match the Backend Enum
        const role = data.role.toUpperCase();

        if (role === "MENTOR") {
          navigate("/mentor-dashboard");
        } else if (role === "MENTEE") {
          navigate("/mentee-dashboard");
        } else {
          setError("Authorized role not found. Contact Admin.");
        }
      } else {
        // Handle "Invalid Credentials" sent by server
        setError(data.message || "Invalid Email or Password");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server is unreachable. Is the backend running on port 5000?");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input 
            type="email" 
            placeholder="Email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            style={styles.input}
          />
          
          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
}

// Simple inline styles for a clean look
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f9"
  },
  card: {
    padding: "40px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    width: "300px",
    textAlign: "center"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  errorText: {
    color: "red",
    fontSize: "14px",
    margin: "0"
  }
};