const { Sequelize } = require('sequelize');
const config = require('./database'); // импортируем объект конфигурации

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false,
  }
);

module.exports = sequelize;