// frontend/src/components/Navbar.jsx
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          PortfolioPro
        </Typography>
        <Box>
          {token ? (
            <>
              <Button color="inherit" component={Link} to="/">Главная</Button>
              <Button color="inherit" component={Link} to="/profile">Профиль</Button>
              <Button color="inherit" component={Link} to="/projects">Проекты</Button>
              <Button color="inherit" component={Link} to="/skills">Навыки</Button>
              <Button color="inherit" component={Link} to="/resume">Резюме</Button>
              <Button color="inherit" component={Link} to="/analytics">Аналитика</Button>
              <Button color="inherit" onClick={handleLogout}>Выйти</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Вход</Button>
              <Button color="inherit" component={Link} to="/register">Регистрация</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar