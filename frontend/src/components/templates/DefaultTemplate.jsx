import { Box, Typography, Avatar, Grid, Paper, Divider, Chip, Button } from '@mui/material';

const DefaultTemplate = ({ resume }) => {
  const { personal, bio, skills, projects, softSkills, educations, experiences } = resume.data;
  const avatar_url = personal?.avatar_url;

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: '1000px', mx: 'auto' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar src={avatar_url} sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }} />
            <Typography variant="h5">{personal.full_name}</Typography>
            <Typography variant="body2" color="textSecondary">{personal.email}</Typography>
            <Typography variant="body2">{personal.phone}</Typography>
            <Divider sx={{ my: 2 }} />
            {personal.linkedin && <Typography variant="body2">LinkedIn: {personal.linkedin}</Typography>}
            {personal.github && <Typography variant="body2">GitHub: {personal.github}</Typography>}
            {personal.website && <Typography variant="body2">Website: {personal.website}</Typography>}
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6">Обо мне</Typography>
          <Typography variant="body1" paragraph>{bio}</Typography>

          {educations && educations.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>Образование</Typography>
              {educations.map(edu => (
                <Box key={edu.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{edu.institution}</Typography>
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
              <Typography variant="h6" sx={{ mt: 2 }}>Опыт работы</Typography>
              {experiences.map(exp => (
                <Box key={exp.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{exp.position} в {exp.company}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {exp.start_date} — {exp.current ? 'настоящее время' : exp.end_date}
                  </Typography>
                  {exp.description && <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>}
                </Box>
              ))}
            </>
          )}

          <Typography variant="h6" sx={{ mt: 2 }}>Навыки</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {skills.filter(s => s.included).map(skill => (
              <Chip key={skill.id} label={`${skill.name} (${skill.level}/10)`} />
            ))}
          </Box>

          {softSkills && softSkills.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>Софт-скиллы</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {softSkills.map((skill) => (
                  <Chip key={skill.id} label={skill.name} variant="outlined" />
                ))}
              </Box>
            </>
          )}

          <Typography variant="h6">Проекты</Typography>
          {projects.filter(p => p.included).map(project => (
            <Box key={project.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
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
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DefaultTemplate;