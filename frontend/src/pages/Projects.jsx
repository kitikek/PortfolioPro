import { useEffect, useState } from 'react'
import { Container, Typography, Box, Button, List, ListItem, ListItemText, IconButton, Chip, Avatar } from '@mui/material'
import { Delete, Edit, Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/v1/projects', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setProjects(res.data.data)
        } else {
          console.error('Неожиданный формат ответа:', res.data)
          setProjects([])
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchProjects()
  }, [navigate, token])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Удалить проект?')) return
    try {
      await axios.delete(`/api/v1/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(projects.filter(p => p.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (id, e) => {
    e.stopPropagation()
    navigate(`/projects/edit/${id}`)
  }

  const handleProjectClick = (id) => {
    navigate(`/projects/${id}`)
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Проекты
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ mb: 2 }}
          onClick={() => navigate('/projects/new')}
        >
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
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }
              }}
              onClick={() => handleProjectClick(project.id)}
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={(e) => handleEdit(project.id, e)} sx={{ mr: 1 }}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={(e) => handleDelete(project.id, e)}>
                    <Delete />
                  </IconButton>
                </>
              }
            >
              {project.images && project.images.length > 0 ? (
                <Avatar variant="rounded" src={project.images[0]} sx={{ width: 56, height: 56, mr: 2 }} />
              ) : (
                <Avatar variant="rounded" sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                  <Typography variant="h6">{project.title?.charAt(0)}</Typography>
                </Avatar>
              )}
              <ListItemText
                primary={project.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textSecondary" sx={{ display: 'block' }}>
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
                  </>
                }
              />
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
  )
}

export default Projects