const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  number: { type: Number, required: true },
  label: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const programSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  duration_years: { type: Number, default: 4 },
  description: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = {
  Program: mongoose.model('Program', programSchema),
  Semester: mongoose.model('Semester', semesterSchema)
};
