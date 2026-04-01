1. Введение и цели проекта
PortfolioPro — веб-сервис для создания интерактивного цифрового портфолио и резюме. Позволяет специалистам:

регистрироваться и заполнять профиль (образование, опыт, навыки);

добавлять проекты с описанием, изображениями, ссылками;

визуализировать навыки (диаграммы);

формировать резюме в формате PDF с выбором шаблона;

получать аналитические рекомендации по развитию навыков (на основе данных HeadHunter или коллаборативной фильтрации).

Целевая аудитория: студенты, разработчики, дизайнеры (специалисты) и HR-менеджеры/техлиды (работодатели).

2. Общая архитектура
Архитектура описана с помощью методологии C4:

Контекстная диаграмма: система PortfolioPro взаимодействует с пользователями (специалистами, работодателями, администратором) и внешними сервисами (HH.ru API, соцсети для аутентификации).

Диаграмма контейнеров: система состоит из 4 контейнеров:

Веб-приложение (Frontend) — React, статические файлы.
Серверная часть (Backend) — Node.js + Express.
База данных (MySQL).
Объектное хранилище (Amvera Storage / S3).
Диаграмма компонентов (бэкенд):

Контроллеры — обработка HTTP-запросов.

Сервисы — бизнес-логика.

Репозитории — доступ к данным.

Интеграция с внешними API (HH.ru, хранилище).

Архитектурные принципы: SOLID, KISS, DRY, YAGNI, Separation of Concerns, MVP.

3. Технологический стек
Бэкенд: Node.js 18, Express, Sequelize (ORM), MySQL 8.0, jsonwebtoken, bcryptjs, multer (загрузка файлов), dotenv, axios, node-cron.

Фронтенд: React 18, React Router v6, Axios, React Hook Form + Yup, Chart.js / Recharts, jsPDF + html2canvas, Material-UI (или Ant Design) для UI-компонентов.

База данных: MySQL 8.0.

Хранилище: Amvera Storage (S3-совместимое), можно использовать MinIO для локальной разработки.

Контейнеризация: Docker, Docker Compose.

CI/CD: GitHub Actions.

Тестирование: Postman + Newman (интеграционное), Jest (модульное).

4. Структура проекта (монорепозиторий)
text
portfolio-pro/
├── backend/
│   ├── src/
│   │   ├── config/          # конфигурация (БД, хранилище, JWT)
│   │   ├── controllers/     # обработчики запросов
│   │   ├── services/        # бизнес-логика
│   │   ├── repositories/    # доступ к данным (Sequelize)
│   │   ├── models/          # модели данных (Sequelize)
│   │   ├── middlewares/     # auth, validation, errorHandler
│   │   ├── routes/          # маршруты API
│   │   ├── utils/           # вспомогательные функции (JWT, хеширование)
│   │   ├── jobs/            # фоновые задачи (cron)
│   │   ├── app.js           # инициализация express
│   │   └── server.js        # запуск сервера
│   ├── migrations/          # миграции Sequelize
│   ├── .env                 # переменные окружения
│   ├── Dockerfile
│   ├── package.json
│   └── .dockerignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # переиспользуемые компоненты
│   │   ├── pages/           # страницы приложения
│   │   ├── services/        # API-клиенты (axios)
│   │   ├── hooks/           # кастомные хуки
│   │   ├── store/           # контекст/состояние
│   │   ├── utils/           # helper-функции
│   │   ├── styles/          # глобальные стили
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── Dockerfile
│   ├── package.json
│   └── nginx.conf          # для продакшн-сборки
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
└── docs/
    ├── api/                # документация API
    └── postman/            # коллекции тестов
5. Настройка окружения
5.1. Переменные окружения (backend/.env)
env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=portfolio_user
DB_PASSWORD=Portfolio123!
DB_NAME=portfoliopro_db

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

STORAGE_TYPE=local  # local или s3
STORAGE_ENDPOINT=   # для s3
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=

HH_API_URL=https://api.hh.ru
HH_API_TIMEOUT=5000
5.2. Переменные окружения (frontend/.env)
env
REACT_APP_API_URL=http://localhost:5000/api/v1
6. База данных (MySQL)
6.1. Логическая модель (диаграмма классов)
text
+-------------+       +-------------+       +-------------+
|   User      |       |  Portfolio  |       |   Project   |
+-------------+       +-------------+       +-------------+
| id          |<----->| id          |<----->| id          |
| email       |       | user_id     |       | portfolio_id|
| password_hash|      | title       |       | title       |
| full_name   |       | is_public   |       | description |
| bio         |       | created_at  |       | repo_url    |
| avatar_url  |       | updated_at  |       | demo_url    |
| contacts    |       +-------------+       | start_date  |
| role        |                             | end_date    |
+-------------+                             | is_published|
                                            | created_at  |
                                            | updated_at  |
                                            +-------------+

