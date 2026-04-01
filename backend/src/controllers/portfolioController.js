const { Portfolio, Project } = require('../models');
const response = require('../utils/response');

// Создать портфолио
const createPortfolio = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return response.error(res, 'Название портфолио обязательно', 400);
    }
    const portfolio = await Portfolio.create({
      user_id: req.user.id,
      title,
    });
    response.success(res, portfolio, 201);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Получить все портфолио пользователя (с проектами)
const getUserPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Project, as: 'Projects' }],
      order: [['created_at', 'DESC']],
    });
    response.success(res, portfolios);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

// Опубликовать портфолио
const publishPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findOne({ where: { id, user_id: req.user.id } });
    if (!portfolio) {
      return response.error(res, 'Портфолио не найдено', 404);
    }
    await portfolio.update({ is_public: true });
    response.success(res, { message: 'Портфолио опубликовано' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

module.exports = { createPortfolio, getUserPortfolios, publishPortfolio };