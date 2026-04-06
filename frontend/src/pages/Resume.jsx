import { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, List, ListItem, ListItemText, IconButton, Chip, Menu, MenuItem, Tooltip } from '@mui/material';
import { Delete, Edit, Share, Public, Lock, GetApp, PictureAsPdf, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const Resume = () => {
  const [resumes, setResumes] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchResumes = async () => {
      try {
        const res = await axios.get('/api/v1/resumes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setResumes(res.data.data);
        } else {
          setResumes([]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchResumes();
  }, [navigate, token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить резюме?')) return;
    try {
      await axios.delete(`/api/v1/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/resume/public/${id}`;
    navigator.clipboard.writeText(url);
    showToast('Ссылка скопирована', 'success');
  };

  const handleExportClick = (event, resume) => {
    setAnchorEl(event.currentTarget);
    setSelectedResume(resume);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
    setSelectedResume(null);
  };

  const downloadFile = async (format, resumeId, title) => {
    try {
      const endpoint = format === 'pdf' ? `/api/v1/resumes/${resumeId}/pdf` : `/api/v1/resumes/${resumeId}/docx`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const contentType = format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'resume'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Ошибка скачивания ${format.toUpperCase()}:`, error);
      showToast(`Не удалось скачать ${format.toUpperCase()}`, 'error');
    }
    handleExportClose();
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Дата неизвестна';
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? 'Дата неизвестна' : d.toLocaleDateString();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Мои резюме</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate('/resume/new')}>
          Создать резюме
        </Button>
        <List>
          {resumes.map(resume => (
            <ListItem
              key={resume.id}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => navigate(`/resume/edit/${resume.id}`)}>
                    <Edit />
                  </IconButton>
                  {resume.is_public && (
                    <IconButton onClick={() => copyLink(resume.id)}>
                      <Share />
                    </IconButton>
                  )}
                  <Tooltip title="Экспорт">
                    <IconButton onClick={(e) => handleExportClick(e, resume)}>
                      <GetApp />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleDelete(resume.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" component="span">{resume.title || 'Без названия'}</Typography>
                    {resume.is_public ? (
                      <Chip icon={<Public />} label="Публичное" size="small" color="success" />
                    ) : (
                      <Chip icon={<Lock />} label="Скрытое" size="small" color="default" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" component="span">Шаблон: {resume.template}</Typography><br />
                    <Typography variant="caption" color="textSecondary">Создано: {formatDate(resume.created_at || resume.createdAt)}</Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleExportClose}>
          <MenuItem onClick={() => downloadFile('pdf', selectedResume?.id, selectedResume?.title)}>
            <PictureAsPdf sx={{ mr: 1 }} /> PDF
          </MenuItem>
          <MenuItem onClick={() => downloadFile('docx', selectedResume?.id, selectedResume?.title)}>
            <Description sx={{ mr: 1 }} /> DOCX
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default Resume;