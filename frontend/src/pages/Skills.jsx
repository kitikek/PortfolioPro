import { useEffect, useState } from 'react'
import { Container, Typography, Box, Button, List, ListItem, ListItemText, IconButton } from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Skills = () => {
  const [skills, setSkills] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    const fetchSkills = async () => {
      try {
        const res = await axios.get('/api/v1/skills', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setSkills(res.data.data)
        } else {
          console.error('Неожиданный формат ответа:', res.data)
          setSkills([])
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchSkills()
  }, [navigate, token])

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSkills(skills.filter(s => s.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Skills
        </Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate('/skills/new')}>
          Add Skill
        </Button>
        <List>
          {skills.map(skill => (
            <ListItem key={skill.id} secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/skills/edit/${skill.id}`)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(skill.id)}>
                  <Delete />
                </IconButton>
              </>
            }>
              <ListItemText primary={skill.name} secondary={`Level: ${skill.level}, Category: ${skill.category || 'Без категории'}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  )
}

export default Skills