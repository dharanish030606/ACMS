const mongoose = require('mongoose');

const mappingSchema = new mongoose.Schema({
  co_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOutcome', required: true },
  po_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgramOutcome', required: true },
  correlation_level: { type: Number, required: true, enum: [1, 2, 3] },
  mapped_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Ensure unique mapping per CO-PO pair
mappingSchema.index({ co_id: 1, po_id: 1 }, { unique: true });

module.exports = mongoose.model('Mapping', mappingSchema);
