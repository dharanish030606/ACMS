const Course = require('../models/Course');
const { ProgramOutcome, CourseOutcome } = require('../models/Outcome');
const { Semester } = require('../models/Program');
const Mapping = require('../models/Mapping');

const getMappingsByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id).populate('semester_id');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const program_id = course.semester_id?.program_id;
    
    const cosDocs = await CourseOutcome.find({ course_id: course._id }).sort('code').lean();
    const posDocs = await ProgramOutcome.find({ program_id }).sort('code').lean();
    
    const cos = cosDocs.map(c => ({ id: c._id, ...c }));
    const pos = posDocs.map(p => ({ id: p._id, ...p }));
    
    const mappingsDocs = await Mapping.find({ co_id: { $in: cos.map(c => c.id) } }).populate('co_id po_id').lean();
    const mappings = mappingsDocs.map(m => ({
      id: m._id, ...m, co_code: m.co_id.code, po_code: m.po_id.code, co_id: m.co_id._id, po_id: m.po_id._id
    }));
    
    res.json({ cos, pos, mappings, program_id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const upsertMapping = async (req, res) => {
  try {
    const { co_id, po_id, correlation_level } = req.body;
    
    const mapping = await Mapping.findOneAndUpdate(
      { co_id, po_id },
      { correlation_level, mapped_by: req.user.id },
      { new: true, upsert: true }
    );
    res.json({ id: mapping._id, ...mapping.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteMapping = async (req, res) => {
  try {
    await Mapping.findOneAndDelete({ co_id: req.params.co_id, po_id: req.params.po_id });
    res.json({ message: 'Mapping removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getGapAnalysis = async (req, res) => {
  try {
    const program_id = req.params.program_id;
    const pos = await ProgramOutcome.find({ program_id }).sort('code').lean();
    
    const gaps = [];
    for (const po of pos) {
      const mapped = await Mapping.countDocuments({ po_id: po._id });
      gaps.push({ po_id: po._id, po_code: po.code, po_description: po.description, mapped_cos: mapped, has_gap: mapped === 0 });
    }
    res.json(gaps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getHeatmap = async (req, res) => {
  try {
    const program_id = req.params.program_id;
    const pos = await ProgramOutcome.find({ program_id }).sort('code').lean();
    const sems = await Semester.find({ program_id }).select('_id');
    const courses = await Course.find({ semester_id: { $in: sems.map(s => s._id) } }).select('_id code');
    
    const matrix = [];
    for (const c of courses) {
      const cos = await CourseOutcome.find({ course_id: c._id }).lean();
      for (const co of cos) {
        const row = { co_id: co._id, co_code: co.code, co_desc: co.description, course_code: c.code };
        const maps = await Mapping.find({ co_id: co._id }).lean();
        const mHash = {};
        maps.forEach(m => mHash[m.po_id] = m.correlation_level);
        
        pos.forEach(p => row[p.code] = mHash[p._id] || 0);
        matrix.push(row);
      }
    }
    res.json({ pos: pos.map(p => ({ id: p._id, ...p })), matrix });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCoverage = async (req, res) => {
  try {
    const program_id = req.params.program_id;
    const pos = await ProgramOutcome.find({ program_id }).sort('code').lean();
    const sems = await Semester.find({ program_id }).select('_id');
    const courses = await Course.find({ semester_id: { $in: sems.map(s => s._id) } }).select('_id');
    const totalCOs = await CourseOutcome.countDocuments({ course_id: { $in: courses.map(c => c._id) } });
    
    const coverage = [];
    for (const po of pos) {
      const mappings = await Mapping.distinct('co_id', { po_id: po._id });
      coverage.push({
        po_code: po.code, po_description: po.description, mapped: mappings.length, total: totalCOs,
        percentage: totalCOs > 0 ? Math.round((mappings.length / totalCOs) * 100) : 0
      });
    }
    res.json(coverage);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMappingsByCourse, upsertMapping, deleteMapping, getGapAnalysis, getHeatmap, getCoverage };
