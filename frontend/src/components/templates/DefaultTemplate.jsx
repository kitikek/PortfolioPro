// frontend/src/components/templates/DefaultTemplate.jsx
import { Box, Typography, Avatar, Grid, Paper, Divider, Chip } from '@mui/material';

const DefaultTemplate = ({ resume }) => {
  const { personal, avatar_url, bio, skills, projects, softSkills } = resume.data;

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

          <Typography variant="h6" sx={{ mt: 2 }}>Навыки</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {skills.filter(s => s.included).map(skill => (
              <Chip key={skill.id} label={`${skill.name} (${skill.level}/10)`} />
            ))}
          </Box>

          <Typography variant="h6">Проекты</Typography>
          {projects.filter(p => p.included).map(project => (
            <Box key={project.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{project.title}</Typography>
            </Box>
          ))}

          {softSkills.length > 0 && (
            <>
              <Typography variant="h6">Софт-скиллы</Typography>
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

export default DefaultTemplate;