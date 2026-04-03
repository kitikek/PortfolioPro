// backend/src/routes/experienceRoutes.js
const express = require('express');
const {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} = require('../controllers/experienceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Все маршруты требуют авторизации
router.use(protect);

// Получить все записи опыта пользователя
router.get('/', getExperiences);

// Создать новую запись
router.post('/', createExperience);

// Обновить запись по ID
router.put('/:id', updateExperience);

// Удалить запись по ID
router.delete('/:id', deleteExperience);

module.exports = router;