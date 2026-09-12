import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../services/socket";
import API_URL from "../../config";

export default function GroupSpace() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [menteeEmail, setMenteeEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [activeCall, setActiveCall] = useState(null);

  const userRole = localStorage.getItem("userRole")?.toUpperCase() || "USER";
  const userName = localStorage.getItem("userName") || "Anonymous";
  const isMentor = userRole === "MENTOR";

  const socket = getSocket();

  const loadGroupAndChat = async () => {
    try {
      const groupRes = await fetch(`${API_URL}/api/groups/${groupId}`);
      const groupData = await groupRes.json();
      if (groupRes.ok) setGroup(groupData);

      const chatRes = await fetch(`${API_URL}/api/chat-history/${groupId}`);
      const chatData = await chatRes.json();
      if (chatRes.ok) setMessages(chatData);

      // Check current call status
      const callRes = await fetch(`${API_URL}/api/groups/${groupId}/call-status`);
      const callData = await callRes.json();
      if (callData && callData.active) {
        setActiveCall(callData);
      } else {
        setActiveCall(null);
      }
    } catch (error) {
      console.error("Initialization Error:", error);
    }
  };

  useEffect(() => {
    loadGroupAndChat();

    socket.emit("join-group-chat", groupId);

    socket.on("receive-group-message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("call-status-changed", (callData) => {
      if (callData && callData.active) {
        setActiveCall(callData);
      } else {
        setActiveCall(null);
      }
    });

    return () => {
      socket.off("receive-group-message");
      socket.off("call-status-changed");
    };
  }, [groupId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== "") {
      socket.emit("send-group-message", {
        groupId,
        message: currentMessage.trim(),
        senderName: userName,
      });
      setCurrentMessage("");
    }
  };

  const handleAddMentee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/groups/add-mentee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, email: menteeEmail.trim() }),
      });
      if (res.ok) {
        setMenteeEmail("");
        loadGroupAndChat();
        alert("Mentee added to group!");
      } else {
        const d = await res.json();
        alert(d.error || "Failed to add mentee");
      }
    } catch (err) {
      alert("Error adding mentee");
    }
  };

  const handleStartCall = () => {
    socket.emit("start-call", { groupId, userName, isMentor });
    navigate(`/group/${groupId}/call`);
  };

  if (!group) return <div style={{ padding: "40px" }}>Loading Group Space...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      {/* Top Header Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button
          onClick={() => navigate(isMentor ? "/mentor-dashboard" : "/mentee-dashboard")}
          style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "6px", background: "#fff", fontWeight: "bold" }}
        >
          &larr; Back to Dashboard
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          {/* Direct link to dedicated Resources page */}
          <button
            onClick={() => navigate(`/group/${groupId}/resources`)}
            style={{ padding: "10px 18px", background: "#6366f1", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            📚 Resource Library ({group.resources?.length || 0})
          </button>

          <button
            onClick={handleStartCall}
            style={{ padding: "10px 18px", background: activeCall?.active ? "#16a34a" : "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            {activeCall?.active ? "🎥 Join Ongoing Meeting" : "🎥 Start Video Call"}
          </button>
        </div>
      </div>

      {/* LIVE CALL NOTIFICATION BANNER */}
      {activeCall?.active && (
        <div
          style={{
            background: "#ecfdf5",
            border: "2px solid #10b981",
            borderRadius: "10px",
            padding: "16px 24px",
            marginBottom: "25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>🔴</span>
            <div>
              <h3 style={{ margin: 0, color: "#065f46" }}>
                Live Video Meeting is currently in progress!
              </h3>
              <span style={{ fontSize: "14px", color: "#047857" }}>
                Started by <strong>{activeCall.hostName || "a member"}</strong> • {activeCall.participants?.length || 1} participant(s) in call
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/group/${groupId}/call`)}
            style={{
              padding: "10px 20px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            Join Call Now &rarr;
          </button>
        </div>
      )}

      <h1>Group Space: {group.name}</h1>
      <hr style={{ marginBottom: "30px", borderColor: "#e5e7eb" }} />

      <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
        {/* Left Column: Roster & Recent Resources preview */}
        <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Class Roster */}
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "10px", border: "1px solid #ddd" }}>
            <h3 style={{ marginTop: 0 }}>Class Roster</h3>
            {isMentor && (
              <form onSubmit={handleAddMentee} style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <input
                  type="email"
                  placeholder="Mentee email"
                  value={menteeEmail}
                  onChange={(e) => setMenteeEmail(e.target.value)}
                  required
                  style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <button type="submit" style={{ padding: "8px 15px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  Add
                </button>
              </form>
            )}
            <h4>Enrolled Students ({group.mentees?.length || 0})</h4>
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {group.mentees?.map((m, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>{m.name || m.email}</li>
              ))}
              {(!group.mentees || group.mentees.length === 0) && (
                <p style={{ color: "#777", fontSize: "14px" }}>No students enrolled yet.</p>
              )}
            </ul>
          </div>

          {/* Resources Preview Box */}
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "10px", border: "1px solid #ddd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0 }}>Resources</h3>
              <button
                onClick={() => navigate(`/group/${groupId}/resources`)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                View All &rarr;
              </button>
            </div>

            <ul style={{ paddingLeft: "20px", margin: "0 0 15px 0" }}>
              {group.resources?.slice(0, 3).map((r, i) => (
                <li key={i} style={{ marginBottom: "8px" }}>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ color: "#007bff", fontWeight: "bold" }}>
                    {r.title}
                  </a>
                </li>
              ))}
              {(!group.resources || group.resources.length === 0) && (
                <p style={{ color: "#777", fontSize: "14px" }}>No resources shared yet.</p>
              )}
            </ul>

            <button
              onClick={() => navigate(`/group/${groupId}/resources`)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Open Resource Library Page
            </button>
          </div>
        </div>

        {/* Right Column: Live Group Chat */}
        <div style={{ flex: 2, minWidth: "400px", background: "#fff", border: "1px solid #ddd", borderRadius: "10px", display: "flex", flexDirection: "column", height: "600px", overflow: "hidden" }}>
          <div style={{ background: "#1e293b", color: "white", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>💬 Live Group Chat</h3>
            {activeCall?.active && (
              <span style={{ background: "#10b981", color: "white", padding: "3px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                Call Active
              </span>
            )}
          </div>

          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc" }}>
            {messages.map((msg, index) => {
              const isMe = msg.sender === userName;
              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    background: isMe ? "#2563eb" : "#ffffff",
                    color: isMe ? "white" : "#1e293b",
                    padding: "10px 15px",
                    borderRadius: "12px",
                    maxWidth: "70%",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    border: isMe ? "none" : "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "4px", opacity: 0.85 }}>
                    {msg.sender}
                  </div>
                  <div style={{ fontSize: "14px", wordBreak: "break-word" }}>{msg.text || msg.message}</div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} style={{ padding: "15px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px", background: "#fff" }}>
            <input
              type="text"
              placeholder="Type a message to the group..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
            />
            <button
              type="submit"
              style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
