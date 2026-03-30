const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  // time is a string for easy display, createdAt is for sorting
  time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);