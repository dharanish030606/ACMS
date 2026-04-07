import { useState } from 'react';
import { Box, Card, Typography, Button, LinearProgress, Alert, Paper } from '@mui/material';
import { CloudUpload, InsertDriveFile, CheckCircle } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axios';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Must use multipart/form-data for files
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const res = await api.post('/upload', formData, config);
      setResult(res.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Material Upload</Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>Securely upload syllabi and reading materials</Typography>
      </Box>

      <Card sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 8, textAlign: 'center', border: '1px dashed rgba(59,130,246,0.4)', bgcolor: 'rgba(15,23,42,0.6)' }}>
        
        {!file && !result && (
          <Box sx={{ py: 6 }}>
            <CloudUpload sx={{ fontSize: 64, color: '#3b82f6', mb: 2, opacity: 0.8 }} />
            <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 1 }}>Drag & Drop or Select File</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mb: 4 }}>Supported formats: PDF, DOCX, XLSX (Max 10MB)</Typography>
            
            <Button variant="contained" component="label" sx={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              Choose File
              <input type="file" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" />
            </Button>
          </Box>
        )}

        {file && !loading && !result && (
          <Box sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 2, display: 'inline-flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, mb: 4 }}>
              <InsertDriveFile sx={{ color: '#8b5cf6', fontSize: 32 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
              </Box>
            </Paper>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={() => setFile(null)} sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>Cancel</Button>
              <Button variant="contained" onClick={handleUpload} sx={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Upload File</Button>
            </Box>
          </Box>
        )}

        {loading && (
          <Box sx={{ py: 8 }}>
             <Typography sx={{ color: '#f1f5f9', mb: 2 }}>Uploading {file?.name}...</Typography>
             <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}

        {result && (
          <Box sx={{ py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#f1f5f9', mb: 1 }}>Upload Successful!</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 4 }}>Your file has been saved securely.</Typography>
            
            <Alert severity="info" sx={{ mb: 4, textAlign: 'left', wordBreak: 'break-all' }}>
              Path: {result.url}
            </Alert>
            
            <Button variant="outlined" onClick={() => { setResult(null); setFile(null); }}>Upload Another</Button>
          </Box>
        )}

        {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}

      </Card>
    </Layout>
  );
}
