import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Tabs, Tab, LinearProgress, Grid
} from '@mui/material';
import { Add, Edit, Delete, School, Business } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';
import { useSnackbar } from 'notistack';

const defaultProgForm = { name: '', code: '', department_id: '', duration_years: 4, description: '' };
const defaultDeptForm = { name: '', code: '', hod_id: '' };

export default function ProgramManagement() {
  const [tab, setTab] = useState(0);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [progForm, setProgForm] = useState(defaultProgForm);
  const [deptForm, setDeptForm] = useState(defaultDeptForm);
  const { enqueueSnackbar } = useSnackbar();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, d, u] = await Promise.all([api.get('/programs'), api.get('/programs/departments'), api.get('/users')]);
      setPrograms(p.data);
      setDepartments(d.data);
      setHods(u.data.filter(x => x.role === 'hod'));
    } catch { enqueueSnackbar('Load error', { variant: 'error' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditItem(null); tab === 0 ? setProgForm(defaultProgForm) : setDeptForm(defaultDeptForm); setOpen(true); };
  const openEditProg = (p) => { setEditItem(p); setProgForm({ name: p.name, code: p.code, department_id: p.department_id, duration_years: p.duration_years, description: p.description || '' }); setOpen(true); };
  const openEditDept = (d) => { setEditItem(d); setDeptForm({ name: d.name, code: d.code, hod_id: d.hod_id || '' }); setOpen(true); };

  const handleSave = async () => {
    try {
      if (tab === 0) {
        editItem ? await api.put(`/programs/${editItem.id}`, progForm) : await api.post('/programs', progForm);
        enqueueSnackbar(editItem ? 'Program updated' : 'Program created', { variant: 'success' });
      } else {
        editItem ? await api.put(`/programs/departments/${editItem.id}`, deptForm) : await api.post('/programs/departments', deptForm);
        enqueueSnackbar(editItem ? 'Department updated' : 'Department created', { variant: 'success' });
      }
      setOpen(false); fetchAll();
    } catch (err) { enqueueSnackbar(err.response?.data?.message || 'Error', { variant: 'error' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      tab === 0 ? await api.delete(`/programs/${id}`) : await api.delete(`/programs/departments/${id}`);
      enqueueSnackbar('Deleted', { variant: 'info' }); fetchAll();
    } catch { enqueueSnackbar('Error', { variant: 'error' }); }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6)' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Programs & Departments</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Manage academic programs and departments</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>{tab === 0 ? 'Add Program' : 'Add Department'}</Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)', px: 2 }}>
          <Tab icon={<School sx={{ fontSize: 18 }} />} iconPosition="start" label="Programs" sx={{ fontSize: '0.85rem' }} />
          <Tab icon={<Business sx={{ fontSize: 18 }} />} iconPosition="start" label="Departments" sx={{ fontSize: '0.85rem' }} />
        </Tabs>
        {loading && <LinearProgress />}

        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead><TableRow>{['Code','Name','Department','Duration','Courses','Semesters','Actions'].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {programs.map(p => (
                  <TableRow key={p.id} sx={{ '&:hover': { background: 'rgba(59,130,246,0.04)' } }}>
                    <TableCell><Chip label={p.code} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: '0.7rem' }} /></TableCell>
                    <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>{p.name}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{p.department_name || '—'}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{p.duration_years} years</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{p.course_count}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{p.semester_count}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEditProg(p)} sx={{ color: '#3b82f6', mr: 0.5 }}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(p.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table>
              <TableHead><TableRow>{['Code','Name','HOD','Programs','Actions'].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {departments.map(d => (
                  <TableRow key={d.id} sx={{ '&:hover': { background: 'rgba(59,130,246,0.04)' } }}>
                    <TableCell><Chip label={d.code} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '0.7rem' }} /></TableCell>
                    <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>{d.name}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{d.hod_name || 'Not Assigned'}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{d.program_count}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEditDept(d)} sx={{ color: '#3b82f6', mr: 0.5 }}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(d.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(59,130,246,0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {editItem ? 'Edit' : 'Create'} {tab === 0 ? 'Program' : 'Department'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {tab === 0 ? (
            <>
              <TextField fullWidth label="Program Name" value={progForm.name} onChange={e => setProgForm({ ...progForm, name: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="Program Code" value={progForm.code} onChange={e => setProgForm({ ...progForm, code: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth select label="Department" value={progForm.department_id} onChange={e => setProgForm({ ...progForm, department_id: e.target.value })} sx={{ mb: 2 }}>
                {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
              <TextField fullWidth type="number" label="Duration (years)" value={progForm.duration_years} onChange={e => setProgForm({ ...progForm, duration_years: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth multiline rows={3} label="Description" value={progForm.description} onChange={e => setProgForm({ ...progForm, description: e.target.value })} />
            </>
          ) : (
            <>
              <TextField fullWidth label="Department Name" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="Department Code" value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth select label="HOD" value={deptForm.hod_id} onChange={e => setDeptForm({ ...deptForm, hod_id: e.target.value })}>
                <MenuItem value="">Not Assigned</MenuItem>
                {hods.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
