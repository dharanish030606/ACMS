const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    
    const user = await User.findOne({ email: email.toLowerCase() }).populate('department_id', 'name');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    
    if (!user.is_active) return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id ? user.department_id._id : null,
        department_name: user.department_id ? user.department_id.name : null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    
    const user = new User({ name, email: email.toLowerCase(), password_hash, role, department_id: department_id || null });
    await user.save();
    
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash').populate('department_id', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const uObj = user.toObject();
    res.json({ id: uObj._id, ...uObj, department_name: uObj.department_id ? uObj.department_id.name : null, department_id: uObj.department_id ? uObj.department_id._id : null });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, register, getMe };
