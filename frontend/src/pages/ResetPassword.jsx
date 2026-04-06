import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Недействительная ссылка для сброса пароля.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Пароли не совпадают');
    if (newPassword.length < 6) return setError('Пароль должен содержать не менее 6 символов');
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/v1/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось сбросить пароль.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}><Alert severity="error">{error}</Alert><Button component={Link} to="/forgot-password" fullWidth variant="contained" sx={{ mt: 2 }}>Запросить новую ссылку</Button></Box>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}><Alert severity="success">Пароль успешно изменён! Перенаправляем...</Alert></Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>Создание нового пароля</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField margin="normal" required fullWidth label="Новый пароль" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <TextField margin="normal" required fullWidth label="Подтверждение пароля" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2 }}>{loading ? 'Сохранение...' : 'Сохранить новый пароль'}</Button>
            <Button component={Link} to="/login" fullWidth variant="text">Вернуться ко входу</Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;