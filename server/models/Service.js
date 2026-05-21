const mongoose = require('mongoose');

// Описание структуру 
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
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Service', serviceSchema);