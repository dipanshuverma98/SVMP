import { useEffect, useState } from "react";
import { connectSocket } from "../services/socket";

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const s = connectSocket(token);

    s.emit("join_room", { roomId: "session:test123" });

    s.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(s);

    return () => s.disconnect();
  }, []);

  const sendMessage = () => {
    socket.emit("send_message", {
      roomId: "session:test123",
      content: msg,
    });
    setMsg("");
  };

  return (
    <div>
      <h2>SVMP Chat</h2>

      {messages.map((m, i) => (
        <p key={i}>{m.content}</p>
      ))}

      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
