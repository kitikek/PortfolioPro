import { useEffect, useState } from 'react'
import { Container, Typography, Box, Button, List, ListItem, ListItemText, IconButton } from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Resume = () => {
  const [resumes, setResumes] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    const fetchResumes = async () => {
      try {
        const res = await axios.get('/api/v1/resumes', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setResumes(res.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchResumes()
  }, [navigate, token])

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResumes(resumes.filter(r => r.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Resumes
        </Typography>
        <Button variant="contained" sx={{ mb: 2 }}>Create Resume</Button>
        <List>
          {resumes.map(resume => (
            <ListItem key={resume.id} secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit">
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(resume.id)}>
                  <Delete />
                </IconButton>
              </>
            }>
              <ListItemText primary={`Template: ${resume.template}`} secondary={`Created: ${new Date(resume.created_at).toLocaleDateString()}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  )
}

export default Resume