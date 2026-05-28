const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phone: { 
        type: String, 
        required: true,
        unique: true 
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    //Выбранный вопрос из списка
    securityQuestion: {
        type: String,
        required: true
    },
    // Секретное слово
    secretWord: { 
        type: String, 
        required: true 
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);