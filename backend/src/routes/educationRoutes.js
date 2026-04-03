const express = require('express');
const { getEducations, createEducation, updateEducation, deleteEducation } = require('../controllers/educationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/', getEducations);
router.post('/', createEducation);
router.put('/:id', updateEducation);
router.delete('/:id', deleteEducation);

module.exports = router;