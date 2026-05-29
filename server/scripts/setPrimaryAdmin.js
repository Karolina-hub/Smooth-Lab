/**
 * Назначает администратором самого первого пользователя (по createdAt).
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

async function setPrimaryAdmin() {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find().sort({ createdAt: 1 });
    if (users.length === 0) {
        console.log('В базе нет пользователей.');
        process.exit(0);
    }

    await User.updateMany({}, { $set: { isAdmin: false } });

    const first = users[0];
    await User.updateOne({ _id: first._id }, { $set: { isAdmin: true } });

    console.log('Администратор назначен:');
    console.log(`  Имя: ${first.name}`);
    console.log(`  Email: ${first.email}`);
    console.log(`  _id: ${first._id}`);

    process.exit(0);
}

setPrimaryAdmin().catch((err) => {
    console.error('Ошибка:', err.message);
    process.exit(1);
});
