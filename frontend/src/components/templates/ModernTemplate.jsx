// frontend/src/components/templates/ModernTemplate.jsx
import { Box, Typography, Avatar, Grid, Paper, Divider, Chip } from '@mui/material';

const ModernTemplate = ({ resume }) => {
  const { personal, avatar_url, bio, skills, projects, softSkills, educations, experiences } = resume.data;

  return (
    <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar src={avatar_url} sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: '4px solid #1976d2' }} />
          <Typography variant="h4" gutterBottom>{personal.full_name}</Typography>
          <Typography variant="subtitle1" color="primary">{personal.email}</Typography>
          <Typography variant="body2">{personal.phone}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box>
            {personal.linkedin && <Typography variant="body2">🔗 {personal.linkedin}</Typography>}
            {personal.github && <Typography variant="body2">💻 {personal.github}</Typography>}
            {personal.website && <Typography variant="body2">🌐 {personal.website}</Typography>}
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>О себе</Typography>
          <Typography variant="body1" paragraph>{bio}</Typography>

          {educations && educations.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom>Образование</Typography>
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
              <Typography variant="h5" gutterBottom>Опыт работы</Typography>
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

          <Typography variant="h5" gutterBottom>Технические навыки</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {skills.filter(s => s.included).map(skill => (
              <Chip key={skill.id} label={`${skill.name} (${skill.level}/10)`} color="primary" variant="outlined" />
            ))}
          </Box>

          <Typography variant="h5" gutterBottom>Проекты</Typography>
          {projects.filter(p => p.included).map(project => (
            <Box key={project.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{project.title}</Typography>
            </Box>
          ))}

          {softSkills.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom>Софт-скиллы</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {softSkills.map((skill, idx) => (
                  <Chip key={idx} label={skill} variant="outlined" />
                ))}
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ModernTemplate;