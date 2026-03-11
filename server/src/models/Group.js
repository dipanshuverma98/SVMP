const GroupSchema = new mongoose.Schema({
  name: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  resources: [{ title: String, url: String }] // Added this for PDF/Links
});