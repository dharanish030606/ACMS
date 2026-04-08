import { useState, useEffect } from 'react';
import { Box, Card, Typography, TextField, MenuItem, Button, Grid, Alert, LinearProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { Send, History } from '@mui/icons-material';
import { format } from 'date-fns';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

export default function FacultySubmitApproval() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'SYLLABUS_UPDATE', course_id: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).catch(console.error);
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    api.get('/approvals').then(r => setHistory(r.data)).catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to submit this request for review?')) return;
    
    setLoading(true);
    try {
      // Sanitize: course_id should be null if not selected, not empty string
      const payload = {
        ...formData,
        course_id: formData.course_id === '' ? null : formData.course_id
      };
      
      await api.post('/approvals', payload);
      setSuccess(true);
      setFormData({ title: '', description: '', type: 'SYLLABUS_UPDATE', course_id: '' });
      fetchHistory();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) { 
        console.error(err);
        const msg = err.response?.data?.message || 'Error submitting request';
        alert(msg);
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Submit for Approval</Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Send curriculum modifications to the HOD for review</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, border: '1px solid rgba(59,130,246,0.2)' }}>
            {success && <Alert severity="success" sx={{ mb: 3 }}>Request submitted successfully!</Alert>}
            
            <form onSubmit={handleSubmit}>
              <TextField select fullWidth label="Request Type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} sx={{ mb: 3 }}>
                <MenuItem value="SYLLABUS_UPDATE">Syllabus Update (Minor)</MenuItem>
                <MenuItem value="COURSE_UPDATE">Course Update (Major)</MenuItem>
                <MenuItem value="MAPPING_UPDATE">Mapping Revision</MenuItem>
              </TextField>

              <TextField select fullWidth label="Related Course (Optional)" value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})} sx={{ mb: 3 }}>
                <MenuItem value="">None</MenuItem>
                {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.code}: {c.name}</MenuItem>)}
              </TextField>

              <TextField fullWidth required label="Request Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} sx={{ mb: 3 }} />
              
              <TextField fullWidth required multiline rows={4} label="Detailed Description / Justification" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} sx={{ mb: 4 }} />

              <Button type="submit" fullWidth variant="contained" disabled={loading} endIcon={<Send />} sx={{ py: 1.5, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </Card>
        </Grid>

         <Grid item xs={12} md={7}>
           <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><History /> My Request History</Typography>
            <TableContainer component={Card} sx={{ bgcolor: '#1e293b' }}>
                <Table size="small">
                <TableHead>
                    <TableRow>
                    <TableCell sx={{ color: '#a1a1aa' }}>Date</TableCell>
                    <TableCell sx={{ color: '#a1a1aa' }}>Title</TableCell>
                    <TableCell sx={{ color: '#a1a1aa' }}>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.length === 0 && <TableRow><TableCell colSpan={3} align="center" sx={{ color: '#64748b', py: 3 }}>No previous requests.</TableCell></TableRow>}
                    {history.map(app => (
                    <TableRow key={app._id}>
                        <TableCell sx={{ color: '#f1f5f9' }}>{app.submitted_at ? format(new Date(app.submitted_at), 'MMM dd, yyyy') : '-'}</TableCell>
                        <TableCell sx={{ color: '#f1f5f9' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{app.title}</Typography>
                            {app.notes && <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>Note: {app.notes}</Typography>}
                        </TableCell>
                        <TableCell>
                            <Chip
                                label={app.status.toUpperCase()} size="small"
                                color={app.status === 'approved' ? 'success' : app.status === 'pending' ? 'warning' : app.status === 'rejected' ? 'error' : 'default'}
                                sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
         </Grid>
      </Grid>
    </Layout>
  );
}
