const mongoose = require('mongoose');

// Хранит связь "пользователь → услуга" для раздела Избранное
const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    }
}, {
    timestamps: true
});

// Уникальная пара: один пользователь не может лайкнуть одну услугу дважды
favoriteSchema.index({ user: 1, service: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
