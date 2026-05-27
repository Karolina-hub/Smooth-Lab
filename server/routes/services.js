const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Master = require('../models/Master');
const auth = require('../middleware/authMiddleware');

// Получить список услуг с поддержкой фильтрации и поиска
// Параметры: ?zone=Лицо&minPrice=100&maxPrice=500&master=<id>&search=название&method=Лазерная эпиляция
router.get('/', async (req, res) => {
    try {
        const { zone, minPrice, maxPrice, master, search, method, isZone, sortBy, order } = req.query;
        const filter = {};

        if (zone)   filter.zone   = zone;
        if (method) filter.method = method;

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (search) {
            filter.$or = [
                { title:  { $regex: search, $options: 'i' } },
                { method: { $regex: search, $options: 'i' } }
            ];
            // В поиске показываем только зоны, не тарифы
            filter.isZone = true;
        }

        if (isZone === 'true') filter.isZone = true;
        if (isZone === 'false') filter.isZone = false;

        const allowedSortFields = ['price', 'title', 'createdAt'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'price';
        const sortOrder = order === 'desc' ? -1 : 1;

        let services = await Service.find(filter).sort({ [sortField]: sortOrder });

        if (master) {
            const masterDoc = await Master.findById(master);
            if (masterDoc) {
                const serviceId = masterDoc.service.toString();
                services = services.filter(s => s._id.toString() === serviceId);
            } else {
                services = [];
            }
        }

        // Пагинация: limit и skip применяются после всех фильтров
        const limit = parseInt(req.query.limit) || 0;
        const skip  = parseInt(req.query.skip)  || 0;
        const total = services.length;

        if (limit > 0) {
            const page = services.slice(skip, skip + limit);
            return res.json({ items: page, total });
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