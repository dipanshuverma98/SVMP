import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");

  const handleLogout = () => {
    // 1. Clear everything from LocalStorage
    localStorage.clear(); 
    
    // 2. Send them back to Login
    navigate("/login");
  };

  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "10px 30px", 
      background: "#343a40", 
      color: "white" 
    }}>
      <div style={{ fontWeight: "bold", fontSize: "20px" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>Mentorship Hub</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span>Welcome, <strong>{userName}</strong> ({userRole})</span>
        
        <button 
          onClick={handleLogout} 
          style={{ 
            background: "#dc3545", 
            color: "white", 
            border: "none", 
            padding: "8px 15px", 
            borderRadius: "5px", 
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}