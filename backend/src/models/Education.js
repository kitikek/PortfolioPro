const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Education = sequelize.define('Education', {
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
  institution: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  degree: {
    type: DataTypes.STRING,
  },
  field_of_study: {
    type: DataTypes.STRING,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Education;