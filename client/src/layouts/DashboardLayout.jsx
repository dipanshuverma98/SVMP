import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ children }) => {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
        <Header />
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { display: "flex", minHeight: "100vh" },
  main: { flex: 1, background: "#f9fafb" },
  content: { padding: "1.5rem" },
};

export default DashboardLayout;
