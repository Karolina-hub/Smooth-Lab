// Маршруты SPA
const routes = {
    '/': () => `
        <div class="fade-in">
            <h1>Главная</h1>
            <p>Добро пожаловать в Smooth Lab! Профессиональный уход за вашей кожей.</p>
        </div>`,
    
    '/catalog': async () => {
        try {
            const res = await fetch('http://localhost:5000/api/services');
            const services = await res.json();
            return `
                <div class="fade-in">
                    <h1>Каталог услуг</h1>
                    <div id="servicesList" class="services-grid">
                        ${services.length > 0 ? renderServices(services) : '<p>Услуг пока нет.</p>'}
                    </div>
                </div>`;
        } catch (err) {
            return `<h1>Ошибка загрузки каталога</h1>`;
        }
    },

    '/search': () => `
        <div class="fade-in">
            <h1>Поиск услуг</h1>
            <input type="text" id="searchInput" placeholder="Введите название..." oninput="handleSearch(this.value)">
            <div id="searchResults" class="services-grid" style="margin-top: 20px;"></div>
        </div>`,

    '/auth': () => `
        <div class="fade-in auth-container">
            <div class="auth-tabs">
                <button onclick="switchAuth('login')" id="tab-login" class="active">Войти</button>
                <button onclick="switchAuth('register')" id="tab-register">Регистрация</button>
            </div>
            <form id="loginForm" class="auth-form">
                <h2>Вход</h2>
                <input type="text" id="loginIdentifier" placeholder="Email" required>
                <input type="password" id="loginPassword" placeholder="Пароль" required>
                <button type="submit">Войти</button>
                <a href="javascript:void(0)" onclick="forgotPassword()" class="forgot-link">Забыли пароль?</a>
            </form>
            <form id="regForm" class="auth-form" style="display: none;">
                <h2>Создать аккаунт</h2>
                <input type="text" id="regName" placeholder="Ваше имя" required>
                <input type="email" id="regEmail" placeholder="Электронная почта" required>
                <input type="tel" id="regPhone" placeholder="Номер телефона (+375)" required>
                <input type="password" id="regPassword" placeholder="Пароль (8+ симв., заглавная, цифра)" required>
                <input type="password" id="regPasswordConfirm" placeholder="Повторите пароль" required>
                
                <select id="regQuestion" class="auth-input" style="margin-bottom: 10px; padding: 10px; border-radius: 5px; border: 1px solid #ffb3c1;" required>
                    <option value="" disabled selected>Выберите секретный вопрос</option>
                    <option value="Девичья фамилия матери">Девичья фамилия матери</option>
                    <option value="Имя вашего первого питомца">Имя вашего первого питомца</option>
                    <option value="Марка вашей первой машины">Марка вашей первой машины</option>
                    <option value="Город, в котором вы родились">Город, в котором вы родились</option>
                </select>

                <input type="text" id="regSecret" placeholder="Ответ на вопрос" required>
                <button type="submit">Завершить регистрацию</button>
            </form>
            <div id="authMessage" style="margin-top: 15px; text-align: center; font-weight: bold;"></div>
        </div>`,

    '/profile': async () => {
        const token = localStorage.getItem('token');
        if (!token) return `<h1>Загрузка...</h1>`;
        try {
            const res = await fetch('http://localhost:5000/api/auth/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Ошибка доступа");
            const user = await res.json();
            return `
            <div class="fade-in">
                <h1>Личный кабинет</h1>
                <div class="card">
                    <p><strong>Имя:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Телефон:</strong> ${user.phone || 'Не указан'}</p>
                    <p><strong>Дата регистрации:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    <button class="btn" onclick="logout()" style="background: #ff4d6d; color: white; margin-top: 20px;">Выйти</button>
                </div>
            </div>`;
        } catch (err) {
            localStorage.clear();
            window.location.hash = '#/auth';
            return `<h1>Сессия истекла, войдите снова</h1>`;
        }
    },

    '/favorites': () => `
        <div class="fade-in">
            <h1>Мои записи</h1>
            <p>Здесь будут отображаться услуги, на которые вы записались.</p>
            <div id="favoritesList" class="services-grid"></div>
        </div>`
};

function renderServices(items) {
    return items.map(s => `
        <div class="card">
            <h3>${s.title}</h3>
            <p>Цена: ${s.price} руб.</p>
            <a href="#/catalog/${s._id}" class="btn-link">Подробнее</a>
        </div>
    `).join('');
}

function updateNav() {
    const token = localStorage.getItem('token');
    const navItems = {
        'nav-auth': !token,
        'nav-profile': !!token,
        'nav-favorites': !!token,
        'nav-admin': !!token
    };
    for (const [id, show] of Object.entries(navItems)) {
        const el = document.getElementById(id);
        if (el) el.style.display = show ? 'block' : 'none';
    }
}

window.showModal = (title, text) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>${text}</p>
            <button class="btn" onclick="this.parentElement.parentElement.remove()">Закрыть</button>
        </div>`;
    document.body.appendChild(modal);
};

window.handleSearch = async (query) => {
    if (query.length < 2) return;
    try {
        const res = await fetch('http://localhost:5000/api/services');
        const services = await res.json();
        const results = services.filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
        document.getElementById('searchResults').innerHTML = renderServices(results);
    } catch (err) { console.error(err); }
};

window.logout = () => {
    localStorage.clear();
    updateNav(); 
    window.location.hash = '#/auth';
};

window.switchAuth = (mode) => {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('regForm');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    if (tabLogin) tabLogin.classList.toggle('active', mode === 'login');
    if (tabRegister) tabRegister.classList.toggle('active', mode === 'register');
    if (loginForm) loginForm.style.display = mode === 'login' ? 'flex' : 'none';
    if (regForm) regForm.style.display = mode === 'login' ? 'none' : 'flex';
};

// Восстановление пароля

// Функция закрытия модалки
window.closeModal = () => {
    const modal = document.getElementById('recoveryModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('recoveryError').innerText = '';
    document.getElementById('recoveryAnswer').value = '';
};

window.forgotPassword = async () => {
    const email = document.getElementById('loginIdentifier').value.trim();
    
    if (!email) {
        showModal("Внимание", "Пожалуйста, введите ваш Email в поле входа, чтобы мы нашли секретный вопрос.");
        return;
    }

    try {
        // Получаем вопрос от сервера
        const res = await fetch(`http://localhost:5000/api/auth/get-question?email=${email}`);
        const data = await res.json();

        if (!res.ok) {
            showModal("Ошибка", data.message || "Пользователь не найден");
            return;
        }

        const modal = document.getElementById('recoveryModal');
        const questionText = document.getElementById('recoveryQuestion');
        
        questionText.innerHTML = `<strong>Вопрос:</strong> ${data.question}`;
        modal.style.display = 'flex'; // Используем flex для центрирования из стилей

    } catch (err) {
        showModal("Ошибка", "Не удалось связаться с сервером.");
    }
};

