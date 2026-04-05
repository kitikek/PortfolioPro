'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Projects', 'videos', {
      type: Sequelize.JSON,
      defaultValue: []
    });
    await queryInterface.addColumn('Projects', 'files', {
      type: Sequelize.JSON,
      defaultValue: []
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Projects', 'videos');
    await queryInterface.removeColumn('Projects', 'files');
  }
};