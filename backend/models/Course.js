const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, default: 3 },
  weekly_hours: { type: Number, default: 4 },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  description: { type: String },
  syllabus_url: { type: String, default: null },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

courseSchema.index({ faculty_id: 1 });

module.exports = mongoose.model('Course', courseSchema);
