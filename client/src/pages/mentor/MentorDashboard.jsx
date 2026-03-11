import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const navigate = useNavigate();
  const mentorId = localStorage.getItem("userId");

  // Fetch existing groups
  const fetchGroups = async () => {
    const res = await fetch(`http://localhost:5000/api/mentor/groups/${mentorId}`);
    const data = await res.json();
    setGroups(data);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Function to Create a new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;

    const res = await fetch("http://localhost:5000/api/mentor/create-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName, mentorId }),
    });

    if (res.ok) {
      setNewGroupName("");
      fetchGroups(); // Refresh the list
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Mentor Dashboard</h1>

      {/* --- Create Group Section --- */}
      <div style={{ background: "#f4f4f4", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h3>Create a New Mentorship Group</h3>
        <form onSubmit={handleCreateGroup} style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="Group Name (e.g. React Batch 1)" 
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            style={{ padding: "10px", flex: 1 }}
          />
          <button type="submit" style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", cursor: "pointer" }}>
            Create Group
          </button>
        </form>
      </div>

      <hr />

      {/* --- Group List Section --- */}
      <h3>Your Active Groups</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {groups.length > 0 ? groups.map(group => (
          <div key={group._id} style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
            <h4>{group.name}</h4>
            <p>{group.mentees?.length || 0} Mentees Joined</p>
            <button 
              onClick={() => navigate(`/group/${group._id}`)}
              style={{ padding: "8px 15px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              Enter Group Space
            </button>
          </div>
        )) : <p>No groups created yet.</p>}
      </div>
    </div>
  );
}