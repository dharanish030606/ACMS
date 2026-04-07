const express = require('express');
const router = express.Router();
const { getVersionsByCourse, createVersion } = require('../controllers/versionController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/course/:id', auth, getVersionsByCourse);
router.post('/', auth, rbac('admin', 'faculty'), createVersion);

module.exports = router;
