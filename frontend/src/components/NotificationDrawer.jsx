import { useState, useEffect } from 'react';
import { Drawer, Box, Typography, IconButton, List, ListItem, ListItemText, Divider, Badge } from '@mui/material';
import { Notifications, Close, Circle } from '@mui/icons-material';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function NotificationDrawer() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    api.get('/notifications').then(r => {
      setNotifications(r.data.notifications);
      setUnreadCount(r.data.unread);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id, link) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
    if (link) {
      setOpen(false);
      navigate(link);
    }
  };

  const handleReadAll = async () => {
    await api.patch('/notifications/read-all');
    fetchNotifications();
  };

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)} sx={{ ml: 1 }}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 340, bgcolor: '#0f172a' } }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 600 }}>Notifications</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <IconButton size="small" onClick={handleReadAll} sx={{ color: '#3b82f6', fontSize: '0.75rem' }}>Mark all read</IconButton>
            )}
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#64748b' }}><Close /></IconButton>
          </Box>
        </Box>

        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>No notifications</Box>
          ) : (
            notifications.map((n) => (
              <Box key={n._id}>
                <ListItem button onClick={() => handleRead(n._id, n.link)} sx={{ bgcolor: n.is_read ? 'transparent' : 'rgba(59,130,246,0.05)', py: 2 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!n.is_read && <Circle sx={{ fontSize: 8, color: '#3b82f6' }} />}
                        <Typography sx={{ color: n.is_read ? '#94a3b8' : '#f1f5f9', fontWeight: n.is_read ? 400 : 600, fontSize: '0.9rem' }}>{n.title}</Typography>
                      </Box>
                    }
                    secondary={<Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.5 }}>{n.message}</Typography>}
                  />
                </ListItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              </Box>
            ))
          )}
        </List>
      </Drawer>
    </>
  );
}
