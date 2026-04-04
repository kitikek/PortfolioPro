const db = require('../models');

/**
 * Обновление профиля текущего пользователя
 * PUT /api/v1/users/me
 */
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id; // из middleware protect
    const { full_name, bio, contacts } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }

    // Обновляем только разрешённые поля
    if (full_name !== undefined) user.full_name = full_name;
    if (bio !== undefined) user.bio = bio;
    if (contacts !== undefined) user.contacts = contacts;
    await user.save();

    // Возвращаем данные без пароля
    const { password_hash, ...userData } = user.toJSON();
    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('❌ Ошибка обновления профиля:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

/**
 * Получение своего профиля (дублирует /auth/me, но для единообразия)
 * GET /api/v1/users/me
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};