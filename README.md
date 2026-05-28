# Smooth Lab

Веб-приложение студии эпиляции: каталог услуг, квиз подбора процедуры, личный кабинет, избранное и админ-панель. Данные хранятся в MongoDB Atlas, интерфейс развёрнут на Netlify, API — на Render.

---

## Ссылки (production)

| Ресурс | URL |
|--------|-----|
| Репозиторий | https://github.com/Karolina-hub/Smooth-Lab |
| Frontend (сайт) | https://willowy-daffodil-79c7c3.netlify.app |
| Backend API | https://smooth-lab-api.onrender.com |
| Проверка API | https://smooth-lab-api.onrender.com/api/health |
| Запись | tel:7703 |

> Открывайте именно **Netlify URL** для просмотра сайта.  
> `smooth-lab-api.onrender.com` — это только API (JSON), не визуальный интерфейс.

---

## Ключевые функции

- **8+ разделов** с клиентским роутингом (History API, без `#`): главная, каталог, поиск, квиз, специалисты, избранное, профиль, админ.
- **Динамический контент** с бэкенда (услуги, мастера, пользователи, избранное, контент страниц).
- **Авторизация:** регистрация, вход, восстановление через секретный вопрос, JWT.
- **Каталог:** фильтры (зона, цена, мастер), сортировка, пагинация «Загрузить ещё», лайки в избранное.
- **Квиз:** 4 шага → рекомендация метода и список услуг с API.
- **Админ-панель:** добавление/удаление услуг и мастеров (только для авторизованных).
- **UX:** спиннеры загрузки, обработка ошибок, адаптивная вёрстка (в т.ч. 375px).

---

## Технологии

| Слой | Стек | Зачем выбран |
|------|------|-------------|
| Frontend | HTML, CSS, Vanilla JS (ES6+) | Простой SPA без тяжёлого фреймворка, быстрый деплой на Netlify |
| Роутинг | History API (SPA) | Чистые URL (`/catalog`, `/profile`), редиректы в `netlify.toml` |
| Backend | Node.js, Express 5 | API, JWT, middleware, MongoDB |
| БД | MongoDB Atlas (Mongoose) | Облачная NoSQL, бесплатный tier для учебного проекта |
| Auth | JWT + bcrypt | Стандарт для REST API |
| Frontend host | Netlify | Статика + CDN |
| Backend host | Render | Node.js API + env vars |
| DB host | MongoDB Atlas | Managed MongoDB |

---

## Локальный запуск

### 1. Клонирование и зависимости

```bash
git clone https://github.com/Karolina-hub/Smooth-Lab.git
cd Smooth-Lab
cd server
npm install
```

### 2. Переменные окружения (`server/.env`)

Скопируйте `server/.env.example` в `server/.env` и заполните:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/smoothlab?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_min_16_chars
PORT=5000
CORS_ORIGIN=http://localhost:5500
```

- `MONGO_URI` — строка подключения из MongoDB Atlas (см. раздел ниже).
- Для локального API на фронте добавьте к URL: `http://127.0.0.1:5500/?useLocalApi=1`

### 3. Запуск backend

```bash
cd server
npm start
```

Проверка: http://localhost:5000/api/health → `{"ok":true,...}`

### 4. Запуск frontend

Откройте `index.html` через Live Server или аналог (порт 5500).  
По умолчанию фронт ходит на production API; для локального backend — `?useLocalApi=1`.

### 5. Наполнение тестовыми данными (опционально)

```bash
cd server
npm run seed
```

Создаёт услуги и демо-мастера в Atlas (использует `MONGO_URI` из `.env`).

---

## Деплой

### MongoDB Atlas

