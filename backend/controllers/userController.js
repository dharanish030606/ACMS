const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const { Program } = require('../models/Program');
const Course = require('../models/Course');
const Mapping = require('../models/Mapping');

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password_hash').populate('department_id', 'name').sort('-created_at');
    res.json(users.map(u => ({ id: u._id, department_name: u.department_id?.name, ...u.toObject() })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash').populate('department_id', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, department_name: user.department_id?.name, ...user.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, role, department_id, is_active, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.name = name;
    user.email = email;
    user.role = role;
    user.department_id = department_id || null;
    user.is_active = is_active;
    
    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.password_hash = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    res.json({ message: 'User updated', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/stats
const getStats = async (req, res) => {
  try {
    const [users, departments, programs, courses, mappings] = await Promise.all([
      User.countDocuments({ is_active: true }),
      Department.countDocuments(),
      Program.countDocuments(),
      Course.countDocuments(),
      Mapping.countDocuments()
    ]);
    res.json({ users, departments, programs, courses, mappings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/workload/stats
const getWorkloadStats = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty', is_active: true }).select('_id name');
    const stats = [];
    
    for (const f of faculty) {
      const courses = await Course.find({ faculty_id: f._id }).select('code name weekly_hours credits').lean();
      const totalHours = courses.reduce((acc, curr) => acc + (curr.weekly_hours || 4), 0);
      stats.push({
        id: f._id,
        name: f.name,
        course_count: courses.length,
        total_weekly_hours: totalHours,
        courses
      });
    }
    
    stats.sort((a, b) => b.total_weekly_hours - a.total_weekly_hours);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getStats, getWorkloadStats };
