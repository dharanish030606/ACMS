const express = require('express');
const router = express.Router();
const { exportExcel, getSummaryReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/summary/:program_id', auth, getSummaryReport);
router.get('/export/excel/:program_id', auth, rbac('admin',), exportExcel);

module.exports = router;
