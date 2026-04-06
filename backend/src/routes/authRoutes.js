const express = require('express');
const { register, login, getMe, updateMe, uploadAvatar, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { forgotPasswordLimiter, resetPasswordLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPasswordLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;