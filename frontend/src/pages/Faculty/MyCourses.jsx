import { useState, useEffect } from 'react';
import { Box, Card, Typography, Chip, LinearProgress, Divider, Button } from '@mui/material';
import { AccountTree } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #10b981, #3b82f6)' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>My Courses</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Manage course outcomes and CO-PO mappings</Typography>
          </Box>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {courses.map(c => (
          <Card key={c.id} sx={{ p: 3, transition: 'all 0.2s', '&:hover': { border: '1px solid rgba(59,130,246,0.4)', boxShadow: '0 4px 24px rgba(59,130,246,0.15)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={c.code} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: '0.75rem' }} />
                  <Chip label={c.semester_label} size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '0.7rem' }} />
                  <Chip label={`${c.credits} Credits`} size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 0.5 }}>{c.name}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>{c.program_name}</Typography>
                {c.description && <Typography sx={{ color: '#475569', fontSize: '0.78rem', mt: 1 }}>{c.description}</Typography>}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{c.co_count}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>OUTCOMES</Typography>
                </Box>
                <Button variant="contained" startIcon={<AccountTree />} onClick={() => navigate(`/faculty/mapping/${c.id}`)}
                  size="small" sx={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                  Manage Mapping
                </Button>
              </Box>
            </Box>
          </Card>
        ))}
        {courses.length === 0 && !loading && (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748b' }}>No courses assigned. Contact your HOD or Admin.</Typography>
          </Card>
        )}
      </Box>
    </Layout>
  );
}
