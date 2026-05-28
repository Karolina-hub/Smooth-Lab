# Smooth Lab

SPA-приложение для студии эпиляции: каталог услуг, подбор процедуры через квиз, личный кабинет, избранное и админ-панель.

## Production ссылки

- **Репозиторий:** https://github.com/Karolina-hub/Smooth-Lab
- **Frontend (Netlify):** https://willowy-daffodil-79c7c3.netlify.app
- **Backend API (Render):** https://smooth-lab-api.onrender.com
- **База данных:** MongoDB Atlas (облако)

> Открыть сайт по ссылке Netlify, а не по URL Render.  
> `https://smooth-lab-api.onrender.com` — API (JSON/health).

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
### 1. Клонирование и зависимости

```bash
git clone <repo-url>
git clone https://github.com/Karolina-hub/Smooth-Lab.git
cd Smooth-Lab
```

### 2) Настроить backend

```bash
cd server
npm install
```

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/smoothlab?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_min_16_chars
PORT=5000
CORS_ORIGIN=http://localhost:5500
```

Запустить сервер:
- `MONGO_URI` — строка подключения из MongoDB Atlas 
- Для локального API на фронте добавьте к URL: `http://127.0.0.1:5500/?useLocalApi=1`

### 3. Запуск backend

```bash
cd server
npm start
```

Если нет скрипта `start`, запуск вручную:
Проверка: http://localhost:5000/api/health → `{"ok":true,...}`

### 4. Запуск frontend

Открыть `index.html` через Live Server или аналог (порт 5500).  
По умолчанию фронт ходит на production API; для локального backend — `?useLocalApi=1`.

### 5. Наполнение тестовыми данными (опционально)

```bash
node index.js
cd server
npm run seed
```

### 3) Настроить frontend
Создаёт услуги и демо-мастера в Atlas (использует `MONGO_URI` из `.env`).

Открыть `index.html` через локальный сервер (например Live Server).
---

По умолчанию frontend использует API из:
- `window.__API_URL` (если задано), или
- `<meta name="api-url" ...>` в `index.html`.
## Деплой

По умолчанию frontend использует production API (`https://smooth-lab-api.onrender.com`).  
Для локального backend добавить к URL: `?useLocalApi=1` (например `http://127.0.0.1:5500/?useLocalApi=1`).
### MongoDB Atlas

## Деплой 

Выбранный вариант:
- **Backend:** Render (Web Service)
- **Frontend:** Netlify (Static Site)
- **База:** MongoDB Atlas

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

- Публичные: `/`, `/auth`, `/catalog`, `/catalog/:method`, `/search`, `/specialists`.
- Приватные: `/favorites`, `/profile`, `/admin`, `/quiz`.
- `404` страница для неизвестных hash-маршрутов.
