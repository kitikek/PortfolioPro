import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/v1/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Alert severity="success">Ссылка для сброса пароля отправлена на вашу почту.</Alert>
          <Button component={Link} to="/login" sx={{ mt: 3 }} variant="contained">Вернуться ко входу</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>Восстановление пароля</Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Введите email, указанный при регистрации.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField margin="normal" required fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2 }}>
              {loading ? 'Отправка...' : 'Отправить ссылку'}
            </Button>
            <Button component={Link} to="/login" fullWidth variant="text">Вернуться ко входу</Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;