const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Импорт моделей
db.User = require('./User');
db.Portfolio = require('./Portfolio');
db.Project = require('./Project');
db.Skill = require('./Skill');
db.Resume = require('./Resume');

// Ассоциации
db.User.hasMany(db.Portfolio, { foreignKey: 'user_id', as: 'Portfolios' });
db.Portfolio.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });

db.Portfolio.hasMany(db.Project, { foreignKey: 'portfolio_id', as: 'Projects' });
db.Project.belongsTo(db.Portfolio, { foreignKey: 'portfolio_id', as: 'Portfolio' });

db.User.hasMany(db.Skill, { foreignKey: 'user_id', as: 'Skills' });
db.Skill.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });

db.User.hasOne(db.Resume, { foreignKey: 'user_id', as: 'Resume' });
db.Resume.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });

module.exports = db;