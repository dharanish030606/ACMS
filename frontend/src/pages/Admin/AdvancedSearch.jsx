import { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Card, List, ListItem, ListItemText, Chip, CircularProgress, Divider } from '@mui/material';
import { Search as SearchIcon, School, MenuBook, AccountTree, People } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await api.get(`/upload/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const hasResults = results && Object.values(results).some(arr => arr.length > 0);

  return (
    <Layout>
      <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 2 }}>Advanced Search</Typography>
        <Typography sx={{ color: '#64748b', mb: 4 }}>Search across all system entities instantly</Typography>
        
        <form onSubmit={handleSearch}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type to search courses, users, programs..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#3b82f6', fontSize: 28 }} /></InputAdornment>,
                endAdornment: loading ? <CircularProgress size={24} /> : null,
                sx: { bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, color: '#f1f5f9', fontSize: '1.2rem', p: 1 }
                }}
            />
        </form>
      </Box>

      {results && (
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            {!hasResults && !loading && <Typography sx={{ textAlign: 'center', color: '#64748b' }}>No matches found for "{query}"</Typography>}
            
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
                {results.courses?.length > 0 && (
                    <Card sx={{ bgcolor: '#1e293b', p: 2 }}>
                        <Typography sx={{ color: '#f59e0b', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}><MenuBook fontSize="small" /> Courses</Typography>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 1 }} />
                        <List dense>
                            {results.courses.map(c => (
                                <ListItem key={c.id} sx={{ px: 0 }}>
                                    <ListItemText primary={`${c.code}: ${c.name}`} secondary={`Status: ${c.status}`} primaryTypographyProps={{ color: '#f1f5f9' }} secondaryTypographyProps={{ color: '#94a3b8' }} />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                )}

                {results.users?.length > 0 && (
                    <Card sx={{ bgcolor: '#1e293b', p: 2 }}>
                        <Typography sx={{ color: '#3b82f6', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}><People fontSize="small" /> Users</Typography>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 1 }} />
                        <List dense>
                            {results.users.map(u => (
                                <ListItem key={u.id} sx={{ px: 0 }}>
                                    <ListItemText primary={u.name} secondary={u.email} primaryTypographyProps={{ color: '#f1f5f9' }} secondaryTypographyProps={{ color: '#94a3b8' }} />
                                    <Chip label={u.role} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                )}

                {results.outcomes?.length > 0 && (
                    <Card sx={{ bgcolor: '#1e293b', p: 2 }}>
                        <Typography sx={{ color: '#ef4444', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}><AccountTree fontSize="small" /> Outcomes</Typography>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 1 }} />
                        <List dense>
                            {results.outcomes.map(o => (
                                <ListItem key={o.id} sx={{ px: 0 }}>
                                    <ListItemText primary={<Box display="flex" alignItems="center" gap={1}><Chip label={o.code} size="small" sx={{ height: 16, fontSize: '0.6rem' }}/> <Typography fontSize="0.85rem" color="#f1f5f9">{o.description}</Typography></Box>} />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                )}

                {(results.programs?.length > 0 || results.departments?.length > 0) && (
                    <Card sx={{ bgcolor: '#1e293b', p: 2 }}>
                        <Typography sx={{ color: '#10b981', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}><School fontSize="small" /> Programs & Depts</Typography>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 1 }} />
                        <List dense>
                            {results.programs?.map(p => (
                                <ListItem key={p.id} sx={{ px: 0 }}><ListItemText primary={`${p.code}: ${p.name}`} primaryTypographyProps={{ color: '#f1f5f9' }} /></ListItem>
                            ))}
                            {results.departments?.map(d => (
                                <ListItem key={d.id} sx={{ px: 0 }}><ListItemText primary={`${d.code}: ${d.name}`} primaryTypographyProps={{ color: '#f1f5f9' }} /></ListItem>
                            ))}
                        </List>
                    </Card>
                )}
            </Box>
        </Box>
      )}
    </Layout>
  );
}
