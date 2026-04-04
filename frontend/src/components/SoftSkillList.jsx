// frontend/src/components/SoftSkillList.jsx
import { useState } from 'react';
import {
  List, ListItem, ListItemText, IconButton, Typography, Box,
  Paper, Button, TextField, InputAdornment, Chip, CircularProgress
} from '@mui/material';
import { Delete, Add, Close } from '@mui/icons-material';

const SoftSkillList = ({ softSkills, onSaveMultiple, onDelete }) => {
  const [newSkills, setNewSkills] = useState([]);       // временные новые навыки (массив строк)
  const [currentInput, setCurrentInput] = useState(''); // текущее значение поля ввода
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  // Добавление во временный список
  const handleAddTemp = () => {
    const trimmed = currentInput.trim();
    if (trimmed === '') return;
    // Проверка на дубликат во временном списке или уже существующих навыках
    if (newSkills.includes(trimmed) || softSkills.some(s => s.name === trimmed)) {
      alert('Такой навык уже добавлен (временно или в списке)');
      return;
    }
    setNewSkills([...newSkills, trimmed]);
    setCurrentInput('');
  };

  // Удаление из временного списка
  const handleRemoveTemp = (index) => {
    setNewSkills(newSkills.filter((_, i) => i !== index));
  };

  // Сохранение всех временных навыков в БД
  const handleSaveAll = async () => {
    if (newSkills.length === 0) return;
    setSaving(true);
    try {
      await onSaveMultiple(newSkills);
      setNewSkills([]);
      alert(`Добавлено ${newSkills.length} софт-скиллов`);
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении некоторых навыков');
    } finally {
      setSaving(false);
    }
  };

  // Фильтрация существующих навыков по поиску
  const filteredSkills = softSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Панель массового добавления */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#111827' }}>
        <Typography variant="subtitle1" gutterBottom>
          Быстрое добавление нескольких софт-скиллов
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Название софт-скилла"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTemp()}
          />
          <Button variant="outlined" onClick={handleAddTemp} startIcon={<Add />}>
            Добавить
          </Button>
        </Box>

        {/* Временный список добавленных навыков */}
        {newSkills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Будут добавлены:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {newSkills.map((skill, idx) => (
                <Chip
                  key={idx}
                  label={skill}
                  onDelete={() => handleRemoveTemp(idx)}
                  deleteIcon={<Close />}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Button
              variant="contained"
              onClick={handleSaveAll}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : <Add />}
              sx={{ mt: 2 }}
            >
              {saving ? 'Сохранение...' : `Сохранить все (${newSkills.length})`}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Поиск по существующим навыкам */}
      <TextField
        fullWidth
        size="small"
        placeholder="Поиск среди добавленных софт-скиллов..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Add sx={{ opacity: 0.5 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Список существующих софт-скиллов (только удаление) */}
      <Paper>
        <List>
          {filteredSkills.map((skill) => (
            <ListItem
              key={skill.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => onDelete(skill.id)} color="error">
                  <Delete />
                </IconButton>
              }
            >
              <ListItemText primary={skill.name} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {filteredSkills.length === 0 && softSkills.length > 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
          Ничего не найдено.
        </Typography>
      )}
      {softSkills.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
          У вас пока нет софт-скиллов. Добавьте их через форму выше.
        </Typography>
      )}
    </Box>
  );
};

export default SoftSkillList;