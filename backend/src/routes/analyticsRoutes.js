// backend/src/routes/analyticsRoutes.js
const express = require('express');
const axios = require('axios');
const { protect } = require('../middlewares/authMiddleware');
const { Skill } = require('../models');

const router = express.Router();
const REC_SERVICE_URL = process.env.REC_SERVICE_URL || 'http://localhost:8001';

router.use(protect);

router.get('/professions', async (req, res) => {
  try {
    const response = await axios.get(`${REC_SERVICE_URL}/professions`);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка загрузки профессий' });
  }
});

router.post('/recommend', async (req, res) => {
  try {
    const { skills, category, selected_profession } = req.body;
    const response = await axios.post(`${REC_SERVICE_URL}/recommend`, {
      skills,
      category: category || 'dev',
      selected_profession
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.response?.data?.detail || 'Ошибка' });
  }
});

module.exports = router;