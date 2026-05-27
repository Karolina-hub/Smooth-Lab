# Smooth Lab

SPA-приложение для студии эпиляции: каталог услуг, подбор процедуры через квиз, личный кабинет, избранное и админ-панель.

## Production ссылки

- Frontend (Netlify): `TODO: добавить ссылку после деплоя`
- Backend API (Render): `TODO: добавить ссылку после деплоя`

## Ключевые функции

- SPA-навигация с публичными и приватными маршрутами.
- Регистрация, вход, восстановление доступа по секретному вопросу.
- Каталог услуг с фильтрацией, пагинацией и сортировкой.
- Добавление/удаление услуг в избранное с сохранением в БД.
- Интерактивный квиз с подбором метода и выдачей рекомендаций.
- Админ-раздел: CRUD для услуг и мастеров.
- Обработка сетевых ошибок и состояния загрузки.

## Технологии

- Frontend: HTML, CSS, Vanilla JavaScript (ES6+), hash-router.
- Backend: Node.js, Express.
- База данных: MongoDB (Mongoose).
- Авторизация: JWT + middleware.
- Хостинг: Netlify (frontend), Render (backend), MongoDB Atlas (database).

## Локальный запуск

### 1) Клонировать репозиторий

```bash
git clone <repo-url>
cd Smooth-Lab
```

### 2) Настроить backend

```bash
cd server
npm install
```

Создать файл `server/.env`:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=5000
CORS_ORIGIN=http://localhost:5500
```

Запустить сервер:

```bash
npm start
```

Если нет скрипта `start`, запуск вручную:

```bash
node index.js
```

### 3) Настроить frontend

Открыть `index.html` через локальный сервер (например Live Server).

По умолчанию frontend использует API из:
- `window.__API_URL` (если задано), или
- `<meta name="api-url" ...>` в `index.html`.

Для локальной разработки значение: `http://localhost:5000`.
Для production нужно заменить его на URL backend.

## Деплой (самый простой путь)

Выбранный вариант:
- **Backend:** Render (Web Service)
- **Frontend:** Netlify (Static Site)
- **База:** MongoDB Atlas

### 1) MongoDB Atlas

- Создать кластер и пользователя БД.
- Получить строку подключения `MONGO_URI`.
- В Network Access разрешить доступ для Render (обычно `0.0.0.0/0`, если нет фиксированных IP).

### 2) Backend на Render

- Подключить GitHub-репозиторий.
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  - `MONGO_URI=<atlas-uri>`
  - `JWT_SECRET=<strong-secret>`
  - `PORT=10000` (или оставить пустым — Render подставит свой)
  - `CORS_ORIGIN=https://<your-netlify-site>.netlify.app`
- После деплоя проверить:
  - `GET https://<your-render-service>.onrender.com/api/health`

### 3) Frontend на Netlify

- New site from Git -> этот же репозиторий.
- Base directory: пусто (корень проекта)
- Build command: пусто
- Publish directory: `.`
- После создания сайта:
  - в `index.html` обновить `<meta name="api-url-prod" ...>` на Render URL
  - redeploy сайта

### 4) Проверка связки

- Открыть frontend URL.
- Проверить сценарии: регистрация, логин, каталог, поиск, избранное, профиль, админ-панель.
- Убедиться, что запросы идут в Render API, а не на localhost.

## Основные API эндпоинты

### Auth

- `POST /api/auth/register` — регистрация пользователя.
- `POST /api/auth/login` — вход по email/паролю.
- `GET /api/auth/me` — данные текущего пользователя (JWT).
- `GET /api/auth/get-question?email=...` — получить секретный вопрос.
- `POST /api/auth/verify-secret` — вход по секретному ответу.

### Services

- `GET /api/services` — список услуг.
- `GET /api/services/:id` — одна услуга.
- `POST /api/services` — создать услугу (JWT).
- `DELETE /api/services/:id` — удалить услугу (JWT).
- Параметры `GET /api/services`:
  - `search` — поиск по названию/методу,
  - `zone`, `minPrice`, `maxPrice`, `method`, `master`,
  - `isZone=true|false`,
  - `limit`, `skip` (пагинация),
  - `sortBy=price|title|createdAt`, `order=asc|desc`.

### Favorites

- `GET /api/favorites` — избранные услуги пользователя (JWT).
- `GET /api/favorites/ids` — ID избранных услуг для подсветки (JWT).
- `POST /api/favorites/:serviceId` — добавить в избранное (JWT).
- `DELETE /api/favorites/:serviceId` — удалить из избранного (JWT).

### Masters

- `GET /api/masters` — список мастеров.
- `POST /api/masters` — добавить мастера (JWT).
- `DELETE /api/masters/:id` — удалить мастера (JWT).

## Маршруты frontend

- Публичные: `#/`, `#/auth`, `#/catalog`, `#/catalog/:method`, `#/search`.
- Приватные: `#/favorites`, `#/profile`, `#/admin`, `#/quiz`.
- `404` страница для неизвестных hash-маршрутов.

## Скриншоты (добавить перед сдачей)

Добавить 3-5 скриншотов в репозиторий (например в папку `docs/screenshots`):

- Главная страница.
- Каталог/детали метода.
- Личный кабинет.
- Избранное.
- Админ-панель (опционально).

И вставить их в README через Markdown:

```md
![Главная](docs/screenshots/home.png)
```