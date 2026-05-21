const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Получить список всех услуг
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        console.error('Ошибка при получении всех услуг:', err);
        res.status(500).json({ message: "Ошибка сервера при получении списка услуг" });
    }
});

// Получить одну конкретную услугу по её ID
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        
        if (!service) {
            return res.status(404).json({ message: "Услуга с таким ID не найдена в базе" });
        }
        
        res.json(service);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный формат ID услуги" });
        }
        console.error('Ошибка при поиске услуги по ID:', err);
        res.status(500).json({ message: "Ошибка сервера на стороне маршрута /api/services/:id" });
    }
});

// Добавить новую услугу
router.post('/', async (req, res) => {
    try {
        const { title, price, description } = req.body;

        if (!title || !price) {
            return res.status(400).json({ message: "Название и цена обязательны для заполнения" });
        }

        const newService = new Service({ 
            title, 
            price, 
            description: description || 'Описание будет добавлено позже.' 
        });

        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        console.error('Ошибка при создании услуги:', err);
        res.status(400).json({ message: "Не удалось создать услугу. Проверьте корректность данных." });
    }
});

module.exports = router;