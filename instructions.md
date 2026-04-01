Инструкции по разработке веб-сервиса PortfolioPro
1. Общее описание проекта
PortfolioPro — веб-сервис для создания интерактивного цифрового портфолио и резюме. Позволяет специалистам:

регистрироваться и заполнять профиль (образование, опыт, навыки);

добавлять проекты с описанием, изображениями, ссылками;

визуализировать навыки (диаграммы);

формировать резюме в формате PDF с выбором шаблона;

получать аналитические рекомендации по развитию навыков (на основе данных HeadHunter или простой коллаборативной фильтрации).

Целевые пользователи: специалисты (студенты, разработчики, дизайнеры) и работодатели (HR, техлиды).

Технологический стек:

Бэкенд: Node.js + Express (JavaScript/TypeScript)

Фронтенд: React (JavaScript/TS) + React Router

База данных: MySQL 8.0

Хранение файлов: объектное хранилище (Amvera Storage, S3-совместимое)

Деплой: облачная платформа Amvera

Дополнительно: REST API, JWT-аутентификация, библиотеки для визуализации и PDF.

2. Требования к окружению разработки
Node.js: версия 18.x или выше

MySQL: версия 8.0

Git: для контроля версий

Пакетный менеджер: npm или yarn

IDE: VS Code (рекомендуются плагины: ESLint, Prettier, MySQL)

Доступ к объектному хранилищу (Amvera Storage) — для загрузки изображений проектов и аватар

3. Структура проекта (монорепозиторий)
text
portfolio-pro/
├── backend/
│   ├── src/
│   │   ├── config/           # конфигурация (БД, хранилище, JWT)
│   │   ├── controllers/      # обработчики запросов
│   │   ├── services/         # бизнес-логика
│   │   ├── repositories/     # доступ к данным
│   │   ├── models/           # модели данных (Sequelize или ручные)
│   │   ├── middlewares/      # middleware (auth, validation)
│   │   ├── routes/           # маршруты API
│   │   ├── utils/            # вспомогательные функции
│   │   ├── jobs/             # фоновые задачи (обновление рекомендаций)
│   │   └── app.js            # точка входа
│   ├── migrations/           # миграции БД
│   ├── package.json
│   └── .env                  # переменные окружения
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # переиспользуемые UI-компоненты
│   │   ├── pages/            # страницы приложения
│   │   ├── services/         # API-клиенты (axios)
│   │   ├── hooks/            # кастомные хуки
│   │   ├── store/            # управление состоянием (context/redux)
│   │   ├── styles/           # глобальные стили
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
└── docs/                     # документация (ТЗ, инструкции)
4. База данных
4.1 Модели данных (логическая схема)
Основные сущности:

User

id (PK)

email (unique)

password_hash

full_name

bio (text)

avatar_url

contacts (JSON: phone, linkedin, github)

role (enum: 'user', 'admin')

created_at, updated_at

Portfolio

id (PK)

user_id (FK)

title

is_public (bool)

created_at

Project

id (PK)

portfolio_id (FK)

title

description (text)

repo_url

demo_url

start_date, end_date

is_published (bool)

created_at, updated_at

ProjectImage

id (PK)

project_id (FK)

image_url

order (int)

Skill (справочник)

id (PK)

name (unique)

UserSkill

id (PK)

user_id (FK)

skill_id (FK)

level (int, 1–5)

Resume (настройки резюме)

id (PK)

user_id (FK)

template (string)

sections_order (JSON)

updated_at

Recommendation (результаты аналитики)

id (PK)

user_id (FK)

skill_name

reason (string)

created_at

4.2 Реализация
Использовать ORM Sequelize для удобства работы с БД и миграциями.

Создать миграции для каждой таблицы.

Для связи many-to-many (UserSkill) использовать промежуточную таблицу.

Пример миграции (Sequelize CLI):

bash
npx sequelize-cli model:generate --name User --attributes email:string,password_hash:string,full_name:string
4.3 Индексы
email в таблице User (уникальный)

user_id в Portfolio, UserSkill, Resume, Recommendation

