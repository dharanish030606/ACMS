const ActivityLog = require('../models/ActivityLog');

// Helper to create a log entry — used internally by other controllers
const logActivity = async ({ user, action, entity_type, entity_id, entity_name, details, req }) => {
  try {
    await ActivityLog.create({
      user_id: user.id || user._id,
      user_name: user.name || 'Unknown',
      user_role: user.role,
      action,
      entity_type,
      entity_id,
      entity_name,
      details,
      ip_address: req?.ip || req?.connection?.remoteAddress || '',
    });
  } catch (e) { /* non-fatal */ }
};

// GET /api/activity  — admin only, paginated
const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.user_id) filter.user_id = req.query.user_id;
    if (req.query.entity_type) filter.entity_type = req.query.entity_type;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/activity/stats
const getActivityStats = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
    const [total, recent, byAction] = await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.countDocuments({ created_at: { $gte: since } }),
      ActivityLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    res.json({ total, recent, byAction });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getActivityLogs, getActivityStats, logActivity };
