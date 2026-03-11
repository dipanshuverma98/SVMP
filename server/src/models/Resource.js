const mongoose = require("mongoose");

// Group Schema
const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Resource Schema
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }, // Link to PDF/Drive/Video
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
});

const Group = mongoose.model("Group", GroupSchema);
const Resource = mongoose.model("Resource", ResourceSchema);
module.exports = { Group, Resource };