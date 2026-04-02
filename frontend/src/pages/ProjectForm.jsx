import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { 
  Container, TextField, Button, Typography, Box, Grid, Paper, IconButton, 
  InputAdornment, FormControl, InputLabel, Select, MenuItem, Chip 
} from '@mui/material'
import { Add, Delete, CloudUpload } from '@mui/icons-material'

const ProjectForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [role, setRole] = useState('')
  const [team, setTeam] = useState('')
  const [organization, setOrganization] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [githubLink, setGithubLink] = useState('')
  const [demoLink, setDemoLink] = useState('')
  const [otherLinks, setOtherLinks] = useState([])
  const [newOtherLink, setNewOtherLink] = useState({ name: '', url: '' })
  const [technologies, setTechnologies] = useState([])
  const [newTech, setNewTech] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const res = await axios.get(`/api/v1/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.data && res.data.success) {
            const proj = res.data.data
            setTitle(proj.title || '')
            setDescription(proj.description || '')
            setRole(proj.role || '')
            setTeam(proj.team || '')
            setOrganization(proj.organization || '')
            setStartDate(proj.start_date || '')
            setEndDate(proj.end_date || '')
            setGithubLink(proj.links?.github || '')
            setDemoLink(proj.links?.demo || '')
            setOtherLinks(proj.links?.other || [])
            setTechnologies(proj.technologies || [])
            setImages(proj.images || [])
          }
        } catch (err) {
          console.error(err)
        }
      }
      fetchProject()
    }
  }, [id, token])

  const handleAddOtherLink = () => {
    if (newOtherLink.name && newOtherLink.url) {
      setOtherLinks([...otherLinks, { name: newOtherLink.name, url: newOtherLink.url }])
      setNewOtherLink({ name: '', url: '' })
    }
  }
  const handleRemoveOtherLink = (index) => {
    setOtherLinks(otherLinks.filter((_, i) => i !== index))
  }
  const handleAddTech = () => {
    if (newTech.trim()) {
      setTechnologies([...technologies, newTech.trim()])
      setNewTech('')
    }
  }
  const handleRemoveTech = (index) => {
    setTechnologies(technologies.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      let projectId = id
      if (!projectId) {
        // сначала создаём временный проект? лучше сначала создать проект, потом загружать. Упростим: при создании сначала создаём проект, затем грузим картинки.
        alert('Сначала сохраните проект, затем добавляйте изображения')
        return
      }
      const res = await axios.post(`/api/v1/projects/${projectId}/images`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.success) {
        setImages([...images, res.data.data.imageUrl])
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (index) => {
    if (!id) return
    try {
      await axios.delete(`/api/v1/projects/${id}/images/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setImages(images.filter((_, i) => i !== index))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title,
        description,
        role,
        team,
        organization,
        start_date: startDate || null,
        end_date: endDate || null,
        links: {
          github: githubLink,
          demo: demoLink,
          other: otherLinks
        },
        technologies,
        images
      }
      if (id) {
        await axios.put(`/api/v1/projects/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Сначала нужно получить portfolioId
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
        const createRes = await axios.post('/api/v1/projects', { ...payload, portfolioId }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (createRes.data.success) {
          // После создания можно загрузить картинки, но мы уже не можем. Предлагаем пользователю после создания добавить картинки в редактировании.
        }
      }
      navigate('/projects')
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения')
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Редактировать проект' : 'Новый проект'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={4} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Роль в проекте" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Например: Frontend Lead" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Команда / участники" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Имена или название команды" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Организация / заказчик" value={organization} onChange={(e) => setOrganization(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Дата начала" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Дата окончания" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>

            {/* Ссылки */}
            <Grid item xs={12}>
              <Typography variant="h6">Ссылки</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GitHub" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Demo / Сайт" value={demoLink} onChange={(e) => setDemoLink(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Другие ссылки</Typography>
              {otherLinks.map((link, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip label={`${link.name}: ${link.url}`} onDelete={() => handleRemoveOtherLink(idx)} sx={{ mr: 1 }} />
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" label="Название" value={newOtherLink.name} onChange={(e) => setNewOtherLink({ ...newOtherLink, name: e.target.value })} />
                <TextField size="small" label="URL" value={newOtherLink.url} onChange={(e) => setNewOtherLink({ ...newOtherLink, url: e.target.value })} />
                <Button variant="outlined" onClick={handleAddOtherLink} startIcon={<Add />}>Добавить</Button>
              </Box>
            </Grid>

            {/* Технологии */}
            <Grid item xs={12}>
              <Typography variant="h6">Технологии</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {technologies.map((tech, idx) => (
                  <Chip key={idx} label={tech} onDelete={() => handleRemoveTech(idx)} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" label="Новая технология" value={newTech} onChange={(e) => setNewTech(e.target.value)} />
                <Button variant="outlined" onClick={handleAddTech} startIcon={<Add />}>Добавить</Button>
              </Box>
            </Grid>

            {/* Изображения */}
            <Grid item xs={12}>
              <Typography variant="h6">Изображения</Typography>
              <Button variant="contained" component="label" startIcon={<CloudUpload />} disabled={uploading || !id}>
                Загрузить изображение
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
              {!id && <Typography variant="caption" display="block" color="textSecondary">Сначала сохраните проект, затем добавляйте изображения</Typography>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {images.map((img, idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: 100, height: 100 }}>
                    <img src={img} alt={`preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'rgba(0,0,0,0.5)' }} onClick={() => handleRemoveImage(idx)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">Сохранить</Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  )
}

export default ProjectForm