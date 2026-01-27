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

module.exports = app;
