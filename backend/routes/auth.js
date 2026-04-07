const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.post('/login', login);
router.post('/register', auth, rbac('admin'), register);
router.get('/me', auth, getMe);

module.exports = router;
