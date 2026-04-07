import { useState, useEffect } from 'react';
import { Box, Card, Typography, MenuItem, TextField, Grid, Chip, LinearProgress, Alert, keyframes, Fade } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
`;
const pop = keyframes`
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;
export default function GapAnalysis() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [gaps, setGaps] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/programs').then(r => { setPrograms(r.data); if (r.data.length > 0) setSelectedProgram(r.data[0].id); });
  }, []);

  useEffect(() => {
    if (!selectedProgram) return;
    setLoading(true);
    Promise.all([
      api.get(`/mappings/gap/${selectedProgram}`),
      api.get(`/mappings/coverage/${selectedProgram}`),
    ]).then(([g, c]) => { setGaps(g.data); setCoverage(c.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProgram]);

  const gapCount = gaps.filter(g => g.has_gap).length;
  const coveragePercent = coverage.length > 0 ? Math.round(coverage.reduce((a, c) => a + c.percentage, 0) / coverage.length) : 0;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #f59e0b, #ef4444)' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Gap Analysis</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Identify uncovered program outcomes and curriculum gaps</Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3 }}>
        <TextField select label="Program" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} size="small" sx={{ minWidth: 320 }}>
          {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {gaps.length > 0 && (
        <>
          {/* Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Fade in={true} timeout={600}>
                <Card sx={{ p: 3, textAlign: 'center', border: gapCount > 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(16,185,129,0.3)', 
                  animation: `${float} 6s ease-in-out infinite`,
                  transition: '0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)', borderColor: gapCount > 0 ? '#f59e0b' : '#10b981' } }}>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: gapCount > 0 ? '#f59e0b' : '#10b981' }}>{gapCount}</Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>POs with Gaps</Typography>
                </Card>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Fade in={true} timeout={1000}>
                <Card sx={{ p: 3, textAlign: 'center', border: '1px solid transparent', 
                  animation: `${float} 6s ease-in-out infinite`, animationDelay: '200ms',
                  transition: '0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)', borderColor: '#3b82f6' } }}>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{gaps.length - gapCount}</Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Covered POs</Typography>
                </Card>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Fade in={true} timeout={1400}>
                <Card sx={{ p: 3, textAlign: 'center', border: '1px solid transparent', 
                  animation: `${float} 6s ease-in-out infinite`, animationDelay: '400ms',
                  transition: '0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)', borderColor: coveragePercent >= 70 ? '#10b981' : '#f59e0b' } }}>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: coveragePercent >= 70 ? '#10b981' : '#f59e0b' }}>{coveragePercent}%</Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Avg Coverage</Typography>
                </Card>
              </Fade>
            </Grid>
          </Grid>

          {/* Coverage bar chart */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>PO Coverage Percentage</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={coverage} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="po_code" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, color: '#f1f5f9' }} formatter={(v) => [`${v}%`, 'Coverage']} />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                      {coverage.map((c, i) => <Cell key={i} fill={c.percentage === 0 ? '#ef4444' : c.percentage < 50 ? '#f59e0b' : '#10b981'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>Program Outcome Status</Typography>
                <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
                  {gaps.map((g, i) => (
                    <Box key={i} sx={{ 
                      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 1, 
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: '0.2s ease', 
                      animation: `${pop} 0.5s ease-out forwards`, animationDelay: `${i * 50}ms`, opacity: 0,
                      '&:hover': { background: 'rgba(59,130,246,0.05)', paddingLeft: 2, borderLeft: g.has_gap ? '4px solid #ef4444' : '4px solid #10b981' }
                    }}>
                      <Chip label={g.po_code} size="small" sx={{ fontWeight: 800, fontSize: '0.75rem', minWidth: 46,
                        bgcolor: g.has_gap ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: g.has_gap ? '#ef4444' : '#10b981', boxShadow: g.has_gap ? '0 0 10px rgba(239,68,68,0.2)' : 'none' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#f1f5f9', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.po_description}</Typography>
                        <Typography sx={{ color: g.has_gap ? '#ef4444' : '#10b981', fontSize: '0.7rem', fontWeight: 700 }}>
                          {g.has_gap ? '⚠ Action Required: No CO mapped' : `✓ ${g.mapped_cos} CO(s) actively mapping to this outcome`}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>

          {gapCount === 0 && (
            <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
              🎉 Excellent! All program outcomes are covered by at least one course outcome. Your curriculum is well-aligned!
            </Alert>
          )}
        </>
      )}

      {gaps.length === 0 && !loading && (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography sx={{ color: '#64748b' }}>Select a program to view gap analysis. Ensure the program has outcomes and mappings defined.</Typography>
        </Card>
      )}
    </Layout>
  );
}
