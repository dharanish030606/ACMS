import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, LinearProgress, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search, Link as LinkIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';
import { useSnackbar } from 'notistack';

const defaultForm = { code: '', name: '', credits: 3, semester_id: '', faculty_id: '', description: '' };

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, p, u] = await Promise.all([api.get('/courses'), api.get('/programs'), api.get('/users')]);
      setCourses(c.data);
      setPrograms(p.data);
      setFaculty(u.data.filter(x => x.role === 'faculty'));
    } catch { enqueueSnackbar('Load error', { variant: 'error' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const loadSemesters = async (progId) => {
    if (!progId) return;
    const r = await api.get(`/courses/semesters/${progId}`);
    setSemesters(r.data);
  };

  const openCreate = () => { setEditCourse(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (c) => {
    setEditCourse(c);
    setForm({ code: c.code, name: c.name, credits: c.credits, semester_id: c.semester_id, faculty_id: c.faculty_id || '', description: c.description || '' });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      editCourse ? await api.put(`/courses/${editCourse.id}`, form) : await api.post('/courses', form);
      enqueueSnackbar(editCourse ? 'Course updated' : 'Course created', { variant: 'success' });
      setOpen(false); fetchAll();
    } catch (err) { enqueueSnackbar(err.response?.data?.message || 'Error', { variant: 'error' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await api.delete(`/courses/${id}`); enqueueSnackbar('Course deleted', { variant: 'info' }); fetchAll(); }
    catch { enqueueSnackbar('Error', { variant: 'error' }); }
  };

  const filtered = courses.filter(c =>
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.program_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #f59e0b, #ef4444)' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Course Management</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Manage department courses and faculty assignments</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Course</Button>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <TextField placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} size="small" sx={{ width: 300 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#64748b', fontSize: 20 }} /></InputAdornment> }} />
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      <Card>
        <TableContainer>
          <Table>
            <TableHead><TableRow>{['Code','Name','Credits','Semester','Program','Faculty','COs','Actions'].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} sx={{ '&:hover': { background: 'rgba(59,130,246,0.04)' } }}>
                  <TableCell><Chip label={c.code} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: '0.7rem' }} /></TableCell>
                  <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>{c.name}</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{c.credits}</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{c.semester_label}</TableCell>
                  <TableCell sx={{ color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.program_name}</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{c.faculty_name || <Chip label="Unassigned" size="small" sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.65rem' }} />}</TableCell>
                  <TableCell><Chip label={c.co_count} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, fontSize: '0.7rem' }} /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/faculty/mapping/${c.id}`)} sx={{ color: '#8b5cf6', mr: 0.5 }} title="Manage CO-PO"><LinkIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openEdit(c)} sx={{ color: '#3b82f6', mr: 0.5 }}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(c.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', color: '#64748b', py: 4 }}>No courses found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(59,130,246,0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{editCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField fullWidth label="Course Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Course Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth type="number" label="Credits" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth select label="Program" value={selectedProgram} onChange={e => { setSelectedProgram(e.target.value); loadSemesters(e.target.value); }} sx={{ mb: 2 }}>
            {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Semester" value={form.semester_id} onChange={e => setForm({ ...form, semester_id: e.target.value })} sx={{ mb: 2 }}>
            {semesters.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Faculty" value={form.faculty_id} onChange={e => setForm({ ...form, faculty_id: e.target.value })} sx={{ mb: 2 }}>
            <MenuItem value="">Unassigned</MenuItem>
            {faculty.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth multiline rows={3} label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
