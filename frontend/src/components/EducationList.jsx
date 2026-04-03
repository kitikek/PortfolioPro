// frontend/src/components/EducationList.jsx
import { useState } from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Box, Paper, Button } from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import EducationForm from './EducationForm';

const EducationList = ({ educations, onDelete, onSave }) => {
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleEdit = (item) => {
    setEditingItem(item);
    setOpenForm(true);
  };

  const handleSave = (data) => {
    if (editingItem) {
      onSave(editingItem.id, data);
    } else {
      onSave(null, data);
    }
    setEditingItem(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Образование</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => setOpenForm(true)}>Добавить</Button>
      </Box>
      <Paper>
        <List>
          {educations.map((edu) => (
            <ListItem key={edu.id} secondaryAction={
              <>
                <IconButton edge="end" onClick={() => handleEdit(edu)}><Edit /></IconButton>
                <IconButton edge="end" onClick={() => onDelete(edu.id)}><Delete /></IconButton>
              </>
            }>
              <ListItemText
                primary={`${edu.degree ? edu.degree + ', ' : ''}${edu.institution}`}
                secondary={`${edu.field_of_study || ''} | ${edu.start_date || ''} — ${edu.end_date || 'по н.в.'}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <EducationForm
        open={openForm}
        onClose={() => { setOpenForm(false); setEditingItem(null); }}
        onSubmit={handleSave}
        initialData={editingItem}
      />
    </Box>
  );
};

export default EducationList;