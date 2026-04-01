const express = require('express');
const { getResumes, createResume, updateResume, deleteResume, getResumeById } = require('../controllers/resumeController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getResumes);
router.post('/', protect, createResume);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);
router.get('/:id', protect, getResumeById);

module.exports = router;