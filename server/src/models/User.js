const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // This MUST be an ObjectId to match the User model's _id
  mentor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  mentees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  resources: [{ 
    title: String, 
    url: String 
  }],
  createdAt: { type: Date, default: Date.now },
});

// Check if models are already defined to prevent errors during hot-reloads
const Group = mongoose.models.Group || mongoose.model("Group", GroupSchema);

module.exports = { Group };