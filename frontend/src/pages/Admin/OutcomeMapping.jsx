import { useState, useEffect } from 'react';
import { Box, Card, Typography, MenuItem, TextField, Grid, Chip, LinearProgress, Tooltip } from '@mui/material';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

const levelColors = { 0: '#1e293b', 1: '#1d4ed8', 2: '#7c3aed', 3: '#047857' };
const levelLabels = { 0: '-', 1: 'Low', 2: 'Medium', 3: 'High' };

export default function OutcomeMapping() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/programs').then(r => {
      setPrograms(r.data);
      if (r.data.length > 0) setSelectedProgram(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedProgram) return;
    setLoading(true);
    api.get(`/mappings/heatmap/${selectedProgram}`)
      .then(r => setHeatmap(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProgram]);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #f59e0b, #ef4444)' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>CO-PO Mapping Matrix</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Visual curriculum outcome alignment heatmap</Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3 }}>
        <TextField select label="Program" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} size="small" sx={{ minWidth: 320 }}>
          {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
      </Card>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3].map(l => (
          <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: levelColors[l], border: '1px solid rgba(255,255,255,0.1)' }} />
            <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>{l === 0 ? 'Not Mapped' : `${l} - ${levelLabels[l]}`}</Typography>
          </Box>
        ))}
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {heatmap && (
        <Card sx={{ p: 0, overflow: 'auto' }}>
          <Box sx={{ minWidth: 600 }}>
            <Box sx={{ p: 2, pb: 1, display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Box sx={{ minWidth: 220, pr: 2 }}>
                <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>CO / COURSE</Typography>
              </Box>
              {heatmap.pos.map(po => (
                <Tooltip key={po.id} title={po.description} placement="top">
                  <Box sx={{ minWidth: 60, textAlign: 'center', px: 0.5 }}>
                    <Typography sx={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700 }}>{po.code}</Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>

            {heatmap.matrix?.map((row, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', py: 0.8, px: 2,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                '&:hover': { background: 'rgba(59,130,246,0.04)' }
              }}>
                <Box sx={{ minWidth: 220, pr: 2 }}>
                  <Typography sx={{ color: '#f1f5f9', fontSize: '0.78rem', fontWeight: 600 }}>
                    {row.course_code} — {row.co_code}
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {row.co_desc}
                  </Typography>
                </Box>
                {heatmap.pos.map(po => {
                  const level = row[po.code] || 0;
                  return (
                    <Box key={po.id} sx={{ minWidth: 60, textAlign: 'center', px: 0.5 }}>
                      <Tooltip title={`${row.co_code} → ${po.code}: ${levelLabels[level]}`}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: 1,
                          background: levelColors[level],
                          border: `1px solid ${level > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          mx: 'auto', cursor: 'default', transition: 'transform 0.15s',
                          '&:hover': { transform: 'scale(1.15)' }
                        }}>
                          <Typography sx={{ color: level > 0 ? '#fff' : '#374151', fontSize: '0.75rem', fontWeight: 700 }}>
                            {level || '—'}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Box>
            ))}
            {(!heatmap.matrix || heatmap.matrix.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                <Typography>No CO-PO mappings found for this program. Add courses and outcomes first.</Typography>
              </Box>
            )}
          </Box>
        </Card>
      )}
    </Layout>
  );
}
