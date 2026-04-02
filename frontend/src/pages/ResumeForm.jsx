import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Box, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Checkbox, FormControlLabel, List, ListItem, ListItemText,
  IconButton, Chip, Grid, Paper, Avatar, Switch
} from '@mui/material';
import { Delete, Add, PhotoCamera } from '@mui/icons-material';

const ResumeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [title, setTitle] = useState('');               // <-- НОВОЕ СОСТОЯНИЕ
  const [template, setTemplate] = useState('default');
  const [isPublic, setIsPublic] = useState(false);
  const [personal, setPersonal] = useState({
    full_name: '', email: '', phone: '', linkedin: '', github: '', website: '', avatar_url: ''
  });
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState({});
  const [softSkills, setSoftSkills] = useState([]);
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [userRes, skillsRes, projectsRes] = await Promise.all([
          axios.get('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/skills', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/projects/me', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const user = userRes.data.success ? userRes.data.data : userRes.data;
        setPersonal({
          full_name: user.full_name || '',
          email: user.email || '',
          phone: user.contacts?.phone || '',
          linkedin: user.contacts?.linkedin || '',
          github: user.contacts?.github || '',
          website: user.contacts?.website || '',
          avatar_url: user.avatar_url || ''
        });
        setAvatarPreview(user.avatar_url || '');
        setBio(user.bio || '');

        let skillsList = [];
        let initialSelected = {};
        if (skillsRes.data.success && Array.isArray(skillsRes.data.data)) {
          skillsList = skillsRes.data.data;
          setSkills(skillsList);
          skillsList.forEach(skill => {
            initialSelected[skill.id] = {
              name: skill.name,
              level: skill.level,
              included: true
            };
          });
          setSelectedSkills(initialSelected);
        }

        let projectsList = [];
        let initialSelectedProj = {};
        if (projectsRes.data.success && Array.isArray(projectsRes.data.data)) {
          projectsList = projectsRes.data.data;
          setProjects(projectsList);
          projectsList.forEach(proj => {
            initialSelectedProj[proj.id] = {
              title: proj.title,
              included: true
            };
          });
          setSelectedProjects(initialSelectedProj);
        }

        if (id) {
          const resumeRes = await axios.get(`/api/v1/resumes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resumeRes.data.success) {
            const resume = resumeRes.data.data;
            setTitle(resume.title || '');               // <-- загружаем название
            setTemplate(resume.template);
            setIsPublic(resume.is_public);
            const data = resume.data || {};

            if (data.personal) setPersonal(prev => ({ ...prev, ...data.personal }));
            if (data.bio !== undefined) setBio(data.bio);

            if (data.skills && skillsList.length) {
              const updatedSelected = { ...initialSelected };
              data.skills.forEach(s => {
                if (updatedSelected[s.id]) {
                  updatedSelected[s.id].included = s.included;
                  if (s.level) updatedSelected[s.id].level = s.level;
                }
              });
              setSelectedSkills(updatedSelected);
            }

            if (data.projects && projectsList.length) {
              const updatedSelectedProj = { ...initialSelectedProj };
              data.projects.forEach(p => {
                if (updatedSelectedProj[p.id]) {
                  updatedSelectedProj[p.id].included = p.included;
                }
              });
              setSelectedProjects(updatedSelectedProj);
            }

            let loadedSoftSkills = [];
            if (data.softSkills) {
              if (Array.isArray(data.softSkills)) {
                loadedSoftSkills = data.softSkills;
              } else if (typeof data.softSkills === 'string') {
                try {
                  loadedSoftSkills = JSON.parse(data.softSkills);
                } catch (e) {
                  console.error('Ошибка парсинга softSkills', e);
                }
              }
            }
            setSoftSkills(loadedSoftSkills);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [token, navigate, id]);

  const handlePersonalChange = (field) => (e) => {
    setPersonal({ ...personal, [field]: e.target.value });
  };

  const handleSkillToggle = (skillId) => {
    setSelectedSkills({
      ...selectedSkills,
      [skillId]: {
        ...selectedSkills[skillId],
        included: !selectedSkills[skillId]?.included
      }
    });
  };

  const handleProjectToggle = (projectId) => {
    setSelectedProjects({
      ...selectedProjects,
      [projectId]: {
        ...selectedProjects[projectId],
        included: !selectedProjects[projectId]?.included
      }
    });
  };

  const handleAddSoftSkill = () => {
    if (newSoftSkill.trim()) {
      setSoftSkills([...softSkills, newSoftSkill.trim()]);
      setNewSoftSkill('');
    }
  };

  const handleRemoveSoftSkill = (index) => {
    setSoftSkills(softSkills.filter((_, i) => i !== index));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await axios.post('/api/v1/auth/upload-avatar', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const avatarUrl = res.data.data.avatar_url;
        setPersonal(prev => ({ ...prev, avatar_url: avatarUrl }));
        setAvatarPreview(avatarUrl);
        alert('Аватар загружен');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки аватара');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resumeData = {
        personal: {
          full_name: personal.full_name,
          email: personal.email,
          phone: personal.phone,
          linkedin: personal.linkedin,
          github: personal.github,
          website: personal.website,
          avatar_url: personal.avatar_url || ''
        },
        bio,
        skills: Object.entries(selectedSkills).map(([id, skill]) => ({
          id: parseInt(id),
          name: skill.name,
          level: skill.level,
          included: skill.included
        })),
        projects: Object.entries(selectedProjects).map(([id, proj]) => ({
          id: parseInt(id),
          title: proj.title,
          included: proj.included
        })),
        softSkills: softSkills
      };

      const payload = {
        title: title.trim() || 'Без названия',   // <-- передаём название
        template,
        is_public: isPublic,
        data: resumeData
      };

      if (id) {
        await axios.put(`/api/v1/resumes/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/v1/resumes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/resume');
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения резюме');
    }
  };

  if (loading) return <Typography>Загрузка...</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Редактировать резюме' : 'Создать резюме'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* НОВЫЙ БЛОК: Название резюме */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Название резюме"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  margin="normal"
                  required
                  helperText="Например: «Резюме для фронтенд‑разработчика»"
                />
              </Paper>
            </Grid>

            {/* Шаблон и публичность */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Шаблон</InputLabel>
                      <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
                        <MenuItem value="default">Default</MenuItem>
                        <MenuItem value="modern">Modern</MenuItem>
                        <MenuItem value="minimal">Minimal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                      label="Опубликовать резюме (доступно по ссылке)"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Аватар */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Фото</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  {avatarPreview && <Avatar src={avatarPreview} sx={{ width: 80, height: 80 }} />}
                  <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                    Загрузить фото
                    <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Личная информация */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Личная информация</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="ФИО" value={personal.full_name} onChange={handlePersonalChange('full_name')} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" value={personal.email} onChange={handlePersonalChange('email')} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Телефон" value={personal.phone} onChange={handlePersonalChange('phone')} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="LinkedIn" value={personal.linkedin} onChange={handlePersonalChange('linkedin')} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="GitHub" value={personal.github} onChange={handlePersonalChange('github')} margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Веб-сайт" value={personal.website} onChange={handlePersonalChange('website')} margin="normal" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Биография" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} margin="normal" />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Навыки */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Навыки</Typography>
                <List>
                  {skills.map(skill => (
                    <ListItem key={skill.id} dense>
                      <FormControlLabel
                        control={<Checkbox checked={selectedSkills[skill.id]?.included || false} onChange={() => handleSkillToggle(skill.id)} />}
                        label={`${skill.name} (уровень ${skill.level})`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Проекты */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Проекты</Typography>
                <List>
                  {projects.map(project => (
                    <ListItem key={project.id} dense>
                      <FormControlLabel
                        control={<Checkbox checked={selectedProjects[project.id]?.included || false} onChange={() => handleProjectToggle(project.id)} />}
                        label={project.title}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Софт-скиллы */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Софт-скиллы</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    label="Новый софт-скилл"
                    value={newSoftSkill}
                    onChange={(e) => setNewSoftSkill(e.target.value)}
                    size="small"
                    sx={{ mr: 1, flexGrow: 1 }}
                  />
                  <Button variant="contained" onClick={handleAddSoftSkill} startIcon={<Add />}>
                    Добавить
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {softSkills.map((skill, index) => (
                    <Chip key={index} label={skill} onDelete={() => handleRemoveSoftSkill(index)} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Кнопки */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/resume')}>Отмена</Button>
                <Button type="submit" variant="contained" color="primary">Сохранить</Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default ResumeForm;