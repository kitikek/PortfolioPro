const express = require('express');
const { getResumes, createResume, updateResume, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getResumes);
router.post('/', protect, createResume);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);

module.exports = router;