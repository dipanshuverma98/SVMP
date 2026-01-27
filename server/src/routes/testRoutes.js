const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get(
  "/mentor-only",
  auth,
  role("mentor"),
  (req, res) => {
    res.json({ message: "Welcome mentor" });
  }
);

router.get(
  "/admin-only",
  auth,
  role("admin"),
  (req, res) => {
    res.json({ message: "Welcome admin" });
  }
);

module.exports = router;