+-------------+       +-------------+       +-------------+
|   Skill     |       |  UserSkill  |       | ProjectImage|
+-------------+       +-------------+       +-------------+
| id          |<----->| id          |<----->| id          |
| name        |       | user_id     |       | project_id  |
+-------------+       | skill_id    |       | image_url   |
                      | level       |       | order       |
                      +-------------+       +-------------+

+-------------+       +-------------+
|   Resume    |       |Recommendation|
+-------------+       +-------------+
| id          |       | id          |
| user_id     |       | user_id     |
| template    |       | skill_name  |
| sections_order|     | reason      |
| updated_at  |       | created_at  |
+-------------+       +-------------+
6.2. Создание базы данных и пользователя (SQL)
sql
CREATE DATABASE portfoliopro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'Portfolio123!';
GRANT ALL PRIVILEGES ON portfoliopro_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
6.3. Sequelize модели
Создать файлы моделей в backend/src/models/. Пример для User.js:

js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  bio: { type: DataTypes.TEXT },
  avatar_url: { type: DataTypes.STRING },
  contacts: { type: DataTypes.JSON, defaultValue: {} },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' }
}, {
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) user.password_hash = await bcrypt.hash(user.password_hash, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) user.password_hash = await bcrypt.hash(user.password_hash, 10);
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User;
Аналогично создать остальные модели: Portfolio, Project, ProjectImage, Skill, UserSkill, Resume, Recommendation. Не забыть определить ассоциации в models/index.js.

6.4. Миграции
Инициализировать Sequelize CLI, создать миграции для каждой таблицы.

7. Бэкенд (Node.js + Express)
7.1. Структура слоёв
config/ — подключение к БД, хранилищу, JWT.

repositories/ — классы, инкапсулирующие операции с БД (CRUD). Например, UserRepository, PortfolioRepository.

services/ — бизнес-логика (регистрация, создание портфолио, валидация, вызов репозиториев). Используют принципы SOLID.

controllers/ — обработка HTTP-запросов, валидация входных данных, вызов сервисов, формирование ответов.

middlewares/ — auth, errorHandler, validation.

routes/ — объединение маршрутов.

utils/ — helper-функции (JWT sign/verify, хеширование, загрузка файлов).

7.2. Аутентификация (JWT)
middleware/authMiddleware.js:

js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password_hash'] } });
      if (!req.user) return res.status(401).json({ success: false, error: 'Пользователь не найден' });
      next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Не авторизован' });
    }
  }
  if (!token) return res.status(401).json({ success: false, error: 'Нет токена' });
};
authController.js:

register — создание пользователя, возврат JWT.

login — проверка пароля, возврат JWT.

getMe — получение данных текущего пользователя.

7.3. API эндпоинты (REST)
Базовый URL: /api/v1. Формат ответа: { success: boolean, data: any, error?: string }.

Аутентификация (не требует токена, кроме /me):

Метод	Путь	Описание
POST	/auth/register	Регистрация (email, password, full_name)
POST	/auth/login	Вход (email, password)
GET	/auth/me	Получить текущего пользователя (требует токен)
Пользователи и профиль:

Метод	Путь	Описание
GET	/users/:id	Публичный профиль (без аутентификации)
PUT	/users/:id	Обновление профиля (только владелец)
GET	/users/:id/skills	Навыки пользователя с уровнями
POST	/users/:id/skills	Добавить навык (только владелец)
PUT	/users/:id/skills/:skillId	Обновить уровень навыка
DELETE	/users/:id/skills/:skillId	Удалить навык
Портфолио и проекты:

Метод	Путь	Описание
GET	/users/:id/portfolio	Получить портфолио пользователя
POST	/portfolios	Создать портфолио
PUT	/portfolios/:id/publish	Опубликовать портфолио
GET	/portfolios/:portfolioId/projects	Список проектов портфолио
POST	/projects	Создать проект (привязать к портфолио)
GET	/projects/:id	Детальная информация о проекте
PUT	/projects/:id	Обновить проект
DELETE	/projects/:id	Удалить проект
POST	/projects/:id/images	Загрузить изображение для проекта
DELETE	/projects/:id/images/:imageId	Удалить изображение
Резюме:

Метод	Путь	Описание
GET	/users/:id/resume	Настройки резюме
PUT	/users/:id/resume	Обновить настройки
POST	/users/:id/resume/generate	Сгенерировать PDF (возвращает ссылку или файл)
Аналитика:

Метод	Путь	Описание
GET	/users/:id/recommendations	Рекомендованные навыки
GET	/skills/popular	Топ-20 навыков (из системы)
GET	/analytics/market	Данные с HH.ru (кэшированные)
7.4. Валидация входных данных
Использовать express-validator или Joi. Пример для создания портфолио:

