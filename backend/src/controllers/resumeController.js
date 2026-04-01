const { Resume } = require('../models');
const response = require('../utils/response');

const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAll({ where: { user_id: req.user.id } });
    response.success(res, resumes);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const createResume = async (req, res) => {
  try {
    const { template, data } = req.body;
    if (!data) {
      return response.error(res, 'Данные резюме обязательны', 400);
    }
    const resume = await Resume.create({
      user_id: req.user.id,
      template: template || 'default',
      data,
    });
    response.success(res, resume, 201);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { template, data } = req.body;
    const resume = await Resume.findOne({ where: { id, user_id: req.user.id } });
    if (!resume) {
      return response.error(res, 'Резюме не найдено', 404);
    }
    await resume.update({ template, data });
    response.success(res, resume);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

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

module.exports = { getResumes, createResume, updateResume, deleteResume, getResumeById };