import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Avatar, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, Chip, keyframes, Fade } from '@mui/material';
import { People, School, MenuBook, AccountTree, Bolt } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const StatCard = ({ title, value, icon, color, delay }) => (
  <Fade in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
    <Card sx={{ 
      height: '100%', position: 'relative', overflow: 'hidden', 
      transition: 'all 0.3s ease-in-out',
      animation: `${float} 6s ease-in-out infinite`,
      animationDelay: `${delay}ms`,
      '&:hover': { 
        transform: 'scale(1.03) translateY(-8px)', 
        boxShadow: `0 12px 30px ${color}44`,
        '& .icon-wrap': { transform: 'scale(1.15) rotate(5deg)' } 
      }
    }}>
      <Box sx={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${color}22, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>{title}</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value ?? '—'}</Typography>
          </Box>
          <Avatar className="icon-wrap" sx={{ bgcolor: `${color}22`, width: 56, height: 56, transition: '0.3s' }}>
            <Box sx={{ color, display: 'flex' }}>{icon}</Box>
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </Fade>
);



export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/stats'),
      api.get('/activity?limit=10')
    ]).then(([sRes, aRes]) => {
      setStats(sRes.data);
      setActivity(aRes.data.logs);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Bolt sx={{ color: '#3b82f6', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Command Center</Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>Overview and high-frequency live activity feeds</Typography>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ borderRadius: 1, mb: 2 }} />}

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Users" value={stats?.users} icon={<People />} color="#3b82f6" delay={0} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Programs defined" value={stats?.programs} icon={<School />} color="#10b981" delay={100} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Courses Live" value={stats?.courses} icon={<MenuBook />} color="#f59e0b" delay={200} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Mappings" value={stats?.mappings} icon={<AccountTree />} color="#ef4444" delay={300} /></Grid>
      </Grid>

      <Fade in={true} timeout={1200}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(59,130,246,0.1), transparent)' }}>
                <Typography variant="h6" sx={{ color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
                  Live Activity Stream
                </Typography>
              </Box>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600, py: 2 }}>Action</TableCell>
                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600, py: 2 }}>User</TableCell>
                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600, py: 2 }}>Entity Impacted</TableCell>
                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600, py: 2 }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.map((act, i) => (
                    <TableRow key={act._id} sx={{ '&:hover': { background: 'rgba(59,130,246,0.04)' }, transition: '0.2s', animation: `${float} ${(i+2)*2}s ease-in-out infinite` }}>
                      <TableCell><Chip label={act.action} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 700, fontSize: '0.7rem', border: '1px solid rgba(59,130,246,0.2)' }} /></TableCell>
                      <TableCell sx={{ color: '#f1f5f9', fontWeight: 500 }}>{act.user_name}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>{act.entity_type} {act.entity_name ? `(${act.entity_name})` : ''}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(act.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {activity.length === 0 && !loading && (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: '#64748b' }}>No recent activity to display.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </Grid>
        </Grid>
      </Fade>
    </Layout>
  );
}
