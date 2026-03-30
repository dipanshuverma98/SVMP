const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Import Models
const User = require("./models/User");
const { Group } = require("./models/Group");
const Chat = require("./models/Chat"); // Ensure this file exists in models/

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/* ------------------- MONGODB CONNECTION ------------------- */
mongoose
  .connect("mongodb://127.0.0.1:27017/mentorship")
  .then(() => console.log("✅ Connected to MongoDB (mentorship)"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

/* ------------------- AUTH ROUTES (Signup/Login) ------------------- */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = new User({ name, email, password, role: role.toUpperCase() });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Login error" });
  }
});

/* ------------------- GROUP & RESOURCE ROUTES ------------------- */

// Mentor: Create Group
app.post("/api/mentor/create-group", async (req, res) => {
  const { name, mentorId } = req.body;
  try {
    const newGroup = new Group({ name, mentor: mentorId });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: "Could not create group" });
  }
});

// Mentor: Fetch his groups
app.get("/api/mentor/groups/:mentorId", async (req, res) => {
  try {
    const groups = await Group.find({ mentor: req.params.mentorId });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Mentee: Fetch his enrolled groups
app.get("/api/mentee/groups/:userId", async (req, res) => {
  try {
    const groups = await Group.find({ mentees: req.params.userId }).populate("mentor", "name email");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Common: Fetch specific group details
app.get("/api/groups/:groupId", async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate("mentees", "email name");
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Group not found" });
  }
});

// Mentor: Add Mentee to Group
app.post("/api/groups/add-mentee", async (req, res) => {
  const { groupId, email } = req.body;
  try {
    const student = await User.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(404).json({ error: "Mentee not found" });

    await Group.findByIdAndUpdate(groupId, { $addToSet: { mentees: student._id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add mentee" });
  }
});

// Mentor: Add Resource Link
app.post("/api/groups/add-resource", async (req, res) => {
  const { groupId, title, url } = req.body;
  try {
    await Group.findByIdAndUpdate(groupId, { $push: { resources: { title, url } } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add resource" });
  }
});

/* ------------------- CHAT PERSISTENCE (History) ------------------- */

app.get("/api/chat-history/:groupId", async (req, res) => {
  try {
    const history = await Chat.find({ groupId: req.params.groupId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to load chat history" });
  }
});

/* ------------------- SOCKET.IO (Real-time) ------------------- */

io.on("connection", (socket) => {
  console.log("🔌 User Connected:", socket.id);

  socket.on("join-group-chat", (groupId) => {
    socket.join(groupId);
    console.log(`👤 User joined room: ${groupId}`);
  });

  socket.on("send-group-message", async (data) => {
    const { groupId, message, senderName } = data;
    try {
      // Create and Save to MongoDB
      const newMessage = new Chat({
        groupId,
        sender: senderName,
        text: message
      });
      const savedMsg = await newMessage.save();

      // Emit to everyone in the room (including sender)
      io.to(groupId).emit("receive-group-message", savedMsg);
    } catch (err) {
      console.error("❌ Chat save error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 User Disconnected");
  });
});

/* ------------------- START SERVER ------------------- */
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});