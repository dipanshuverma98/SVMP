import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API_URL from "../../config";

export default function MenteeDashboard() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mentee/groups/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setGroups(data);
        }
      } catch (err) {
        console.error("Failed to load groups", err);
      }
    };
    fetchMyGroups();
  }, [userId]);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar />
      
      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ marginBottom: "5px" }}>Student Dashboard</h1>
          <p style={{ color: "#666" }}>Select a group to start learning and chatting with your mentor.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
          {groups.length > 0 ? groups.map(group => (
            <div key={group._id} style={{ backgroundColor: "white", padding: "30px", borderRadius: "15px", border: "1px solid #e1e4e8", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "inline-block", padding: "5px 12px", background: "#e7f3ff", color: "#007bff", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", marginBottom: "15px" }}>
                ACTIVE GROUP
              </div>
              <h3 style={{ margin: "0 0 10px 0", color: "#2d3436" }}>{group.name}</h3>
              <p style={{ color: "#636e72", fontSize: "14px", marginBottom: "25px" }}>
                <strong>Mentor:</strong> {group.mentor?.name || group.mentor?.email.split("@")[0]}
              </p>
              <button 
                onClick={() => navigate(`/group/${group._id}`)}
                style={{ width: "100%", padding: "12px", background: "#28a745", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
              >
                Join Class Space
              </button>
            </div>
          )) : (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", background: "white", borderRadius: "15px", border: "2px dashed #ccc" }}>
              <h3 style={{ color: "#999" }}>You aren't in any groups yet.</h3>
              <p style={{ color: "#bbb" }}>Contact your mentor to be added using your registered email.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}