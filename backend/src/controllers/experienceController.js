// backend/src/controllers/experienceController.js
const { Experience } = require('../models');
const response = require('../utils/response');

// Получить все записи об опыте работы текущего пользователя
const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.findAll({
      where: { user_id: req.user.id },
      order: [['start_date', 'DESC']],
    });
    response.success(res, experiences);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Создать новую запись об опыте работы
const createExperience = async (req, res) => {
  try {
    const { company, position, start_date, end_date, current, description } = req.body;
    if (!company || !position) {
      return response.error(res, 'Название компании и должность обязательны', 400);
    }
    const experience = await Experience.create({
      user_id: req.user.id,
      company,
      position,
      start_date: start_date || null,
      end_date: current ? null : (end_date || null),
      current: current || false,
      description: description || null,
    });
    response.success(res, experience, 201);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Обновить запись об опыте работы
const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, position, start_date, end_date, current, description } = req.body;
    const experience = await Experience.findOne({ where: { id, user_id: req.user.id } });
    if (!experience) {
      return response.error(res, 'Запись не найдена', 404);
    }
    await experience.update({
      company: company !== undefined ? company : experience.company,
      position: position !== undefined ? position : experience.position,
      start_date: start_date !== undefined ? start_date : experience.start_date,
      end_date: current ? null : (end_date !== undefined ? end_date : experience.end_date),
      current: current !== undefined ? current : experience.current,
      description: description !== undefined ? description : experience.description,
    });
    response.success(res, experience);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Удалить запись об опыте работы
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findOne({ where: { id, user_id: req.user.id } });
    if (!experience) {
      return response.error(res, 'Запись не найдена', 404);
    }
    await experience.destroy();
    response.success(res, { message: 'Запись удалена' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

module.exports = {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
};