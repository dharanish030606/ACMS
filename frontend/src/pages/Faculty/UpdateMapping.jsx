import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Chip, LinearProgress, Alert, IconButton, Tooltip, Divider, Grid
} from '@mui/material';
import { Add, ArrowBack, Save, Delete } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';
import { useSnackbar } from 'notistack';

const levelColors = { 0: 'rgba(30,41,59,0.5)', 1: '#1d4ed8', 2: '#7c3aed', 3: '#047857' };
const levelBg = { 0: 'rgba(255,255,255,0.03)', 1: 'rgba(29,78,216,0.2)', 2: 'rgba(124,58,237,0.2)', 3: 'rgba(4,120,87,0.2)' };

export default function UpdateMapping() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coDialog, setCoDialog] = useState(false);
  const [coForm, setCoForm] = useState({ code: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/mappings/course/${courseId}`);
      setData(r.data);
    } catch { enqueueSnackbar('Failed to load course data', { variant: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [courseId]);

  const getLevel = (co_id, po_id) => {
    const m = data?.mappings?.find(m => m.co_id === co_id && m.po_id === po_id);
    return m ? m.correlation_level : 0;
  };

  const cycleLevel = async (co_id, po_id) => {
    const current = getLevel(co_id, po_id);
    const next = (current + 1) % 4;
    try {
      if (next === 0) {
        await api.delete(`/mappings/${co_id}/${po_id}`);
      } else {
        await api.post('/mappings', { co_id, po_id, correlation_level: next });
      }
      load();
    } catch { enqueueSnackbar('Error updating mapping', { variant: 'error' }); }
  };

  const addCO = async () => {
    if (!coForm.code || !coForm.description) return;
    setSaving(true);
    try {
      await api.post('/outcomes/co', { course_id: parseInt(courseId), ...coForm });
      enqueueSnackbar('Course outcome added!', { variant: 'success' });
      setCoDialog(false);
      setCoForm({ code: '', description: '' });
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error', { variant: 'error' });
    } finally { setSaving(false); }
  };

  const deleteCO = async (co_id) => {
    if (!window.confirm('Delete this course outcome and all its mappings?')) return;
    try {
      await api.delete(`/outcomes/co/${co_id}`);
      enqueueSnackbar('CO deleted', { variant: 'info' });
      load();
    } catch { enqueueSnackbar('Error', { variant: 'error' }); }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: '#64748b', mb: 2 }}>Back</Button>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #10b981, #3b82f6)' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>CO-PO Mapping</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Click cells to cycle: — → 1 (Low) → 2 (Medium) → 3 (High) → —</Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCoDialog(true)}>Add Course Outcome</Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Correlation:</Typography>
        {[['—', 0, '#64748b'], ['1 Low', 1, '#1d4ed8'], ['2 Medium', 2, '#7c3aed'], ['3 High', 3, '#047857']].map(([label, level, color]) => (
          <Box key={level} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: levelColors[level], border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: level > 0 ? '#fff' : '#475569', fontSize: '0.65rem', fontWeight: 700 }}>{level || '—'}</Typography>
            </Box>
            <Typography sx={{ color, fontSize: '0.78rem', fontWeight: 600 }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      {data && (
        <Card sx={{ overflow: 'auto', p: 0 }}>
          <Box sx={{ minWidth: Math.max(600, 220 + data.pos.length * 75) }}>
            {/* Header */}
            <Box sx={{ display: 'flex', bgcolor: 'rgba(59,130,246,0.08)', borderBottom: '1px solid rgba(59,130,246,0.15)', p: 2 }}>
              <Box sx={{ minWidth: 200, pr: 2 }}>
                <Typography sx={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Course Outcomes ({data.cos.length})
                </Typography>
              </Box>
              {data.pos.map(po => (
                <Tooltip key={po.id} title={po.description} placement="top">
                  <Box sx={{ minWidth: 65, textAlign: 'center', px: 0.5 }}>
                    <Typography sx={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700 }}>{po.code}</Typography>
                  </Box>
                </Tooltip>
              ))}
              <Box sx={{ minWidth: 40 }} />
            </Box>

            {/* Rows */}
            {data.cos.map(co => (
              <Box key={co.id} sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(255,255,255,0.04)', '&:hover': { background: 'rgba(59,130,246,0.03)' } }}>
                <Box sx={{ minWidth: 200, pr: 2 }}>
                  <Typography sx={{ color: '#f1f5f9', fontSize: '0.8rem', fontWeight: 700 }}>{co.code}</Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{co.description}</Typography>
                </Box>
                {data.pos.map(po => {
                  const level = getLevel(co.id, po.id);
                  return (
                    <Box key={po.id} sx={{ minWidth: 65, textAlign: 'center', px: 4 }}>
                      <Tooltip title={`Click to cycle: currently ${level === 0 ? 'Not mapped' : `Level ${level}`}`}>
                        <Box onClick={() => cycleLevel(co.id, po.id)} sx={{
                          width: 36, height: 36, borderRadius: 1, cursor: 'pointer', mx: 'auto',
                          bgcolor: levelColors[level], background: levelBg[level],
                          border: `2px solid ${level > 0 ? levelColors[level] : 'rgba(255,255,255,0.08)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s', '&:hover': { transform: 'scale(1.2)', borderColor: '#3b82f6' }
                        }}>
                          <Typography sx={{ color: level > 0 ? '#fff' : '#374151', fontSize: '0.78rem', fontWeight: 700 }}>{level || '—'}</Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  );
                })}
                <Box sx={{ minWidth: 40 }}>
                  <IconButton size="small" onClick={() => deleteCO(co.id)} sx={{ color: '#ef444488', '&:hover': { color: '#ef4444' } }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}

            {data.cos.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                <Typography sx={{ mb: 1 }}>No course outcomes defined yet.</Typography>
                <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => setCoDialog(true)} sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}>Add First CO</Button>
              </Box>
            )}

            {data.pos.length === 0 && (
              <Alert severity="warning" sx={{ m: 2, borderRadius: 2 }}>No Program Outcomes (POs) defined for this program. Ask your HOD or Admin to add POs first.</Alert>
            )}
          </Box>
        </Card>
      )}

      {/* Add CO Dialog */}
      <Dialog open={coDialog} onClose={() => setCoDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(59,130,246,0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Add Course Outcome</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField fullWidth label="CO Code (e.g. CO1)" value={coForm.code} onChange={e => setCoForm({ ...coForm, code: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth multiline rows={3} label="CO Description" value={coForm.description} onChange={e => setCoForm({ ...coForm, description: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCoDialog(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={addCO} disabled={saving} startIcon={<Save />}>{saving ? 'Saving...' : 'Add CO'}</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
