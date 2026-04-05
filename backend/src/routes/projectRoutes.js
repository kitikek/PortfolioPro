const express = require('express');
const { 
  getUserProjects, 
  getProjectsByPortfolio, 
  createProject, 
  updateProject, 
  deleteProject,
  getProjectById,
  uploadProjectImage,
  deleteProjectImage,
  uploadProjectVideo,
  deleteProjectVideo,
  addVideoLink,
  uploadProjectFile,
  deleteProjectFile,
  getPublicProject
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Настройки multer для изображений
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/projects/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-img-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadImage = multer({ 
  storage: imageStorage, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images'), false);
  }, 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// Настройки для видео
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/projects/videos/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Только видео (mp4, webm, ogg)'), false);
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Настройки для файлов
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/projects/files/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const router = express.Router();

// Публичный маршрут (без авторизации)
router.get('/public/:id', getPublicProject);

// Все остальные маршруты требуют авторизации
router.use(protect);

router.get('/', getUserProjects);
router.get('/me', getUserProjects);
router.get('/portfolio/:portfolioId', getProjectsByPortfolio);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Изображения
router.post('/:id/images', uploadImage.single('image'), uploadProjectImage);
router.delete('/:id/images/:imageIndex', deleteProjectImage);

// Видео
router.post('/:id/videos', uploadVideo.single('video'), uploadProjectVideo);
router.delete('/:id/videos/:videoIndex', deleteProjectVideo);
router.post('/:id/video-links', addVideoLink);

// Файлы
router.post('/:id/files', uploadFile.single('file'), uploadProjectFile);
router.delete('/:id/files/:fileIndex', deleteProjectFile);

module.exports = router;