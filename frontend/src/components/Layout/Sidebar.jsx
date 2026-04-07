import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Avatar, Chip, Divider, Tooltip
} from '@mui/material';
import {
  Dashboard, People, School, BarChart, MenuBook, AccountTree,
  Analytics, Logout, Map, AutoGraph, Timeline, History,
  Approval, Search, CloudUpload, Notifications
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const adminNav = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
  { label: 'User Management', icon: <People />, path: '/admin/users' },
  { label: 'Programs & Depts', icon: <School />, path: '/admin/programs' },
  { label: 'Reports', icon: <BarChart />, path: '/admin/reports' },
  { label: 'Activity Log', icon: <History />, path: '/admin/activity' },
  { label: 'Courses defined', icon: <MenuBook />, path: '/admin/courses' },
  { label: 'CO-PO Mapping', icon: <AccountTree />, path: '/admin/mapping' },
  { label: 'Gap Analysis', icon: <Analytics />, path: '/admin/gap-analysis' },
  { label: 'Approvals', icon: <Approval />, path: '/admin/approvals' },
  { label: 'Search', icon: <Search />, path: '/admin/search' },
];

const facultyNav = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/faculty/dashboard' },
  { label: 'My Courses', icon: <MenuBook />, path: '/faculty/courses' },
  { label: 'File Upload', icon: <CloudUpload />, path: '/faculty/upload' },
  { label: 'Submit Approval', icon: <Approval />, path: '/faculty/submit-approval' },
];

const roleColors = { admin: '#ef4444', faculty: '#10b981' };
const roleLabels = { admin: 'Administrator', faculty: 'Faculty' };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = user?.role === 'admin' ? adminNav : facultyNav;
  const roleColor = roleColors[user?.role] || '#3b82f6';

  return (
    <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, overflow: 'hidden' } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 0 }}>
        {/* Logo */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Map sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1 }}>ACMS</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>Curriculum Mapping</Typography>
            </Box>
          </Box>

          {/* User card */}
          <Box sx={{
            p: 2, borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
            border: '1px solid rgba(59,130,246,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`, fontSize: '1rem', fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</Typography>
                <Chip label={user?.role?.toUpperCase()} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}44` }} />
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2 }} />

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
          <Typography sx={{ px: 3, py: 1, fontSize: '0.65rem', fontWeight: 700, color: '#475569', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {roleLabels[user?.role]}
          </Typography>
          <List dense sx={{ px: 1.5 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2, py: 1.2,
                      background: active ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))' : 'transparent',
                      border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                      '&:hover': { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: active ? '#3b82f6' : '#64748b' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: active ? 600 : 400, color: active ? '#f1f5f9' : '#94a3b8' }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2 }} />

        {/* Logout */}
        <Box sx={{ p: 2 }}>
          <ListItemButton onClick={logout} sx={{ borderRadius: 2, py: 1.2, '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#ef4444' }}><Logout /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, color: '#ef4444' }} />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
