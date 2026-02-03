import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ hook INSIDE component

  const email = location.state?.email;

  if (!email) {
    return <p>Please login again.</p>;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await verifyOtp(email, otp.trim());

      // ✅ let AuthContext handle token storage
      login(data.token);

      // ✅ role-based redirect
      if (data.role === "mentor") {
        navigate("/mentor");
      } else if (data.role === "mentee") {
        navigate("/mentee");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleVerify} style={styles.card}>
        <h2>Verify OTP</h2>
        <p>{email}</p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          required
          onChange={(e) => setOtp(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    width: "320px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "1rem 0",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default VerifyOtp;
