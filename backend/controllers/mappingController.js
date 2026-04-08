const Course = require('../models/Course');
const { ProgramOutcome, CourseOutcome } = require('../models/Outcome');
const { Semester } = require('../models/Program');
const Mapping = require('../models/Mapping');

const getMappingsByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id).populate('semester_id');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    console.log(`[Mapping] Fetching mappings for course: ${course.code} (${course._id})`);
    
    // Safety check for semester/program
    const program_id = course.semester_id?.program_id;
    if (!program_id) {
        return res.json({ cos: [], pos: [], mappings: [], program_id: null, warning: 'Course has no associated program' });
    }
    
    const cosDocs = await CourseOutcome.find({ course_id: course._id }).sort('code').lean();
    const posDocs = await ProgramOutcome.find({ program_id }).sort('code').lean();
    
    const cos = cosDocs.map(c => ({ id: c._id, ...c }));
    const pos = posDocs.map(p => ({ id: p._id, ...p }));
    
    const mappingsDocs = await Mapping.find({ co_id: { $in: cos.map(c => c.id) } }).populate('co_id po_id').lean();
    
    // Filter out mappings where co_id or po_id might have been deleted but reference persists (rare with findOneAndDelete but safe)
    const mappings = mappingsDocs.filter(m => m.co_id && m.po_id).map(m => ({
      id: m._id, ...m, co_code: m.co_id.code, po_code: m.po_id.code, co_id: m.co_id._id, po_id: m.po_id._id
    }));
    
    res.json({ cos, pos, mappings, program_id });
  } catch (err) {
    console.error('[Mapping Error] getMappingsByCourse:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const upsertMapping = async (req, res) => {
  try {
    const { co_id, po_id, correlation_level } = req.body;
    console.log(`[Mapping] Upsert request: CO=${co_id}, PO=${po_id}, Level=${correlation_level}`);
    
    if (correlation_level === 0) {
      const deleted = await Mapping.findOneAndDelete({ co_id, po_id });
      console.log(`[Mapping] Removed level 0 mapping: ${deleted ? 'Success' : 'Not found'}`);
      return res.json({ message: 'Mapping removed' });
    }

    const mapping = await Mapping.findOneAndUpdate(
      { co_id, po_id },
      { correlation_level, mapped_by: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );
    console.log(`[Mapping] Successfully updated mapping: ${mapping._id}`);
    res.json({ id: mapping._id, ...mapping.toObject() });
  } catch (err) {
    console.error('[Mapping Error] upsertMapping:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const deleteMapping = async (req, res) => {
  try {
    const { co_id, po_id } = req.params;
    console.log(`[Mapping] Delete request: CO=${co_id}, PO=${po_id}`);
    const deleted = await Mapping.findOneAndDelete({ co_id, po_id });
    console.log(`[Mapping] Deleted mapping: ${deleted ? 'Success' : 'Not found'}`);
    res.json({ message: 'Mapping removed' });
  } catch (err) {
    console.error('[Mapping Error] deleteMapping:', err);
    res.status(500).json({ message: err.message || 'Server error' });
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
    res.status(500).json({ message: err.message || 'Server error' });
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
    res.status(500).json({ message: err.message || 'Server error' });
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
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = { getMappingsByCourse, upsertMapping, deleteMapping, getGapAnalysis, getHeatmap, getCoverage };
