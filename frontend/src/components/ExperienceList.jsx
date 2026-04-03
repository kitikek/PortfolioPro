// frontend/src/components/ExperienceList.jsx
import { useState } from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Box, Chip, Paper, Button } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import ExperienceForm from './ExperienceForm';

const ExperienceList = ({ experiences, onSave, onDelete }) => {
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleEdit = (item) => {
    setEditingItem(item);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setOpenForm(true);
  };

  const handleSave = (data) => {
    if (editingItem) {
      onSave(editingItem.id, data);
    } else {
      onSave(null, data);
    }
    setOpenForm(false);
    setEditingItem(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
  };

  const formatPeriod = (start, end, current) => {
    const startStr = formatDate(start);
    const endStr = current ? 'настоящее время' : formatDate(end);
    return `${startStr} — ${endStr}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Опыт работы</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={handleAdd}>Добавить</Button>
      </Box>

      {experiences.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">Нет добавленного опыта работы. Нажмите «Добавить».</Typography>
        </Paper>
      )}

      <List>
        {experiences.map((exp) => (
          <Paper key={exp.id} sx={{ mb: 2, overflow: 'hidden' }}>
            <ListItem
              secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => handleEdit(exp)} sx={{ mr: 1 }}><Edit /></IconButton>
                  <IconButton edge="end" onClick={() => onDelete(exp.id)} color="error"><Delete /></IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" component="span">{exp.position}</Typography>
                    <Typography variant="body2" color="textSecondary" component="span">в {exp.company}</Typography>
                    {exp.current && <Chip label="По настоящее время" size="small" color="primary" variant="outlined" />}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {formatPeriod(exp.start_date, exp.end_date, exp.current)}
                    </Typography>
                    {exp.description && <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>}
                  </>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      <ExperienceForm
        open={openForm}
        onClose={() => { setOpenForm(false); setEditingItem(null); }}
        onSave={handleSave}
        initialData={editingItem}
      />
    </Box>
  );
};

export default ExperienceList;