const mongoose = require('mongoose');

const ZONES   = ['Лицо', 'Тело', 'Руки', 'Ноги'];
const METHODS = ['Лазерная эпиляция', 'Электроэпиляция', 'Шугаринг', 'Вакcинг'];

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    zone: {
        type: String,
        enum: ZONES,
        default: 'Тело'
    },
    method: {
        type: String,
        enum: METHODS,
        default: 'Лазерная эпиляция'
    },
    // true — зона, false — тариф 
    isZone: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
