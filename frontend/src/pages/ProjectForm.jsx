import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { Container, TextField, Button, Typography, Box } from '@mui/material'

const ProjectForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const res = await axios.get(`/api/v1/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.data && res.data.success) {
            setTitle(res.data.data.title)
            setDescription(res.data.data.description || '')
          }
        } catch (err) {
          console.error(err)
        }
      }
      fetchProject()
    }
  }, [id, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (id) {
        await axios.put(`/api/v1/projects/${id}`, { title, description }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Получаем или создаём портфолио
        let portfolioId = null
        const portfoliosRes = await axios.get('/api/v1/portfolios', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (portfoliosRes.data.success && portfoliosRes.data.data.length > 0) {
          portfolioId = portfoliosRes.data.data[0].id
        } else {
          const newPortfolio = await axios.post('/api/v1/portfolios', { title: 'Моё портфолио' }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          portfolioId = newPortfolio.data.data.id
        }
        await axios.post('/api/v1/projects', { title, description, portfolioId }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      navigate('/projects')
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Редактировать проект' : 'Новый проект'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Сохранить
          </Button>
        </form>
      </Box>
    </Container>
  )
}

export default ProjectForm