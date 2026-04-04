import { Box, Typography, Avatar, Divider, Chip, Button } from '@mui/material';

const MinimalTemplate = ({ resume }) => {
  const { personal, bio, skills, projects, softSkills, educations, experiences } = resume.data;
  const avatar_url = personal?.avatar_url;

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar src={avatar_url} sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }} />
        <Typography variant="h4">{personal.full_name}</Typography>
        <Typography variant="body1">{personal.email} | {personal.phone}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">О себе</Typography>
      <Typography variant="body1" paragraph>{bio}</Typography>

      {educations && educations.length > 0 && (
        <>
          <Typography variant="h6">Образование</Typography>
          {educations.map(edu => (
            <Box key={edu.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{edu.institution}</Typography>
              <Typography variant="body2">{edu.degree} {edu.field_of_study && `, ${edu.field_of_study}`}</Typography>
              <Typography variant="caption" color="textSecondary">
                {edu.start_date} — {edu.end_date || 'по настоящее время'}
              </Typography>
              {edu.description && <Typography variant="body2" sx={{ mt: 1 }}>{edu.description}</Typography>}
            </Box>
          ))}
        </>
      )}

      {experiences && experiences.length > 0 && (
        <>
          <Typography variant="h6">Опыт работы</Typography>
          {experiences.map(exp => (
            <Box key={exp.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{exp.position} в {exp.company}</Typography>
              <Typography variant="caption" color="textSecondary">
                {exp.start_date} — {exp.current ? 'настоящее время' : exp.end_date}
              </Typography>
              {exp.description && <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>}
            </Box>
          ))}
        </>
      )}

      <Typography variant="h6">Навыки</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {skills.filter(s => s.included).map(skill => (
          <Typography key={skill.id} variant="body2" sx={{ bgcolor: '#f0f0f0', px: 1, py: 0.5, borderRadius: 1 }}>
            {skill.name}
          </Typography>
        ))}
      </Box>

      {softSkills && softSkills.length > 0 && (
        <>
          <Typography variant="h6">Софт-скиллы</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {softSkills.map((skill) => (
              <Typography key={skill.id} variant="body2">{skill.name}</Typography>
            ))}
          </Box>
        </>
      )}

      <Typography variant="h6">Проекты</Typography>
      {projects.filter(p => p.included).map(project => (
        <Box key={project.id} sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            {project.is_published ? (
              <a href={`/project/public/${project.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                {project.title}
              </a>
            ) : (
              project.title
            )}
          </Typography>
          {project.description && <Typography variant="body2" sx={{ mt: 1 }}>{project.description}</Typography>}
          {project.technologies && project.technologies.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {project.technologies.map(tech => <Chip key={tech} label={tech} size="small" />)}
            </Box>
          )}
          {project.links && (project.links.github || project.links.demo || project.links.other?.length) && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {project.links.github && <Button size="small" href={project.links.github} target="_blank">GitHub</Button>}
              {project.links.demo && <Button size="small" href={project.links.demo} target="_blank">Demo</Button>}
              {project.links.other?.map((link, idx) => <Button key={idx} size="small" href={link.url} target="_blank">{link.name}</Button>)}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default MinimalTemplate;