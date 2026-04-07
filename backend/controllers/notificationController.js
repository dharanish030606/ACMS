const Notification = require('../models/Notification');

// Internal helper used by other controllers to create notifications
const createNotification = async ({ recipient_id, type, title, message, link, related_id }) => {
  try {
    await Notification.create({ recipient_id, type, title, message, link, related_id });
  } catch (e) { /* non-fatal */ }
};

// GET /api/notifications — get logged-in user's notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();
    const unread = notifications.filter(n => !n.is_read).length;
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient_id: req.user.id },
      { is_read: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient_id: req.user.id, is_read: false }, { is_read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient_id: req.user.id });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification, createNotification };