// Функция отправки ответа 
window.submitRecovery = async () => {
    const email = document.getElementById('loginIdentifier').value.trim();
    const answer = document.getElementById('recoveryAnswer').value.trim();
    const errorBlock = document.getElementById('recoveryError');

    if (!answer) {
        errorBlock.innerText = 'Введите ответ!';
        return;
    }

    try {
        const verifyRes = await fetch('http://localhost:5000/api/auth/verify-secret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, answer })
        });
        
        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
            localStorage.setItem('token', verifyData.token);
            closeModal();
            window.location.hash = '#/profile';
            updateNav();
            showModal("Успех", "Вы успешно вошли в аккаунт!");
        } else {
            errorBlock.innerText = verifyData.message || "Неверный ответ!";
        }
    } catch (err) {
        errorBlock.innerText = 'Ошибка сервера';
    }
};
// Логика входа и регистрации

function initLoginLogic() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const msg = document.getElementById('authMessage');
        const loginData = {
            email: document.getElementById('loginIdentifier').value.trim(), 
            password: document.getElementById('loginPassword').value.trim()
        };
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                updateNav();
                msg.style.color = "green";
                msg.innerText = "Успешный вход!";
                setTimeout(() => window.location.hash = '#/profile', 1000);
            } else {
                msg.style.color = "red";
                msg.innerText = data.message;
            }
        } catch (err) { msg.innerText = "Ошибка сервера"; }
    };
}

