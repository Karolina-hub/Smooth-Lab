const services = [
    { id: 1, title: "Лазерная эпиляция", price: "2500₽", desc: "Самый популярный метод для долгого результата." },
    { id: 2, title: "Электроэпиляция", price: "40₽/мин", desc: "Удаление волос навсегда." },
    { id: 3, title: "Шугаринг", price: "1200₽", desc: "Классический уход сахарной пастой." },
    { id: 4, title: "Трейдинг", price: "500₽", desc: "Коррекция зон лица нитью." }
];

const routes = {
    '/': () => `
        <section class="hero">
            <h1>Smooth Lab</h1>
            <p>Научный подход к вашей гладкости</p>
            <a href="#/catalog" class="btn">Смотреть услуги</a>
        </section>`,
    
    '/auth': () => `
        <div style="padding: 50px; text-align:center;">
            <h2>Авторизация</h2>
            <input type="email" placeholder="Email"><br>
            <input type="password" placeholder="Пароль"><br>
            <button class="btn">Войти</button>
            <p><small>Забыли пароль? / Регистрация</small></p>
        </div>`,

    '/catalog': () => {
        const html = services.map(s => `
            <div class="card">
                <h3>${s.title}</h3>
                <p>${s.price}</p>
                <a href="#/catalog/detail?id=${s.id}" class="btn">Подробнее</a>
            </div>`).join('');
        return `<div class="catalog-grid">${html}</div>`;
    },

    '/catalog/detail': () => {
        const params = new URLSearchParams(location.hash.split('?')[1]);
        const item = services.find(s => s.id == params.get('id')) || services[0];
        return `
            <div style="padding: 50px 5%;">
                <h2>${item.title}</h2>
                <p>${item.desc}</p>
                <p><strong>Цена: ${item.price}</strong></p>
                <button class="btn" onclick="alert('Добавлено в избранное')">❤ В избранное</button>
                <br><br><a href="#/catalog">← Назад в каталог</a>
            </div>`;
    },

    '/quiz': () => `
        <div style="padding: 50px; text-align:center;">
            <h2>Smart Квиз</h2>
            <p>Вопрос 1: Какой у вас тип кожи?</p>
            <button class="btn">Светлая</button> <button class="btn">Смуглая</button>
        </div>`,

    '/search': () => `
        <div style="padding: 50px; text-align:center;">
            <h2>Поиск услуг</h2>
            <input type="text" placeholder="Введите название..." oninput="console.log('Поиск...')">
            <p>Найдено результатов: 0</p>
        </div>`,

    '/favorites': () => `
        <div style="padding: 50px;">
            <h2>Ваше избранное</h2>
            <p>Список пуст. Перейдите в каталог, чтобы добавить услуги.</p>
        </div>`,

    '/profile': () => `
        <div style="padding: 50px;">
            <h2>Личный кабинет</h2>
            <p>Имя: Студент Smooth Lab</p>
            <p>Бонусный баланс: 500 баллов</p>
            <button class="btn" onclick="location.hash='#/auth'">Выйти</button>
        </div>`,

    '/admin': () => `
        <div style="padding: 50px; background: #eee;">
            <h2>Админ-панель</h2>
            <table border="1" style="width:100%; background:#white;">
                <tr><th>ID</th><th>Услуга</th><th>Записей сегодня</th></tr>
                <tr><td>1</td><td>Лазер</td><td>12</td></tr>
            </table>
        </div>`
};

function router() {
    const rawHash = location.hash || '#/';
    const path = rawHash.split('?')[0].slice(1);
    const app = document.getElementById('app');
    
    const render = routes[path] || (() => '<h2>404 Not Found</h2>');
    app.innerHTML = render();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);