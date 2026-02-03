import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { role, logout } = useAuth(); // ✅ hook INSIDE component

  return (
    <div style={styles.sidebar}>
      <h3>SVMP</h3>

      {role === "mentor" && (
        <>
          <Link to="/mentor">Dashboard</Link>
          <Link to="/mentor/sessions">My Sessions</Link>
          <Link to="/mentor/resources">Resources</Link>
        </>
      )}

      {role === "mentee" && (
        <>
          <Link to="/mentee">Dashboard</Link>
          <Link to="/mentee/mentors">My Mentors</Link>
          <Link to="/mentee/resources">Resources</Link>
        </>
      )}

      <button onClick={logout} style={styles.logout}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "220px",
    background: "#1f2937",
    color: "#fff",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  logout: {
    marginTop: "auto",
    padding: "8px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default Sidebar;
