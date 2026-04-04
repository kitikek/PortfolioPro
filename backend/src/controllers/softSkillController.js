const db = require('../models');

// Получить все софт-скиллы текущего пользователя
exports.getSoftSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const softSkills = await db.SoftSkill.findAll({
      where: { user_id: userId },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: softSkills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка загрузки софт-скиллов' });
  }
};

// Создать новый софт-скилл
exports.createSoftSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Название обязательно' });
    }
    const softSkill = await db.SoftSkill.create({
      user_id: userId,
      name: name.trim(),
    });
    res.status(201).json({ success: true, data: softSkill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка создания' });
  }
};

// Обновить софт-скилл
exports.updateSoftSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name } = req.body;
    const softSkill = await db.SoftSkill.findOne({ where: { id, user_id: userId } });
    if (!softSkill) {
      return res.status(404).json({ success: false, error: 'Софт-скилл не найден' });
    }
    if (name) softSkill.name = name.trim();
    await softSkill.save();
    res.json({ success: true, data: softSkill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка обновления' });
  }
};

// Удалить софт-скилл
exports.deleteSoftSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleted = await db.SoftSkill.destroy({ where: { id, user_id: userId } });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Софт-скилл не найден' });
    }
    res.json({ success: true, message: 'Удалено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка удаления' });
  }
};