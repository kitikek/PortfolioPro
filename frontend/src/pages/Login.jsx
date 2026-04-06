import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Вход</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <MuiLink component={Link} to="/forgot-password" variant="body2">Забыли пароль?</MuiLink>
          </Box>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Войти</Button>
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} to="/register" variant="body2">Нет аккаунта? Зарегистрироваться</MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;