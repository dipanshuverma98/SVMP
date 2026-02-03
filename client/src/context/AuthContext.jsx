import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Auto-login on refresh
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setToken(storedToken);
        setUser(decoded);
        connectSocket(storedToken); // ✅ reconnect socket
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Login
  const login = (jwtToken) => {
    const decoded = jwtDecode(jwtToken);
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setUser(decoded);
    connectSocket(jwtToken); // ✅ connect socket after login
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    disconnectSocket(); // ✅ disconnect socket
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
