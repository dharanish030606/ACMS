const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name: { type: String, required: true },
  user_role: { type: String },
  action: { type: String, required: true }, // e.g. 'CREATE_COURSE', 'UPDATE_MAPPING'
  entity_type: { type: String }, // 'Course', 'Mapping', 'User', etc.
  entity_id: { type: mongoose.Schema.Types.ObjectId },
  entity_name: { type: String },
  details: { type: String },
  ip_address: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

activityLogSchema.index({ created_at: -1 });
activityLogSchema.index({ user_id: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
