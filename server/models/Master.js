const mongoose = require('mongoose');

const MasterSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    specialization: { 
        type: String, 
        required: true 
    },
    experience: { 
        type: String, 
        default: 'Более 3 лет' 
    },
    photo: {
        type: String,
        default: 'https://via.placeholder.com/150' // Заглушка, пока нет фото
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Master', MasterSchema);