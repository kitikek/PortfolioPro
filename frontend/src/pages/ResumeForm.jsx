import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { Container, TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material'

const ResumeForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [template, setTemplate] = useState('default')
  const [data, setData] = useState({})
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (id) {
      const fetchResume = async () => {
        try {
          const res = await axios.get(`/api/v1/resumes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.data && res.data.success) {
            setTemplate(res.data.data.template)
            setData(res.data.data.data || {})
          }
        } catch (err) {
          console.error(err)
        }
      }
      fetchResume()
    }
  }, [id, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { template, data: data || {} }
      if (id) {
        await axios.put(`/api/v1/resumes/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/v1/resumes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      navigate('/resume')
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения')
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Редактировать резюме' : 'Создать резюме'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Шаблон</InputLabel>
            <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="modern">Modern</MenuItem>
              <MenuItem value="minimal">Minimal</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Данные (JSON)"
            multiline
            rows={10}
            value={JSON.stringify(data, null, 2)}
            onChange={(e) => {
              try {
                setData(JSON.parse(e.target.value))
              } catch (err) {
                // invalid JSON, ignore
              }
            }}
            margin="normal"
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Сохранить
          </Button>
        </form>
      </Box>
    </Container>
  )
}

export default ResumeForm