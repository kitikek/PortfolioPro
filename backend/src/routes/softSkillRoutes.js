const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getSoftSkills,
  createSoftSkill,
  updateSoftSkill,
  deleteSoftSkill,
} = require('../controllers/softSkillController');

router.use(protect);

router.route('/')
  .get(getSoftSkills)
  .post(createSoftSkill);

router.route('/:id')
  .put(updateSoftSkill)
  .delete(deleteSoftSkill);

module.exports = router;