portfolio_id в Project

5. API (RESTful)
Все эндпоинты имеют префикс /api/v1.

5.1 Аутентификация
Метод	Путь	Описание
POST	/auth/register	Регистрация (email, password, full_name)
POST	/auth/login	Вход (email, password) -> возвращает JWT
POST	/auth/logout	Выход (опционально)
GET	/auth/me	Получить данные текущего пользователя
Защита: для всех маршрутов, кроме /auth/*, требуется JWT в заголовке Authorization: Bearer <token>.

5.2 Пользователи и профиль
Метод	Путь	Описание
GET	/users/:id	Публичный профиль (доступен без аутентификации)
PUT	/users/:id	Обновление профиля (только владелец)
GET	/users/:id/skills	Получить навыки пользователя с уровнями
POST	/users/:id/skills	Добавить навык (только владелец)
PUT	/users/:id/skills/:skillId	Обновить уровень
DELETE	/users/:id/skills/:skillId	Удалить навык
5.3 Портфолио и проекты
Метод	Путь	Описание
GET	/users/:id/portfolio	Получить портфолио пользователя (список проектов)
POST	/users/:id/portfolio	Создать портфолио (если нет) – автоматически при первом проекте
GET	/portfolio/:portfolioId/projects	Список проектов портфолио
POST	/portfolio/:portfolioId/projects	Создать проект
GET	/projects/:projectId	Детальная информация о проекте
PUT	/projects/:projectId	Обновить проект
DELETE	/projects/:projectId	Удалить проект
POST	/projects/:projectId/images	Загрузить изображение для проекта
DELETE	/projects/:projectId/images/:imageId	Удалить изображение
5.4 Резюме и генерация PDF
Метод	Путь	Описание
GET	/users/:id/resume	Получить настройки резюме
PUT	/users/:id/resume	Обновить настройки (шаблон, порядок разделов)
POST	/users/:id/resume/generate	Сгенерировать PDF (возвращает ссылку или сам файл)
5.5 Аналитика и рекомендации
Метод	Путь	Описание
GET	/users/:id/recommendations	Получить список рекомендуемых навыков
GET	/skills/popular	Получить топ-20 навыков (общих или для категории)
GET	/analytics/market	Данные с HH.ru (кэшированные)
6. Фронтенд
6.1 Используемые библиотеки
React (create-react-app или Vite)

React Router для маршрутизации

Axios для HTTP-запросов

React Hook Form + Yup для форм и валидации

Material-UI (MUI) или Ant Design – готовые компоненты (кнопки, карточки, модальные окна, поля ввода)

Chart.js или Recharts для визуализации навыков

jsPDF + html2canvas (или react-pdf) для генерации PDF

React Toastify для уведомлений

6.2 Страницы (pages)
Главная (landing) – описание сервиса, призыв к регистрации.

Вход / Регистрация – формы с валидацией.

Личный кабинет – профиль пользователя, возможность редактирования.

Портфолио – список проектов (сетка), кнопка добавления проекта.

Страница проекта (детальная) – просмотр/редактирование проекта.

Навыки – добавление/удаление навыков, интерактивная диаграмма.

Резюме – настройка шаблона, предпросмотр, кнопка скачивания PDF.

Аналитика – отображение рекомендаций и рыночных данных (графики).

Публичный профиль – просмотр профиля другого пользователя.

6.3 Основные компоненты (shared)
Button (можно взять из MUI)

Input (MUI TextField)

Card (MUI Card)

Modal (MUI Dialog)

Navbar (AppBar + меню)

Sidebar (опционально)

ProtectedRoute – компонент для защиты приватных страниц

6.4 Управление состоянием
Использовать React Context API для глобального состояния (пользователь, тема).

Для более сложных состояний (например, пагинация проектов) можно использовать useReducer.

Сохранять токен JWT в localStorage или httpOnly cookie.

6.5 Маршрутизация (React Router)
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
7. Модуль аналитики и рекомендаций
7.1 Упрощённый подход (MVP)
Фоновый job (cron) раз в сутки:

Собирает все навыки из таблицы UserSkill, считает частоту.

Для каждого пользователя находит навыки, которых у него нет, но которые входят в топ-20 самых популярных.

Формирует записи в таблице Recommendation (skill_name, reason = "Популярный навык").

Для получения рыночных данных:

Периодически запрашивает HeadHunter API (например, GET /vacancies?text=разработка&only_with_salary=true&per_page=100) и извлекает навыки из вакансий.

Кэширует результат на 24 часа в отдельной таблице MarketSkill.

7.2 Нейросетевой подход (перспективное развитие)
Использовать данные HH.ru (4494 навыка) и построить нейросеть, как описано в статье.

Модель (двухканальная) будет предсказывать вероятность необходимости навыка для пользователя.

Вместе с семантической близостью (матрица совместной встречаемости) формировать гибридный скор.

Модель можно вынести в отдельный микросервис на Python (Flask) и вызывать из Node.js по HTTP.

8. Модуль генерации PDF
На фронтенде использовать jsPDF + html2canvas для "печати" страницы резюме.

Альтернатива: серверная генерация с помощью Puppeteer (безголовый браузер) для точного отображения.

Для MVP можно реализовать простой вариант: отобразить предварительный вид резюме и вызвать window.print() для сохранения в PDF.

Вариант с jsPDF:

js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const generatePDF = (element) => {
  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save('resume.pdf');
  });
};
9. Визуализация навыков
Использовать Chart.js или Recharts.

Диаграмма может быть:

Радарная – для сравнения уровня навыков.

Круговая/кольцевая – доля навыков по уровню.

Столбчатая – рейтинг навыков.

Библиотека react-chartjs-2 предоставляет готовые компоненты.

Пример (Chart.js):

jsx
import { Radar } from 'react-chartjs-2';

const data = {
  labels: ['JavaScript', 'React', 'Python', 'SQL', 'Docker'],
  datasets: [{
    label: 'Уровень владения',
    data: [5, 4, 3, 2, 1],
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
  }],
};

<Radar data={data} />
10. Загрузка файлов (изображения)
На бэкенде использовать multer для приёма multipart/form-data.

Загружать файлы в объектное хранилище (Amvera Storage). В БД сохранять только URL.

Для фронтенда – компонент загрузки (MUI Upload) с предпросмотром.

11. Аутентификация и безопасность
JWT с коротким сроком жизни (например, 7 дней). Refresh token опционально.

Пароли хешировать bcrypt.

Все запросы через HTTPS.

Защита от CSRF (можно использовать cookie с SameSite=Strict).

Валидация входных данных на бэкенде (например, с помощью express-validator).

12. Тестирование
Модульное тестирование: Jest для бэкенда, React Testing Library для фронтенда.

Интеграционное тестирование: проверка API (Supertest).

Пользовательское тестирование: с привлечением 3–5 тестовых пользователей для проверки сценариев.

13. Деплой
Платформа: Amvera (поддерживает Node.js, MySQL, объектное хранилище).

Настроить переменные окружения (DATABASE_URL, JWT_SECRET, STORAGE_ACCESS_KEY и т.д.).

Использовать PM2 для управления процессом Node.js.

Для автоматизации деплоя настроить CI/CD (например, через GitHub Actions).

14. Рекомендации по использованию готовых библиотек
UI-компоненты: Material-UI (MUI) – полный набор готовых компонентов (кнопки, карточки, модалки, формы). Можно использовать их дизайн-систему, что сократит время вёрстки.

Иконки: MUI Icons или FontAwesome.

Формы: React Hook Form + Yup – удобная валидация.

HTTP-клиент: Axios (интерцепторы для добавления JWT).

Маршрутизация: React Router v6.

Уведомления: React Toastify.

Диаграммы: Recharts (более декларативный) или Chart.js.

PDF: jsPDF + html2canvas (для простого варианта).

Аутентификация: JWT – библиотека jsonwebtoken.

Хеширование: bcryptjs.

ORM: Sequelize (с поддержкой миграций).