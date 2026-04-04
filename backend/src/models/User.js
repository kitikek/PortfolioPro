const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  avatar_url: {
    type: DataTypes.STRING,
  },
  contacts: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
}, {
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
  },
});

User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User;