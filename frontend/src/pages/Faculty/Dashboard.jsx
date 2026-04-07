import { useState, useEffect } from 'react';
import { Box, Grid, Card, Typography, Chip, LinearProgress, Divider, Avatar } from '@mui/material';
import { MenuBook, AccountTree, TrendingUp } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalCOs = courses.reduce((a, c) => a + parseInt(c.co_count || 0), 0);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #10b981, #3b82f6)' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Faculty Dashboard</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Welcome, {user?.name}</Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { title: 'My Courses', value: courses.length, icon: <MenuBook />, color: '#3b82f6' },
          { title: 'Course Outcomes', value: totalCOs, icon: <AccountTree />, color: '#10b981' },
        ].map((c, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{c.title}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#f1f5f9' }}>{c.value}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${c.color}22`, width: 52, height: 52 }}><Box sx={{ color: c.color }}>{c.icon}</Box></Avatar>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>My Assigned Courses</Typography>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
        {courses.map((c, i) => (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)',
            cursor: 'pointer', borderRadius: 1, px: 1,
            '&:hover': { background: 'rgba(59,130,246,0.06)' },
            transition: 'all 0.15s'
          }} onClick={() => window.location.href = `/faculty/mapping/${c.id}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label={c.code} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: '0.7rem' }} />
              <Box>
                <Typography sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.87rem' }}>{c.name}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>{c.program_name} · {c.semester_label}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={`${c.co_count} COs`} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600, fontSize: '0.7rem' }} />
              <Chip label={`${c.credits} Cr`} size="small" sx={{ bgcolor: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontWeight: 600, fontSize: '0.7rem' }} />
            </Box>
          </Box>
        ))}
        {courses.length === 0 && !loading && (
          <Typography sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>No courses assigned yet</Typography>
        )}
      </Card>
    </Layout>
  );
}
