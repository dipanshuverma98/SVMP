import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={styles.container}>
      
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>SVMP</h2>

        <div style={styles.navLinks}>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h1>Student Virtual Mentorship Platform</h1>
        <p>
          Connect mentors and mentees in one place.  
          Share resources, collaborate in groups, and host mentorship sessions.
        </p>

        <div style={styles.buttons}>
          <Link to="/signup" style={styles.primaryBtn}>
            Get Started
          </Link>

          <Link to="/login" style={styles.secondaryBtn}>
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <h2>Platform Features</h2>

        <div style={styles.featureGrid}>
          <div style={styles.card}>
            <h3>Mentor Groups</h3>
            <p>Mentors can create groups and manage their mentees.</p>
          </div>

          <div style={styles.card}>
            <h3>Resource Library</h3>
            <p>Access learning materials and Google Drive resources.</p>
          </div>

          <div style={styles.card}>
            <h3>Group Chat</h3>
            <p>Communicate and share links or resources instantly.</p>
          </div>

          <div style={styles.card}>
            <h3>Video Meetings</h3>
            <p>Mentors host sessions and share meeting links with mentees.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 SVMP Platform</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    background: "#1e293b",
    color: "white",
  },

  logo: {
    margin: 0,
  },

  navLinks: {
    display: "flex",
    gap: "20px",
  },

  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
  },

  hero: {
    textAlign: "center",
    padding: "80px 20px",
    background: "#f1f5f9",
  },

  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },

  primaryBtn: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
  },

  secondaryBtn: {
    padding: "10px 20px",
    border: "1px solid #2563eb",
    color: "#2563eb",
    textDecoration: "none",
    borderRadius: "6px",
  },

  features: {
    padding: "60px 20px",
    textAlign: "center",
  },

  featureGrid: {
    marginTop: "30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    padding: "0 40px",
  },

  card: {
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "white",
  },

  footer: {
    marginTop: "40px",
    padding: "20px",
    textAlign: "center",
    background: "#1e293b",
    color: "white",
  },
};

export default Home;