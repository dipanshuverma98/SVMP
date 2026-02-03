import { jwtDecode } from "jwt-decode";


// Get JWT token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Get user role from JWT
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (err) {
    return null;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};
