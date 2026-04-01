/**
 * Успешный ответ с данными
 * @param {Object} res - объект ответа Express
 * @param {any} data - данные для отправки
 * @param {number} status - HTTP статус (по умолчанию 200)
 */
const success = (res, data, status = 200) => {
  res.status(status).json({
    success: true,
    data,
  });
};

/**
 * Ответ с ошибкой
 * @param {Object} res - объект ответа Express
 * @param {string} message - сообщение об ошибке
 * @param {number} status - HTTP статус (по умолчанию 500)
 */
const error = (res, message, status = 500) => {
  res.status(status).json({
    success: false,
    error: message,
  });
};

/**
 * Ответ при ошибке валидации (например, из express-validator)
 * @param {Object} res - объект ответа Express
 * @param {Array} errors - массив ошибок валидации
 */
const validationError = (res, errors) => {
  const messages = errors.map(err => err.msg);
  res.status(400).json({
    success: false,
    error: messages.join(', '),
    details: errors,
  });
};

module.exports = {
  success,
  error,
  validationError,
};