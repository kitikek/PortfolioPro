const { Skill } = require('../models');
const response = require('../utils/response');

const getSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({ where: { user_id: req.user.id } });
    response.success(res, skills);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const createSkill = async (req, res) => {
  try {
    const { name, level, category } = req.body;
    if (!name || !level) {
      return response.error(res, 'Название и уровень навыка обязательны', 400);
    }
    const skill = await Skill.create({
      user_id: req.user.id,
      name,
      level,
      category: category || null,
    });
    response.success(res, skill, 201);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, category } = req.body;
    const skill = await Skill.findOne({ where: { id, user_id: req.user.id } });
    if (!skill) {
      return response.error(res, 'Навык не найден', 404);
    }
    await skill.update({ name, level, category });
    response.success(res, skill);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findOne({ where: { id, user_id: req.user.id } });
    if (!skill) {
      return response.error(res, 'Навык не найден', 404);
    }
    await skill.destroy();
    response.success(res, { message: 'Навык удалён' });
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findOne({ where: { id, user_id: req.user.id } });
    if (!skill) {
      return response.error(res, 'Навык не найден', 404);
    }
    response.success(res, skill);
  } catch (error) {
    console.error(error);
    response.error(res, 'Ошибка сервера', 500);
  }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill, getSkillById };