1. [MongoDB Atlas](https://cloud.mongodb.com/) → создать кластер (Free tier).
2. Database Access → Add IP `0.0.0.0/0` (для Render).
3. Создать пользователя БД, скопировать connection string.
4. В connection string указать имя БД, например: `/smoothlab`  
   Итоговый URI: `mongodb+srv://user:pass@cluster.../smoothlab?...`

### Render (backend)

1. New → Web Service, подключить репозиторий.
2. **Root Directory:** `server`
3. **Build:** `npm install`
4. **Start:** `npm start`
5. **Environment Variables:**

| Key | Value |
|-----|--------|
| `MONGO_URI` | строка из Atlas |
| `JWT_SECRET` | длинный секрет |
| `CORS_ORIGIN` | `https://willowy-daffodil-79c7c3.netlify.app` |

После деплоя: `https://<service>.onrender.com/api/health`

### Netlify (frontend)

1. New site from Git → репозиторий `Karolina-hub/Smooth-Lab`.
2. **Build command:** пусто  
3. **Publish directory:** `.` (корень репозитория)
4. В `index.html` в `<meta name="api-url-prod">` указать URL Render.
5. Deploy → проверить сайт и API в Network tab браузера.

---

## API (основные эндпоинты)

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | `/api/health` | Проверка сервера | нет |
| POST | `/api/auth/register` | Регистрация | нет |
| POST | `/api/auth/login` | Вход | нет |
| GET | `/api/auth/get-question?email=` | Секретный вопрос (восстановление) | нет |
| POST | `/api/auth/verify-secret` | Проверка ответа, сброс пароля | нет |
| GET | `/api/auth/me` | Текущий пользователь | JWT |
| GET | `/api/services` | Список услуг (фильтры, поиск, сортировка, пагинация) | нет |
| POST/DELETE | `/api/services`, `/api/services/:id` | Добавить / удалить услугу | JWT |
| GET | `/api/masters` | Список мастеров | нет |
| POST/DELETE | `/api/masters`, `/api/masters/:id` | Добавить / удалить мастера | JWT |
| GET | `/api/favorites` | Избранное | JWT |
| POST/DELETE | `/api/favorites/:serviceId` | Добавить / убрать из избранного | JWT |
| GET | `/api/content` | Тексты страниц и шаги квиза | нет |

Полный список см. в коде: `server/routes/`.

---

## Маршруты фронтенда

| Путь | Доступ | Описание |
|------|--------|----------|
| `/` | публичный | Главная |
| `/auth` | публичный | Вход / регистрация |
| `/catalog` | публичный | Каталог методов + фильтры |
| `/catalog/:method` | публичный | Зоны и цены метода |
| `/search` | публичный | Поиск |
| `/specialists` | публичный | Список мастеров |
| `/quiz` | приватный | Квиз (нужен вход) |
| `/favorites` | приватный | Избранное |
| `/profile` | приватный | Профиль |
| `/admin` | приватный | Управление услугами и мастерами |

---

## Где лежат данные в Atlas

1. Atlas → **Data Explorer** → база `smoothlab` (или как в `MONGO_URI`).
2. Коллекции:
   - `users` — пользователи (email, пароль, секретный вопрос)
   - `services` — услуги (название, цена, зона, метод)
   - `masters` — мастера (имя, специализация)
   - `favorites` — связи user ↔ service

Данные с локальной MongoDB **не попадают** в Atlas автоматически — только то, что создано через API/seed на сервере с Atlas `MONGO_URI`.

**Важно:** аккаунт, зарегистрированный локально, на Netlify не сработает (другая БД). Для проверки production зарегистрируйтесь на сайте Netlify или выполните `npm run seed` с `MONGO_URI` от Atlas.

---

## Скриншоты для сдачи

Добавьте в `docs/screenshots/` файлы (например `home.png`, `catalog.png`, `profile.png`) и раскомментируйте в README:

```markdown
![Главная](docs/screenshots/home.png)
![Каталог](docs/screenshots/catalog.png)
![Личный кабинет](docs/screenshots/profile.png)
```

---

## Что сдать преподавателю (чеклист)

- [ ] Ссылка на GitHub
- [ ] Ссылка на работающий фронтенд (Netlify)
- [ ] Ссылка на API (Render `/api/health`)
- [ ] README с инструкцией запуска
- [ ] 3–5 скриншотов в репозитории
- [ ] Видео 4–5 мин или демо на занятии (по ЛР3/ЛР4)

---

## Структура проекта

```
Smooth-Lab/
├── index.html          # SPA shell, meta api-url
├── app.js              # Роутинг, UI, API-клиент
├── style.css
├── netlify.toml
├── server/
│   ├── index.js
│   ├── routes/         # auth, services, masters, favorites, content
│   ├── models/
│   ├── middleware/
│   └── scripts/seedServices.js
├── docs/screenshots/
└── README.md
```
