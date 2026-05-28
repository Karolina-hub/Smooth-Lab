const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware'); 
const router = express.Router();

function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
}

async function findUserByEmail(email) {
    const normalized = normalizeEmail(email);
    if (!normalized) return null;
    let user = await User.findOne({ email: normalized });
    if (user) return user;
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return User.findOne({ email: { $regex: new RegExp(`^${escaped}$`, 'i') } });
}

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password, name, phone, securityQuestion, secretWord } = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Недопустимый формат Email' });
        }
        if (!passRegex.test(password)) {
            return res.status(400).json({ message: 'Пароль должен содержать 8 символов, заглавную букву и цифру' });
        }

        const candidate = await findUserByEmail(email);
        if (candidate) {
            return res.status(400).json({ message: 'Этот Email уже зарегистрирован!' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt); 

        const usersCount = await User.countDocuments();
        const isFirstUser = usersCount === 0;

        const newUser = new User({ 
            email, 
            phone, 
            passwordHash, 
            name,
            securityQuestion, 
            secretWord: secretWord.toLowerCase().trim(), 
            isAdmin: isFirstUser,
            createdAt: new Date()
        });

        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                isAdmin: newUser.isAdmin
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получение секретного вопроса
router.get('/get-question', async (req, res) => {
    try {
        const email = normalizeEmail(req.query.email);
        if (!email) return res.status(400).json({ message: 'Укажите email' });
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        
        res.json({ question: user.securityQuestion || "Секретный вопрос не задан" });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вход через секретное слово
router.post('/verify-secret', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { answer } = req.body;
        const user = await findUserByEmail(email);

        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        if (user.secretWord !== (answer || '').toLowerCase().trim()) {
            return res.status(400).json({ message: 'Неверный ответ на вопрос!' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: !!user.isAdmin } });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вход через пароль 
router.post('/login', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;
        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({ message: 'Пользователь не найден' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: !!user.isAdmin } });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение данных текущего пользователя 
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;