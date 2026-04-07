const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, getStats } = require('../controllers/userController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/stats', auth, getStats);
router.get('/', auth, rbac('admin'), getAllUsers);
router.get('/:id', auth, rbac('admin'), getUserById);
router.put('/:id', auth, rbac('admin'), updateUser);
router.delete('/:id', auth, rbac('admin'), deleteUser);

module.exports = router;
