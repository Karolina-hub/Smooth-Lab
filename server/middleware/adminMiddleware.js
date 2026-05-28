const User = require('../models/User');

module.exports = async function adminOnly(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('isAdmin');
        if (!user?.isAdmin) {
            return res.status(403).json({ message: 'Доступ только для администратора' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Ошибка проверки прав' });
    }
};
