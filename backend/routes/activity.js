const express = require('express');
const router = express.Router();
const { getActivityLogs, getActivityStats } = require('../controllers/activityController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/stats', auth, rbac('admin'), getActivityStats);
router.get('/', auth, rbac('admin'), getActivityLogs);

module.exports = router;
