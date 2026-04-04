'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Таблица Users
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bio: {
        type: Sequelize.TEXT
      },
      avatar_url: {
        type: Sequelize.STRING
      },
      contacts: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Индексы для Users
    await queryInterface.addIndex('Users', ['email'], { unique: true });
    await queryInterface.addIndex('Users', ['created_at']);

    // 2. Таблица Portfolios
    await queryInterface.createTable('Portfolios', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Portfolios', ['user_id']);
    await queryInterface.addIndex('Portfolios', ['is_public']);

    // 3. Таблица Resumes
    await queryInterface.createTable('Resumes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Без названия'
      },
      template: {
        type: Sequelize.STRING,
        defaultValue: 'default'
      },
      data: {
        type: Sequelize.JSON,
        allowNull: false
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pdf_url: {
        type: Sequelize.STRING
      },
      education_ids: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      experience_ids: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Resumes', ['user_id']);
    await queryInterface.addIndex('Resumes', ['is_public']);

    // 4. Таблица Skills
    await queryInterface.createTable('Skills', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 10 }
      },
      category: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Skills', ['user_id']);
    await queryInterface.addIndex('Skills', ['category']);

    // 5. Таблица Education
    await queryInterface.createTable('Educations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      institution: {
        type: Sequelize.STRING,
        allowNull: false
      },
      degree: {
        type: Sequelize.STRING
      },
      field_of_study: {
        type: Sequelize.STRING
      },
      start_date: {
        type: Sequelize.DATEONLY
      },
      end_date: {
        type: Sequelize.DATEONLY
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Educations', ['user_id']);
    await queryInterface.addIndex('Educations', ['start_date']);

    // 6. Таблица Experience
    await queryInterface.createTable('Experiences', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      company: {
        type: Sequelize.STRING,
        allowNull: false
      },
      position: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATEONLY
      },
      end_date: {
        type: Sequelize.DATEONLY
      },
      current: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Experiences', ['user_id']);
    await queryInterface.addIndex('Experiences', ['start_date']);
    await queryInterface.addIndex('Experiences', ['current']);

    // 7. Таблица Projects (зависит от Portfolios)
    await queryInterface.createTable('Projects', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      portfolio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Portfolios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      role: {
        type: Sequelize.STRING
      },
      team: {
        type: Sequelize.STRING,
        comment: 'Название команды или список участников'
      },
      organization: {
        type: Sequelize.STRING
      },
      start_date: {
        type: Sequelize.DATEONLY
      },
      end_date: {
        type: Sequelize.DATEONLY
      },
      images: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      links: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      technologies: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Projects', ['portfolio_id']);
    await queryInterface.addIndex('Projects', ['is_published']);
    await queryInterface.addIndex('Projects', ['start_date']);
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем таблицы в обратном порядке (из-за внешних ключей)
    await queryInterface.dropTable('Projects');
    await queryInterface.dropTable('Experiences');
    await queryInterface.dropTable('Educations');
    await queryInterface.dropTable('Skills');
    await queryInterface.dropTable('Resumes');
    await queryInterface.dropTable('Portfolios');
    await queryInterface.dropTable('Users');
    // Удаляем ENUM тип (только для PostgreSQL, для других БД не критично)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
  }
};