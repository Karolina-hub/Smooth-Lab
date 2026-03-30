const services = [
    { id: 1, title: "Лазерная эпиляция", price: 2500 },
    { id: 2, title: "Электроэпиляция", price: 1500 },
    { id: 3, title: "Шугаринг", price: 1200 }
];

const routes = {
    '/': () => `<div class="fade-in"><h1>Главная</h1><p>Добро пожаловать в Smooth Lab!</p></div>`,
    '/catalog': () => `
        <div class="fade-in">
            <h1>Каталог</h1>
            ${services.map(s => `
                <div class="card">
                    <h3>${s.title}</h3>
                    <p>Цена: ${s.price} руб.</p>
                </div>
            `).join('')}
        </div>`,
    '/quiz': () => `<div class="fade-in"><h1>Квиз</h1><p>Скоро здесь будет тест...</p></div>`
};

function router() {
    const path = window.location.hash.slice(1) || '/';
    const app = document.getElementById('app');
    const view = routes[path] || (() => '<h1>404</h1>');
    app.innerHTML = view();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);