const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['COURSE_UPDATE', 'SYLLABUS_UPDATE', 'MAPPING_UPDATE', 'NEW_COURSE', 'OUTCOME_UPDATE'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', default: null },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  notes: { type: String }, // Reviewer notes
  submitted_at: { type: Date },
  reviewed_at: { type: Date },
  academic_year: { type: String, default: () => {
    const now = new Date();
    const year = now.getFullYear();
    return `${year}-${year + 1}`;
  }},
  attachments: [{ name: String, url: String }],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

approvalSchema.index({ status: 1 });
approvalSchema.index({ submitted_by: 1 });

module.exports = mongoose.model('Approval', approvalSchema);
