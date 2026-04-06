import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Autocomplete } from '@mui/material';
import { useToast } from '../contexts/ToastContext';

const SkillForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [level, setLevel] = useState(3);
  const [category, setCategory] = useState('');
  const [existingCategories, setExistingCategories] = useState([]);
  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/v1/skills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && Array.isArray(res.data.data)) {
          const categories = [...new Set(res.data.data.map(s => s.category).filter(c => c && c.trim()))];
          setExistingCategories(categories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (id) {
      const fetchSkill = async () => {
        try {
          const res = await axios.get(`/api/v1/skills/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.success) {
            setName(res.data.data.name || '');
            const lvl = parseInt(res.data.data.level, 10);
            setLevel(isNaN(lvl) ? 3 : lvl);
            setCategory(res.data.data.category || '');
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchSkill();
    }
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const lvl = parseInt(level, 10);
      if (isNaN(lvl) || lvl < 1 || lvl > 10) {
        showToast('Уровень должен быть числом от 1 до 10', 'warning');
        return;
      }
      const payload = { name, level: lvl, category: category.trim() || null };
      if (id) {
        await axios.put(`/api/v1/skills/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/v1/skills', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/skills');
    } catch (err) {
      console.error(err);
      showToast('Ошибка сохранения навыка', 'error');
    }
  };

  const handleLevelChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setLevel(isNaN(val) ? '' : val);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Редактировать навык' : 'Новый навык'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Уровень (1-10)"
            type="number"
            value={level === '' ? '' : level}
            onChange={handleLevelChange}
            margin="normal"
            inputProps={{ min: 1, max: 10 }}
            required
          />
          <Autocomplete
            fullWidth
            freeSolo
            options={existingCategories}
            value={category}
            onInputChange={(event, newValue) => setCategory(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Категория"
                margin="normal"
                helperText="Выберите существующую или введите новую"
              />
            )}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Сохранить
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default SkillForm;