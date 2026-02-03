const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");

router.get("/:userId", auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.userId, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.userId },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;
