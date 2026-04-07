const CurriculumVersion = require('../models/CurriculumVersion');
const Course = require('../models/Course');
const { CourseOutcome } = require('../models/Outcome');

// GET /api/versions/course/:id
const getVersionsByCourse = async (req, res) => {
  try {
    const versions = await CurriculumVersion.find({ course_id: req.params.id })
      .populate('modified_by', 'name role')
      .sort({ version_number: -1 })
      .lean();
    res.json(versions.map(v => ({ id: v._id, ...v })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/versions — snapshot current state of a course
const createVersion = async (req, res) => {
  try {
    const { course_id, change_summary, academic_year } = req.body;

    const course = await Course.findById(course_id).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const outcomes = await CourseOutcome.find({ course_id }).lean();

    const lastVersion = await CurriculumVersion.findOne({ course_id })
      .sort({ version_number: -1 })
      .lean();
    const version_number = (lastVersion?.version_number || 0) + 1;

    const version = await CurriculumVersion.create({
      course_id,
      version_number,
      academic_year: academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      modified_by: req.user.id,
      modified_by_name: req.user.name,
      change_summary: change_summary || 'Manual snapshot',
      snapshot: {
        name: course.name,
        code: course.code,
        credits: course.credits,
        description: course.description,
        weekly_hours: course.weekly_hours,
        syllabus_url: course.syllabus_url,
        outcomes: outcomes.map(o => ({ code: o.code, description: o.description })),
      },
    });

    res.status(201).json({ id: version._id, ...version.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getVersionsByCourse, createVersion };
