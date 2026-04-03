const { Education } = require('../models');
const response = require('../utils/response');

const getEducations = async (req, res) => {
  try {
    const educations = await Education.findAll({ where: { user_id: req.user.id }, order: [['start_date', 'DESC']] });
    response.success(res, educations);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const createEducation = async (req, res) => {
  try {
    const { institution, degree, field_of_study, start_date, end_date, description } = req.body;
    if (!institution) return response.error(res, 'Укажите учебное заведение', 400);
    const education = await Education.create({
      user_id: req.user.id,
      institution,
      degree,
      field_of_study,
      start_date,
      end_date,
      description,
    });
    response.success(res, education, 201);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const education = await Education.findOne({ where: { id, user_id: req.user.id } });
    if (!education) return response.error(res, 'Запись не найдена', 404);
    await education.update(req.body);
    response.success(res, education);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const education = await Education.findOne({ where: { id, user_id: req.user.id } });
    if (!education) return response.error(res, 'Запись не найдена', 404);
    await education.destroy();
    response.success(res, { message: 'Удалено' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

module.exports = { getEducations, createEducation, updateEducation, deleteEducation };