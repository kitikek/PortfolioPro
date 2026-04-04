import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Box, Chip, Grid, Paper, IconButton, Button } from '@mui/material';
import { GitHub, Language, ArrowBack } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PublicProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/api/v1/projects/public/${id}`);
        if (res.data.success) setProject(res.data.data);
        else setError('Проект не найден или скрыт');
      } catch (err) {
        setError(err.response?.data?.error || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <Typography>Загрузка...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!project) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <style>
        {`
          .swiper-button-next, .swiper-button-prev { color: #4B607F !important; }
          .swiper-pagination-bullet-active { background: #4B607F !important; }
        `}
      </style>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}><ArrowBack /></IconButton>
          <Typography variant="h4">{project.title}</Typography>
        </Box>

        {project.images && project.images.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} spaceBetween={20} slidesPerView={1}>
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
              {project.links?.github && <Button component="a" href={project.links.github} target="_blank" startIcon={<GitHub />}>GitHub</Button>}
              {project.links?.demo && <Button component="a" href={project.links.demo} target="_blank" startIcon={<Language />}>Demo</Button>}
              {project.links?.other?.map((link, idx) => <Button key={idx} component="a" href={link.url} target="_blank">{link.name}</Button>)}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PublicProjectPage;