const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Master = require('../models/Master');
const auth = require('../middleware/authMiddleware');

// Получить список услуг с поддержкой фильтрации и поиска
// Параметры: ?zone=Лицо&minPrice=100&maxPrice=500&master=<id>&search=название&method=Лазерная эпиляция
router.get('/', async (req, res) => {
    try {
        const { zone, minPrice, maxPrice, master, search, method } = req.query;
        const filter = {};

        if (zone)   filter.zone   = zone;
        if (method) filter.method = method;

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (search) filter.title = { $regex: search, $options: 'i' };

        let services = await Service.find(filter).sort({ price: 1 });

        if (master) {
            const masterDoc = await Master.findById(master);
            if (masterDoc) {
                const serviceId = masterDoc.service.toString();
                services = services.filter(s => s._id.toString() === serviceId);
            } else {
                services = [];
            }
        }

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

// Добавить новую услугу (только для авторизованных)
router.post('/', auth, async (req, res) => {
    try {
        const { title, price, description, zone } = req.body;

        if (!title || !price) {
            return res.status(400).json({ message: "Название и цена обязательны для заполнения" });
        }

        const newService = new Service({ 
            title, 
            price, 
            description: description || 'Описание будет добавлено позже.',
            zone: zone || 'Лицо'
        });

        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        console.error('Ошибка при создании услуги:', err);
        res.status(400).json({ message: "Не удалось создать услугу. Проверьте корректность данных." });
    }
});

// Удалить услугу по ID (только для авторизованных)
router.delete('/:id', auth, async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Услуга не найдена" });
        }
        res.json({ message: "Услуга удалена" });
    } catch (err) {
        console.error('Ошибка при удалении услуги:', err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;