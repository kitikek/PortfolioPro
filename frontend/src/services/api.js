import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

// Добавляем токен в каждый запрос
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Пользователь
export const getMe = () => api.get('/auth/me')
export const updateUser = (data) => api.put('/users/me', data)
export const uploadAvatar = (formData) => api.post('/auth/upload-avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// Образование
export const getEducations = () => api.get('/educations')
export const createEducation = (data) => api.post('/educations', data)
export const updateEducation = (id, data) => api.put(`/educations/${id}`, data)
export const deleteEducation = (id) => api.delete(`/educations/${id}`)

// Опыт
export const getExperiences = () => api.get('/experiences')
export const createExperience = (data) => api.post('/experiences', data)
export const updateExperience = (id, data) => api.put(`/experiences/${id}`, data)
export const deleteExperience = (id) => api.delete(`/experiences/${id}`)

// Навыки (Hard Skills)
export const getSkills = () => api.get('/skills')
export const createSkill = (data) => api.post('/skills', data)
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data)
export const deleteSkill = (id) => api.delete(`/skills/${id}`)

// Софт-скиллы
export const getSoftSkills = () => api.get('/soft-skills')
export const createSoftSkill = (data) => api.post('/soft-skills', data)
export const updateSoftSkill = (id, data) => api.put(`/soft-skills/${id}`, data)
export const deleteSoftSkill = (id) => api.delete(`/soft-skills/${id}`)

export default api