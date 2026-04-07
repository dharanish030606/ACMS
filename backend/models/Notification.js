const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['APPROVAL_REQUIRED', 'APPROVED', 'REJECTED', 'MAPPING_GAP', 'COURSE_ASSIGNED', 'CURRICULUM_UPDATE', 'SYSTEM'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // Optional frontend route to navigate to
  is_read: { type: Boolean, default: false },
  related_id: { type: mongoose.Schema.Types.ObjectId }, // Related entity
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

notificationSchema.index({ recipient_id: 1, is_read: 1 });
notificationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
