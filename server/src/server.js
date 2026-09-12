require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import Models
const User = require("./models/User");
const { Group } = require("./models/Group");
const Chat = require("./models/Chat");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/* ------------------- MONGODB CONNECTION ------------------- */
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/svmp";
let isDbConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ Connected to MongoDB`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};

// Initial connection for traditional/local server runs
connectDB();

// Middleware ensuring DB is connected before handling requests in serverless environments
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  next();
});

/* ------------------- EMAIL CONFIGURATION (OTP) ------------------- */
// Temporary memory store for OTPs
const otpStore = {}; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "muke45556@gmail.com",
    pass: process.env.EMAIL_PASS || "mxet tnnx nqct lmgh",
  },
});

/* ------------------- AUTH ROUTES (OTP/Login) ------------------- */

// 1. Send OTP Route
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save temporarily (expires in 5 mins)
  otpStore[normalizedEmail] = { otp, expiresAt: Date.now() + 5 * 60000 };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"SVMP" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "Verify Your Mentorship Hub Account",
        html: `<h3>Welcome to SVMP!</h3><p>Your OTP for registration is: <strong>${otp}</strong></p><p>It will expire in 5 minutes.</p>`,
      });
      console.log(`✅ OTP email sent to ${normalizedEmail}`);
    } else {
      console.log(`⚠️ Email credentials not set. Simulated OTP for ${normalizedEmail}: ${otp}`);
    }
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    // In local dev/fallback if SMTP fails, allow user to continue in console
    console.log(`ℹ️ Fallback for local testing - OTP for ${normalizedEmail}: ${otp}`);
    res.json({ success: true, message: "OTP generated (check console if email failed)" });
  }
});

// 2. Verify OTP & Create Account Route
app.post("/api/auth/verify-otp", async (req, res) => {
  const { name, email, password, role, otp } = req.body;
  if (!email || !otp || !password || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const storedOtpData = otpStore[normalizedEmail];

  if (!storedOtpData) return res.status(400).json({ error: "OTP not found or expired" });
  if (String(storedOtpData.otp).trim() !== String(otp).trim()) {
    return res.status(400).json({ error: "Invalid OTP" });
  }
  if (Date.now() > storedOtpData.expiresAt) {
    delete otpStore[normalizedEmail];
    return res.status(400).json({ error: "OTP has expired" });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = (role || "mentee").toUpperCase();
    const newUser = new User({ 
      name, 
      email: normalizedEmail, 
      password: hashedPassword, 
      role: userRole 
    });
    await newUser.save();
    
    // Clear OTP from memory
    delete otpStore[normalizedEmail];

    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.status(201).json({ 
      success: true, 
      message: "Account verified and created!",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error("❌ MONGODB SAVE ERROR:", error);
    res.status(500).json({ error: "Failed to create account in database" });
  }
});

// 3. Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Verify password (supports bcrypt hash and plaintext fallback for legacy users)
    let isMatch = false;
    if (!user.password) {
      // User record in database has no password set
      return res.status(401).json({ error: "No password set for this account. Please re-register." });
    }

    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
    }

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
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

// In-memory active calls per groupId: { [groupId]: { hostId, hostName, startedAt, participants: [{ id, name, isMentor }] } }
const activeCalls = {};

app.get("/api/groups/:groupId/call-status", (req, res) => {
  const { groupId } = req.params;
  res.json(activeCalls[groupId] || { active: false });
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
    if (activeCalls[groupId]) {
      socket.emit("call-status-changed", activeCalls[groupId]);
    }
  });

  socket.on("send-group-message", async (data) => {
    const { groupId, message, senderName } = data;
    try {
      const newMessage = new Chat({
        groupId,
        sender: senderName,
        text: message
      });
      const savedMsg = await newMessage.save();
      io.to(groupId).emit("receive-group-message", savedMsg);
    } catch (err) {
      console.error("❌ Chat save error:", err);
    }
  });

  // --- WEBRTC MULTI-PEER VIDEO CALL & ACTIVE CALL STATE ---
  
  // 1. Group member starts or announces a call
  socket.on("start-call", ({ groupId, userName, isMentor }) => {
    if (!activeCalls[groupId]) {
      activeCalls[groupId] = {
        active: true,
        groupId,
        hostId: socket.id,
        hostName: userName,
        startedAt: new Date(),
        participants: []
      };
    }
    const call = activeCalls[groupId];
    if (!call.participants.some(p => p.socketId === socket.id)) {
      call.participants.push({ socketId: socket.id, userName, isMentor });
    }
    io.to(groupId).emit("call-status-changed", call);
  });

  // 2. Member joins the video room
  socket.on("join-video-call", ({ groupId, userName, isMentor }) => {
    socket.join(`call-${groupId}`);
    socket.groupId = groupId;
    socket.userName = userName;
    socket.isMentor = isMentor;

    if (!activeCalls[groupId]) {
      activeCalls[groupId] = {
        active: true,
        groupId,
        hostId: socket.id,
        hostName: userName,
        startedAt: new Date(),
        participants: []
      };
    }

    const call = activeCalls[groupId];
    if (!call.participants.some(p => p.socketId === socket.id)) {
      call.participants.push({ socketId: socket.id, userName, isMentor });
    }

    // Inform existing call participants that a new peer joined
    socket.to(`call-${groupId}`).emit("peer-joined", {
      peerId: socket.id,
      userName,
      isMentor
    });

    // Notify the entire group that call status has changed/active
    io.to(groupId).emit("call-status-changed", call);

    // Send the joining user the list of already connected peers
    const existingPeers = call.participants.filter(p => p.socketId !== socket.id);
    socket.emit("existing-peers", existingPeers);
  });

  // 3. Peer-to-Peer WebRTC Signaling
  socket.on("signal-send", ({ to, signal, fromName }) => {
    io.to(to).emit("signal-receive", {
      from: socket.id,
      signal,
      fromName: fromName || socket.userName
    });
  });

  // Backward-compatible direct offer/answer/candidate
  socket.on("webrtc-offer", (data) => {
    socket.to(data.groupId).emit("webrtc-offer", data.offer);
    socket.to(data.groupId).emit("receive-video-offer", {
      offer: data.offer,
      callerId: socket.id,
    });
  });

  socket.on("webrtc-answer", (data) => {
    if (data.groupId) socket.to(data.groupId).emit("webrtc-answer", data.answer);
    if (data.callerId) io.to(data.callerId).emit("receive-video-answer", { answer: data.answer });
  });

  socket.on("webrtc-ice-candidate", (data) => {
    const candidate = data.candidate || data;
    socket.to(data.groupId).emit("webrtc-ice-candidate", candidate);
    socket.to(data.groupId).emit("receive-ice-candidate", candidate);
  });

  // 4. Leave call
  const leaveCurrentCall = (groupId) => {
    if (!groupId || !activeCalls[groupId]) return;
    const call = activeCalls[groupId];
    call.participants = call.participants.filter(p => p.socketId !== socket.id);

    socket.to(`call-${groupId}`).emit("peer-left", { peerId: socket.id });

    if (call.participants.length === 0) {
      delete activeCalls[groupId];
      io.to(groupId).emit("call-status-changed", { active: false, groupId });
    } else {
      io.to(groupId).emit("call-status-changed", call);
    }
  };

  socket.on("leave-video-call", ({ groupId }) => {
    leaveCurrentCall(groupId || socket.groupId);
  });

  socket.on("disconnect", () => {
    console.log("🔌 User Disconnected:", socket.id);
    if (socket.groupId) {
      leaveCurrentCall(socket.groupId);
    }
  });
});

/* ------------------- START SERVER ------------------- */
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;