js
const { body, validationResult } = require('express-validator');

exports.createPortfolio = [
  body('userId').isInt().withMessage('userId должен быть числом'),
  body('title').notEmpty().withMessage('Название обязательно'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    // логика
  }
];
7.5. Загрузка файлов (multer + S3)
Установить multer, aws-sdk (или клиент для S3).

Создать middleware для загрузки одного или нескольких файлов.

Сохранять файлы в S3 (или локально в режиме разработки).

В БД хранить URL.

7.6. Интеграция с HH.ru API
Создать сервис hhService.js с методами для получения вакансий, извлечения навыков.

Кэшировать данные в таблице MarketSkill или в Redis (на выбор).

Запускать фоновую задачу (node-cron) раз в сутки для обновления кэша.

7.7. Фоновые задачи (cron)
Обновление рыночных данных (HH.ru).

Генерация рекомендаций для пользователей на основе популярных навыков.

8. Фронтенд (React)
8.1. Структура страниц
Главная (Landing) — описание сервиса, кнопки регистрации/входа.

Вход / Регистрация — формы с валидацией (React Hook Form + Yup).

Личный кабинет — профиль, редактирование.

Портфолио — список проектов (сетка), кнопка добавления проекта.

Страница проекта — детальный просмотр, редактирование.

Навыки — добавление/удаление, интерактивная диаграмма (Radar/Bar).

Резюме — настройка шаблона, предпросмотр, кнопка скачивания PDF.

Аналитика — отображение рекомендаций и рыночных данных.

Публичный профиль — просмотр профиля другого пользователя (без авторизации).

8.2. Маршрутизация (React Router v6)
jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/profile/:id" element={<PublicProfile />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/projects/:id" element={<ProjectPage />} />
    <Route path="/skills" element={<SkillsPage />} />
    <Route path="/resume" element={<ResumePage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
  </Route>
</Routes>
8.3. Управление состоянием
Использовать React Context для глобального состояния (текущий пользователь, тема).

Для сложных форм — локальное состояние (useState) + React Hook Form.

Для запросов — axios с перехватчиками (добавление JWT).

8.4. Компоненты UI
Рекомендуется использовать Material-UI (MUI) для ускорения разработки:

Кнопки, карточки, модальные окна, поля ввода, навигация.

Иконки: MUI Icons.

8.5. Визуализация навыков
Библиотека Chart.js с обёрткой react-chartjs-2.

Тип диаграммы: радиальная (radar) для сравнения уровней, или столбчатая (bar).

8.6. Генерация PDF
Использовать jsPDF + html2canvas для захвата HTML-элемента и преобразования в PDF.

Или серверная генерация (Puppeteer) для более точного рендеринга.

8.7. Адаптивность
Использовать CSS Grid/Flexbox.

MUI компоненты адаптивны по умолчанию.

9. Контейнеризация (Docker)
9.1. Dockerfile для backend
dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
9.2. Dockerfile для frontend (многостадийная сборка)
dockerfile
# build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
9.3. docker-compose.yml
yaml
version: '3.8'
services:
  db:
    image: mysql:8
    container_name: portfolio-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: portfoliopro_db
      MYSQL_ROOT_HOST: '%'
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: ./backend
    container_name: portfolio-backend
    restart: always
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: portfoliopro_db
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production

  frontend:
    build: ./frontend
    container_name: portfolio-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  db_data:
10. CI/CD (GitHub Actions)
Файл .github/workflows/ci.yml:

yaml
name: CI/CD

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        if: github.ref == 'refs/heads/main'
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and start services
        run: docker-compose up -d --build

      - name: Wait for services
        run: sleep 10

      - name: Install Newman
        run: npm install -g newman

      - name: Run Postman tests
        run: newman run docs/postman/portfolio.postman_collection.json -e docs/postman/portfolio.postman_environment.json

      - name: Stop services
        run: docker-compose down

      - name: Build and push images (main only)
        if: github.ref == 'refs/heads/main'
        run: |
          docker-compose build
          docker tag portfolio-backend:latest ${{ secrets.DOCKER_USERNAME }}/portfolio-backend:latest
          docker tag portfolio-frontend:latest ${{ secrets.DOCKER_USERNAME }}/portfolio-frontend:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/portfolio-backend:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/portfolio-frontend:latest
11. Тестирование
11.1. Интеграционные тесты (Postman + Newman)
Создать коллекцию portfolio.postman_collection.json с запросами для всех ключевых эндпоинтов. Использовать переменные окружения (например, base_url, portfolioId). Пример тестов для создания портфолио:

javascript
pm.test("Status code is 201", () => {
  pm.response.to.have.status(201);
});
pm.test("Response contains data with id", () => {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.id).to.be.a('number');
  pm.environment.set("portfolioId", json.data.id);
});
Запуск локально: newman run collection.json -e environment.json.
