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
app.use(cors());
app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes); 
app.use('/api/masters', require('./routes/masters'));
app.use('/api/favorites', require('./routes/favorites'));

// Проверочный маршрут
app.get('/', (req, res) => {
    res.send('Сервер Smooth Lab работает');
});

const PORT = process.env.PORT || 5000;

// Подключение к базе
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('УСПЕХ: Подключено к локальной MongoDB');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ:', err.message);
  });