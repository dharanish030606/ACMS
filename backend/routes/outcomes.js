const express = require('express');
const router = express.Router();
const { getPOsByProgram, createPO, updatePO, deletePO, getCOsByCourse, createCO, updateCO, deleteCO } = require('../controllers/outcomeController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Program Outcomes
router.get('/po/program/:program_id', auth, getPOsByProgram);
router.post('/po', auth, rbac('admin',), createPO);
router.put('/po/:id', auth, rbac('admin',), updatePO);
router.delete('/po/:id', auth, rbac('admin',), deletePO);

// Course Outcomes
router.get('/co/course/:course_id', auth, getCOsByCourse);
router.post('/co', auth, rbac('admin', 'faculty'), createCO);
router.put('/co/:id', auth, rbac('admin', 'faculty'), updateCO);
router.delete('/co/:id', auth, rbac('admin',), deleteCO);

module.exports = router;
