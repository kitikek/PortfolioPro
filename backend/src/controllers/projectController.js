const { Project, Portfolio } = require('../models');
const response = require('../utils/response');
const path = require('path');
const fs = require('fs');

// Получить все проекты пользователя (через все его портфолио)
const getUserProjects = async (req, res) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { user_id: req.user.id },
      attributes: ['id']
    });
    const portfolioIds = portfolios.map(p => p.id);
    const projects = await Project.findAll({
      where: { portfolio_id: portfolioIds },
      order: [['created_at', 'DESC']]
    });
    response.success(res, projects);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Получить проекты конкретного портфолио
const getProjectsByPortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const portfolio = await Portfolio.findOne({
      where: { id: portfolioId, user_id: req.user.id }
    });
    if (!portfolio) {
      return response.error(res, 'Портфолио не найдено', 404);
    }
    const projects = await Project.findAll({
      where: { portfolio_id: portfolioId },
      order: [['created_at', 'DESC']]
    });
    response.success(res, projects);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Создать проект
const createProject = async (req, res) => {
  try {
    const { portfolioId, title, description, role, team, organization, start_date, end_date, links, technologies } = req.body;
    if (!portfolioId || !title) {
      return response.error(res, 'portfolioId и title обязательны', 400);
    }
    const portfolio = await Portfolio.findOne({
      where: { id: portfolioId, user_id: req.user.id }
    });
    if (!portfolio) {
      return response.error(res, 'Портфолио не найдено или не принадлежит вам', 404);
    }
    const project = await Project.create({
      portfolio_id: portfolioId,
      title,
      description: description || null,
      role: role || null,
      team: team || null,
      organization: organization || null,
      start_date: start_date || null,
      end_date: end_date || null,
      links: links || {},
      technologies: technologies || [],
      images: [],
      is_published: false
    });
    response.success(res, project, 201);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Обновить проект
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, role, team, organization, start_date, end_date, images, links, technologies, is_published } = req.body;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) {
      return response.error(res, 'Проект не найден', 404);
    }
    if (project.Portfolio.user_id !== req.user.id) {
      return response.error(res, 'Нет доступа к этому проекту', 403);
    }
    await project.update({
      title: title !== undefined ? title : project.title,
      description: description !== undefined ? description : project.description,
      role: role !== undefined ? role : project.role,
      team: team !== undefined ? team : project.team,
      organization: organization !== undefined ? organization : project.organization,
      start_date: start_date !== undefined ? start_date : project.start_date,
      end_date: end_date !== undefined ? end_date : project.end_date,
      images: images !== undefined ? images : project.images,
      links: links !== undefined ? links : project.links,
      technologies: technologies !== undefined ? technologies : project.technologies,
      is_published: is_published !== undefined ? is_published : project.is_published
    });
    response.success(res, project);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Удалить проект
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) {
      return response.error(res, 'Проект не найден', 404);
    }
    if (project.Portfolio.user_id !== req.user.id) {
      return response.error(res, 'Нет доступа к этому проекту', 403);
    }
    // Удаляем связанные изображения с диска
    if (project.images && project.images.length) {
      project.images.forEach(imgPath => {
        const fullPath = path.join(__dirname, '../../', imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }
    await project.destroy();
    response.success(res, { message: 'Проект удалён' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Получить один проект по id (с проверкой доступа к неопубликованным)
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) {
      return response.error(res, 'Проект не найден', 404);
    }
    // Если проект не опубликован и пользователь не владелец, запрещаем просмотр
    if (!project.is_published && project.Portfolio.user_id !== req.user?.id) {
      return response.error(res, 'Доступ запрещён', 403);
    }
    response.success(res, project);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Загрузка изображения для проекта
const uploadProjectImage = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа', 403);
    if (!req.file) return response.error(res, 'Файл не загружен', 400);
    const imageUrl = `/uploads/projects/${req.file.filename}`;
    const currentImages = project.images || [];
    currentImages.push(imageUrl);
    await project.update({ images: currentImages });
    response.success(res, { imageUrl });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка загрузки', 500);
  }
};

// Удаление изображения из проекта (по индексу)
const deleteProjectImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа', 403);
    const images = project.images || [];
    const idx = parseInt(imageIndex);
    if (idx >= images.length) return response.error(res, 'Изображение не найдено', 404);
    // Удаляем файл с диска
    const filePath = path.join(__dirname, '../../', images[idx]);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    images.splice(idx, 1);
    await project.update({ images });
    response.success(res, { message: 'Изображение удалено' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Получить публичный проект (без авторизации)
exports.getPublicProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await db.Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Проект не найден' });
    }
    if (!project.is_published) {
      return res.status(404).json({ success: false, error: 'Проект не опубликован' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Ошибка загрузки проекта' });
  }
};

module.exports = {
  getUserProjects,
  getProjectsByPortfolio,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  uploadProjectImage,
  deleteProjectImage,
};