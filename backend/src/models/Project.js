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