const { Resume } = require('../models');
const response = require('../utils/response');

// Получить все резюме пользователя
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAll({ where: { user_id: req.user.id } });
    response.success(res, resumes);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Создать резюме
const createResume = async (req, res) => {
  try {
    const { title, template, data, is_public } = req.body;
    if (!data) {
      return response.error(res, 'Данные резюме обязательны', 400);
    }
    const resume = await Resume.create({
      user_id: req.user.id,
      title: title || 'Без названия',
      template: template || 'default',
      data,
      is_public: is_public !== undefined ? is_public : false,
    });
    response.success(res, resume, 201);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Обновить резюме
const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, template, data, is_public } = req.body;
    const resume = await Resume.findOne({ where: { id, user_id: req.user.id } });
    if (!resume) {
      return response.error(res, 'Резюме не найдено', 404);
    }
    await resume.update({
      title: title !== undefined ? title : resume.title,
      template: template !== undefined ? template : resume.template,
      data: data !== undefined ? data : resume.data,
      is_public: is_public !== undefined ? is_public : resume.is_public,
    });
    response.success(res, resume);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Удалить резюме
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ where: { id, user_id: req.user.id } });
    if (!resume) {
      return response.error(res, 'Резюме не найдено', 404);
    }
    await resume.destroy();
    response.success(res, { message: 'Резюме удалено' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Получить одно резюме по ID (только для владельца)
const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ where: { id, user_id: req.user.id } });
    if (!resume) return response.error(res, 'Резюме не найдено', 404);
    response.success(res, resume);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Публичный просмотр резюме
const getPublicResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findByPk(id);
    if (!resume) return response.error(res, 'Резюме не найдено', 404);
    if (!resume.is_public) return response.error(res, 'Резюме скрыто владельцем', 403);
    response.success(res, resume);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const publishResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ where: { id, user_id: req.user.id } });
    if (!resume) return response.error(res, 'Резюме не найдено', 404);
    await resume.update({ is_public: true });
    response.success(res, { message: 'Резюме опубликовано' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const unpublishResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ where: { id, user_id: req.user.id } });
    if (!resume) return response.error(res, 'Резюме не найдено', 404);
    await resume.update({ is_public: false });
    response.success(res, { message: 'Резюме скрыто' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

module.exports = {
  getResumes,
  createResume,
  updateResume,
  deleteResume,
  getResumeById,
  getPublicResume,
  publishResume,
  unpublishResume,
};