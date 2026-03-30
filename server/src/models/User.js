const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Prevents two users from signing up with the same email
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["MENTOR", "MENTEE"], // Ensures only these two specific roles can be saved
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Check if the model is already defined to prevent errors during server restarts/hot-reloads
// (This is the same great practice you used in your Group.js file!)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Exporting it wrapped in an object so that `const { User } = require("./models/User");` works perfectly
module.exports = { User };