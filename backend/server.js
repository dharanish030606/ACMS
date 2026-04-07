require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/outcomes', require('./routes/outcomes'));
app.use('/api/mappings', require('./routes/mappings'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/versions', require('./routes/versions'));
app.use('/api/upload', require('./routes/upload'));

// Static path for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 ACMS Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);
});
