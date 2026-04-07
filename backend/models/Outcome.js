const mongoose = require('mongoose');

const programOutcomeSchema = new mongoose.Schema({
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  code: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const courseOutcomeSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  code: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = {
  ProgramOutcome: mongoose.model('ProgramOutcome', programOutcomeSchema),
  CourseOutcome: mongoose.model('CourseOutcome', courseOutcomeSchema)
};
