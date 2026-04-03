import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function GroupSpace() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  // --- All Your Original Data States ---
  const [group, setGroup] = useState(null);
  const [menteeEmail, setMenteeEmail] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const userRole = localStorage.getItem("userRole")?.toUpperCase() || "USER";
  const userName = localStorage.getItem("userName") || "Anonymous";
  const isMentor = userRole === "MENTOR";

  useEffect(() => {
    const loadData = async () => {
      try {
        const groupRes = await fetch(`http://localhost:5000/api/groups/${groupId}`);
        const groupData = await groupRes.json();
        if (groupRes.ok) setGroup(groupData);

        const chatRes = await fetch(`http://localhost:5000/api/chat-history/${groupId}`);
        const chatData = await chatRes.json();
        if (chatRes.ok) setMessages(chatData);
      } catch (error) {
        console.error("Initialization Error:", error);
      }
    };

    loadData();
    socket.emit("join-group-chat", groupId);

    socket.on("receive-group-message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receive-group-message");
    };
  }, [groupId]);

  // --- Handlers (Exactly as you had them) ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== "") {
      socket.emit("send-group-message", {
        groupId,
        message: currentMessage,
        senderName: userName,
      });
      setCurrentMessage(""); 
    }
  };

  const handleAddMentee = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/groups/add-mentee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, email: menteeEmail }),
    });
    if (res.ok) window.location.reload();
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/groups/add-resource", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, title: resourceTitle, url: resourceUrl }),
    });
    if (res.ok) window.location.reload();
  };

  if (!group) return <div style={{ padding: "40px" }}>Loading Group Space...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      
      {/* Header Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={() => navigate(isMentor ? "/mentor-dashboard" : "/mentee-dashboard")} style={{ padding: "8px 15px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}>
          &larr; Back to Dashboard
        </button>
        <button 
          onClick={() => navigate(`/group/${groupId}/call`)} 
          style={{ padding: "10px 20px", background: "#d9534f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          🎥 Start WebRTC Call (New Page)
        </button>
      </div>

      <h1>Group Space: {group.name}</h1>
      <hr style={{ marginBottom: "30px" }}/>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        
        {/* Left Column: Roster & Resources */}
        <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
            <h3>Class Roster</h3>
            {isMentor && (
              <form onSubmit={handleAddMentee} style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <input type="email" placeholder="Mentee email" value={menteeEmail} onChange={(e) => setMenteeEmail(e.target.value)} required style={{ flex: 1, padding: "8px" }} />
                <button type="submit" style={{ padding: "8px 15px", background: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>Add</button>
              </form>
            )}
            <h4>Enrolled ({group.mentees.length})</h4>
            <ul style={{ paddingLeft: "20px" }}>
              {group.mentees.map((m, i) => <li key={i}>{m.name || m.email}</li>)}
            </ul>
          </div>

          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
            <h3>Resources</h3>
            {isMentor && (
              <form onSubmit={handleAddResource} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                <input type="text" placeholder="Title" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} required style={{ padding: "8px" }} />
                <input type="url" placeholder="URL" value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} required style={{ padding: "8px" }} />
                <button type="submit" style={{ padding: "8px 15px", background: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>Upload</button>
              </form>
            )}
            <ul style={{ paddingLeft: "20px" }}>
              {group.resources.map((r, i) => (
                <li key={i}><a href={r.url} target="_blank" rel="noreferrer" style={{ color: "#007bff", fontWeight: "bold" }}>{r.title}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: THE LIVE CHAT ROOM */}
        <div style={{ flex: 2, minWidth: "400px", background: "#fff", border: "1px solid #ddd", borderRadius: "8px", display: "flex", flexDirection: "column", height: "600px" }}>
          <div style={{ background: "#343a40", color: "white", padding: "15px", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
            <h3 style={{ margin: 0 }}>💬 Live Group Chat</h3>
          </div>
          
          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f4f4f9" }}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                alignSelf: msg.sender === userName ? "flex-end" : "flex-start",
                background: msg.sender === userName ? "#007bff" : "#ffffff",
                color: msg.sender === userName ? "white" : "black",
                padding: "10px 15px", borderRadius: "12px", maxWidth: "70%", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: msg.sender === userName ? "none" : "1px solid #ddd"
              }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "4px", opacity: 0.8 }}>{msg.sender}</div>
                <div style={{ fontSize: "14px" }}>{msg.text || msg.message}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={{ padding: "15px", borderTop: "1px solid #ddd", display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              placeholder="Type message..." 
              value={currentMessage} 
              onChange={(e) => setCurrentMessage(e.target.value)} 
              style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ccc", outline: "none" }} 
            />
            <button type="submit" style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}