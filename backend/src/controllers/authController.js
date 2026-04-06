const jwt = require('jsonwebtoken');
const { User } = require('../models');
const response = require('../utils/response');
const { sendResetEmail } = require('../utils/mailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    const user = await User.create({ email, password_hash: password, full_name });
    const token = generateToken(user.id);
    res.status(201).json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    const token = generateToken(user.id);
    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      bio: req.user.bio,
      avatar_url: req.user.avatar_url,
      contacts: req.user.contacts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const updateMe = async (req, res) => {
  try {
    const { full_name, bio, contacts } = req.body;
    await User.update(
      { full_name, bio, contacts },
      { where: { id: req.user.id } }
    );
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });
    response.success(res, updatedUser);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка обновления профиля', 500);
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return response.error(res, 'Файл не загружен', 400);
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.update({ avatar_url: avatarUrl }, { where: { id: req.user.id } });
    response.success(res, { avatar_url: avatarUrl });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка загрузки', 500);
  }
};

// 1. Запрос на сброс пароля
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return response.error(res, 'Email обязателен', 400);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return response.success(res, { message: 'Если пользователь с таким email существует, ссылка для сброса пароля будет отправлена.' });
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.update({ resetToken, resetTokenExpiry });

    await sendResetEmail(user.email, resetToken);
    response.success(res, { message: 'Ссылка для сброса пароля отправлена на ваш email.' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// 2. Сброс пароля
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return response.error(res, 'Токен и новый пароль обязательны', 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return response.error(res, 'Недействительная или просроченная ссылка для сброса пароля.', 400);
    }

    const user = await User.findOne({ where: { id: decoded.id, resetToken: token } });
    if (!user) return response.error(res, 'Недействительная ссылка для сброса пароля.', 400);
    if (user.resetTokenExpiry < new Date()) {
      return response.error(res, 'Срок действия ссылки истёк. Запросите восстановление пароля заново.', 400);
    }

    await user.update({
      password_hash: newPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    response.success(res, { message: 'Пароль успешно изменён. Теперь вы можете войти с новым паролем.' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

module.exports = { register, login, getMe, updateMe, uploadAvatar, forgotPassword, resetPassword };