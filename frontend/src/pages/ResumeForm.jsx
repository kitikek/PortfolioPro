import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';

const ResumeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Состояние формы
  const [template, setTemplate] = useState('default');
  const [personal, setPersonal] = useState({
    full_name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    website: ''
  });
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);      // все навыки пользователя
  const [selectedSkills, setSelectedSkills] = useState({}); // { skillId: { name, level, included } }
  const [projects, setProjects] = useState([]);  // все проекты пользователя
  const [selectedProjects, setSelectedProjects] = useState({}); // { projectId: { title, included } }
  const [softSkills, setSoftSkills] = useState([]); // массив строк софт-скиллов
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // Загрузка данных пользователя
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Получаем текущего пользователя
        const userRes = await axios.get('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.data && userRes.data.success) {
          const user = userRes.data.data;
          setPersonal({
            full_name: user.full_name || '',
            email: user.email || '',
            phone: user.contacts?.phone || '',
            linkedin: user.contacts?.linkedin || '',
            github: user.contacts?.github || '',
            website: user.contacts?.website || ''
          });
          setBio(user.bio || '');
        } else {
          // Fallback, если ответ без success
          const user = userRes.data;
          setPersonal({
            full_name: user.full_name || '',
            email: user.email || '',
            phone: user.contacts?.phone || '',
            linkedin: user.contacts?.linkedin || '',
            github: user.contacts?.github || '',
            website: user.contacts?.website || ''
          });
          setBio(user.bio || '');
        }

        // Получаем навыки пользователя
        const skillsRes = await axios.get('/api/v1/skills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (skillsRes.data && skillsRes.data.success && Array.isArray(skillsRes.data.data)) {
          const skillsList = skillsRes.data.data;
          setSkills(skillsList);
          // По умолчанию все навыки включены
          const initialSelected = {};
          skillsList.forEach(skill => {
            initialSelected[skill.id] = {
              name: skill.name,
              level: skill.level,
              included: true
            };
          });
          setSelectedSkills(initialSelected);
        }

        // Получаем проекты пользователя
        const projectsRes = await axios.get('/api/v1/projects/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (projectsRes.data && projectsRes.data.success && Array.isArray(projectsRes.data.data)) {
          const projectsList = projectsRes.data.data;
          setProjects(projectsList);
          // По умолчанию все проекты включены
          const initialSelectedProj = {};
          projectsList.forEach(proj => {
            initialSelectedProj[proj.id] = {
              title: proj.title,
              included: true
            };
          });
          setSelectedProjects(initialSelectedProj);
        }

        // Если редактируем существующее резюме, загружаем его настройки
        if (id) {
          const resumeRes = await axios.get(`/api/v1/resumes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resumeRes.data && resumeRes.data.success) {
            const resume = resumeRes.data.data;
            setTemplate(resume.template);
            const data = resume.data || {};
            if (data.personal) {
              setPersonal(prev => ({ ...prev, ...data.personal }));
            }
            if (data.bio !== undefined) setBio(data.bio);
            if (data.skills) {
              const updatedSelected = { ...selectedSkills };
              data.skills.forEach(s => {
                if (updatedSelected[s.id]) {
                  updatedSelected[s.id].included = s.included;
                  if (s.level) updatedSelected[s.id].level = s.level;
                }
              });
              setSelectedSkills(updatedSelected);
            }
            if (data.projects) {
              const updatedSelectedProj = { ...selectedProjects };
              data.projects.forEach(p => {
                if (updatedSelectedProj[p.id]) {
                  updatedSelectedProj[p.id].included = p.included;
                }
              });
              setSelectedProjects(updatedSelectedProj);
            }
            if (data.softSkills) setSoftSkills(data.softSkills);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    fetchData();
  }, [token, navigate, id]);

  // Обработчики изменения полей
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Формируем объект data для сохранения
      const resumeData = {
        personal: {
          full_name: personal.full_name,
          email: personal.email,
          phone: personal.phone,
          linkedin: personal.linkedin,
          github: personal.github,
          website: personal.website
        },
        bio: bio,
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
        template,
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Редактировать резюме' : 'Создать резюме'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Шаблон */}
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Шаблон</InputLabel>
                <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="modern">Modern</MenuItem>
                  <MenuItem value="minimal">Minimal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Личная информация */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Личная информация</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ФИО"
                      value={personal.full_name}
                      onChange={handlePersonalChange('full_name')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={personal.email}
                      onChange={handlePersonalChange('email')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Телефон"
                      value={personal.phone}
                      onChange={handlePersonalChange('phone')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      value={personal.linkedin}
                      onChange={handlePersonalChange('linkedin')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="GitHub"
                      value={personal.github}
                      onChange={handlePersonalChange('github')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Веб-сайт"
                      value={personal.website}
                      onChange={handlePersonalChange('website')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Биография"
                      multiline
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      margin="normal"
                    />
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
                        control={
                          <Checkbox
                            checked={selectedSkills[skill.id]?.included || false}
                            onChange={() => handleSkillToggle(skill.id)}
                          />
                        }
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
                        control={
                          <Checkbox
                            checked={selectedProjects[project.id]?.included || false}
                            onChange={() => handleProjectToggle(project.id)}
                          />
                        }
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
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => handleRemoveSoftSkill(index)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Кнопки */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/resume')}>
                  Отмена
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Сохранить
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default ResumeForm;