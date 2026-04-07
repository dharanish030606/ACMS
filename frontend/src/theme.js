import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8' },
    secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9' },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    background: { default: '#0a0f1e', paper: '#111827' },
    text: { primary: '#f1f5f9', secondary: '#94a3b8' },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 20px rgba(59,130,246,0.3)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          '&:hover': { background: 'linear-gradient(135deg, #2563eb, #7c3aed)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #111827, #1a2235)',
          border: '1px solid rgba(59,130,246,0.12)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: '#3b82f6' },
            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #0d1529 0%, #0a0f1e 100%)',
          border: 'none',
          borderRight: '1px solid rgba(59,130,246,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10,15,30,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(59,130,246,0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { background: 'rgba(59,130,246,0.1)', fontWeight: 600, color: '#60a5fa' },
        root: { borderColor: 'rgba(255,255,255,0.06)' },
      },
    },
  },
});

export default theme;
