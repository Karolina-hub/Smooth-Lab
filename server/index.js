const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Импорты маршрутов
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');

const app = express();

// Настройки Middleware 
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.length ? corsOrigins : true
}));
app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes); 
app.use('/api/masters', require('./routes/masters'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/content', require('./routes/content'));

// Проверочный маршрут
app.get('/', (req, res) => {
    res.send('Сервер Smooth Lab работает');
});
app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'smooth-lab-api' });
});

// Единый обработчик ошибок API
app.use((err, req, res, next) => {
    console.error('API error:', err.message);
    res.status(err.status || 500).json({
        message: err.message || 'Внутренняя ошибка сервера'
    });
});

const PORT = process.env.PORT || 5000;

// Подключение к базе
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('УСПЕХ: Подключено к MongoDB');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ:', err.message);
  });