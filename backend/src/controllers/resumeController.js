// backend/src/controllers/resumeController.js
const { Resume, Education, Experience } = require('../models');
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
    const { title, template, data, is_public, education_ids, experience_ids } = req.body;
    if (!data) return response.error(res, 'Данные резюме обязательны', 400);
    
    // Берём education из data, если нет education_ids
    let educationsData = data.educations || [];
    if (education_ids && education_ids.length) {
      const educations = await Education.findAll({ where: { id: education_ids, user_id: req.user.id } });
      educationsData = educations.map(e => e.toJSON());
    }
    
    let experiencesData = data.experiences || [];
    if (experience_ids && experience_ids.length) {
      const experiences = await Experience.findAll({ where: { id: experience_ids, user_id: req.user.id } });
      experiencesData = experiences.map(e => e.toJSON());
    }
    
    const resumeData = {
      ...data,
      educations: educationsData,
      experiences: experiencesData,
    };
    
    const resume = await Resume.create({
      user_id: req.user.id,
      title: title || 'Без названия',
      template: template || 'default',
      data: resumeData,
      is_public: is_public !== undefined ? is_public : false,
      education_ids: education_ids || [],
      experience_ids: experience_ids || [],
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
    const { title, template, data, is_public, education_ids, experience_ids } = req.body;
    const resume = await Resume.findOne({ where: { id, user_id: req.user.id } });
    if (!resume) return response.error(res, 'Резюме не найдено', 404);
    
    // Определяем итоговые массивы для образования
    let educationsData;
    if (education_ids !== undefined) {
      if (education_ids.length) {
        const educations = await Education.findAll({ where: { id: education_ids, user_id: req.user.id } });
        educationsData = educations.map(e => e.toJSON());
      } else {
        educationsData = [];
      }
    } else {
      // Если education_ids не передан, берём из переданного data, иначе из старых данных
      educationsData = (data && data.educations) ? data.educations : (resume.data?.educations || []);
    }
    
    let experiencesData;
    if (experience_ids !== undefined) {
      if (experience_ids.length) {
        const experiences = await Experience.findAll({ where: { id: experience_ids, user_id: req.user.id } });
        experiencesData = experiences.map(e => e.toJSON());
      } else {
        experiencesData = [];
      }
    } else {
      experiencesData = (data && data.experiences) ? data.experiences : (resume.data?.experiences || []);
    }
    
    const updatedData = {
      ...(data || resume.data),
      educations: educationsData,
      experiences: experiencesData,
    };
    
    await resume.update({
      title: title !== undefined ? title : resume.title,
      template: template !== undefined ? template : resume.template,
      data: updatedData,
      is_public: is_public !== undefined ? is_public : resume.is_public,
      education_ids: education_ids !== undefined ? education_ids : resume.education_ids,
      experience_ids: experience_ids !== undefined ? experience_ids : resume.experience_ids,
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