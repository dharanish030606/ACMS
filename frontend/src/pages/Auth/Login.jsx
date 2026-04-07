import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, TextField, Button, Typography, Alert, InputAdornment, IconButton, Chip } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, School } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const creds = { admin: ['admin@acms.edu', 'Admin@123'], faculty: ['faculty@acms.edu', 'Faculty@123'] };
    setEmail(creds[role][0]);
    setPassword(creds[role][1]);
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0a0f1e 40%, #0c1a0c 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated background orbs */}
      {[
        { top: '-10%', left: '-5%', color: '#3b82f6' },
        { top: '60%', right: '-10%', color: '#8b5cf6' },
        { bottom: '-10%', left: '30%', color: '#10b981' },
      ].map((orb, i) => (
        <Box key={i} sx={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: `radial-gradient(circle, ${orb.color}22 0%, transparent 70%)`,
          top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
          filter: 'blur(40px)', animation: `pulse${i} 6s ease-in-out infinite`,
          '@keyframes pulse0': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.1)' } },
          '@keyframes pulse1': { '0%,100%': { transform: 'scale(1.1)' }, '50%': { transform: 'scale(0.9)' } },
          '@keyframes pulse2': { '0%,100%': { transform: 'scale(0.9)' }, '50%': { transform: 'scale(1.15)' } },
        }} />
      ))}

      <Box sx={{ width: '100%', maxWidth: 480, px: 2, position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 3, mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(59,130,246,0.5)',
          }}>
            <School sx={{ fontSize: 38, color: '#fff' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
            ACMS
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
            Automated Curriculum Mapping System
          </Typography>
        </Box>

        <Card sx={{ p: 4, borderRadius: 3, border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#f1f5f9' }}>Welcome back</Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mb: 3 }}>Sign in to your account to continue</Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField
              id="login-email" fullWidth label="Email Address" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#64748b', fontSize: 20 }} /></InputAdornment> }}
            />
            <TextField
              id="login-password" fullWidth label="Password" type={showPassword ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)} required sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#64748b', fontSize: 20 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#64748b' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }}
            />
            <Button id="login-submit" type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', mb: 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Quick login chips */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography sx={{ color: '#475569', fontSize: '0.75rem', mb: 1.5, textAlign: 'center' }}>Quick Login (Demo)</Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['admin', 'faculty'].map(role => (
                <Chip key={role} label={role.toUpperCase()} onClick={() => quickLogin(role)} size="small"
                  sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.7rem',
                    bgcolor: role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                    color: role === 'admin' ? '#ef4444' : '#10b981',
                    border: `1px solid ${role === 'admin' ? '#ef444433' : '#10b98133'}`,
                    '&:hover': { opacity: 0.8 }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
