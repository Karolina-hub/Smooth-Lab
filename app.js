const services = [
    { id: 1, title: "Лазерная эпиляция", price: "2500₽", desc: "Самый популярный метод для долгого результата." },
    { id: 2, title: "Электроэпиляция", price: "40₽/мин", desc: "Удаление волос навсегда." },
    { id: 3, title: "Шугаринг", price: "1200₽", desc: "Классический уход сахарной пастой." },
    { id: 4, title: "Трейдинг", price: "500₽", desc: "Коррекция зон лица нитью." }
];
// 1. База данных услуг
const services = [
    { id: 1, title: "Лазерная эпиляция", price: 2500, desc: "Самый популярный метод для долгого результата." },
    { id: 2, title: "Электроэпиляция", price: 1500, desc: "Удаление волос навсегда." },
    { id: 3, title: "Шугаринг", price: 1200, desc: "Классический уход сахарной пастой." }
];

// 2. Роутер и отрисовка страниц
const routes = {
    '/': () => `
        <div class="fade-in">
            <h1>Smooth Lab</h1>
            <p>Ваша кожа заслуживает идеальной гладкости.</p>
            <a href="#/catalog" class="btn">Смотреть услуги</a>
        </div>`,

    '/catalog': () => `
        <div class="fade-in">
            <h2>Наши услуги</h2>
            <div class="grid">
                ${services.map(s => `
                    <div class="card">
                        <h3>${s.title}</h3>
                        <p>${s.price} ₽</p>
                        <button onclick="addToFavorites(${s.id})">❤ В избранное</button>
                    </div>
                `).join('')}
            </div>
        </div>`,

    '/quiz': () => {
        return `
        <div class="fade-in" id="quiz-container">
            <h2>Подбор процедуры</h2>
            <p>Какой у вас тип кожи?</p>
            <button class="quiz-option" onclick="renderQuizStep(2)">Светлая/Чувствительная</button>
            <button class="quiz-option" onclick="renderQuizStep(2)">Смуглая</button>
        </div>`;
    },

    '/auth': () => `
        <div class="fade-in">
            <h2>Вход</h2>
            <input type="email" id="email" placeholder="Email">
            <div id="email-error" class="error-message"></div>
            <button onclick="validateLogin()">Войти</button>
        </div>`,

    '/favorites': () => {
        const favs = JSON.parse(localStorage.getItem('favs')) || [];
        const favServices = services.filter(s => favs.includes(s.id));
        return `
        <div class="fade-in">
            <h2>Ваше избранное</h2>
            ${favServices.length ? favServices.map(s => `<p>★ ${s.title}</p>`).join('') : '<p>Пока пусто</p>'}
        </div>`;
    }
};

// --- Функции-хелперы ---

// Сохранение в LocalStorage
window.addToFavorites = (id) => {
    let favs = JSON.parse(localStorage.getItem('favs')) || [];
    if (!favs.includes(id)) {
        favs.push(id);
        localStorage.setItem('favs', JSON.stringify(favs));
        alert("Добавлено в избранное!");
    }
};

// Валидация формы
window.validateLogin = () => {
    const email = document.getElementById('email').value;
    const errorDiv = document.getElementById('email-error');
    if (!email.includes('@')) {
        errorDiv.innerText = "Введите корректный email";
    } else {
        errorDiv.innerText = "";
        alert("Успешный вход!");
    }
};

// Шаги Квиза
window.renderQuizStep = (step) => {
    const container = document.getElementById('quiz-container');
    if (step === 2) {
        container.innerHTML = `
            <h2>Последний вопрос</h2>
            <p>Боитесь ли вы боли?</p>
            <button class="quiz-option" onclick="showQuizResult('Лазерная')">Да, очень</button>
            <button class="quiz-option" onclick="showQuizResult('Электро')">Нет, я кремень</button>
        `;
    }
};

window.showQuizResult = (res) => {
    document.getElementById('quiz-container').innerHTML = `<h3>Результат: Вам подходит ${res} эпиляция!</h3>`;
};

// Главный обработчик навигации
function router() {
    const path = window.location.hash.slice(1) || '/';
    const app = document.getElementById('app');
    const view = routes[path] || (() => '<h2>404 Not Found</h2>');
    app.innerHTML = view();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
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