const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'faculty'],
    default: 'faculty',
  },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
