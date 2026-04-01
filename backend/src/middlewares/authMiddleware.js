const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });
      if (!req.user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Не авторизован' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Не авторизован, нет токена' });
  }
};

module.exports = { protect };