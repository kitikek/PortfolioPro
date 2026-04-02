import { useEffect, useState } from 'react'
import { Container, Typography, Box, Button, List, ListItem, ListItemText, IconButton, Paper, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material'
import { Delete, Edit, BarChart, Radar as RadarIcon, Search } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Chart as ChartJS,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { Radar, Bar } from 'react-chartjs-2'

ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
)

const Skills = () => {
  const [skills, setSkills] = useState([])
  const [chartType, setChartType] = useState('radar')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    const fetchSkills = async () => {
      try {
        const res = await axios.get('/api/v1/skills', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setSkills(res.data.data)
          const uniqueCategories = [...new Set(res.data.data.map(s => s.category).filter(c => c && c.trim()))]
          setCategories(uniqueCategories)
        } else {
          console.error('Неожиданный формат ответа:', res.data)
          setSkills([])
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchSkills()
  }, [navigate, token])

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updatedSkills = skills.filter(s => s.id !== id)
      setSkills(updatedSkills)
      const uniqueCategories = [...new Set(updatedSkills.map(s => s.category).filter(c => c && c.trim()))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error(error)
    }
  }

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? skill.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  const chartData = {
    labels: filteredSkills.map(skill => skill.name),
    datasets: [
      {
        label: 'Уровень (1-10)',
        data: filteredSkills.map(skill => skill.level),
        backgroundColor: 'rgba(75, 96, 127, 0.3)',
        borderColor: '#4B607F',
        borderWidth: 2,
        pointBackgroundColor: '#F3701E',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#F3701E',
        borderRadius: 8,
      },
    ],
  }

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2, backdropColor: 'transparent', color: '#9CA3AF' },
        grid: { color: '#2D3748' },
        pointLabels: { color: '#F3F4F6' },
      },
    },
    plugins: {
      legend: { labels: { color: '#F3F4F6' } },
      tooltip: { bodyColor: '#F3F4F6', titleColor: '#F3F4F6' },
    },
    maintainAspectRatio: true,
  }

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: { beginAtZero: true, max: 10, ticks: { color: '#F3F4F6' }, grid: { color: '#2D3748' } },
      y: { ticks: { color: '#F3F4F6' }, grid: { color: '#2D3748' } },
    },
    plugins: {
      legend: { labels: { color: '#F3F4F6' } },
      tooltip: { bodyColor: '#F3F4F6', titleColor: '#F3F4F6' },
    },
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Мои навыки
        </Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate('/skills/new')}>
          Добавить навык
        </Button>

        {/* Диаграмма */}
        {filteredSkills.length > 0 && (
          <Paper sx={{ p: 3, mb: 4, backgroundColor: '#111827' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Визуализация</Typography>
              <Box>
                <Button
                  size="small"
                  variant={chartType === 'radar' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('radar')}
                  startIcon={<RadarIcon />}
                  sx={{ mr: 1 }}
                >
                  Радар
                </Button>
                <Button
                  size="small"
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('bar')}
                  startIcon={<BarChart />}
                >
                  Столбцы
                </Button>
              </Box>
            </Box>
            <Box sx={{ height: 400 }}>
              {chartType === 'radar' ? (
                <Radar data={chartData} options={radarOptions} />
              ) : (
                <Bar data={chartData} options={barOptions} />
              )}
            </Box>
          </Paper>
        )}

        {/* Панель поиска и фильтрации – теперь под диаграммой */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#111827' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Категория</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Категория"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Все категории</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {(searchTerm || selectedCategory) && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Найдено: {filteredSkills.length} навыков
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Список навыков */}
        <List>
          {filteredSkills.map(skill => (
            <ListItem key={skill.id} secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/skills/edit/${skill.id}`)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(skill.id)}>
                  <Delete />
                </IconButton>
              </>
            }>
              <ListItemText
                primary={skill.name}
                secondary={`Уровень: ${skill.level} / 10 • Категория: ${skill.category || 'Без категории'}`}
              />
            </ListItem>
          ))}
        </List>
        {filteredSkills.length === 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
            Навыки не найдены. Попробуйте изменить фильтры или добавьте новый навык.
          </Typography>
        )}
      </Box>
    </Container>
  )
}

export default Skills