function initRegLogic() {
    const form = document.getElementById('regForm');
    const phoneInput = document.getElementById('regPhone');
    if (!form || !phoneInput) return;

    phoneInput.addEventListener('focus', () => { if (!phoneInput.value) phoneInput.value = '+375'; });
    phoneInput.addEventListener('input', () => {
        if (!phoneInput.value.startsWith('+375')) phoneInput.value = '+375';
        phoneInput.value = '+375' + phoneInput.value.slice(4).replace(/\D/g, '').substring(0, 9);
    });

    form.onsubmit = async (e) => {
        e.preventDefault();
        const msg = document.getElementById('authMessage');
        msg.style.color = "red";

        const email = document.getElementById('regEmail').value.trim();
        const phone = phoneInput.value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regPasswordConfirm').value;
        const securityQuestion = document.getElementById('regQuestion').value;
        const secretWord = document.getElementById('regSecret').value.trim();

        // ВАЛИДАЦИЯ
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|ru|by|net|org)$/;
        if (/[а-яА-ЯёЁ]/.test(email)) { msg.innerText = "Email не должен содержать русские буквы!"; return; }
        if (!emailRegex.test(email)) { msg.innerText = "Неверный домен почты!"; return; }
        if (phone.length !== 13) { msg.innerText = "Введите полный номер телефона!"; return; }
        if (!securityQuestion) { msg.innerText = "Выберите секретный вопрос!"; return; }
        
        const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passRegex.test(password)) { msg.innerText = "Пароль: 8+ знаков, заглавная, цифра!"; return; }
        if (password !== confirm) { msg.innerText = "Пароли не совпадают!"; return; }

        const userData = {
            name: document.getElementById('regName').value,
            email, phone, password, securityQuestion, secretWord
        };

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (res.ok) {
                msg.style.color = "green";
                msg.innerText = "Успех! Теперь войдите.";
                setTimeout(() => switchAuth('login'), 1500);
            } else {
                const data = await res.json();
                msg.innerText = data.message;
            }
        } catch (err) { msg.innerText = "Ошибка сервера"; }
    };
}

// Главный роутер
async function router() {
    const hash = window.location.hash.slice(1) || '/';
    const app = document.getElementById('app');
    const token = localStorage.getItem('token');

    if (['/profile', '/admin', '/favorites'].includes(hash) && !token) {
        window.location.hash = '#/auth';
        return;
    }

    if (hash.startsWith('/catalog/')) {
        const id = hash.split('/')[2];
        try {
            const res = await fetch(`http://localhost:5000/api/services/${id}`);
            if (!res.ok) { app.innerHTML = `<h1>Услуга не найдена</h1>`; return; }
            const item = await res.json();
            const resMasters = await fetch(`http://localhost:5000/api/masters`);
            const allMasters = await resMasters.json();
            const masters = allMasters.filter(m => m.service === id || (m.service && m.service._id === id));

            app.innerHTML = `
                <div class="fade-in">
                    <h1>${item.title}</h1>
                    <div class="card">
                        <p>${item.description || 'Описание скоро появится.'}</p>
                        <p><strong>Цена: ${item.price} руб.</strong></p>
                    </div>
                    <h2 style="margin-top: 40px;">Наши специалисты:</h2>
                    <div class="services-grid">
                        ${masters.length > 0 ? masters.map(m => `
                            <div class="card">
                                <img src="${m.photo || 'https://via.placeholder.com/150'}" style="width:100%; border-radius:10px; margin-bottom:10px;">
                                <h3>${m.name}</h3>
                                <p><em>${m.specialization}</em></p>
                                <p>Опыт: ${m.experience}</p>
                                <button class="btn" onclick="showModal('Запись', 'Вы выбрали специалиста: ${m.name}. Ожидайте звонка!')">Записаться</button>
                            </div>
                        `).join('') : '<p>Специалисты подбираются.</p>'}
                    </div>
                    <button class="btn" onclick="location.hash = '#/catalog'" style="margin-top:20px; background: #8a5a65; color: white;">Назад к услугам</button>
                </div>`;
            return;
        } catch (err) { console.error(err); }
    }

    const viewFunc = routes[hash] || (() => '<h1>404</h1>');
    app.innerHTML = await viewFunc();

    if (hash === '/auth') {
        initLoginLogic();
        initRegLogic(); 
    }
    updateNav(); 
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);