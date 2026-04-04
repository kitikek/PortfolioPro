import { useEffect, useState } from 'react'
import { Container, Typography, Box, Button, List, ListItem, ListItemText, IconButton, Chip } from '@mui/material'
import { Delete, Edit, Share, Public, Lock } from '@mui/icons-material'
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
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setResumes(res.data.data)
        } else {
          console.error('Неожиданный формат ответа:', res.data)
          setResumes([])
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchResumes()
  }, [navigate, token])

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить резюме?')) return
    try {
      await axios.delete(`/api/v1/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResumes(resumes.filter(r => r.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const copyLink = (id) => {
    const url = `${window.location.origin}/resume/public/${id}`
    navigator.clipboard.writeText(url)
    alert('Ссылка скопирована')
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Дата неизвестна'
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return 'Дата неизвестна'
    return d.toLocaleDateString()
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Мои резюме
        </Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate('/resume/new')}>
          Создать резюме
        </Button>
        <List>
          {resumes.map(resume => (
            <ListItem key={resume.id} secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/resume/edit/${resume.id}`)}>
                  <Edit />
                </IconButton>
                {resume.is_public && (
                  <IconButton edge="end" aria-label="share" onClick={() => copyLink(resume.id)}>
                    <Share />
                  </IconButton>
                )}
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(resume.id)}>
                  <Delete />
                </IconButton>
              </>
            }>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" component="span">
                      {resume.title || 'Без названия'}
                    </Typography>
                    {resume.is_public ? (
                      <Chip icon={<Public />} label="Публичное" size="small" color="success" />
                    ) : (
                      <Chip icon={<Lock />} label="Скрытое" size="small" color="default" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" component="span">
                      Шаблон: {resume.template}
                    </Typography>
                    <br />
                    <Typography variant="caption" component="span" color="textSecondary">
                      Создано: {formatDate(resume.created_at || resume.createdAt)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  )
}

export default Resume