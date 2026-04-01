const express = require('express');
const { 
  getUserProjects, 
  getProjectsByPortfolio, 
  createProject, 
  updateProject, 
  deleteProject,
  getProjectById
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Все маршруты требуют авторизации
router.use(protect);

// Проекты текущего пользователя
router.get('/me', getUserProjects);   // GET /api/v1/projects/me

// Проекты конкретного портфолио
router.get('/portfolio/:portfolioId', getProjectsByPortfolio); // GET /api/v1/projects/portfolio/:portfolioId

// Создание проекта
router.post('/', createProject);      // POST /api/v1/projects

// Работа с конкретным проектом
router.get('/:id', getProjectById);   // GET /api/v1/projects/:id
router.put('/:id', updateProject);    // PUT /api/v1/projects/:id
router.delete('/:id', deleteProject); // DELETE /api/v1/projects/:id

module.exports = router;