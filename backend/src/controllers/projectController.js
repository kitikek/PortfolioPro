const { Project, Portfolio } = require('../models');
const response = require('../utils/response');
const path = require('path');
const fs = require('fs');

// Получить все проекты пользователя
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
    if (!portfolio) return response.error(res, 'Портфолио не найдено', 404);
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
    const { portfolioId, title, description, role, team, organization, start_date, end_date, links, technologies, videos, files } = req.body;
    if (!portfolioId || !title) return response.error(res, 'portfolioId и title обязательны', 400);
    const portfolio = await Portfolio.findOne({ where: { id: portfolioId, user_id: req.user.id } });
    if (!portfolio) return response.error(res, 'Портфолио не найдено или не принадлежит вам', 404);
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
      videos: videos || [],
      files: files || [],
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
    const { title, description, role, team, organization, start_date, end_date, images, links, technologies, is_published, videos, files } = req.body;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа к этому проекту', 403);
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
      is_published: is_published !== undefined ? is_published : project.is_published,
      videos: videos !== undefined ? videos : project.videos,
      files: files !== undefined ? files : project.files
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
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа', 403);
    // Удаляем все связанные файлы с диска
    if (project.images && project.images.length) {
      project.images.forEach(imgPath => {
        const fullPath = path.join(__dirname, '../../', imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }
    if (project.videos && project.videos.length) {
      project.videos.forEach(video => {
        if (video.type === 'upload') {
          const fullPath = path.join(__dirname, '../../', video.url);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      });
    }
    if (project.files && project.files.length) {
      project.files.forEach(file => {
        const fullPath = path.join(__dirname, '../../', file.url);
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

// Получить один проект по id (с проверкой доступа)
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (!project.is_published && project.Portfolio.user_id !== req.user?.id) {
      return response.error(res, 'Доступ запрещён', 403);
    }
    response.success(res, project);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Загрузка изображения
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

// Удаление изображения
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

// Загрузка видео
const uploadProjectVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа', 403);
    if (!req.file) return response.error(res, 'Файл не загружен', 400);
    const videoUrl = `/uploads/projects/videos/${req.file.filename}`;
    const currentVideos = project.videos || [];
    currentVideos.push({
      type: 'upload',
      url: videoUrl,
      title: req.body.title || null,
      mimeType: req.file.mimetype
    });
    await project.update({ videos: currentVideos });
    response.success(res, { videoUrl });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка загрузки видео', 500);
  }
};

// Удаление видео
const deleteProjectVideo = async (req, res) => {
  try {
    const { id, videoIndex } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа', 403);
    const videos = project.videos || [];
    const idx = parseInt(videoIndex);
    if (idx >= videos.length) return response.error(res, 'Видео не найдено', 404);
    if (videos[idx].type === 'upload') {
      const filePath = path.join(__dirname, '../../', videos[idx].url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    videos.splice(idx, 1);
    await project.update({ videos });
    response.success(res, { message: 'Видео удалено' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Добавить ссылку на видео (YouTube/Vimeo)
const addVideoLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, title } = req.body;
    if (!url) return response.error(res, 'Ссылка на видео обязательна', 400);
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа', 403);
    const currentVideos = project.videos || [];
    currentVideos.push({
      type: 'link',
      url,
      title: title || null
    });
    await project.update({ videos: currentVideos });
    response.success(res, { message: 'Ссылка добавлена' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Загрузка произвольного файла
const uploadProjectFile = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа', 403);
    if (!req.file) return response.error(res, 'Файл не загружен', 400);
    const fileUrl = `/uploads/projects/files/${req.file.filename}`;
    const currentFiles = project.files || [];
    currentFiles.push({
      name: req.body.name || req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    await project.update({ files: currentFiles });
    response.success(res, { fileUrl });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка загрузки файла', 500);
  }
};

// Удаление файла
const deleteProjectFile = async (req, res) => {
  try {
    const { id, fileIndex } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (project.Portfolio.user_id !== req.user.id) return response.error(res, 'Нет доступа', 403);
    const files = project.files || [];
    const idx = parseInt(fileIndex);
    if (idx >= files.length) return response.error(res, 'Файл не найден', 404);
    const filePath = path.join(__dirname, '../../', files[idx].url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    files.splice(idx, 1);
    await project.update({ files });
    response.success(res, { message: 'Файл удалён' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Публичный просмотр проекта
const getPublicProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return response.error(res, 'Проект не найден', 404);
    if (!project.is_published) return response.error(res, 'Проект не опубликован', 404);
    response.success(res, project);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка загрузки проекта', 500);
  }
};

const downloadProjectFile = async (req, res) => {
  try {
    const { id, fileIndex } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Portfolio, as: 'Portfolio' }]
    });
    if (!project) return response.error(res, 'Проект не найден', 404);

    // Проверка доступа: если проект не опубликован, проверяем владельца
    if (!project.is_published && (!req.user || project.Portfolio.user_id !== req.user.id)) {
      return response.error(res, 'Доступ запрещён', 403);
    }

    const files = project.files || [];
    const idx = parseInt(fileIndex);
    if (isNaN(idx) || idx < 0 || idx >= files.length) {
      return response.error(res, 'Файл не найден', 404);
    }

    const file = files[idx];
    const filePath = path.join(__dirname, '../../', file.url);
    if (!fs.existsSync(filePath)) {
      return response.error(res, 'Файл не найден на диске', 404);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка скачивания', 500);
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
  uploadProjectVideo,
  deleteProjectVideo,
  addVideoLink,
  uploadProjectFile,
  deleteProjectFile,
  getPublicProject,
  downloadProjectFile,
};