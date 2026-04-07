import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import Login from './pages/Auth/Login';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import ProgramManagement from './pages/Admin/ProgramManagement';
import AdminReports from './pages/Admin/Reports';
import ActivityLog from './pages/Admin/ActivityLog';
import AdminApprovalWorkflow from './pages/Admin/ApprovalWorkflow';
import AdvancedSearch from './pages/Admin/AdvancedSearch';

import CourseManagement from './pages/Admin/CourseManagement';
import OutcomeMapping from './pages/Admin/OutcomeMapping';
import GapAnalysis from './pages/Admin/GapAnalysis';

import FacultyDashboard from './pages/Faculty/Dashboard';
import MyCourses from './pages/Faculty/MyCourses';
import UpdateMapping from './pages/Faculty/UpdateMapping';
import FacultySubmitApproval from './pages/Faculty/SubmitApproval';
import FileUpload from './pages/Faculty/FileUpload';

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" />;
  return <Navigate to="/login" />;
};

export default function App() {
  const { loading } = useAuth();
  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" sx={{ background: '#0a0f1e' }}>
      <CircularProgress size={56} sx={{ color: '#3b82f6' }} />
    </Box>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/programs" element={<ProtectedRoute roles={['admin']}><ProgramManagement /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/activity" element={<ProtectedRoute roles={['admin']}><ActivityLog /></ProtectedRoute>} />
      <Route path="/admin/approvals" element={<ProtectedRoute roles={['admin']}><AdminApprovalWorkflow /></ProtectedRoute>} />
      <Route path="/admin/search" element={<ProtectedRoute roles={['admin']}><AdvancedSearch /></ProtectedRoute>} />

      <Route path="/admin/courses" element={<ProtectedRoute roles={['admin']}><CourseManagement /></ProtectedRoute>} />
      <Route path="/admin/mapping" element={<ProtectedRoute roles={['admin']}><OutcomeMapping /></ProtectedRoute>} />
      <Route path="/admin/gap-analysis" element={<ProtectedRoute roles={['admin']}><GapAnalysis /></ProtectedRoute>} />
      {/* Faculty Routes */}
      <Route path="/faculty/dashboard" element={<ProtectedRoute roles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/courses" element={<ProtectedRoute roles={['faculty']}><MyCourses /></ProtectedRoute>} />
      <Route path="/faculty/mapping/:courseId" element={<ProtectedRoute roles={['faculty', 'admin']}><UpdateMapping /></ProtectedRoute>} />
      <Route path="/faculty/submit-approval" element={<ProtectedRoute roles={['faculty']}><FacultySubmitApproval /></ProtectedRoute>} />
      <Route path="/faculty/upload" element={<ProtectedRoute roles={['faculty']}><FileUpload /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
