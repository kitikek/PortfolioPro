const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resume = sequelize.define('Resume', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Без названия',
  },
  template: {
    type: DataTypes.STRING,
    defaultValue: 'default',
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pdf_url: {
    type: DataTypes.STRING,
  },
  education_ids: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  experience_ids: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Resume;