import { useEffect, useState } from 'react'
import { Container, Typography, Box, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data)
      } catch (error) {
        navigate('/login')
      }
    }
    fetchUser()
  }, [navigate])

  if (!user) return <div>Loading...</div>

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Здравствуйте, {user.full_name}
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="h6">Профиль</Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Bio: {user.bio || 'No bio'}</Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default Dashboard