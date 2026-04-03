require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const projectRoutes = require('./routes/projectRoutes');
const skillRoutes = require('./routes/skillRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const educationRoutes = require('./routes/educationRoutes');

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

// Статическая раздача файлов (если используется)
app.use('/uploads', express.static('uploads'));

sequelize.authenticate()
  .then(() => {
    console.log('✅ Подключение к MySQL успешно');
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Синхронизация БД завершена');
    app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
  })
  .catch(err => console.error('❌ Ошибка:', err));