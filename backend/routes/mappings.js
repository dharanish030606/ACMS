const express = require('express');
const router = express.Router();
const { getMappingsByCourse, upsertMapping, deleteMapping, getGapAnalysis, getHeatmap, getCoverage } = require('../controllers/mappingController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/course/:course_id', auth, getMappingsByCourse);
router.get('/gap/:program_id', auth, getGapAnalysis);
router.get('/heatmap/:program_id', auth, getHeatmap);
router.get('/coverage/:program_id', auth, getCoverage);
router.post('/', auth, rbac('admin', 'faculty'), upsertMapping);
router.delete('/:co_id/:po_id', auth, rbac('admin', 'faculty'), deleteMapping);

module.exports = router;
