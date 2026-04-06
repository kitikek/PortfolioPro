import { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, Chip, CircularProgress, Alert, List, ListItem, ListItemText, IconButton, LinearProgress } from '@mui/material';
import { TrendingUp, Work, AddCircleOutline, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { getSkills, deleteSkill } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Analytics = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState({});
  const [deleting, setDeleting] = useState({});
  const { showToast } = useToast();

  const loadSkills = async () => {
    const skillsRes = await getSkills();
    setUserSkills(skillsRes.data.success ? skillsRes.data.data : []);
  };

  const loadRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const recRes = await axios.get('/api/v1/analytics/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (recRes.data.success) {
        setRecommendations(recRes.data.data);
      } else {
        setError(recRes.data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadSkills(), loadRecommendations()]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await loadSkills();
        await loadRecommendations();
      } catch (err) {
        setError(err.response?.data?.error || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    if (explanation.includes('0%')) {
      return explanation.replace('0%', 'менее 1%');
    }
    return explanation;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Аналитика и рекомендации</Typography>
      <Typography variant="body1" paragraph>
        На основе ваших текущих навыков и анализа рынка труда мы подобрали для вас наиболее релевантные навыки для развития и подходящие профессии.
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
                <strong>Что означает рейтинг?</strong> Это вероятность от 0 до 1, показывающая, насколько модель уверена, что навык вам пригодится. 
                Значения 0.1–0.3 – нормальны, даже такой навык может быть полезен для развития. Проценты в объяснении показывают, как часто рекомендуемый навык встречается вместе с вашими текущими навыками в вакансиях.
              </Typography>
              {recommendations?.recommended_skills?.length === 0 && (
                <Typography>Нет рекомендаций. Добавьте больше навыков в профиль.</Typography>
              )}
              <List>
                {recommendations?.recommended_skills?.map((rec, idx) => {
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                Подходящие профессии
              </Typography>
              <List>
                {recommendations?.profession_matches?.map((prof, idx) => (
                  <ListItem key={idx} divider>
                    <ListItemText
                      primary={prof.title}
                      secondary={`Соответствие: ${(prof.relevance * 100).toFixed(1)}%`}
                    />
                    <Box sx={{ width: 80 }}>
                      <LinearProgress variant="determinate" value={prof.relevance * 100} />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
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