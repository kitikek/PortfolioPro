const express = require('express');
const { getSkills, createSkill, updateSkill, deleteSkill, getSkillById } = require('../controllers/skillController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getSkills);
router.post('/', protect, createSkill);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);
router.get('/:id', protect, getSkillById);   // GET /api/v1/skills/:id

module.exports = router;