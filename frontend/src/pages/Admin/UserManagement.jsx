import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, InputAdornment, LinearProgress, Alert
} from '@mui/material';
import { Add, Edit, Delete, Search, PersonAdd } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';
import { useSnackbar } from 'notistack';

const ROLES = ['admin', 'hod', 'faculty'];
const roleColors = { admin: '#ef4444', hod: '#f59e0b', faculty: '#10b981' };

const defaultForm = { name: '', email: '', password: '', role: 'faculty', department_id: '', is_active: true };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, d] = await Promise.all([api.get('/users'), api.get('/programs/departments')]);
      setUsers(u.data);
      setDepartments(d.data);
    } catch (err) {
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditUser(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, department_id: u.department_id || '', is_active: u.is_active }); setOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, form);
        enqueueSnackbar('User updated!', { variant: 'success' });
      } else {
        await api.post('/auth/register', form);
        enqueueSnackbar('User created!', { variant: 'success' });
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error saving user', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      enqueueSnackbar('User deleted', { variant: 'info' });
      fetchData();
    } catch { enqueueSnackbar('Error deleting user', { variant: 'error' }); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6)' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>User Management</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Manage system users and role assignments</Typography>
          </Box>
        </Box>
        <Button id="create-user-btn" variant="contained" startIcon={<PersonAdd />} onClick={openCreate}>Create User</Button>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          id="user-search" placeholder="Search by name, email or role..." value={search}
          onChange={e => setSearch(e.target.value)} size="small" sx={{ width: 350 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#64748b', fontSize: 20 }} /></InputAdornment> }}
        />
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Name', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id} sx={{ '&:hover': { background: 'rgba(59,130,246,0.04)' } }}>
                  <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>{u.name}</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role?.toUpperCase()} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: `${roleColors[u.role]}22`, color: roleColors[u.role], border: `1px solid ${roleColors[u.role]}44` }} />
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{u.department_name || '—'}</TableCell>
                  <TableCell>
                    <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: u.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: u.is_active ? '#10b981' : '#64748b', fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(u)} sx={{ color: '#3b82f6', mr: 0.5 }}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(u.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', color: '#64748b', py: 4 }}>No users found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(59,130,246,0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {editUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField id="user-name" fullWidth label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} sx={{ mb: 2 }} />
          <TextField id="user-email" fullWidth label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />
          <TextField id="user-password" fullWidth label={editUser ? 'New Password (leave blank to keep)' : 'Password'} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} sx={{ mb: 2 }} />
          <TextField id="user-role" fullWidth select label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} sx={{ mb: 2 }}>
            {ROLES.map(r => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>)}
          </TextField>
          <TextField id="user-dept" fullWidth select label="Department" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} sx={{ mb: 2 }}>
            <MenuItem value="">None</MenuItem>
            {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
          {editUser && (
            <TextField id="user-status" fullWidth select label="Status" value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button id="save-user-btn" variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
