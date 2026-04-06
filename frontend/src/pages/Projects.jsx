import { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, List, ListItem, IconButton, Chip, Avatar, Tooltip } from '@mui/material';
import { Delete, Edit, Add, Share, Public, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/v1/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setProjects(res.data.data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjects();
  }, [navigate, token]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Удалить проект?')) return;
    try {
      await axios.delete(`/api/v1/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (id, e) => {
    e.stopPropagation();
    navigate(`/projects/edit/${id}`);
  };

  const handleProjectClick = (id) => {
    navigate(`/projects/${id}`);
  };

  const copyLink = (id, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/project/public/${id}`;
    navigator.clipboard.writeText(url);
    showToast('Ссылка на проект скопирована', 'success');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Проекты</Typography>
        <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => navigate('/projects/new')}>
          Добавить проект
        </Button>
        <List>
          {projects.map(project => (
            <ListItem
              key={project.id}
              alignItems="flex-start"
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'background-color 0.2s, border-radius 0.2s',
                '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
              }}
              onClick={() => handleProjectClick(project.id)}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Редактировать">
                    <IconButton edge="end" onClick={(e) => handleEdit(project.id, e)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  {project.is_published && (
                    <Tooltip title="Поделиться">
                      <IconButton edge="end" onClick={(e) => copyLink(project.id, e)}>
                        <Share />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Удалить">
                    <IconButton edge="end" onClick={(e) => handleDelete(project.id, e)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <Box sx={{ display: 'flex', width: '100%', pr: 12 }}>
                {project.images && project.images.length > 0 ? (
                  <Avatar variant="rounded" src={project.images[0]} sx={{ width: 56, height: 56, mr: 2 }} />
                ) : (
                  <Avatar variant="rounded" sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                    <Typography variant="h6">{project.title?.charAt(0)}</Typography>
                  </Avatar>
                )}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Typography variant="subtitle1" component="span">
                      {project.title}
                    </Typography>
                    {project.is_published ? (
                      <Chip icon={<Public />} label="Опубликован" size="small" color="success" />
                    ) : (
                      <Chip icon={<Lock />} label="Скрыт" size="small" color="default" />
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary" component="div" sx={{ mb: 1 }}>
                    {project.description ? project.description.slice(0, 120) + (project.description.length > 120 ? '…' : '') : 'Нет описания'}
                  </Typography>
                  {project.technologies && project.technologies.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {project.technologies.slice(0, 3).map(tech => (
                        <Chip key={tech} label={tech} size="small" />
                      ))}
                      {project.technologies.length > 3 && (
                        <Chip label={`+${project.technologies.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
        {projects.length === 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
            У вас пока нет проектов. Нажмите «Добавить проект», чтобы создать первый.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Projects;