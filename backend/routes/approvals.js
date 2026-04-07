const express = require('express');
const router = express.Router();
const { getApprovals, createApproval, updateApproval, getApprovalById } = require('../controllers/approvalController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/', auth, rbac('admin', 'faculty'), getApprovals);
router.get('/:id', auth, rbac('admin', 'faculty'), getApprovalById);
router.post('/', auth, rbac('faculty', 'admin'), createApproval);
router.patch('/:id', auth, rbac('admin',), updateApproval);

module.exports = router;
