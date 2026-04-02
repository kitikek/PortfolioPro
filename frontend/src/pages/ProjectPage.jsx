import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Container, Typography, Box, Chip, Grid, Paper, IconButton, Button } from '@mui/material'
import { Edit, Delete, GitHub, Language, ArrowBack } from '@mui/icons-material'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const ProjectPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/api/v1/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) setProject(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id, token])

  const handleDelete = async () => {
    if (window.confirm('Удалить проект?')) {
      await axios.delete(`/api/v1/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/projects')
    }
  }

  if (loading) return <Typography>Загрузка...</Typography>
  if (!project) return <Typography>Проект не найден</Typography>

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Стили для стрелок и точек пагинации Swiper */}
      <style>
        {`
          .swiper-button-next,
          .swiper-button-prev {
            color: #4B607F !important;
            background: transparent !important;
            width: 40px;
            height: 40px;
            transition: color 0.2s;
          }
          .swiper-button-next:hover,
          .swiper-button-prev:hover {
            color: #2F3E52 !important;
          }
          .swiper-button-next:after,
          .swiper-button-prev:after {
            font-size: 28px;
            font-weight: bold;
          }
          .swiper-pagination-bullet {
            background: #4B607F !important;
            opacity: 0.5;
          }
          .swiper-pagination-bullet-active {
            background: #4B607F !important;
            opacity: 1;
          }
        `}
      </style>

      <Paper sx={{ p: 3 }}>
        {/* Кнопка "Назад" и заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/projects')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>{project.title}</Typography>
          <Box>
            <IconButton onClick={() => navigate(`/projects/edit/${project.id}`)}><Edit /></IconButton>
            <IconButton onClick={handleDelete} color="error"><Delete /></IconButton>
          </Box>
        </Box>

        {/* Галерея */}
        {project.images && project.images.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              style={{ borderRadius: 16 }}
            >
              {project.images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img src={img} alt={`slide ${idx}`} style={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 16 }} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6">Описание</Typography>
            <Typography paragraph>{project.description || 'Нет описания'}</Typography>

            {project.technologies?.length > 0 && (
              <>
                <Typography variant="h6">Технологии</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {project.technologies.map(tech => <Chip key={tech} label={tech} />)}
                </Box>
              </>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            {project.role && <Typography><strong>Роль:</strong> {project.role}</Typography>}
            {project.team && <Typography><strong>Команда:</strong> {project.team}</Typography>}
            {project.organization && <Typography><strong>Организация:</strong> {project.organization}</Typography>}
            {project.start_date && <Typography><strong>Даты:</strong> {project.start_date} {project.end_date && `— ${project.end_date}`}</Typography>}
            
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
              {project.links?.github && (
                <Button
                  component="a"
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHub />}
                  variant="text"
                  size="small"
                  sx={{ textTransform: 'none', px: 1, minWidth: 'auto' }}
                >
                  GitHub
                </Button>
              )}
              {project.links?.demo && (
                <Button
                  component="a"
                  href={project.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<Language />}
                  variant="text"
                  size="small"
                  sx={{ textTransform: 'none', px: 1, minWidth: 'auto' }}
                >
                  Demo
                </Button>
              )}
              {project.links?.other?.map((link, idx) => (
                <Button
                  key={idx}
                  component="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="text"
                  size="small"
                  sx={{ textTransform: 'none', px: 1, minWidth: 'auto' }}
                >
                  {link.name}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default ProjectPage