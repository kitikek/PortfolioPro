const express = require('express');
const { getResumes, createResume, updateResume, deleteResume, getResumeById, publishResume, unpublishResume, getPublicResume, generatePDF, exportDocx } = require('../controllers/resumeController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Публичные маршруты
router.get('/public/:id', getPublicResume);

// Защищённые маршруты
router.use(protect);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.post('/', createResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.put('/:id/publish', publishResume);
router.put('/:id/unpublish', unpublishResume);
router.get('/:id/pdf', generatePDF);
router.get('/:id/docx', exportDocx);

module.exports = router;