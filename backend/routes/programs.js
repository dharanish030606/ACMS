const express = require('express');
const router = express.Router();
const {
  getAllPrograms, getProgramById, createProgram, updateProgram, deleteProgram,
  getDepartments, createDepartment, updateDepartment, deleteDepartment
} = require('../controllers/programController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Departments
router.get('/departments', auth, getDepartments);
router.post('/departments', auth, rbac('admin'), createDepartment);
router.put('/departments/:id', auth, rbac('admin'), updateDepartment);
router.delete('/departments/:id', auth, rbac('admin'), deleteDepartment);

// Programs
router.get('/', auth, getAllPrograms);
router.get('/:id', auth, getProgramById);
router.post('/', auth, rbac('admin'), createProgram);
router.put('/:id', auth, rbac('admin'), updateProgram);
router.delete('/:id', auth, rbac('admin'), deleteProgram);

module.exports = router;
