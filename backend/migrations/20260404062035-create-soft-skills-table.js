'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SoftSkills', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Добавляем индексы для производительности
    await queryInterface.addIndex('SoftSkills', ['user_id']);
    await queryInterface.addIndex('SoftSkills', ['name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SoftSkills');
  }
};