import { useState, useEffect } from 'react';
import { Box, Card, Typography, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination } from '@mui/material';
import { format } from 'date-fns';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/activity?page=${page}&limit=20`)
      .then(r => { setLogs(r.data.logs); setTotal(r.data.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>System Activity Log</Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Monitor all system operations and audit trails</Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <TableContainer component={Card} sx={{ bgcolor: '#1e293b' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#a1a1aa' }}>Timestamp</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>User</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>Action</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>Entity</TableCell>
              <TableCell sx={{ color: '#a1a1aa' }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log._id}>
                <TableCell sx={{ color: '#f1f5f9', fontSize: '0.8rem' }}>{format(new Date(log.created_at), 'MMM dd, HH:mm')}</TableCell>
                <TableCell sx={{ color: '#f1f5f9' }}>
                   {log.user_name} <Chip label={log.user_role} size="small" sx={{ fontSize: '0.65rem', height: 16, ml: 1 }} />
                </TableCell>
                <TableCell sx={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.8rem' }}>{log.action}</TableCell>
                <TableCell sx={{ color: '#f1f5f9', fontSize: '0.8rem' }}>{log.entity_type}{(log.entity_name ? `: ${log.entity_name}` : '')}</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{log.details || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {total > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={total} page={page} onChange={(_, p) => setPage(p)} color="primary" />
          </Box>
        )}
      </TableContainer>
    </Layout>
  );
}
