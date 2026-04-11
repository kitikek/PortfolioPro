// frontend/src/pages/Analytics.jsx
import { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, Chip, CircularProgress, Alert, List, ListItem, ListItemText, IconButton, LinearProgress, FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';
import { TrendingUp, Work, AddCircleOutline, Delete as DeleteIcon, HelpOutline } from '@mui/icons-material';
import axios from 'axios';
import { getSkills, deleteSkill } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Analytics = () => {
  const [recommendedSkills, setRecommendedSkills] = useState([]);
  const [professionMatches, setProfessionMatches] = useState([]);
  const [selectedProfessionMatch, setSelectedProfessionMatch] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [professionsList, setProfessionsList] = useState([]);
  const [selectedProfession, setSelectedProfession] = useState(() => {
    return localStorage.getItem('selectedProfession') || '';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState({});
  const [deleting, setDeleting] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/analytics/professions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.professions) {
          setProfessionsList(res.data.professions);
        }
      } catch (err) {
        console.error('Ошибка загрузки профессий:', err);
      }
    };
    fetchProfessions();
  }, []);

  const loadSkills = async () => {
    const skillsRes = await getSkills();
    setUserSkills(skillsRes.data.success ? skillsRes.data.data : []);
    return skillsRes.data.success ? skillsRes.data.data : [];
  };

  const fetchRecommendations = async (profession = null, skillsArray = null) => {
    const token = localStorage.getItem('token');
    const skillsToSend = skillsArray || userSkills;
    const skillsMap = skillsToSend.reduce((acc, s) => ({ ...acc, [s.name]: s.level }), {});
    const payload = {
      skills: skillsMap,
      category: 'dev',
      selected_profession: profession || undefined
    };
    const recRes = await axios.post('/api/v1/analytics/recommend', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return recRes.data;
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentSkills = await loadSkills();
      const generalData = await fetchRecommendations(null, currentSkills);
      if (generalData.profession_matches) {
        setProfessionMatches(generalData.profession_matches);
      }

      if (!selectedProfession) {
        setRecommendedSkills(generalData.recommended_skills || []);
        setSelectedProfessionMatch(null);
      } else {
        const profData = await fetchRecommendations(selectedProfession, currentSkills);
        setRecommendedSkills(profData.recommended_skills || []);
        if (profData.selected_profession_match) {
          setSelectedProfessionMatch(profData.selected_profession_match);
        } else {
          const match = professionMatches.find(p => p.title === selectedProfession);
          setSelectedProfessionMatch(match || null);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleProfessionChange = async (event) => {
    const prof = event.target.value;
    setSelectedProfession(prof);
    localStorage.setItem('selectedProfession', prof);

    if (prof === '') {
      await refreshAll();
    } else {
      setLoading(true);
      try {
        const currentSkills = await loadSkills();
        const profData = await fetchRecommendations(prof, currentSkills);
        setRecommendedSkills(profData.recommended_skills || []);
        if (profData.selected_profession_match) {
          setSelectedProfessionMatch(profData.selected_profession_match);
        } else {
          const match = professionMatches.find(p => p.title === prof);
          setSelectedProfessionMatch(match || null);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddSkill = async (skillName, suggestedLevel = 3) => {
    setAdding(prev => ({ ...prev, [skillName]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/skills', 
        { name: skillName, level: suggestedLevel, category: 'recommended' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshAll();
      showToast(`Навык "${skillName}" добавлен!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Ошибка добавления навыка', 'error');
    } finally {
      setAdding(prev => ({ ...prev, [skillName]: false }));
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Удалить навык "${skillName}"?`)) return;
    setDeleting(prev => ({ ...prev, [skillId]: true }));
    try {
      await deleteSkill(skillId);
      await refreshAll();
    } catch (err) {
      console.error(err);
      showToast('Ошибка удаления навыка', 'error');
    } finally {
      setDeleting(prev => ({ ...prev, [skillId]: false }));
    }
  };

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  const userSkillNames = userSkills.map(s => s.name);
  const formatExplanation = (explanation) => {
    if (explanation.includes('0%')) return explanation.replace('0%', 'менее 1%');
    return explanation;
  };

  const getProfessionTooltip = (relevance) => {
    const percent = (relevance * 100).toFixed(0);
    return `Вы владеете примерно ${percent}% навыков, обычно требуемых для этой профессии. Добавление рекомендованных навыков повысит этот процент.`;
  };

  const displayProfessions = professionMatches.length > 0 ? professionMatches : professionsList.map(p => ({ title: p, relevance: 0 }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Аналитика и рекомендации</Typography>
      <Typography variant="body1" paragraph>
        Здесь вы можете увидеть, какие навыки стоит развивать, чтобы быть востребованным специалистом.
        Выберите интересующую профессию из списка, и система подскажет, каких навыков вам не хватает,
        а также оценит ваше текущее соответствие этой профессии. Если профессия не выбрана,
        рекомендации формируются на основе ваших текущих навыков и рыночных данных.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Рекомендуемые навыки
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedProfession 
                  ? "Навыки отсортированы по важности для выбранной профессии (от самых критичных к менее важным)."
                  : "Навыки отсортированы по вероятности их полезности для вас (чем выше рейтинг, тем более востребован навык)."}
              </Typography>
              {professionsList.length > 0 && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Выберите профессию (опционально)</InputLabel>
                  <Select
                    value={selectedProfession}
                    label="Выберите профессию (опционально)"
                    onChange={handleProfessionChange}
                  >
                    <MenuItem value="">— Не выбрано —</MenuItem>
                    {professionsList.map(prof => (
                      <MenuItem key={prof} value={prof}>{prof}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {selectedProfession && selectedProfessionMatch && (
                <Box sx={{ mb: 2, p: 1, bgcolor: 'primary.main', borderRadius: 1 }}>
                  <Typography variant="body2" color="white" align="center">
                    Ваше соответствие профессии «{selectedProfessionMatch.title}»: {(selectedProfessionMatch.relevance * 100).toFixed(1)}%
                    <Tooltip title={getProfessionTooltip(selectedProfessionMatch.relevance)} arrow>
                      <HelpOutline sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle', cursor: 'help' }} />
                    </Tooltip>
                  </Typography>
                </Box>
              )}
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Что означает рейтинг?</strong> Это вероятность от 0 до 1, показывающая, насколько модель уверена, что навык вам пригодится. 
                Значения 0.1–0.3 – нормальны, даже такой навык может быть полезен для развития.
              </Typography>
              {recommendedSkills.length === 0 ? (
                <Typography>Нет рекомендаций. Добавьте больше навыков в профиль.</Typography>
              ) : (
                <List>
                  {recommendedSkills.map((rec, idx) => {
                    const alreadyHas = userSkillNames.includes(rec.skill);
                    return (
                      <ListItem key={idx} divider>
                        <ListItemText
                          primary={rec.skill}
                          secondary={
                            <>
                              <Box component="span" display="block" fontSize="0.75rem" color="textSecondary">
                                Рейтинг: {rec.score.toFixed(2)}
                              </Box>
                              <Box component="span" display="block" fontSize="0.875rem">
                                {formatExplanation(rec.explanation)}
                              </Box>
                            </>
                          }
                        />
                        {!alreadyHas ? (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddCircleOutline />}
                            onClick={() => handleAddSkill(rec.skill, Math.min(3 + Math.floor(rec.score * 5), 10))}
                            disabled={adding[rec.skill]}
                          >
                            {adding[rec.skill] ? 'Добавление...' : 'Добавить'}
                          </Button>
                        ) : (
                          <Chip label="Уже есть" size="small" color="success" />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                Оценка соответствия профессиям
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                В этом блоке показано, насколько ваши текущие навыки соответствуют разным IT-профессиям.
                Чем выше процент, тем ближе вы к требованиям рынка для этой роли.
                {selectedProfession && " Ваше соответствие выбранной профессии выделено отдельно."}
              </Typography>
              {displayProfessions.length > 0 ? (
                <List>
                  {displayProfessions.map((prof, idx) => (
                    <ListItem key={idx} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {prof.title}
                            {prof.relevance > 0 && (
                              <Tooltip title={getProfessionTooltip(prof.relevance)} arrow>
                                <HelpOutline sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
                              </Tooltip>
                            )}
                          </Box>
                        }
                        secondary={`Соответствие: ${(prof.relevance * 100).toFixed(1)}%`}
                      />
                      <Box sx={{ width: 80 }}>
                        <LinearProgress variant="determinate" value={prof.relevance * 100} />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>Нет данных для оценки. Добавьте больше навыков.</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6">Ваши текущие навыки</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {userSkills.map(skill => (
                  <Chip
                    key={skill.id}
                    label={`${skill.name} (${skill.level}/10)`}
                    color="primary"
                    variant="outlined"
                    onDelete={deleting[skill.id] ? undefined : () => handleDeleteSkill(skill.id, skill.name)}
                    deleteIcon={deleting[skill.id] ? <CircularProgress size={16} /> : <DeleteIcon />}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;