// frontend/src/components/templates/DefaultTemplate.jsx
import { Box, Typography, Avatar, Grid, Paper, Divider, Chip, Button, LinearProgress } from '@mui/material';

const DefaultTemplate = ({ resume }) => {

  console.log('=== DefaultTemplate ===');
  console.log('resume.data:', resume.data);
  console.log('educations:', resume.data?.educations);
  console.log('experiences:', resume.data?.experiences);

  const { personal, bio, skills, projects, softSkills, educations, experiences } = resume.data;
  const avatar_url = personal?.avatar_url;

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
            {personal.linkedin && <Typography variant="body2">🔗 {personal.linkedin}</Typography>}
            {personal.github && <Typography variant="body2">🐙 {personal.github}</Typography>}
            {personal.website && <Typography variant="body2">🌐 {personal.website}</Typography>}
            
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

          {/* Образование */}
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

          {/* Опыт работы */}
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

          {/* Технические навыки с прогресс-барами */}
          <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#F3F4F6' }}>Технические навыки</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {skills.filter(s => s.included).map(skill => (
              <Box key={skill.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ minWidth: 100, color: '#F3F4F6' }}>{skill.name}</Typography>
                {renderSkillLevel(skill.level)}
              </Box>
            ))}
          </Box>

          {/* Проекты */}
          <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#F3F4F6' }}>Проекты</Typography>
          {projects && projects.filter(p => p.included).map(project => (
            <Box key={project.id} sx={{ mb: 3, borderLeft: '2px solid #4B607F', pl: 2 }}>
              <Typography variant="subtitle1">
                {project.is_published ? (
                  <a href={`/project/public/${project.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#F3701E', fontWeight: 'bold' }}>
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