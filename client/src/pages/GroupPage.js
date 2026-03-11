import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function GroupPage() {
  const { groupId } = useParams();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [menteeEmail, setMenteeEmail] = useState("");

  useEffect(() => {
    socket.emit("join-group-chat", groupId);
    socket.on("receive-group-message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });
    return () => socket.off();
  }, [groupId]);

  const sendMsg = () => {
    socket.emit("send-group-message", { groupId, message, senderName: "Mentor" });
    setMessage("");
  };

  const addMentee = async () => {
    await fetch(`http://localhost:5000/api/groups/add-mentee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, email: menteeEmail })
    });
    alert("Mentee Added!");
  };

  return (
    <div style={{ padding: "20px", position: "relative" }}>
      {/* Top Right Buttons */}
      <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => setShowResourceModal(true)} style={{ background: "#28a745", color: "white" }}>📚 Resources</button>
        <button onClick={() => {
          const email = prompt("Enter Mentee Email:");
          if(email) { setMenteeEmail(email); addMentee(); }
        }} style={{ background: "#007bff", color: "white" }}>+ Add Mentee</button>
      </div>

      <h1>Group Chat</h1>
      <div style={{ height: "400px", border: "1px solid #ccc", overflowY: "scroll", padding: "10px", marginBottom: "10px" }}>
        {chat.map((msg, i) => (
          <p key={i}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
      <button onClick={sendMsg}>Send</button>

      {/* Resource Modal Placeholder */}
      {showResourceModal && (
        <div style={{ position: "fixed", top: "20%", left: "30%", background: "white", padding: "20px", border: "2px solid black" }}>
          <h3>Add Resource</h3>
          <input placeholder="Link or PDF URL" />
          <button onClick={() => setShowResourceModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
}