const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  portfolio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Portfolios',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  team: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Название команды или список участников',
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  links: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  technologies: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Project;