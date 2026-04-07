const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, getSemestersByProgram, addUnit } = require('../controllers/courseController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/semesters/:program_id', auth, getSemestersByProgram);
router.post('/units', auth, rbac('admin', 'faculty'), addUnit);
router.get('/', auth, getAllCourses);
router.get('/:id', auth, getCourseById);
router.post('/', auth, rbac('admin',), createCourse);
router.put('/:id', auth, rbac('admin',), updateCourse);
router.delete('/:id', auth, rbac('admin',), deleteCourse);

module.exports = router;
