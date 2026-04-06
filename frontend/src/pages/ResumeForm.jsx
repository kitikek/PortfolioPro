import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Box, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Checkbox, FormControlLabel, List, ListItem, ListItemText,
  IconButton, Chip, Grid, Paper, Avatar, Switch
} from '@mui/material';
import { Delete, Add, PhotoCamera } from '@mui/icons-material';
import { getSoftSkills } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const ResumeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
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
  const [softSkillsList, setSoftSkillsList] = useState([]);
  const [selectedSoftSkills, setSelectedSoftSkills] = useState({});
  const [educations, setEducations] = useState([]);
  const [selectedEducations, setSelectedEducations] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [selectedExperiences, setSelectedExperiences] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        // Загружаем все необходимые данные
        const [userRes, skillsRes, projectsRes, eduRes, expRes, softRes] = await Promise.all([
          axios.get('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/skills', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/projects/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/educations', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/v1/experiences', { headers: { Authorization: `Bearer ${token}` } }),
          getSoftSkills(),
        ]);

        // Пользователь
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

        // Hard Skills
        let skillsList = [];
        if (skillsRes.data.success && Array.isArray(skillsRes.data.data)) {
          skillsList = skillsRes.data.data;
          setSkills(skillsList);
        }

        // Projects
        let projectsList = [];
        if (projectsRes.data.success && Array.isArray(projectsRes.data.data)) {
          projectsList = projectsRes.data.data;
          setProjects(projectsList);
        }

        // Educations
        let eduList = [];
        if (eduRes.data.success && Array.isArray(eduRes.data.data)) {
          eduList = eduRes.data.data;
          setEducations(eduList);
        }

        // Experiences
        let expList = [];
        if (expRes.data.success && Array.isArray(expRes.data.data)) {
          expList = expRes.data.data;
          setExperiences(expList);
        }

        // Soft Skills
        let softSkillsData = [];
        if (softRes.data.success && Array.isArray(softRes.data.data)) {
          softSkillsData = softRes.data.data;
          setSoftSkillsList(softSkillsData);
        }

        // === Инициализация состояний выбора ===
        let initialSelectedSkills = {};
        skillsList.forEach(skill => {
          initialSelectedSkills[skill.id] = { name: skill.name, level: skill.level, included: false };
        });

        let initialSelectedProjects = {};
        projectsList.forEach(proj => {
          initialSelectedProjects[proj.id] = {
            title: proj.title,
            included: false,
            is_published: proj.is_published
          };
        });

        let initialSelectedEducations = {};
        eduList.forEach(edu => {
          initialSelectedEducations[edu.id] = { included: false };
        });

        let initialSelectedExperiences = {};
        expList.forEach(exp => {
          initialSelectedExperiences[exp.id] = { included: false };
        });

        let initialSelectedSoftSkills = {};
        softSkillsData.forEach(ss => {
          initialSelectedSoftSkills[ss.id] = { name: ss.name, included: false };
        });

        // Если редактируем резюме – загружаем его данные и обновляем выбранные состояния
        if (id) {
          const resumeRes = await axios.get(`/api/v1/resumes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resumeRes.data.success) {
            const resume = resumeRes.data.data;
            setTitle(resume.title || '');
            setTemplate(resume.template);
            setIsPublic(resume.is_public);
            const data = resume.data || {};

            if (data.personal) setPersonal(prev => ({ ...prev, ...data.personal }));
            if (data.bio !== undefined) setBio(data.bio);

            // Hard Skills
            if (data.skills && Array.isArray(data.skills)) {
              data.skills.forEach(s => {
                if (initialSelectedSkills[s.id]) {
                  initialSelectedSkills[s.id].included = s.included;
                  if (s.level) initialSelectedSkills[s.id].level = s.level;
                }
              });
            }

            // Projects (скрытые проекты нельзя включить)
            if (data.projects && Array.isArray(data.projects)) {
              data.projects.forEach(p => {
                const project = projectsList.find(pr => pr.id === p.id);
                if (project && !project.is_published) {
                  initialSelectedProjects[p.id].included = false;
                } else if (initialSelectedProjects[p.id]) {
                  initialSelectedProjects[p.id].included = p.included;
                }
              });
            }

            // Educations
            if (data.educations && Array.isArray(data.educations)) {
              data.educations.forEach(edu => {
                if (initialSelectedEducations[edu.id]) {
                  initialSelectedEducations[edu.id].included = true;
                }
              });
            }

            // Experiences
            if (data.experiences && Array.isArray(data.experiences)) {
              data.experiences.forEach(exp => {
                if (initialSelectedExperiences[exp.id]) {
                  initialSelectedExperiences[exp.id].included = true;
                }
              });
            }

            // Soft Skills
            if (data.softSkills && Array.isArray(data.softSkills)) {
              data.softSkills.forEach(ss => {
                if (initialSelectedSoftSkills[ss.id]) {
                  initialSelectedSoftSkills[ss.id].included = true;
                } else {
                  initialSelectedSoftSkills[ss.id] = { name: ss.name, included: true };
                }
              });
            }
          }
        } else {
          // Новое резюме – всё включено по умолчанию
          Object.keys(initialSelectedSkills).forEach(key => {
            initialSelectedSkills[key].included = true;
          });
          Object.keys(initialSelectedProjects).forEach(key => {
            if (initialSelectedProjects[key].is_published) {
              initialSelectedProjects[key].included = true;
            }
          });
          Object.keys(initialSelectedEducations).forEach(key => {
            initialSelectedEducations[key].included = true;
          });
          Object.keys(initialSelectedExperiences).forEach(key => {
            initialSelectedExperiences[key].included = true;
          });
          Object.keys(initialSelectedSoftSkills).forEach(key => {
            initialSelectedSoftSkills[key].included = true;
          });
        }

        setSelectedSkills(initialSelectedSkills);
        setSelectedProjects(initialSelectedProjects);
        setSelectedEducations(initialSelectedEducations);
        setSelectedExperiences(initialSelectedExperiences);
        setSelectedSoftSkills(initialSelectedSoftSkills);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [token, navigate, id]);

  const handlePersonalChange = (field) => (e) => setPersonal({ ...personal, [field]: e.target.value });
  const handleSkillToggle = (skillId) => setSelectedSkills(prev => ({ ...prev, [skillId]: { ...prev[skillId], included: !prev[skillId]?.included } }));
  const handleProjectToggle = (projectId) => setSelectedProjects(prev => ({ ...prev, [projectId]: { ...prev[projectId], included: !prev[projectId]?.included } }));
  const handleEducationToggle = (eduId) => setSelectedEducations(prev => ({ ...prev, [eduId]: { included: !prev[eduId]?.included } }));
  const handleExperienceToggle = (expId) => setSelectedExperiences(prev => ({ ...prev, [expId]: { included: !prev[expId]?.included } }));
  const handleSoftSkillToggle = (skillId) => setSelectedSoftSkills(prev => ({ ...prev, [skillId]: { ...prev[skillId], included: !prev[skillId]?.included } }));

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
        setPersonal(prev => ({ ...prev, avatar_url: res.data.data.avatar_url }));
        setAvatarPreview(res.data.data.avatar_url);
        showToast('Аватар загружен', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Ошибка загрузки аватара', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fullEducations = Object.entries(selectedEducations)
        .filter(([_, val]) => val.included)
        .map(([id]) => educations.find(edu => edu.id === parseInt(id)))
        .filter(Boolean);

      const fullExperiences = Object.entries(selectedExperiences)
        .filter(([_, val]) => val.included)
        .map(([id]) => experiences.find(exp => exp.id === parseInt(id)))
        .filter(Boolean);

      const softSkillsSelected = Object.entries(selectedSoftSkills)
        .filter(([_, val]) => val.included)
        .map(([id, val]) => ({ id: parseInt(id), name: val.name }));

      const projectsSelected = Object.entries(selectedProjects)
        .filter(([_, val]) => val.included)
        .map(([id, val]) => {
          const fullProject = projects.find(p => p.id === parseInt(id));
          return {
            id: parseInt(id),
            title: fullProject?.title,
            description: fullProject?.description,
            technologies: fullProject?.technologies,
            links: fullProject?.links,
            is_published: fullProject?.is_published,
            included: true,
          };
        });

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
        projects: projectsSelected,
        educations: fullEducations,
        experiences: fullExperiences,
        softSkills: softSkillsSelected
      };

      const payload = {
        title: title.trim() || 'Без названия',
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
      showToast('Ошибка сохранения резюме', 'error');
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
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <TextField fullWidth label="Название резюме" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" required helperText="Например: «Резюме для фронтенд‑разработчика»" />
              </Paper>
            </Grid>

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
                    <FormControlLabel control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />} label="Опубликовать резюме (доступно по ссылке)" />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Фото</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  {avatarPreview && <Avatar src={avatarPreview} sx={{ width: 80, height: 80 }} />}
                  <Button variant="contained" component="label" startIcon={<PhotoCamera />}>Загрузить фото<input type="file" hidden accept="image/*" onChange={handleAvatarUpload} /></Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Личная информация</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="ФИО" value={personal.full_name} onChange={handlePersonalChange('full_name')} margin="normal" /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={personal.email} onChange={handlePersonalChange('email')} margin="normal" /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Телефон" value={personal.phone} onChange={handlePersonalChange('phone')} margin="normal" /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="LinkedIn" value={personal.linkedin} onChange={handlePersonalChange('linkedin')} margin="normal" /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="GitHub" value={personal.github} onChange={handlePersonalChange('github')} margin="normal" /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Веб-сайт" value={personal.website} onChange={handlePersonalChange('website')} margin="normal" /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Биография" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} margin="normal" /></Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Образование</Typography>
                <List>
                  {educations.map(edu => (
                    <ListItem key={edu.id} dense>
                      <FormControlLabel
                        control={<Checkbox checked={selectedEducations[edu.id]?.included || false} onChange={() => handleEducationToggle(edu.id)} />}
                        label={`${edu.institution} (${edu.degree || ''}) ${edu.field_of_study ? `, ${edu.field_of_study}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Опыт работы</Typography>
                <List>
                  {experiences.map(exp => (
                    <ListItem key={exp.id} dense>
                      <FormControlLabel
                        control={<Checkbox checked={selectedExperiences[exp.id]?.included || false} onChange={() => handleExperienceToggle(exp.id)} />}
                        label={`${exp.position} в ${exp.company}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Навыки (Hard)</Typography>
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

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Софт-скиллы</Typography>
                {softSkillsList.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    У вас пока нет добавленных софт-скиллов. Перейдите в раздел «Навыки» → «Soft Skills», чтобы добавить их.
                  </Typography>
                ) : (
                  <List>
                    {softSkillsList.map(skill => (
                      <ListItem key={skill.id} dense>
                        <FormControlLabel
                          control={<Checkbox checked={selectedSoftSkills[skill.id]?.included || false} onChange={() => handleSoftSkillToggle(skill.id)} />}
                          label={skill.name}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Проекты</Typography>
                <List>
                  {projects.map(project => {
                    const isDisabled = !project.is_published;
                    return (
                      <ListItem key={project.id} dense>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedProjects[project.id]?.included || false}
                              onChange={() => handleProjectToggle(project.id)}
                              disabled={isDisabled}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{project.title}</span>
                              {isDisabled && <Chip label="Скрытый" size="small" color="error" variant="outlined" />}
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Grid>

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