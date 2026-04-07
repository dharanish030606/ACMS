import { useState, useEffect, useRef } from 'react';
import { Box, TextField, InputAdornment, Popover, List, ListItem, ListItemText, Typography, Chip, CircularProgress } from '@mui/material';
import { Search as SearchIcon, School, MenuBook, AccountTree, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ courses: [], programs: [], outcomes: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  const fetchResults = (q) => {
    if (q.length < 2) {
      setResults({ courses: [], programs: [], outcomes: [], users: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/upload/search?q=${encodeURIComponent(q)}`)
      .then(r => setResults(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setAnchorEl(e.currentTarget);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchResults(val);
    }, 300);
  };

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const open = Boolean(anchorEl) && query.length >= 2;
  const hasResults = Object.values(results).some(arr => arr.length > 0);

  const getTypeIcon = (type) => {
    if (type === 'course') return <MenuBook fontSize="small" sx={{ color: '#f59e0b' }} />;
    if (type === 'program' || type === 'department') return <School fontSize="small" sx={{ color: '#10b981' }} />;
    if (type === 'user') return <People fontSize="small" sx={{ color: '#3b82f6' }} />;
    return <AccountTree fontSize="small" sx={{ color: '#ef4444' }} />;
  };

  return (
    <Box sx={{ flexGrow: 1, maxW: 600, mx: 4 }}>
      <TextField
        fullWidth size="small"
        placeholder="Search courses, programs, outcomes, users..."
        value={query}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b' }} /></InputAdornment>,
          endAdornment: loading ? <CircularProgress size={16} /> : null,
          sx: { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#f1f5f9', '& fieldset': { border: 'none' } }
        }}
      />
      
      <Popover
        open={open} anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
         PaperProps={{ sx: { width: anchorEl?.clientWidth || 400, mt: 1, bgcolor: '#0f172a', border: '1px solid rgba(59,130,246,0.2)' } }}
         disableAutoFocus disableEnforceFocus
      >
        <Box sx={{ maxHeight: 400, overflow: 'auto', p: 1 }}>
          {!loading && !hasResults && (
            <Typography sx={{ p: 2, color: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>No results found for "{query}"</Typography>
          )}

          {results.courses?.length > 0 && (
            <Box mb={1}>
              <Typography sx={{ px: 2, py: 0.5, fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Courses</Typography>
              {results.courses.map(c => (
                <ListItem button key={c.id} onClick={() => { setAnchorEl(null); navigate('/admin/search'); }} sx={{ borderRadius: 1 }}>
                  <ListItemText primary={<Box display="flex" gap={1}>{getTypeIcon('course')}<Typography fontSize="0.85rem" color="#f1f5f9">{c.code}: {c.name}</Typography></Box>} />
                </ListItem>
              ))}
            </Box>
          )}

          {results.outcomes?.length > 0 && (
            <Box mb={1}>
              <Typography sx={{ px: 2, py: 0.5, fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Outcomes</Typography>
              {results.outcomes.map(o => (
                <ListItem button key={o.id} onClick={() => { setAnchorEl(null); navigate('/admin/search'); }} sx={{ borderRadius: 1 }}>
                   <ListItemText primary={<Box display="flex" gap={1}>{getTypeIcon('po')}<Typography fontSize="0.85rem" color="#f1f5f9">
                     <Chip label={o.code} size="small" sx={{ height: 16, fontSize: '0.6rem', mr: 1, bgcolor: 'rgba(239,68,68,0.15)', color: '#ef4444' }} />
                     {o.description.substring(0, 50)}...
                   </Typography></Box>} />
                </ListItem>
              ))}
            </Box>
          )}

          {(results.programs?.length > 0 || results.departments?.length > 0) && (
             <Box mb={1}>
              <Typography sx={{ px: 2, py: 0.5, fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Programs & Depts</Typography>
              {results.programs?.map(p => (
                <ListItem button key={p.id} onClick={() => { setAnchorEl(null); navigate('/admin/programs'); }} sx={{ borderRadius: 1 }}>
                  <ListItemText primary={<Box display="flex" gap={1}>{getTypeIcon('program')}<Typography fontSize="0.85rem" color="#f1f5f9">{p.code}: {p.name}</Typography></Box>} />
                </ListItem>
              ))}
            </Box>
          )}

           {results.users?.length > 0 && (
             <Box mb={1}>
              <Typography sx={{ px: 2, py: 0.5, fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Users</Typography>
              {results.users?.map(u => (
                <ListItem button key={u.id} onClick={() => { setAnchorEl(null); navigate('/admin/users'); }} sx={{ borderRadius: 1 }}>
                  <ListItemText primary={<Box display="flex" gap={1}>{getTypeIcon('user')}<Typography fontSize="0.85rem" color="#f1f5f9">{u.name} ({u.role})</Typography></Box>} />
                </ListItem>
              ))}
            </Box>
           )}
        </Box>
      </Popover>
    </Box>
  );
}
