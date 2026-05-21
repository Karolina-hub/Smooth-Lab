const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware'); 
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone, securityQuestion, secretWord } = req.body; 

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Недопустимый формат Email' });
        }
        if (!passRegex.test(password)) {
            return res.status(400).json({ message: 'Пароль должен содержать 8 символов, заглавную букву и цифру' });
        }

        const candidate = await User.findOne({ email });
        if (candidate) {
            return res.status(400).json({ message: 'Этот Email уже зарегистрирован!' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt); 

        const newUser = new User({ 
            email, 
            phone, 
            passwordHash, 
            name,
            securityQuestion, 
            secretWord: secretWord.toLowerCase().trim(), 
            createdAt: new Date()
        });

        await newUser.save();
        res.status(201).json({ message: 'Пользователь создан!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получение секретного вопроса
router.get('/get-question', async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        
        res.json({ question: user.securityQuestion || "Секретный вопрос не задан" });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вход через секретное слово
router.post('/verify-secret', async (req, res) => {
    try {
        const { email, answer } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        if (user.secretWord !== answer.toLowerCase().trim()) {
            return res.status(400).json({ message: 'Неверный ответ на вопрос!' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вход через пароль 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Пользователь не найден' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
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