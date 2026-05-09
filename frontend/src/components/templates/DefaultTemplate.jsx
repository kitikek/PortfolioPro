import { Box, Typography, Avatar, Grid, Paper, Divider, Chip, Button, LinearProgress } from '@mui/material';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const DefaultTemplate = ({ resume }) => {
  const { personal, bio, skills, projects, softSkills, educations, experiences } = resume.data;
  const avatar_url = personal?.avatar_url;

  // Данные для радарной диаграммы
  const radarLabels = skills.filter(s => s.included).map(s => s.name);
  const radarDataValues = skills.filter(s => s.included).map(s => s.level);

  const radarChartData = {
    labels: radarLabels,
    datasets: [{
      label: 'Уровень (1-10)',
      data: radarDataValues,
      backgroundColor: 'rgba(243, 112, 30, 0.2)',
      borderColor: '#F3701E',
      borderWidth: 2,
      pointBackgroundColor: '#4B607F',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#F3701E',
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2, backdropColor: 'transparent', color: '#9CA3AF' },
        grid: { color: '#2D3748' },
        pointLabels: { color: '#F3F4F6' }
      }
    },
    plugins: {
      legend: { labels: { color: '#F3F4F6' } },
      tooltip: { bodyColor: '#F3F4F6', titleColor: '#F3F4F6' }
    }
  };

  const renderSkillLevel = (level) => {
    const percent = (level / 10) * 100;
    return <LinearProgress variant="determinate" value={percent} sx={{ width: 120, height: 8, borderRadius: 4, bgcolor: '#2D3748', '& .MuiLinearProgress-bar': { bgcolor: '#F3701E' } }} />;
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: '1000px', mx: 'auto', bgcolor: '#111827', color: '#F3F4F6' }}>
      <Grid container spacing={4}>
        {/* Левая колонка */}
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar src={avatar_url} sx={{ width: 150, height: 150, mx: 'auto', mb: 2, border: '3px solid #4B607F' }} />
            <Typography variant="h5">{personal.full_name}</Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{personal.email}</Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{personal.phone}</Typography>
            <Divider sx={{ my: 2, bgcolor: '#2D3748' }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }}>
              {personal.linkedin && (
                <Chip 
                  label="LinkedIn" 
                  component="a" 
                  href={personal.linkedin} 
                  target="_blank" 
                  clickable 
                  sx={{ borderColor: '#4B607F', color: '#F3F4F6', '&:hover': { bgcolor: '#1F2937' } }}
                  variant="outlined"
                />
              )}
              {personal.github && (
                <Chip 
                  label="GitHub" 
                  component="a" 
                  href={personal.github} 
                  target="_blank" 
                  clickable 
                  sx={{ borderColor: '#4B607F', color: '#F3F4F6', '&:hover': { bgcolor: '#1F2937' } }}
                  variant="outlined"
                />
              )}
              {personal.website && (
                <Chip 
                  label="Website" 
                  component="a" 
                  href={personal.website} 
                  target="_blank" 
                  clickable 
                  sx={{ borderColor: '#4B607F', color: '#F3F4F6', '&:hover': { bgcolor: '#1F2937' } }}
                  variant="outlined"
                />
              )}
            </Box>
            
            {softSkills && softSkills.length > 0 && (
              <>
                <Divider sx={{ my: 2, bgcolor: '#2D3748' }} />
                <Typography variant="subtitle1" sx={{ color: '#F3F4F6' }}>Софт-скиллы</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mt: 1 }}>
                  {softSkills.map(skill => <Chip key={skill.id} label={skill.name} size="small" variant="outlined" sx={{ borderColor: '#4B607F', color: '#F3F4F6' }} />)}
                </Box>
              </>
            )}
          </Box>
        </Grid>

        {/* Правая колонка */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom sx={{ color: '#F3F4F6' }}>О себе</Typography>
          <Typography variant="body1" paragraph sx={{ color: '#9CA3AF' }}>{bio || 'Нет информации'}</Typography>

          {educations && educations.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#F3F4F6' }}>Образование</Typography>
              {educations.map(edu => (
                <Box key={edu.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#F3F4F6' }}>{edu.institution}</Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{edu.degree} {edu.field_of_study && `, ${edu.field_of_study}`}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {edu.start_date || '?'} — {edu.end_date || 'по настоящее время'}
                  </Typography>
                  {edu.description && <Typography variant="body2" sx={{ mt: 1, color: '#9CA3AF' }}>{edu.description}</Typography>}
                </Box>
              ))}
            </>
          )}

          {experiences && experiences.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#F3F4F6' }}>Опыт работы</Typography>
              {experiences.map(exp => (
                <Box key={exp.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#F3F4F6' }}>{exp.position} в {exp.company}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {exp.start_date || '?'} — {exp.current ? 'настоящее время' : exp.end_date || '?'}
                  </Typography>
                  {exp.description && <Typography variant="body2" sx={{ mt: 1, color: '#9CA3AF' }}>{exp.description}</Typography>}
                </Box>
              ))}
            </>
          )}

          <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#F3F4F6' }}>Технические навыки</Typography>
          {radarLabels.length > 0 && (
            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mb: 3 }}>
              <Radar data={radarChartData} options={radarOptions} />
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {skills.filter(s => s.included).map(skill => (
              <Box key={skill.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ minWidth: 100, color: '#F3F4F6' }}>{skill.name}</Typography>
                {renderSkillLevel(skill.level)}
              </Box>
            ))}
          </Box>

          <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#F3F4F6' }}>Проекты</Typography>
          {projects && projects.filter(p => p.included).map(project => (
            <Box key={project.id} sx={{ mb: 3, borderLeft: '2px solid #4B607F', pl: 2 }}>
              <Typography variant="subtitle1">
                {project.is_published ? (
                  <a href={`/#/project/public/${project.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#F3701E', fontWeight: 'bold' }}>
                    {project.title}
                  </a>
                ) : (
                  <span style={{ color: '#9CA3AF' }}>{project.title}</span>
                )}
              </Typography>
              {project.description && <Typography variant="body2" sx={{ mt: 0.5, color: '#9CA3AF' }}>{project.description}</Typography>}
              {project.technologies && project.technologies.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {project.technologies.map(tech => <Chip key={tech} label={tech} size="small" sx={{ bgcolor: '#2D3748', color: '#F3F4F6' }} />)}
                </Box>
              )}
              {project.links && (project.links.github || project.links.demo) && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  {project.links.github && <Button size="small" href={project.links.github} target="_blank" sx={{ color: '#F3701E' }}>GitHub</Button>}
                  {project.links.demo && <Button size="small" href={project.links.demo} target="_blank" sx={{ color: '#F3701E' }}>Demo</Button>}
                </Box>
              )}
            </Box>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DefaultTemplate;