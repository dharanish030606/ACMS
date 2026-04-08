const Approval = require('../models/Approval');
const { createNotification } = require('./notificationController');
const { logActivity } = require('./activityController');
const User = require('../models/User');

// GET /api/approvals
const getApprovals = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'faculty') filter.submitted_by = req.user.id;
    if (req.query.status) filter.status = req.query.status;

    const approvals = await Approval.find(filter)
      .populate('submitted_by', 'name email role')
      .populate('reviewed_by', 'name email')
      .populate('course_id', 'code name')
      .sort({ created_at: -1 })
      .lean();

    res.json(approvals.map(a => ({ id: a._id, ...a })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/approvals/:id
const getApprovalById = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id)
      .populate('submitted_by', 'name email role')
      .populate('reviewed_by', 'name email')
      .populate('course_id', 'code name')
      .lean();
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    res.json({ id: approval._id, ...approval });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/approvals
const createApproval = async (req, res) => {
  try {
    const { title, description, type, course_id, program_id, department_id, academic_year } = req.body;
    
    console.log(`[Approval] Creating request: "${title}" by ${req.user.name}`);

    // Sanitize IDs: convert empty strings to null to avoid Mongoose cast errors
    const sanitizedData = {
      title,
      description,
      type,
      course_id: (course_id && course_id !== '') ? course_id : null,
      program_id: (program_id && program_id !== '') ? program_id : null,
      department_id: (department_id && department_id !== '') ? department_id : null,
      academic_year,
      submitted_by: req.user.id,
      status: 'pending',
      submitted_at: new Date(),
    };

    const approval = await Approval.create(sanitizedData);

    // Notify HOD/Admin
    const reviewers = await User.find({ role: { $in: ['admin'] }, is_active: true }).select('_id');
    for (const reviewer of reviewers) {
      await createNotification({
        recipient_id: reviewer._id,
        type: 'APPROVAL_REQUIRED',
        title: 'New Approval Request',
        message: `${req.user.name} submitted: "${title}"`,
        link: '/admin/approvals',
        related_id: approval._id,
      }).catch(err => console.error('[Notification Error]:', err));
    }

    await logActivity({
      user: req.user,
      action: 'CREATE_APPROVAL',
      entity_type: 'Approval',
      entity_id: approval._id,
      entity_name: title,
      req,
    }).catch(err => console.error('[ActivityLog Error]:', err));

    res.status(201).json({ id: approval._id, ...approval.toObject() });
  } catch (err) {
    console.error('[Approval Error] createApproval:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/approvals/:id
const updateApproval = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });

    approval.status = status;
    approval.notes = notes;
    approval.reviewed_by = req.user.id;
    approval.reviewed_at = new Date();
    await approval.save();

    // Notify submitter
    await createNotification({
      recipient_id: approval.submitted_by,
      type: status === 'approved' ? 'APPROVED' : 'REJECTED',
      title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your request "${approval.title}" was ${status}. ${notes ? 'Note: ' + notes : ''}`,
      link: '/faculty/approvals',
      related_id: approval._id,
    });

    await logActivity({
      user: req.user,
      action: `${status.toUpperCase()}_APPROVAL`,
      entity_type: 'Approval',
      entity_id: approval._id,
      entity_name: approval.title,
      req,
    });

    res.json({ id: approval._id, ...approval.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getApprovals, getApprovalById, createApproval, updateApproval };
