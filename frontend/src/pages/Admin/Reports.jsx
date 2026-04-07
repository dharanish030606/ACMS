import { useState, useEffect } from 'react';
import { Box, Card, Typography, LinearProgress, Button, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Divider } from '@mui/material';
import { Download, PictureAsPdf, GridOn } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

export default function AdminReports() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    api.get('/programs').then(r => { setPrograms(r.data); if (r.data.length > 0) setSelectedProgram(r.data[0].id); });
  }, []);

  useEffect(() => {
    if (!selectedProgram) return;
    setLoading(true);
    api.get(`/reports/summary/${selectedProgram}`).then(r => setSummary(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [selectedProgram]);

  const handleExport = async (format) => {
    if (!selectedProgram) return;
    setDownloading(format);
    try {
      if (format === 'PDF') {
        const jsPDF = (await import('jspdf')).default;
        await import('jspdf-autotable');
        
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`CO-PO Mapping Report: ${summary.program.name}`, 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Department: ${summary.program.dept_name}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
        
        doc.autoTable({
          startY: 45,
          head: [['Metric', 'Count']],
          body: [
            ['Total Courses', summary.stats.courses],
            ['Total Program Outcomes', summary.stats.pos],
            ['Total Course Outcomes', summary.stats.cos],
            ['Active Mappings', summary.stats.mappings]
          ],
        });
        
        doc.text('Gap Analysis Results (Unmapped POs)', 14, doc.lastAutoTable.finalY + 15);
        
        const gapData = summary.gaps.map(g => [g.code, g.description]);
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['PO Code', 'Description']],
          body: gapData.length > 0 ? gapData : [['None', 'All POs are properly covered']],
          theme: gapData.length > 0 ? 'striped' : 'grid'
        });
        
        doc.save(`ACMS_Report_${summary.program.code}.pdf`);
      } else if (format === 'CSV') {
        const res = await api.get(`/reports/exportCSV/${selectedProgram}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `CO_PO_Mapping_${summary.program.code}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const res = await api.get(`/reports/export/${selectedProgram}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `CO_PO_Mapping_${summary.program.code}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error(err);
      alert(`Error exporting ${format}`);
    } finally {
      setDownloading('');
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Curriculum Reports</Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Generate and export detailed analysis reports</Typography>
      </Box>

      <Card sx={{ p: 2, mb: 3 }}>
        <TextField select label="Select Program for Report" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} size="small" sx={{ minWidth: 320 }}>
          {programs.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {summary && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, height: '100%', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 3 }}>Export Full Data Matrix</Typography>
              <Typography sx={{ color: '#94a3b8', mb: 4, fontSize: '0.85rem' }}>
                Download the complete CO-PO correlation matrix for all courses in {summary.program.name}. 
                Includes direct mappings and correlation strengths suitable for accreditation submissions.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" endIcon={<GridOn />} onClick={() => handleExport('Excel')} disabled={!!downloading} sx={{ py: 1.5, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                  {downloading === 'Excel' ? 'Generating...' : 'Export as Excel (.xlsx)'}
                </Button>
                <Button variant="contained" endIcon={<Download />} onClick={() => handleExport('CSV')} disabled={!!downloading} sx={{ py: 1.5, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>
                  {downloading === 'CSV' ? 'Generating...' : 'Export as CSV (.csv)'}
                </Button>
                <Button variant="contained" endIcon={<PictureAsPdf />} onClick={() => handleExport('PDF')} disabled={!!downloading} sx={{ py: 1.5, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
                  {downloading === 'PDF' ? 'Generating...' : 'Export Summary PDF'}
                </Button>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 2 }}>Current Summary</Typography>
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                <Box p={2} bgcolor="rgba(255,255,255,0.03)" borderRadius={2}>
                  <Typography color="#64748b" fontSize="0.75rem">Courses Connected</Typography>
                  <Typography color="#f1f5f9" fontSize="1.5rem" fontWeight={700}>{summary.stats.courses}</Typography>
                </Box>
                <Box p={2} bgcolor="rgba(255,255,255,0.03)" borderRadius={2}>
                  <Typography color="#64748b" fontSize="0.75rem">Active Mappings</Typography>
                  <Typography color="#3b82f6" fontSize="1.5rem" fontWeight={700}>{summary.stats.mappings}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ color: '#f1f5f9', mb: 1 }}>Gap Analysis Status</Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />
              
              {summary.gaps.length > 0 ? (
                <Table size="small">
                  <TableBody>
                    {summary.gaps.map(g => (
                      <TableRow key={g.id}>
                        <TableCell sx={{ color: '#ef4444', fontWeight: 600 }}>{g.code}</TableCell>
                        <TableCell sx={{ color: '#94a3b8' }}>{g.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography sx={{ color: '#10b981', p: 2, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 2 }}>
                   Status: Optimal. No gaps detected in current curriculum.
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}
