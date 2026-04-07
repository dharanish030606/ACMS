const Course = require('../models/Course');
const { Semester, Program } = require('../models/Program');
const Department = require('../models/Department');
const { CourseOutcome } = require('../models/Outcome');
const User = require('../models/User');

// GET /api/courses
const getAllCourses = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'faculty') query.faculty_id = req.user.id;
    
    // For HOD filtration, we would fetch departments but for basic setup we fetch all and filter or populate
    const courses = await Course.find(query)
      .populate({
        path: 'semester_id',
        populate: {
          path: 'program_id',
          populate: { path: 'department_id' }
        }
      })
      .populate('faculty_id', 'name')
      .lean();
      
    const formatted = [];
    for (const c of courses) {
      const co_count = await CourseOutcome.countDocuments({ course_id: c._id });
      
      formatted.push({
        id: c._id,
        code: c.code,
        name: c.name,
        credits: c.credits,
        description: c.description,
        semester_id: c.semester_id?._id,
        semester_label: c.semester_id?.label,
        semester_number: c.semester_id?.number,
        program_name: c.semester_id?.program_id?.name,
        department_name: c.semester_id?.program_id?.department_id?.name,
        faculty_name: c.faculty_id?.name,
        co_count
      });
    }
    
    formatted.sort((a, b) => (a.program_name || '').localeCompare(b.program_name || '') || (a.semester_number || 0) - (b.semester_number || 0));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const c = await Course.findById(req.params.id)
      .populate({ path: 'semester_id', populate: { path: 'program_id' } })
      .populate('faculty_id', 'name')
      .lean();
      
    if (!c) return res.status(404).json({ message: 'Course not found' });
    
    const outcomes = await CourseOutcome.find({ course_id: c._id }).sort('code').lean();
    outcomes.forEach(o => o.id = o._id);
    
    res.json({
      id: c._id, ...c,
      semester_label: c.semester_id?.label,
      program_name: c.semester_id?.program_id?.name,
      faculty_name: c.faculty_id?.name,
      outcomes, units: [] // Keeping basic format
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { code, name, credits, semester_id, faculty_id, description } = req.body;
    const existing = await Course.findOne({ code });
    if (existing) return res.status(409).json({ message: 'Course code exists' });
    
    const c = new Course({ code, name, credits, semester_id, faculty_id: faculty_id || null, description });
    await c.save();
    res.status(201).json({ id: c._id, ...c.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { code, name, credits, semester_id, faculty_id, description } = req.body;
    const c = await Course.findByIdAndUpdate(req.params.id, { code, name, credits, semester_id, faculty_id: faculty_id || null, description }, { new: true });
    if (!c) return res.status(404).json({ message: 'Course not found' });
    res.json({ id: c._id, ...c.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSemestersByProgram = async (req, res) => {
  try {
    const sems = await Semester.find({ program_id: req.params.program_id }).sort('number').lean();
    res.json(sems.map(s => ({ id: s._id, ...s })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, getSemestersByProgram, addUnit: (req,res) => res.json({}) };
