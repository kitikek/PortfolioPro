// frontend/src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { Container, Tabs, Tab, Box, Paper, Typography, Avatar, Button, TextField, Grid } from '@mui/material'
import { PhotoCamera } from '@mui/icons-material'
import { getMe, updateUser, uploadAvatar, getEducations, createEducation, updateEducation, deleteEducation, getExperiences, createExperience, updateExperience, deleteExperience } from '../services/api'
import EducationList from '../components/EducationList'
import ExperienceList from '../components/ExperienceList'

const Profile = () => {
  const [tabValue, setTabValue] = useState(0)
  const [educations, setEducations] = useState([])
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [personal, setPersonal] = useState({
    full_name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    website: '',
    bio: '',
  })
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, eduRes, expRes] = await Promise.all([
          getMe(),
          getEducations(),
          getExperiences(),
        ])
        const userData = userRes.data.success ? userRes.data.data : userRes.data
        setPersonal({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone: userData.contacts?.phone || '',
          linkedin: userData.contacts?.linkedin || '',
          github: userData.contacts?.github || '',
          website: userData.contacts?.website || '',
          bio: userData.bio || '',
        })
        setAvatarPreview(userData.avatar_url || '')
        if (eduRes.data.success) setEducations(eduRes.data.data)
        if (expRes.data.success) setExperiences(expRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handlePersonalChange = (field) => (e) => {
    setPersonal({ ...personal, [field]: e.target.value })
  }

  const handleSavePersonal = async () => {
    try {
      const payload = {
        full_name: personal.full_name,
        bio: personal.bio,
        contacts: {
          phone: personal.phone,
          linkedin: personal.linkedin,
          github: personal.github,
          website: personal.website,
        },
      }
      const res = await updateUser(payload)
      if (res.data.success) {
        alert('Данные сохранены')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения')
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const res = await uploadAvatar(formData)
      if (res.data.success) {
        setAvatarPreview(res.data.data.avatar_url)
        alert('Аватар обновлён')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveEducation = async (id, data) => {
    try {
      if (id) {
        const res = await updateEducation(id, data)
        if (res.data.success) {
          setEducations(educations.map(e => e.id === id ? res.data.data : e))
        }
      } else {
        const res = await createEducation(data)
        if (res.data.success) {
          setEducations([res.data.data, ...educations])
        }
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения')
    }
  }

  const handleDeleteEducation = async (id) => {
    if (window.confirm('Удалить запись?')) {
      try {
        await deleteEducation(id)
        setEducations(educations.filter(e => e.id !== id))
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleSaveExperience = async (id, data) => {
    try {
      if (id) {
        const res = await updateExperience(id, data)
        if (res.data.success) {
          setExperiences(experiences.map(e => e.id === id ? res.data.data : e))
        }
      } else {
        const res = await createExperience(data)
        if (res.data.success) {
          setExperiences([res.data.data, ...experiences])
        }
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка сохранения')
    }
  }

  const handleDeleteExperience = async (id) => {
    if (window.confirm('Удалить запись?')) {
      try {
        await deleteExperience(id)
        setExperiences(experiences.filter(e => e.id !== id))
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (loading) return <Typography>Загрузка...</Typography>

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="Основное" />
          <Tab label="Образование" />
          <Tab label="Опыт работы" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar src={avatarPreview} sx={{ width: 80, height: 80, mr: 2 }} />
              <Button component="label" variant="contained" startIcon={<PhotoCamera />}>
                Загрузить фото
                <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="ФИО" value={personal.full_name} onChange={handlePersonalChange('full_name')} margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" value={personal.email} disabled margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Телефон" value={personal.phone} onChange={handlePersonalChange('phone')} margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="LinkedIn" value={personal.linkedin} onChange={handlePersonalChange('linkedin')} margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="GitHub" value={personal.github} onChange={handlePersonalChange('github')} margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Веб-сайт" value={personal.website} onChange={handlePersonalChange('website')} margin="normal" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Биография" multiline rows={4} value={personal.bio} onChange={handlePersonalChange('bio')} margin="normal" />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleSavePersonal}>Сохранить изменения</Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <EducationList
            educations={educations}
            onDelete={handleDeleteEducation}
            onSave={handleSaveEducation}
          />
        )}

        {tabValue === 2 && (
          <ExperienceList
            experiences={experiences}
            onDelete={handleDeleteExperience}
            onSave={handleSaveExperience}
          />
        )}
      </Paper>
    </Container>
  )
}

export default Profile