// frontend/src/components/templates/MinimalTemplate.jsx
import { Box, Typography, Avatar, Divider } from '@mui/material';

const MinimalTemplate = ({ resume }) => {
  const { personal, avatar_url, bio, skills, projects, softSkills } = resume.data;

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar src={avatar_url} sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }} />
        <Typography variant="h4">{personal.full_name}</Typography>
        <Typography variant="body1">{personal.email} | {personal.phone}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">About</Typography>
      <Typography variant="body1" paragraph>{bio}</Typography>
      <Typography variant="h6">Skills</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {skills.filter(s => s.included).map(skill => (
          <Typography key={skill.id} variant="body2" sx={{ bgcolor: '#f0f0f0', px: 1, py: 0.5, borderRadius: 1 }}>{skill.name}</Typography>
        ))}
      </Box>
      <Typography variant="h6">Projects</Typography>
      {projects.filter(p => p.included).map(project => (
        <Typography key={project.id} variant="body2">{project.title}</Typography>
      ))}
      {softSkills.length > 0 && (
        <>
          <Typography variant="h6">Soft Skills</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {softSkills.map((skill, idx) => (
              <Typography key={idx} variant="body2">{skill}</Typography>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default MinimalTemplate;