const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("SVMP API is running");
});
const testRoutes = require("./routes/testRoutes");
app.use("/api/test", testRoutes);
const protectedRoutes = require("./routes/protectedRoutes");
app.use("/api/protected", protectedRoutes);
app.use("/api/mentor", require("./routes/mentorRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

module.exports = app;
