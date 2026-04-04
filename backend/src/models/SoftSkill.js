const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SoftSkill = sequelize.define('SoftSkill', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
  tableName: 'softskills',   // <-- добавляем эту строку
});

module.exports = SoftSkill;