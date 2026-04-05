import { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, Chip, CircularProgress, Alert, List, ListItem, ListItemText, LinearProgress } from '@mui/material';
import { TrendingUp, Work, AddCircleOutline } from '@mui/icons-material';
import axios from 'axios';
import { getSkills } from '../services/api';

const Analytics = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const skillsRes = await getSkills();
        const skills = skillsRes.data.success ? skillsRes.data.data : [];
        setUserSkills(skills);

        const recRes = await axios.get('/api/v1/analytics/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (recRes.data.success) {
          setRecommendations(recRes.data.data);
        } else {
          setError(recRes.data.error);
        }
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
      const skillsRes = await getSkills();
      setUserSkills(skillsRes.data.success ? skillsRes.data.data : []);
      alert(`Навык "${skillName}" добавлен!`);
    } catch (err) {
      console.error(err);
      alert('Ошибка добавления навыка');
    } finally {
      setAdding(prev => ({ ...prev, [skillName]: false }));
    }
  };

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  const userSkillNames = userSkills.map(s => s.name);

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
                            <Typography variant="caption" display="block">Рейтинг: {rec.score.toFixed(2)}</Typography>
                            <Typography variant="body2" color="textSecondary">{rec.explanation}</Typography>
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
                      secondary={`Соответствие: ${prof.relevance * 100}%`}
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
                  <Chip key={skill.id} label={`${skill.name} (${skill.level}/10)`} color="primary" variant="outlined" />
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