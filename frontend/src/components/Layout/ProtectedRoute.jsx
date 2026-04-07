import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" sx={{ background: '#0a0f1e' }}>
      <CircularProgress sx={{ color: '#3b82f6' }} />
    </Box>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
