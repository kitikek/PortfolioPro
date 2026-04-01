import { useEffect, useState } from 'react'
import { Container, Typography, Box, Button, List, ListItem, ListItemText, IconButton } from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
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
        setProjects(res.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchProjects()
  }, [navigate, token])

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(projects.filter(p => p.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Projects
        </Typography>
        <Button variant="contained" sx={{ mb: 2 }}>Add Project</Button>
        <List>
          {projects.map(project => (
            <ListItem key={project.id} secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit">
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(project.id)}>
                  <Delete />
                </IconButton>
              </>
            }>
              <ListItemText primary={project.title} secondary={project.description} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  )
}

export default Projects