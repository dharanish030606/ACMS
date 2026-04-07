const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, getNotifications);
router.patch('/read-all', auth, markAllRead);
router.patch('/:id/read', auth, markRead);
router.delete('/:id', auth, deleteNotification);

module.exports = router;
