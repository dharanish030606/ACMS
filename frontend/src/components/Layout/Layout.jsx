import { Box, AppBar, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import GlobalSearch from '../GlobalSearch';
import NotificationDrawer from '../NotificationDrawer';

const Layout = ({ children }) => (
  <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px`, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'transparent', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <GlobalSearch />
          <NotificationDrawer />
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  </Box>
);

export default Layout;
