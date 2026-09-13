import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar"; 

export default function MentorDashboard() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const navigate = useNavigate();
  const mentorId = localStorage.getItem("userId");

  const fetchGroups = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/mentor/groups/${mentorId}`);
      const data = await res.json();
      if (res.ok) setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [mentorId]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;

    try {
      const res = await fetch("http://localhost:5000/api/mentor/create-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, mentorId }),
      });

      if (res.ok) {
        setNewGroupName("");
        fetchGroups();
        alert("Group created successfully!");
      }
    } catch (err) {
      alert("Error creating group.");
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <Navbar />
      
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>Mentor Dashboard</h1>
        </div>

        {/* Create Group Section */}
        <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "40px" }}>
          <h3 style={{ marginTop: 0 }}>Create a New Mentorship Group</h3>
          <form onSubmit={handleCreateGroup} style={{ display: "flex", gap: "15px" }}>
            <input 
              type="text" 
              placeholder="Enter Group Name (e.g., MERN Stack Batch)" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
            />
            <button type="submit" style={{ padding: "12px 25px", background: "#28a745", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              + Create Group
            </button>
          </form>
        </div>

        <hr style={{ border: "0", borderTop: "1px solid #ddd", marginBottom: "30px" }} />

        {/* Group List */}
        <h3>Your Active Groups</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
          {groups.length > 0 ? groups.map(group => (
            <div key={group._id} style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "20px" }}>{group.name}</h4>
              <p style={{ color: "#777", marginBottom: "20px" }}>{group.mentees?.length || 0} Students Enrolled</p>
              <button 
                onClick={() => navigate(`/group/${group._id}`)}
                style={{ width: "100%", padding: "12px", background: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
              >
                Manage Group Space &rarr;
              </button>
            </div>
          )) : (
            <p style={{ color: "#888", gridColumn: "1/-1", textAlign: "center", padding: "40px", background: "#eee", borderRadius: "10px" }}>
              No groups found. Start by creating one above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}