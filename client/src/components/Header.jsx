import { getUserRole } from "../services/authUtils";

const Header = () => {
  const role = getUserRole();

  return (
    <div style={styles.header}>
      <h2>{role?.toUpperCase()} Dashboard</h2>
    </div>
  );
};

const styles = {
  header: {
    padding: "1rem",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
  },
};

export default Header;


