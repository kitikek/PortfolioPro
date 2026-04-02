// backend/src/seeders/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

const { User, Portfolio, Project, Skill, Resume } = db;

async function seed() {
  try {
    // Синхронизация всех моделей (создаст таблицы, если их нет)
    await db.sequelize.sync({ alter: true });
    console.log('✅ Таблицы синхронизированы');

    // Удаляем существующие данные (осторожно!)
    await User.destroy({ where: {} });
    await Portfolio.destroy({ where: {} });
    await Project.destroy({ where: {} });
    await Skill.destroy({ where: {} });
    await Resume.destroy({ where: {} });
    console.log('🗑️  Старые данные удалены');

    // Создаём тестового пользователя
    const user = await User.create({
      email: 'test@example.com',
      password_hash: 'password123', // будет захеширован через хук beforeCreate
      full_name: 'Тестовый Пользователь',
      bio: 'Разработчик, люблю React и Node.js',
      contacts: { github: 'testuser', linkedin: 'testuser' }
    });
    console.log(`✅ Создан пользователь: ${user.email}`);

    // Создаём портфолио
    const portfolio = await Portfolio.create({
      user_id: user.id,
      title: 'Моё профессиональное портфолио',
      is_public: true
    });
    console.log(`✅ Создано портфолио: ${portfolio.title}`);

    // Создаём проекты
    const project1 = await Project.create({
      portfolio_id: portfolio.id,
      title: 'Todo App на React',
      description: 'Простое приложение для управления задачами. Использует React и локальное хранилище.',
      technologies: ['React', 'JavaScript', 'CSS'],
      links: { github: 'https://github.com/test/todo-app', demo: 'https://test-todo-app.netlify.app' },
      images: [],
      is_published: true
    });
    console.log(`✅ Создан проект: ${project1.title}`);

    const project2 = await Project.create({
      portfolio_id: portfolio.id,
      title: 'REST API для блога',
      description: 'API на Express с JWT-аутентификацией и связью с MySQL.',
      technologies: ['Node.js', 'Express', 'MySQL', 'JWT'],
      links: { github: 'https://github.com/test/blog-api' },
      images: [],
      is_published: true
    });
    console.log(`✅ Создан проект: ${project2.title}`);

    const project3 = await Project.create({
      portfolio_id: portfolio.id,
      title: 'Портфолио-менеджер PortfolioPro',
      description: 'Веб-сервис для создания цифровых портфолио и резюме.',
      technologies: ['React', 'Node.js', 'Express', 'MySQL', 'Sequelize'],
      links: { github: 'https://github.com/test/portfolio-pro' },
      images: [],
      is_published: true
    });
    console.log(`✅ Создан проект: ${project3.title}`);

    // Создаём навыки
    const skills = [
      { name: 'JavaScript', level: 5, category: 'Frontend' },
      { name: 'React', level: 4, category: 'Frontend' },
      { name: 'Node.js', level: 4, category: 'Backend' },
      { name: 'Express', level: 4, category: 'Backend' },
      { name: 'MySQL', level: 3, category: 'Database' },
      { name: 'Git', level: 4, category: 'Tools' },
      { name: 'Docker', level: 2, category: 'DevOps' }
    ];
    for (const skillData of skills) {
      await Skill.create({
        user_id: user.id,
        ...skillData
      });
    }
    console.log(`✅ Создано ${skills.length} навыков`);

    // Создаём резюме (пустое, можно заполнить позже)
    await Resume.create({
    user_id: user.id,
    title: 'Тестовое резюме',
    template: 'default',
    data: {
        personal: { name: user.full_name, email: user.email },
        education: [],
        experience: [],
        skills: skills.map(s => ({ name: s.name, level: s.level }))
    }
    });
    console.log('✅ Создано резюме');

    console.log('\n🎉 Сидирование завершено успешно!');
    console.log('Тестовые данные:');
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Пароль: password123`);
    console.log(`  - ID пользователя: ${user.id}`);
    console.log(`  - ID портфолио: ${portfolio.id}`);
  } catch (error) {
    console.error('❌ Ошибка при сидировании:', error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));