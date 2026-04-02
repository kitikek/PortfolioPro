const express = require('express');
const { 
  getUserProjects, 
  getProjectsByPortfolio, 
  createProject, 
  updateProject, 
  deleteProject,
  getProjectById,
  uploadProjectImage,
  deleteProjectImage
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Настройка multer (можно вынести в отдельный middleware, но для простоты здесь)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/projects/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-img-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images'), false);
}, limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();
router.use(protect);

router.get('/me', getUserProjects);
router.get('/portfolio/:portfolioId', getProjectsByPortfolio);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/images', upload.single('image'), uploadProjectImage);
router.delete('/:id/images/:imageIndex', deleteProjectImage);
router.get('/', protect, getUserProjects); // дубль? оставим

module.exports = router;