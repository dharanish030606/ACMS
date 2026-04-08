const Department = require('../models/Department');
const { Program, Semester } = require('../models/Program');
const Course = require('../models/Course');
const { ProgramOutcome } = require('../models/Outcome');
const User = require('../models/User');

// GET /api/programs
const getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate('department_id', 'name').sort('-created_at').lean();
    
    const formatted = [];
    for (const p of programs) {
      const semDocs = await Semester.find({ program_id: p._id }).select('_id');
      const semIds = semDocs.map(s => s._id);
      formatted.push({
        ...p,
        id: String(p._id),
        department_name: p.department_id?.name,
        semester_count: semIds.length,
        course_count: await Course.countDocuments({ semester_id: { $in: semIds } })
      });
    }
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/programs/:id
const getProgramById = async (req, res) => {
  try {
    const p = await Program.findById(req.params.id).populate('department_id', 'name').lean();
    if (!p) return res.status(404).json({ message: 'Program not found' });
    
    p.id = p._id;
    p.department_name = p.department_id?.name;
    
    const semDocs = await Semester.find({ program_id: p._id }).sort('number').lean();
    const semesters = [];
    for (const s of semDocs) {
      s.id = s._id;
      s.course_count = await Course.countDocuments({ semester_id: s._id });
      semesters.push(s);
    }
    
    const outcomes = await ProgramOutcome.find({ program_id: p._id }).sort('code').lean();
    outcomes.forEach(o => o.id = o._id);
    
    res.json({ ...p, semesters, outcomes });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/programs
const createProgram = async (req, res) => {
  try {
    const { name, code, department_id, duration_years, description } = req.body;
    const existing = await Program.findOne({ code });
    if (existing) return res.status(409).json({ message: 'Program code exists' });
    
    const prog = new Program({ name, code, department_id, duration_years, description });
    await prog.save();
    
    const dur = duration_years || 4;
    const sems = [];
    for (let i = 1; i <= dur * 2; i++) {
      sems.push({ program_id: prog._id, number: i, label: `Semester ${i}` });
    }
    await Semester.insertMany(sems);
    
    res.status(201).json({ id: prog._id, ...prog.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/programs/:id
const updateProgram = async (req, res) => {
  try {
    const { name, code, department_id, duration_years, description } = req.body;
    const prog = await Program.findByIdAndUpdate(req.params.id, { name, code, department_id, duration_years, description }, { new: true });
    if (!prog) return res.status(404).json({ message: 'Program not found' });
    res.json({ id: prog._id, ...prog.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/programs/:id
const deleteProgram = async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    // Realistically need to delete semesters, courses, etc. here, but omitting for brevity
    res.json({ message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/programs/departments
const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find().populate('hod_id', 'name').sort('name').lean();
    for (const d of depts) {
      d.id = d._id;
      d.hod_name = d.hod_id?.name;
      d.program_count = await Program.countDocuments({ department_id: d._id });
    }
    res.json(depts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, hod_id } = req.body;
    const existing = await Department.findOne({ code });
    if (existing) return res.status(409).json({ message: 'Department code exists' });
    
    const d = new Department({ name, code, hod_id: hod_id || null });
    await d.save();
    res.status(201).json({ id: d._id, ...d.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { name, code, hod_id } = req.body;
    const d = await Department.findByIdAndUpdate(req.params.id, { name, code, hod_id: hod_id || null }, { new: true });
    if (!d) return res.status(404).json({ message: 'Department not found' });
    res.json({ id: d._id, ...d.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllPrograms, getProgramById, createProgram, updateProgram, deleteProgram, getDepartments, createDepartment, updateDepartment, deleteDepartment };
