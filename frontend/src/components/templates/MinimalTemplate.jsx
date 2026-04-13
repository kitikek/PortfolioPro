import { Box, Typography, Avatar, Grid, Paper, Divider, Chip, Button, LinearProgress } from '@mui/material';

const MinimalTemplate = ({ resume }) => {
  const { personal, bio, skills, projects, softSkills, educations, experiences } = resume.data;
  const avatar_url = personal?.avatar_url;

  const renderSkillLevel = (level) => {
    const percent = (level / 10) * 100;
    return <LinearProgress variant="determinate" value={percent} sx={{ width: 120, height: 8, borderRadius: 4, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#1976d2' } }} />;
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: '1000px', mx: 'auto', bgcolor: '#fff', color: '#000' }}>
      <Grid container spacing={4}>
        {/* Левая колонка */}
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar src={avatar_url} sx={{ width: 150, height: 150, mx: 'auto', mb: 2, border: '3px solid #1976d2' }} />
            <Typography variant="h5" sx={{ color: '#000' }}>{personal.full_name}</Typography>
            <Typography variant="body2" sx={{ color: '#333' }}>{personal.email}</Typography>
            <Typography variant="body2" sx={{ color: '#333' }}>{personal.phone}</Typography>
            <Divider sx={{ my: 2 }} />
            
            {/* Ссылки как кнопки (чипсы) */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }}>
              {personal.linkedin && (
                <Chip 
                  label="LinkedIn" 
                  component="a" 
                  href={personal.linkedin} 
                  target="_blank" 
                  clickable 
                  sx={{ bgcolor: '#e3f2fd', color: '#000', '&:hover': { bgcolor: '#bbdefb' } }}
                />
              )}
              {personal.github && (
                <Chip 
                  label="GitHub" 
                  component="a" 
                  href={personal.github} 
                  target="_blank" 
                  clickable 
                  sx={{ bgcolor: '#e3f2fd', color: '#000', '&:hover': { bgcolor: '#bbdefb' } }}
                />
              )}
              {personal.website && (
                <Chip 
                  label="Website" 
                  component="a" 
                  href={personal.website} 
                  target="_blank" 
                  clickable 
                  sx={{ bgcolor: '#e3f2fd', color: '#000', '&:hover': { bgcolor: '#bbdefb' } }}
                />
              )}
            </Box>
            
            {softSkills && softSkills.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ color: '#000' }}>Софт-скиллы</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mt: 1 }}>
                  {softSkills.map(skill => <Chip key={skill.id} label={skill.name} size="small" variant="outlined" sx={{ color: '#000', borderColor: '#1976d2' }} />)}
                </Box>
              </>
            )}
          </Box>
        </Grid>

        {/* Правая колонка (без изменений) */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom sx={{ color: '#000' }}>О себе</Typography>
          <Typography variant="body1" paragraph sx={{ color: '#000' }}>{bio || 'Нет информации'}</Typography>

          {/* Образование */}
          {educations && educations.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#000' }}>Образование</Typography>
              {educations.map(edu => (
                <Box key={edu.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#000' }}>{edu.institution}</Typography>
                  <Typography variant="body2" sx={{ color: '#333' }}>{edu.degree} {edu.field_of_study && `, ${edu.field_of_study}`}</Typography>
                  <Typography variant="caption" sx={{ color: '#555' }}>
                    {edu.start_date || '?'} — {edu.end_date || 'по настоящее время'}
                  </Typography>
                  {edu.description && <Typography variant="body2" sx={{ mt: 1, color: '#333' }}>{edu.description}</Typography>}
                </Box>
              ))}
            </>
          )}

          {/* Опыт работы */}
          {experiences && experiences.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#000' }}>Опыт работы</Typography>
              {experiences.map(exp => (
                <Box key={exp.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#000' }}>{exp.position} в {exp.company}</Typography>
                  <Typography variant="caption" sx={{ color: '#555' }}>
                    {exp.start_date || '?'} — {exp.current ? 'настоящее время' : exp.end_date || '?'}
                  </Typography>
                  {exp.description && <Typography variant="body2" sx={{ mt: 1, color: '#333' }}>{exp.description}</Typography>}
                </Box>
              ))}
            </>
          )}

          {/* Технические навыки */}
          <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#000' }}>Технические навыки</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {skills.filter(s => s.included).map(skill => (
              <Box key={skill.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ minWidth: 100, color: '#000' }}>{skill.name}</Typography>
                {renderSkillLevel(skill.level)}
              </Box>
            ))}
          </Box>

          {/* Проекты */}
          <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#000' }}>Проекты</Typography>
          {projects && projects.filter(p => p.included).map(project => (
            <Box key={project.id} sx={{ mb: 3, borderLeft: '2px solid #1976d2', pl: 2 }}>
              <Typography variant="subtitle1">
                {project.is_published ? (
                  <a href={`/#/project/public/${project.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                    {project.title}
                  </a>
                ) : (
                  <span style={{ color: '#555' }}>{project.title}</span>
                )}
              </Typography>
              {project.description && <Typography variant="body2" sx={{ mt: 0.5, color: '#333' }}>{project.description}</Typography>}
              {project.technologies && project.technologies.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {project.technologies.map(tech => <Chip key={tech} label={tech} size="small" sx={{ color: '#000', bgcolor: '#f0f0f0' }} />)}
                </Box>
              )}
              {project.links && (project.links.github || project.links.demo) && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  {project.links.github && <Button size="small" href={project.links.github} target="_blank" sx={{ color: '#1976d2' }}>GitHub</Button>}
                  {project.links.demo && <Button size="small" href={project.links.demo} target="_blank" sx={{ color: '#1976d2' }}>Demo</Button>}
                </Box>
              )}
            </Box>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MinimalTemplate;