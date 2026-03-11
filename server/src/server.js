const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const User = require("./models/User");
const { Group, Resource } = require("./models/Group");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());

/* ------------------- MongoDB Connection ------------------- */

mongoose.connect("mongodb://127.0.0.1:27017/mentorship");

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

/* ------------------- OTP Store ------------------- */

let otpStore = {};

/* ------------------- Email Transporter ------------------- */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "muke45556@gmail.com",
    pass: "kkmc hbpp noyo ogfj",
  },
});

/* ------------------- SEND OTP ------------------- */

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  const mailOptions = {
    from: "muke45556@gmail.com",
    to: email,
    subject: "Your Verification Code",
    text: `Your OTP is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Email failed" });
  }
});

/* ------------------- VERIFY OTP ------------------- */

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] === otp) {
    delete otpStore[email];
    res.json({ success: true, message: "OTP verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

/* ------------------- REGISTER USER ------------------- */

app.post("/api/auth/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({
      email,
      password,
      role,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ------------------- LOGIN USER ------------------- */

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.json({
      success: true,
      role: user.role,
      userId: user._id,
      message: "Login successful",
    });

  } catch (error) {
    res.status(500).json({ error: "Login error" });
  }
});

/* ------------------- CREATE GROUP ------------------- */

// Route: Mentor creates a group
app.post("/api/mentor/create-group", async (req, res) => {
  const { name, mentorId } = req.body;
  try {
    const newGroup = new Group({
      name,
      mentor: mentorId,
      mentees: [], // Starts empty
      resources: []
    });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: "Could not create group" });
  }
});
/* ------------------- GET GROUPS OF A MENTOR ------------------- */

app.get("/api/mentor/groups/:mentorId", async (req, res) => {
  try {
    const { mentorId } = req.params;
    console.log("Searching for groups belonging to Mentor ID:", mentorId);

    const groups = await Group.find({ mentor: mentorId });
    
    console.log("Groups found in DB:", groups.length);
    res.json(groups);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

/* ------------------- ADD MENTEE TO GROUP ------------------- */

app.post("/api/groups/add-mentee", async (req, res) => {
  const { groupId, email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { mentees: user._id },
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: "Failed to add mentee" });
  }
});

/* ------------------- ADD RESOURCE ------------------- */

app.post("/api/groups/add-resource", async (req, res) => {
  const { groupId, title, url } = req.body;

  try {
    const group = await Group.findById(groupId);

    group.resources.push({ title, url });

    await group.save();

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: "Failed to add resource" });
  }
});

/* ------------------- ADD RESOURCE SEPARATE COLLECTION ------------------- */

app.post("/api/mentor/add-resource", async (req, res) => {
  const { title, url, groupId } = req.body;

  try {
    const resource = new Resource({
      title,
      url,
      groupId,
    });

    await resource.save();

    res.status(201).json(resource);

  } catch (error) {
    res.status(500).json({ error: "Failed to add resource" });
  }
});

/* ------------------- SOCKET.IO GROUP CHAT ------------------- */

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join-group-chat", (groupId) => {
    socket.join(groupId);
  });

  socket.on("send-group-message", ({ groupId, message, senderName }) => {

    io.to(groupId).emit("receive-group-message", {
      text: message,
      sender: senderName,
      time: new Date().toLocaleTimeString(),
    });

  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

});

/* ------------------- START SERVER ------------------- */

server.listen(5000, () => {
  console.log("Server running on port 5000");
});