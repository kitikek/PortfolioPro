const express = require('express');
const axios = require('axios');
const { protect } = require('../middlewares/authMiddleware');
const { Skill } = require('../models');

const router = express.Router();
const REC_SERVICE_URL = process.env.REC_SERVICE_URL || 'http://localhost:8001/recommend';

// Маппинг русских названий навыков на английские (можно расширять)
const skillTranslationMap = {
  'ооп': 'oop',
  'объектно-ориентированное программирование': 'oop',
  'api': 'api',
  'апи': 'api',
  'git': 'git',
  'гит': 'git',
  'sql': 'sql',
  'базы данных': 'sql',
  'docker': 'docker',
  'докер': 'docker',
  'html': 'html',
  'css': 'css',
  'javascript': 'javascript',
  'js': 'javascript',
  'python': 'python',
  'питон': 'python',
  'react': 'react',
  'react.js': 'react',
  'vue': 'vue',
  'angular': 'angular',
  'node.js': 'node.js',
  'nodejs': 'node.js',
  'express': 'express',
  'mongodb': 'mongodb',
  'postgresql': 'postgresql',
  'mysql': 'mysql',
  'typescript': 'typescript',
  'java': 'java',
  'c#': 'c#',
  'c++': 'c++',
  'php': 'php',
  'go': 'go',
  'rust': 'rust',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'flutter': 'flutter',
  'aws': 'aws',
  'azure': 'azure',
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  'terraform': 'terraform',
  'jenkins': 'jenkins',
  'ci/cd': 'ci/cd',
  'linux': 'linux',
  'windows': 'windows',
  'машинное обучение': 'machine learning',
  'ml': 'machine learning',
  'искусственный интеллект': 'ai',
  'ai': 'ai',
  'data science': 'data science',
  'аналитика': 'analytics',
  'big data': 'big data'
};

router.use(protect);

router.get('/recommendations', async (req, res) => {
  try {
    const userSkills = await Skill.findAll({
      where: { user_id: req.user.id },
      attributes: ['name', 'level']
    });

    const skillsMap = {};
    userSkills.forEach(s => {
      let skillName = s.name.toLowerCase().trim();
      // Игнорируем слишком короткие или бессмысленные названия
      if (skillName.length < 2 || /^\d+$/.test(skillName)) return;
      // Применяем перевод
      const mappedName = skillTranslationMap[skillName] || skillName;
      if (skillsMap[mappedName]) {
        skillsMap[mappedName] = Math.max(skillsMap[mappedName], s.level);
      } else {
        skillsMap[mappedName] = s.level;
      }
    });

    const category = req.user.category || 'dev';

    console.log('Отправляем в Python:', JSON.stringify({ skills: skillsMap, category }));

    const response = await axios.post(REC_SERVICE_URL, {
      skills: skillsMap,
      category: category
    }, { timeout: 15000 });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Ошибка рекомендаций:', error.message);
    if (error.response) console.error('Ответ Python:', error.response.data);
    res.status(500).json({ success: false, error: 'Не удалось получить рекомендации' });
  }
});

module.exports = router;