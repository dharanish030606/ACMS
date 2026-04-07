import { useState, useEffect } from 'react';
import { Box, Card, Typography, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { format } from 'date-fns';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

export default function AdminApprovalWorkflow() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchApprovals = () => {
    setLoading(true);
    api.get('/approvals').then(r => setApprovals(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApprovals(); }, []);

  const handleAction = async (status) => {
    try {
      await api.patch(`/approvals/${selected._id}`, { status, notes });
      setDialogOpen(false);
      fetchApprovals();
    } catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Approval Workflow</Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Review curriculum modifications and syllabus updates</Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <TableContainer component={Card} sx={{ bgcolor: '#1e293b' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#a1a1aa' }}>Date</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>Title</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>Type</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>Submitted By</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>Status</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals.map(app => (
              <TableRow key={app._id}>
                <TableCell sx={{ color: '#f1f5f9' }}>{app.submitted_at ? format(new Date(app.submitted_at), 'MMM dd, yyyy') : '-'}</TableCell>
                <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>{app.title}</TableCell>
                <TableCell><Chip label={app.type.replace('_', ' ')} size="small" sx={{ bgcolor: '#334155', color: '#e2e8f0', fontSize: '0.7rem' }} /></TableCell>
                <TableCell sx={{ color: '#94a3b8' }}>{app.submitted_by?.name}</TableCell>
                <TableCell>
                  <Chip
                    label={app.status.toUpperCase()} size="small"
                    color={app.status === 'approved' ? 'success' : app.status === 'pending' ? 'warning' : app.status === 'rejected' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => { setSelected(app); setNotes(app.notes || ''); setDialogOpen(true); }}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#0f172a', color: '#f1f5f9', minWidth: 400 } }}>
        <DialogTitle>Review Approval Request</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>{selected?.title}</Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 3 }}>{selected?.description}</Typography>
          <TextField
            fullWidth multiline rows={3} label="Reviewer Notes"
            value={notes} onChange={(e) => setNotes(e.target.value)}
            InputLabelProps={{ style: { color: '#64748b' } }}
            inputProps={{ style: { color: '#f1f5f9' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#334155' }, '&:hover fieldset': { borderColor: '#3b82f6' } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={() => handleAction('rejected')} color="error" variant="contained">Reject</Button>
          <Button onClick={() => handleAction('approved')} color="success" variant="contained">Approve</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
