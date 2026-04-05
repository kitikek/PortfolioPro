// backend/src/routes/analyticsRoutes.js
const express = require('express');
const axios = require('axios');
const { protect } = require('../middlewares/authMiddleware');
const { Skill } = require('../models');

const router = express.Router();
const REC_SERVICE_URL = process.env.REC_SERVICE_URL || 'http://localhost:8001/recommend';

router.use(protect);

router.get('/recommendations', async (req, res) => {
  try {
    const userSkills = await Skill.findAll({
      where: { user_id: req.user.id },
      attributes: ['name', 'level']
    });
    const skillsMap = {};
    userSkills.forEach(s => { skillsMap[s.name] = s.level; });

    // Определяем категорию пользователя (можно вынести в модель User, по умолчанию 'dev')
    const category = req.user.category || 'dev';

    const response = await axios.post(REC_SERVICE_URL, {
      skills: skillsMap,
      category: category
    }, { timeout: 10000 });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Recommendation error:', error.message);
    res.status(500).json({ success: false, error: 'Не удалось получить рекомендации' });
  }
});

module.exports = router;