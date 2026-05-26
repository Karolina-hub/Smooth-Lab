const mongoose = require('mongoose');

// Допустимые зоны обработки
const ZONES = ['Лицо', 'Тело', 'Руки', 'Ноги', 'Волосы'];

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
    // Зона обработки для фильтрации в каталоге
    zone: {
        type: String,
        enum: ZONES,
        default: 'Лицо'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Service', serviceSchema);