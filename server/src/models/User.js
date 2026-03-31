const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // 👈 Added the name field so your users have names!
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["MENTOR", "MENTEE"], 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// 👈 Exported DIRECTLY so `const User = require("./models/User");` works perfectly!
module.exports = User;