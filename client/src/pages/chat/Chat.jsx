import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getChatHistory } from "../../services/chatService";

const Chat = ({ toUserId }) => {
  const { token, user } = useAuth(); // ✅ inside component
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ✅ Load chat history
  useEffect(() => {
    if (!toUserId || !token || !user) return;

    const loadHistory = async () => {
      try {
        const data = await getChatHistory(toUserId, token);

        setMessages(
          data.map((m) => ({
            from: m.sender === user.userId ? "me" : "them",
            message: m.message,
            time: m.createdAt,
          }))
        );
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    loadHistory();
  }, [toUserId, token, user]);

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: m.from === "me" ? "flex-end" : "flex-start",
              background: m.from === "me" ? "#16a34a" : "#374151",
            }}
          >
            {m.message}
          </div>
        ))}
      </div>

      <form style={styles.inputBox}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  messages: {
    flex: 1,
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  message: {
    padding: "8px 12px",
    borderRadius: "8px",
    color: "#fff",
    maxWidth: "70%",
  },
  inputBox: {
    display: "flex",
    padding: "1rem",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "8px",
  },
};

export default Chat;
