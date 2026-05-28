const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const auth = require('../middleware/authMiddleware');

// Получить все избранные услуги текущего пользователя
router.get('/', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id }).populate('service');
        // Возвращаем только данные услуг 
        const services = favorites.map(f => f.service).filter(Boolean);
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получить список ID избранных услуг (для подсветки лайков в каталоге)
router.get('/ids', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id }).select('service');
        const ids = favorites.map(f => f.service.toString());
        res.json(ids);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Добавить услугу в избранное
router.post('/:serviceId', auth, async (req, res) => {
    try {
        const favorite = new Favorite({
            user: req.user.id,
            service: req.params.serviceId
        });
        await favorite.save();
        res.status(201).json({ message: 'Добавлено в избранное' });
    } catch (err) {
        // Код 11000 — нарушение уникального индекса (уже в избранном)
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Уже в избранном' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Удалить услугу из избранного
router.delete('/:serviceId', auth, async (req, res) => {
    try {
        await Favorite.findOneAndDelete({
            user: req.user.id,
            service: req.params.serviceId
        });
        res.json({ message: 'Удалено из избранного' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
