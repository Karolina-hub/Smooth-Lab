/**
 * Скрипт заполнения базы данных услугами.
 * Запуск из папки /server: node scripts/seedServices.js
 * ВНИМАНИЕ: удаляет все существующие услуги и добавляет новые.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Service = require('../models/Service');
const Master = require('../models/Master');

const services = [
    // Лазерная эпиляция
    // Лицо: верхняя губа, подбородок
    { method: 'Лазерная эпиляция', title: 'Верхняя губа',        price: 18, zone: 'Лицо', description: 'Лазерное удаление волос над верхней губой.' },
    { method: 'Лазерная эпиляция', title: 'Подбородок',          price: 18, zone: 'Лицо', description: 'Лазерное удаление волос на подбородке.' },
    // Руки: предплечья
    { method: 'Лазерная эпиляция', title: 'Предплечья',          price: 45, zone: 'Руки', description: 'Лазерное удаление волос на предплечьях.' },
    // Ноги: голени, бёдра
    { method: 'Лазерная эпиляция', title: 'Голени',              price: 60, zone: 'Ноги', description: 'Лазерное удаление волос в зоне голеней.' },
    { method: 'Лазерная эпиляция', title: 'Бёдра',               price: 60, zone: 'Ноги', description: 'Лазерное удаление волос в зоне бёдер.' },
    // Тело: всё остальное
    { method: 'Лазерная эпиляция', title: 'Бикини классическое', price: 45, zone: 'Тело', description: 'Лазерное удаление волос, классическое бикини.' },
    { method: 'Лазерная эпиляция', title: 'Бикини глубокое',     price: 55, zone: 'Тело', description: 'Лазерное удаление волос, глубокое бикини.' },
    { method: 'Лазерная эпиляция', title: 'Подмышечные впадины', price: 30, zone: 'Тело', description: 'Лазерное удаление волос в подмышечных впадинах.' },
    { method: 'Лазерная эпиляция', title: 'Живот (полоска)',      price: 25, zone: 'Тело', description: 'Лазерное удаление волос, полоска на животе.' },
    { method: 'Лазерная эпиляция', title: 'Живот полностью',     price: 45, zone: 'Тело', description: 'Лазерное удаление волос на животе полностью.' },
    { method: 'Лазерная эпиляция', title: 'Поясница',            price: 35, zone: 'Тело', description: 'Лазерное удаление волос в зоне поясницы.' },
    { method: 'Лазерная эпиляция', title: 'Ягодицы',             price: 45, zone: 'Тело', description: 'Лазерное удаление волос в зоне ягодиц.' },

    // Вакcинг
    // Руки: предплечья, руки полностью
    { method: 'Вакcинг', title: 'Предплечья',          price: 20, zone: 'Руки', description: 'Удаление волос воском на предплечьях.' },
    { method: 'Вакcинг', title: 'Руки полностью',      price: 30, zone: 'Руки', description: 'Удаление волос воском на руках полностью.' },
    // Ноги: голени, бёдра
    { method: 'Вакcинг', title: 'Голени',              price: 25, zone: 'Ноги', description: 'Удаление волос воском на голенях.' },
    { method: 'Вакcинг', title: 'Бёдра',               price: 25, zone: 'Ноги', description: 'Удаление волос воском в зоне бёдер.' },
    // Тело: всё остальное
    { method: 'Вакcинг', title: 'Подмышечные впадины', price: 15, zone: 'Тело', description: 'Удаление волос воском в подмышечных впадинах.' },
    { method: 'Вакcинг', title: 'Бикини классическое', price: 25, zone: 'Тело', description: 'Удаление волос воском, классическое бикини.' },
    { method: 'Вакcинг', title: 'Бикини глубокое',     price: 35, zone: 'Тело', description: 'Удаление волос воском, глубокое бикини.' },

    // Шугаринг
    // Лицо: верхняя губа
    { method: 'Шугаринг', title: 'Верхняя губа',        price: 15, zone: 'Лицо', description: 'Шугаринг над верхней губой.' },
    // Руки: руки полностью
    { method: 'Шугаринг', title: 'Руки полностью',      price: 35, zone: 'Руки', description: 'Шугаринг на руках полностью.' },
    // Ноги: голени, бёдра
    { method: 'Шугаринг', title: 'Голени',              price: 30, zone: 'Ноги', description: 'Шугаринг на голенях.' },
    { method: 'Шугаринг', title: 'Бёдра',               price: 30, zone: 'Ноги', description: 'Шугаринг в зоне бёдер.' },
    // Тело: всё остальное
    { method: 'Шугаринг', title: 'Живот (полоска)',      price: 5,  zone: 'Тело', description: 'Шугаринг, полоска на животе.' },
    { method: 'Шугаринг', title: 'Поясница',            price: 15, zone: 'Тело', description: 'Шугаринг в зоне поясницы.' },
    { method: 'Шугаринг', title: 'Подмышечные впадины', price: 20, zone: 'Тело', description: 'Шугаринг в подмышечных впадинах.' },
    { method: 'Шугаринг', title: 'Бикини классическое', price: 30, zone: 'Тело', description: 'Шугаринг, классическое бикини.' },
    { method: 'Шугаринг', title: 'Бикини глубокое',     price: 45, zone: 'Тело', description: 'Шугаринг, глубокое бикини.' },

    // Электроэпиляция — тарифы, не зоны
    { method: 'Электроэпиляция', title: '1 час работы',          price: 50,  zone: 'Тело', isZone: false, description: 'Стоимость одного часа работы специалиста.' },
    { method: 'Электроэпиляция', title: 'До 30 минут (за мин.)', price: 1.2, zone: 'Тело', isZone: false, description: 'Стоимость за минуту при сеансе до 30 минут.' },
    { method: 'Электроэпиляция', title: 'Одноразовая игла',      price: 7,   zone: 'Тело', isZone: false, description: 'Одноразовая игла для электроэпиляции.' },
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        await Service.deleteMany({});
        console.log('Старые услуги удалены.');
        await Service.insertMany(services);
        console.log(`Добавлено ${services.length} услуг.`);

        await Master.deleteMany({});
        const laserService = await Service.findOne({ method: 'Лазерная эпиляция' });
        if (laserService) {
            await Master.create({
                name: 'Анна Иванова',
                specialization: 'Лазерная эпиляция',
                experience: '5 лет',
                service: laserService._id,
                photo: 'https://via.placeholder.com/150'
            });
            console.log('Добавлен демо-специалист.');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Ошибка подключения к БД:', err.message);
        process.exit(1);
    });
