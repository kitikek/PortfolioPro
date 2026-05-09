require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/sequelize');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const projectRoutes = require('./routes/projectRoutes');
const skillRoutes = require('./routes/skillRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const educationRoutes = require('./routes/educationRoutes');
const userRoutes = require('./routes/userRoutes');
const softSkillRoutes = require('./routes/softSkillRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/experiences', experienceRoutes);
app.use('/api/v1/educations', educationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/soft-skills', softSkillRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/contact', contactRoutes);

// Статическая раздача файлов (если используется)
app.use('/uploads', express.static('uploads'));

const path = require('path');

// Раздача статических файлов React (собранный фронтенд)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Обработка любых маршрутов, не начинающихся с /api или /uploads
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Подключение к MySQL успешно');
    // Убираем sync! Миграции уже выполнены.
    app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
  })
  .catch(err => console.error('❌ Ошибка:', err));