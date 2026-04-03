const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const nodemailer = require("nodemailer"); // Added Nodemailer

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

/* ------------------- EMAIL CONFIGURATION (OTP) ------------------- */
// Temporary memory store for OTPs
const otpStore = {}; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "muke45556@gmail.com", // 👈 REPLACE WITH YOUR GMAIL
    pass: "owvq pbrj pnfs gvsu",    // 👈 REPLACE WITH YOUR 16-DIGIT APP PASSWORD
  },
});

/* ------------------- AUTH ROUTES (OTP/Login) ------------------- */

// 1. Send OTP Route (Replaces direct signup)
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save it temporarily (expires in 5 mins)
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60000 };

  // Send the Email
  try {
    await transporter.sendMail({
      from: "muke45556@gmail.com", // 👈 REPLACE WITH YOUR GMAIL
      to: email,
      subject: "Verify Your Mentorship Hub Account",
      html: `<h3>Welcome!</h3><p>Your OTP for registration is: <strong>${otp}</strong></p><p>It will expire in 5 minutes.</p>`,
    });
    console.log(`✅ OTP sent to ${email}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    res.status(500).json({ error: "Failed to send OTP email." });
  }
});

// 2. Verify OTP & Create Account Route
app.post("/api/auth/verify-otp", async (req, res) => {
  const { name, email, password, role, otp } = req.body;
  const storedOtpData = otpStore[email];

  if (!storedOtpData) return res.status(400).json({ error: "OTP not found or expired" });
  if (storedOtpData.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
  if (Date.now() > storedOtpData.expiresAt) return res.status(400).json({ error: "OTP has expired" });

  try {
    // OTP is correct! Create the actual user in the database now.
    const newUser = new User({ name, email, password, role: role.toUpperCase() });
    await newUser.save();
    
    // Clear the OTP from memory
    delete otpStore[email];
    
    res.status(201).json({ success: true, message: "Account verified and created!" });
  } catch (error) {
    console.error("❌ MONGODB SAVE ERROR:", error);
    res.status(500).json({ error: "Failed to create account in database" });
  }
});

// 3. Login Route
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
  // --- WEBRTC VIDEO CALL SIGNALING ---
  
  // 1. User A sends an offer to start a call
  socket.on("video-offer", (data) => {
    // Send the offer only to the other people in this specific group room
    socket.to(data.groupId).emit("receive-video-offer", {
      offer: data.offer,
      callerId: socket.id,
    });
  });

  // 2. User B answers the call
  socket.on("video-answer", (data) => {
    // Send the answer directly back to the person who called (User A)
    io.to(data.callerId).emit("receive-video-answer", {
      answer: data.answer,
    });
  });

  // 3. Both users exchange network info to find the best connection path
  socket.on("new-ice-candidate", (data) => {
    socket.to(data.groupId).emit("receive-ice-candidate", data.candidate);
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