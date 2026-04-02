const express = require('express');
const { register, login, getMe, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;