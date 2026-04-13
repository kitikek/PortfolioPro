import { Box, Typography, Avatar, Divider, Chip, Button, Paper } from '@mui/material';

const ModernTemplate = ({ resume }) => {
  const { personal, bio, skills, projects, softSkills, educations, experiences } = resume.data;
  const avatar_url = personal?.avatar_url;

  // Вспомогательная функция для проверки наличия хотя бы одной ссылки
  const hasAnyLink = (links) => {
    if (!links) return false;
    const hasGithub = links.github && links.github.trim() !== '';
    const hasDemo = links.demo && links.demo.trim() !== '';
    const hasOther = links.other && Array.isArray(links.other) && links.other.length > 0;
    return hasGithub || hasDemo || hasOther;
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: '800px', mx: 'auto', p: 4, bgcolor: '#fafafa', color: '#000' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar src={avatar_url} sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#1976d2' }} />
        <Typography variant="h3" gutterBottom sx={{ color: '#000' }}>{personal.full_name}</Typography>
        <Typography variant="body1" sx={{ color: '#333' }}>{personal.email} | {personal.phone}</Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {personal.linkedin && <Chip label="LinkedIn" component="a" href={personal.linkedin} clickable sx={{ color: '#000', bgcolor: '#e3f2fd' }} />}
          {personal.github && <Chip label="GitHub" component="a" href={personal.github} clickable sx={{ color: '#000', bgcolor: '#e3f2fd' }} />}
          {personal.website && <Chip label="Website" component="a" href={personal.website} clickable sx={{ color: '#000', bgcolor: '#e3f2fd' }} />}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom sx={{ color: '#000' }}>О себе</Typography>
      <Typography variant="body1" paragraph sx={{ mb: 3, color: '#000' }}>{bio || 'Нет информации'}</Typography>

      {/* Образование */}
      {educations && educations.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ color: '#000' }}>Образование</Typography>
          {educations.map(edu => (
            <Box key={edu.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#000' }}>{edu.institution}</Typography>
              <Typography variant="body2" sx={{ color: '#333' }}>{edu.degree} {edu.field_of_study && `, ${edu.field_of_study}`}</Typography>
              <Typography variant="caption" sx={{ color: '#555' }}>
                {edu.start_date} — {edu.end_date || 'настоящее время'}
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
                {exp.start_date} — {exp.current ? 'настоящее время' : exp.end_date}
              </Typography>
              {exp.description && <Typography variant="body2" sx={{ mt: 1, color: '#333' }}>{exp.description}</Typography>}
            </Box>
          ))}
        </>
      )}

      {/* Технические навыки – чипсы */}
      <Typography variant="h5" gutterBottom sx={{ mt: 2, color: '#000' }}>Технические навыки</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {skills.filter(s => s.included).map(skill => (
          <Chip key={skill.id} label={`${skill.name} (${skill.level}/10)`} color="primary" variant="outlined" sx={{ color: '#000', borderColor: '#1976d2' }} />
        ))}
      </Box>

      {/* Софт-скиллы – чипсы */}
      {softSkills && softSkills.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ color: '#000' }}>Софт-скиллы</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {softSkills.map(skill => (
              <Chip key={skill.id} label={skill.name} variant="outlined" sx={{ color: '#000', borderColor: '#1976d2' }} />
            ))}
          </Box>
        </>
      )}

      {/* Проекты */}
      <Typography variant="h5" gutterBottom sx={{ color: '#000' }}>Проекты</Typography>
      {projects.filter(p => p.included).map(project => (
        <Box key={project.id} sx={{ mb: 3 }}>
          <Typography variant="subtitle1">
            {project.is_published ? (
              <a href={`/#/project/public/${project.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2' }}>
                {project.title}
              </a>
            ) : (
              <span style={{ color: '#555' }}>{project.title}</span>
            )}
          </Typography>
          {project.description && <Typography variant="body2" sx={{ mt: 1, color: '#333' }}>{project.description}</Typography>}
          {project.technologies && project.technologies.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {project.technologies.map(tech => <Chip key={tech} label={tech} size="small" sx={{ color: '#000', bgcolor: '#f0f0f0' }} />)}
            </Box>
          )}
          
          {/* Ссылки – показываем только если есть хотя бы одна непустая */}
          {hasAnyLink(project.links) && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {project.links.github && project.links.github.trim() !== '' && (
                <Button size="small" href={project.links.github} target="_blank" sx={{ color: '#1976d2' }}>GitHub</Button>
              )}
              {project.links.demo && project.links.demo.trim() !== '' && (
                <Button size="small" href={project.links.demo} target="_blank" sx={{ color: '#1976d2' }}>Demo</Button>
              )}
              {project.links.other && Array.isArray(project.links.other) && project.links.other.map((link, idx) => (
                link.url && link.url.trim() !== '' && (
                  <Button key={idx} size="small" href={link.url} target="_blank" sx={{ color: '#1976d2' }}>
                    {link.name || 'Ссылка'}
                  </Button>
                )
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Paper>
  );
};

export default ModernTemplate;