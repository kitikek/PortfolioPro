const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Portfolio = sequelize.define('Portfolio', {
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
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Portfolio;