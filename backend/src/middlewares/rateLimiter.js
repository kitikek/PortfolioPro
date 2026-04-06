const rateLimit = require('express-rate-limit');

// Ограничение для forgot-password (3 запроса в час)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, error: 'Слишком много запросов на сброс пароля. Попробуйте позже.' },
});

// Ограничение для reset-password (5 запросов за 15 минут)
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Слишком много попыток сброса пароля. Попробуйте позже.' },
});

module.exports = { forgotPasswordLimiter, resetPasswordLimiter };