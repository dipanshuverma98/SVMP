const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  resources: [{ title: String, url: String }], // Added this for PDF/Links
  createdAt: { type: Date, default: Date.now }
});

// 👇 THIS IS THE MISSING MAGIC LINE 👇
// It actually creates the model. We also check if it exists first to prevent hot-reload crashes.
const Group = mongoose.models.Group || mongoose.model("Group", GroupSchema);

// Now we can safely export it!
module.exports = { Group };