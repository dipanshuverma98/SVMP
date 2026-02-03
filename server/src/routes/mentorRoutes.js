const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.post(
  "/create-session",
  auth,
  role("mentor"),
  (req, res) => {
    res.json({ message: "Mentor session created" });
  }
);

module.exports = router;
