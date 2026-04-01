const { Project, Portfolio } = require('../models');
const response = require('../utils/response');

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
    const { portfolioId, title, description, images, links, technologies } = req.body;
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
      images: images || [],
      links: links || {},
      technologies: technologies || [],
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
    const { title, description, images, links, technologies, is_published } = req.body;
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

module.exports = {
  getUserProjects,
  getProjectsByPortfolio,
  createProject,
  updateProject,
  deleteProject,
  getProjectById
};