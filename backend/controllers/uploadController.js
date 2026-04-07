const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');
const { Program } = require('../models/Program');
const { ProgramOutcome, CourseOutcome } = require('../models/Outcome');
const Department = require('../models/Department');

// POST /api/upload
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// GET /api/upload/search?q=...
const searchAll = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) return res.json({ courses: [], programs: [], outcomes: [], users: [] });

    const regex = new RegExp(q, 'i');

    const [courses, programs, pos, cos, users, depts] = await Promise.all([
      Course.find({ $or: [{ name: regex }, { code: regex }] }).limit(8).select('code name credits status').lean(),
      Program.find({ $or: [{ name: regex }, { code: regex }] }).limit(5).select('code name').lean(),
      ProgramOutcome.find({ $or: [{ code: regex }, { description: regex }] }).limit(6).select('code description program_id').lean(),
      CourseOutcome.find({ $or: [{ code: regex }, { description: regex }] }).limit(6).select('code description course_id').lean(),
      req.user.role === 'admin' ? User.find({ $or: [{ name: regex }, { email: regex }] }).limit(5).select('name email role').lean() : Promise.resolve([]),
      Department.find({ name: regex }).limit(3).select('name code').lean(),
    ]);

    res.json({
      courses: courses.map(c => ({ id: c._id, ...c, type: 'course' })),
      programs: programs.map(p => ({ id: p._id, ...p, type: 'program' })),
      outcomes: [...pos.map(o => ({ id: o._id, ...o, type: 'po' })), ...cos.map(o => ({ id: o._id, ...o, type: 'co' }))],
      users: users.map(u => ({ id: u._id, ...u, type: 'user' })),
      departments: depts.map(d => ({ id: d._id, ...d, type: 'department' })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = { uploadFile, searchAll };
