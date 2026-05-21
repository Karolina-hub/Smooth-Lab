const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Берем токен из заголовков запроса
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Нет токена, доступ запрещен" });
    }

    try {
        // Получаем чистый токен
        const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        
        // Проверяем на подленность
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // Запоминаем id пользователя в объекте запроса 
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ message: "Токен невалиден" });
    }
};