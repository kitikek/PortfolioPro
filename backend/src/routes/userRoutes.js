const express = require('express');
const router = express.Router();
const { updateMe, getMe } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Все маршруты требуют авторизации
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;