// frontend/src/components/ExperienceForm.jsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Alert,
} from '@mui/material';

const ExperienceForm = ({ open, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    current: false,
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        position: initialData.position || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        current: initialData.current || false,
        description: initialData.description || '',
      });
      setIsEdit(true);
    } else {
      setFormData({
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        current: false,
        description: '',
      });
      setIsEdit(false);
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'current') {
      setFormData((prev) => ({ ...prev, current: checked }));
      if (checked) {
        setFormData((prev) => ({ ...prev, end_date: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = 'Укажите компанию';
    if (!formData.position.trim()) newErrors.position = 'Укажите должность';
    if (!formData.start_date && !formData.current) {
      newErrors.start_date = 'Укажите дату начала';
    }
    if (formData.start_date && formData.end_date && !formData.current) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'Дата окончания не может быть раньше даты начала';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Редактировать опыт' : 'Добавить опыт работы'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Компания"
            name="company"
            value={formData.company}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.company}
            helperText={errors.company}
          />
          <TextField
            label="Должность"
            name="position"
            value={formData.position}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.position}
            helperText={errors.position}
          />
          <TextField
            label="Дата начала"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.start_date}
            helperText={errors.start_date}
          />
          <FormControlLabel
            control={
              <Switch
                name="current"
                checked={formData.current}
                onChange={handleChange}
              />
            }
            label="Работаю по настоящее время"
          />
          {!formData.current && (
            <TextField
              label="Дата окончания"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.end_date}
              helperText={errors.end_date}
            />
          )}
          <TextField
            label="Описание обязанностей и достижений"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExperienceForm;