const mongoose = require('mongoose');

const curriculumVersionSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  version_number: { type: Number, required: true },
  academic_year: { type: String, required: true },
  modified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modified_by_name: { type: String },
  change_summary: { type: String },
  snapshot: {
    name: String,
    code: String,
    credits: Number,
    description: String,
    weekly_hours: Number,
    syllabus_url: String,
    outcomes: [{ code: String, description: String }]
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

curriculumVersionSchema.index({ course_id: 1, version_number: -1 });

module.exports = mongoose.model('CurriculumVersion', curriculumVersionSchema);
