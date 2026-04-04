const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Experience = sequelize.define('Experience', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  current: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Experience;