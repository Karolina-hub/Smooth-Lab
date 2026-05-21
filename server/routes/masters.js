const express = require('express');
const router = express.Router();
const Master = require('../models/Master');
const authMiddleware = require('../middleware/authMiddleware');

// Получить всех мастеров
router.get('/', async (req, res) => {
    try {
        const masters = await Master.find().populate('service');
        res.json(masters);
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Добавить мастера
router.post('/', authMiddleware, async (req, res) => {
    try {
        const master = new Master(req.body);
        await master.save();
        res.status(201).json(master);
    } catch (err) {
        res.status(400).json({ message: "Ошибка при добавлении" });
    }
});

module.exports = router;