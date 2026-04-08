const { ProgramOutcome, CourseOutcome } = require('../models/Outcome');
const Mapping = require('../models/Mapping');

const getPOsByProgram = async (req, res) => {
  try {
    const pos = await ProgramOutcome.find({ program_id: req.params.program_id }).sort('code').lean();
    res.json(pos.map(p => ({ id: p._id, ...p })));
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const createPO = async (req, res) => {
  try {
    const { program_id, code, description } = req.body;
    const existing = await ProgramOutcome.findOne({ program_id, code });
    if (existing) return res.status(409).json({ message: 'PO code exists' });
    
    const po = new ProgramOutcome({ program_id, code, description });
    await po.save();
    res.status(201).json({ id: po._id, ...po.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const updatePO = async (req, res) => {
  try {
    const po = await ProgramOutcome.findByIdAndUpdate(req.params.id, { code: req.body.code, description: req.body.description }, { new: true });
    res.json({ id: po._id, ...po.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const deletePO = async (req, res) => {
  try {
    await ProgramOutcome.findByIdAndDelete(req.params.id);
    res.json({ message: 'PO deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const getCOsByCourse = async (req, res) => {
  try {
    const cos = await CourseOutcome.find({ course_id: req.params.course_id }).sort('code').lean();
    res.json(cos.map(c => ({ id: c._id, ...c })));
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const createCO = async (req, res) => {
  try {
    const { course_id, code, description } = req.body;
    
    // Robustness check for ID format
    if (!course_id || String(course_id).length < 2) {
       return res.status(400).json({ message: 'Missing or invalid Course ID' });
    }

    const existing = await CourseOutcome.findOne({ course_id, code });
    if (existing) return res.status(409).json({ message: 'CO code exists' });
    
    const co = new CourseOutcome({ course_id, code, description });
    await co.save();
    res.status(201).json({ id: co._id, ...co.toObject() });
  } catch (err) {
    console.error('Create CO Error:', err);
    res.status(500).json({ 
      message: err.message.includes('Cast to ObjectId failed') 
        ? 'Invalid ID format in database. Please check your course data.' 
        : (err.message || 'Server error') 
    });
  }
};

const updateCO = async (req, res) => {
  try {
    const co = await CourseOutcome.findByIdAndUpdate(req.params.id, { code: req.body.code, description: req.body.description }, { new: true });
    res.json({ id: co._id, ...co.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const deleteCO = async (req, res) => {
  try {
    await CourseOutcome.findByIdAndDelete(req.params.id);
    await Mapping.deleteMany({ co_id: req.params.id });
    res.json({ message: 'CO deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = { getPOsByProgram, createPO, updatePO, deletePO, getCOsByCourse, createCO, updateCO, deleteCO };
