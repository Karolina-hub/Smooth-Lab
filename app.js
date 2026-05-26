// Маршруты SPA
const routes = {
    '/': async () => {
        try {
            const [servicesRes, mastersRes] = await Promise.all([
                fetch('http://localhost:5000/api/services'),
                fetch('http://localhost:5000/api/masters')
            ]);
            const services = await servicesRes.json();
            const masters  = await mastersRes.json();

            const procedures = [
                { name: 'Лазерная эпиляция', icon: '✨', desc: 'Современный метод с долгосрочным результатом' },
                { name: 'Вакcинг',            icon: '🌿', desc: 'Быстро и эффективно для любых зон' },
                { name: 'Шугаринг',           icon: '🍯', desc: 'Натуральная паста, минимум раздражения' },
                { name: 'Электроэпиляция',    icon: '⚡', desc: 'Единственный метод с гарантией навсегда' }
            ];

            return `
                <div class="fade-in">
                    <section class="hero">
                        <h1 class="hero-title">Smooth <span>Lab</span></h1>
                        <p class="hero-sub">Профессиональное удаление волос — лазер, вакcинг, шугаринг, электроэпиляция</p>
                        <div class="hero-actions">
                            <a href="#/quiz" class="btn btn-primary">Подобрать процедуру</a>
                            <a href="#/catalog" class="btn btn-secondary">Весь каталог</a>
                        </div>
                    </section>

                    <section class="home-stats">
                        <div class="stat-card">
                            <span class="stat-num">${services.length}</span>
                            <span class="stat-label">Процедур</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-num">${masters.length}</span>
                            <span class="stat-label">Специалистов</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-num">4</span>
                            <span class="stat-label">Метода</span>
                        </div>
                    </section>

                    <section>
                        <h2 class="section-title">Наши методы</h2>
                        <div class="methods-grid">
                            ${procedures.map(p => `
                                <div class="method-card">
                                    <div class="method-icon">${p.icon}</div>
                                    <h3>${p.name}</h3>
                                    <p>${p.desc}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="home-cta">
                        <h2>Не знаете, что выбрать?</h2>
                        <p>Пройдите короткий квиз — мы подберём процедуру под ваш тип кожи и бюджет.</p>
                        <a href="#/quiz" class="btn btn-primary">Пройти квиз</a>
                    </section>
                </div>`;
        } catch (err) {
            return `
                <div class="fade-in">
                    <section class="hero">
                        <h1 class="hero-title">Smooth <span>Lab</span></h1>
                        <p class="hero-sub">Профессиональное удаление волос — лазер, вакcинг, шугаринг, электроэпиляция</p>
                        <div class="hero-actions">
                            <a href="#/quiz" class="btn btn-primary">Подобрать процедуру</a>
                            <a href="#/catalog" class="btn btn-secondary">Весь каталог</a>
                        </div>
                    </section>
                </div>`;
        }
    },
    
    '/catalog': async () => {
        return `
            <div class="fade-in">
                <h1>Каталог услуг</h1>

                <div class="filters-panel">
                    <div class="filter-group">
                        <label>Зона</label>
                        <select id="filterZone">
                            <option value="">Все зоны</option>
                            <option value="Лицо">Лицо</option>
                            <option value="Тело">Тело</option>
                            <option value="Руки">Руки</option>
                            <option value="Ноги">Ноги</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Цена от</label>
                        <input type="number" id="filterMinPrice" placeholder="0" min="0">
                    </div>
                    <div class="filter-group">
                        <label>Цена до</label>
                        <input type="number" id="filterMaxPrice" placeholder="9999" min="0">
                    </div>
                    <div class="filter-group">
                        <label>Специалист</label>
                        <select id="filterMaster">
                            <option value="">Все специалисты</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="applyFilters()">Найти</button>
                    <button class="btn btn-secondary" onclick="resetFilters()">Сбросить</button>
                </div>

                <div id="catalogSpinner" class="spinner-wrap">
                    <div class="spinner"></div>
                </div>
                <div id="servicesList" class="services-grid" style="display:none;"></div>
                <p id="catalogEmpty" style="display:none; text-align:center; color:#8a5a65;">Услуги не найдены.</p>
            </div>`;
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

    '/admin': () => `
        <div class="fade-in">
            <h1>Панель управления</h1>

            <div class="admin-tabs">
                <button class="admin-tab active" onclick="switchAdminTab('services', this)">Услуги</button>
                <button class="admin-tab" onclick="switchAdminTab('masters', this)">Мастера</button>
            </div>

            <div id="adminServices">
                <h2>Добавить услугу</h2>
                <form id="addServiceForm" class="admin-form">
                    <input type="text" id="svcTitle" placeholder="Название услуги" required>
                    <input type="number" id="svcPrice" placeholder="Цена (руб.)" min="1" required>
                    <textarea id="svcDesc" placeholder="Описание" rows="3"></textarea>
                    <select id="svcZone">
                        <option value="Лицо">Лицо</option>
                        <option value="Тело">Тело</option>
                        <option value="Руки">Руки</option>
                        <option value="Ноги">Ноги</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Добавить услугу</button>
                </form>
                <p id="svcMsg" class="admin-msg"></p>
                <h2 style="margin-top:30px;">Список услуг</h2>
                <div id="adminServicesList"></div>
            </div>

            <div id="adminMasters" style="display:none;">
                <h2>Добавить мастера</h2>
                <form id="addMasterForm" class="admin-form">
                    <input type="text" id="mstrName" placeholder="Имя мастера" required>
                    <input type="text" id="mstrSpec" placeholder="Специализация" required>
                    <input type="text" id="mstrExp" placeholder="Опыт (напр. 5 лет)" required>
                    <input type="url" id="mstrPhoto" placeholder="Ссылка на фото (необязательно)">
                    <select id="mstrService" required>
                        <option value="" disabled selected>Выберите услугу</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Добавить мастера</button>
                </form>
                <p id="mstrMsg" class="admin-msg"></p>
                <h2 style="margin-top:30px;">Список мастеров</h2>
                <div id="adminMastersList"></div>
            </div>
        </div>`,

    '/quiz': () => `
        <div class="fade-in">
            <h1>Подбор процедуры</h1>
            <p style="color:#8a5a65; margin-bottom:30px;">Ответьте на несколько вопросов — мы подберём подходящие услуги именно для вас.</p>
            <div id="quizContainer">
                <div class="quiz-progress">
                    <div class="quiz-progress-bar" id="quizProgressBar" style="width:25%"></div>
                </div>
                <div id="quizStep"></div>
            </div>
        </div>`,

    '/favorites': async () => {
        const token = localStorage.getItem('token');
        if (!token) return `<h1>Загрузка...</h1>`;
        try {
            const res = await fetch('http://localhost:5000/api/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            const services = await res.json();
            return `
                <div class="fade-in">
                    <h1>Избранное</h1>
                    ${services.length === 0
                        ? `<div class="card" style="text-align:center;">
                               <p>Вы ещё не добавили ни одной услуги в избранное.</p>
                               <a href="#/catalog" class="btn btn-primary">Перейти в каталог</a>
                           </div>`
                        : `<div class="services-grid">${renderServices(services, [])}</div>`
                    }
                </div>`;
        } catch (err) {
            return `<div class="fade-in"><h1>Избранное</h1><p class="error-text">Не удалось загрузить избранное.</p></div>`;
        }
    }
};

function renderServices(items, favoriteIds = []) {
    return items.map(s => {
        const isFav = favoriteIds.includes(s._id);
        return `
        <div class="card" id="card-${s._id}">
            <div class="card-zone-badge">${s.zone || 'Лицо'}</div>
            <h3>${s.title}</h3>
            <p class="card-price">${s.price} руб.</p>
            <div class="card-actions">
                <a href="#/catalog/${s._id}" class="btn btn-primary">Подробнее</a>
                <button
                    class="btn-like ${isFav ? 'liked' : ''}"
                    onclick="toggleFavorite('${s._id}', this)"
                    title="${isFav ? 'Убрать из избранного' : 'В избранное'}">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
        </div>`;
    }).join('');
}

// ─── Каталог: загрузка, фильтры, лайки ───────────────────────────────────────

// Загружает услуги с учётом текущих фильтров и отрисовывает их
async function loadCatalog(params = {}) {
    const spinner = document.getElementById('catalogSpinner');
    const list = document.getElementById('servicesList');
    const empty = document.getElementById('catalogEmpty');
    if (!list) return;

    if (spinner) spinner.style.display = 'flex';
    list.style.display = 'none';
    if (empty) empty.style.display = 'none';

    try {
        // Строим строку запроса из переданных параметров
        const query = new URLSearchParams();
        if (params.zone)     query.set('zone', params.zone);
        if (params.minPrice) query.set('minPrice', params.minPrice);
        if (params.maxPrice) query.set('maxPrice', params.maxPrice);
        if (params.master)   query.set('master', params.master);

        const [servicesRes, mastersRes] = await Promise.all([
            fetch(`http://localhost:5000/api/services?${query}`),
            fetch('http://localhost:5000/api/masters')
        ]);

        if (!servicesRes.ok) throw new Error('Ошибка загрузки услуг');
        const services = await servicesRes.json();
        const masters  = await mastersRes.json();

        // Заполняем выпадающий список специалистов (только при первой загрузке)
        const masterSelect = document.getElementById('filterMaster');
        if (masterSelect && masterSelect.options.length === 1) {
            masters.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m._id;
                opt.textContent = m.name;
                masterSelect.appendChild(opt);
            });
        }

        // Получаем ID избранных услуг (если пользователь авторизован)
        let favoriteIds = [];
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const favRes = await fetch('http://localhost:5000/api/favorites/ids', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (favRes.ok) favoriteIds = await favRes.json();
            } catch (_) { /* не критично */ }
        }

        if (spinner) spinner.style.display = 'none';

        if (services.length === 0) {
            if (empty) empty.style.display = 'block';
            return;
        }

        list.innerHTML = renderServices(services, favoriteIds);
        list.style.display = 'grid';

    } catch (err) {
        if (spinner) spinner.style.display = 'none';
        if (list) {
            list.innerHTML = `<p class="error-text" style="grid-column:1/-1;">Не удалось загрузить каталог. Проверьте соединение.</p>`;
            list.style.display = 'grid';
        }
    }
}

// Читает значения фильтров из DOM и запускает загрузку
window.applyFilters = () => {
    const params = {
        zone:     document.getElementById('filterZone')?.value || '',
        minPrice: document.getElementById('filterMinPrice')?.value || '',
        maxPrice: document.getElementById('filterMaxPrice')?.value || '',
        master:   document.getElementById('filterMaster')?.value || ''
    };
    loadCatalog(params);
};

// Сбрасывает все фильтры и перезагружает каталог
window.resetFilters = () => {
    const ids = ['filterZone', 'filterMinPrice', 'filterMaxPrice', 'filterMaster'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    loadCatalog();
};

// Переключает лайк на услуге
window.toggleFavorite = async (serviceId, btn) => {
    const token = localStorage.getItem('token');
    if (!token) {
        showModal('Внимание', 'Войдите в аккаунт, чтобы добавлять услуги в избранное.');
        return;
    }

    const isLiked = btn.classList.contains('liked');
    const method  = isLiked ? 'DELETE' : 'POST';

    try {
        const res = await fetch(`http://localhost:5000/api/favorites/${serviceId}`, {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            btn.classList.toggle('liked', !isLiked);
            btn.textContent = isLiked ? '🤍' : '❤️';
            btn.title = isLiked ? 'В избранное' : 'Убрать из избранного';
        } else {
            const data = await res.json();
            showModal('Ошибка', data.message || 'Не удалось обновить избранное.');
        }
    } catch (err) {
        showModal('Ошибка', 'Нет соединения с сервером.');
    }
};

// ─────────────────────────────────────────────────────────────────────────────

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
        const res = await fetch(`http://localhost:5000/api/services?search=${encodeURIComponent(query)}`);
        const services = await res.json();
        document.getElementById('searchResults').innerHTML = renderServices(services, []);
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

// ─── Квиз: подбор процедуры ───────────────────────────────────────────────────

// Админ-панель

function switchAdminTab(tab, btn) {
    document.getElementById('adminServices').style.display = tab === 'services' ? 'block' : 'none';
    document.getElementById('adminMasters').style.display  = tab === 'masters'  ? 'block' : 'none';
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

async function initAdmin() {
    await Promise.all([loadAdminServices(), loadAdminMasters()]);
    initAddServiceForm();
    initAddMasterForm();
}

async function loadAdminServices() {
    const container = document.getElementById('adminServicesList');
    if (!container) return;
    try {
        const res = await fetch('http://localhost:5000/api/services');
        const services = await res.json();
        if (services.length === 0) {
            container.innerHTML = '<p style="color:#8a5a65;">Услуг пока нет.</p>';
            return;
        }
        container.innerHTML = services.map(s => `
            <div class="admin-row">
                <div>
                    <strong>${s.title}</strong>
                    <span class="card-zone-badge" style="margin-left:8px;">${s.zone || 'Лицо'}</span>
                    <span style="color:#ff8fa3; margin-left:8px;">${s.price} руб.</span>
                </div>
                <button class="btn-delete" onclick="deleteService('${s._id}')">Удалить</button>
            </div>`).join('');
    } catch (err) {
        container.innerHTML = '<p class="error-text">Не удалось загрузить услуги.</p>';
    }
}

async function loadAdminMasters() {
    const container = document.getElementById('adminMastersList');
    const serviceSelect = document.getElementById('mstrService');
    if (!container) return;
    try {
        const [mastersRes, servicesRes] = await Promise.all([
            fetch('http://localhost:5000/api/masters'),
            fetch('http://localhost:5000/api/services')
        ]);
        const masters  = await mastersRes.json();
        const services = await servicesRes.json();

        // Заполняем select услуг в форме добавления мастера
        if (serviceSelect) {
            serviceSelect.innerHTML = '<option value="" disabled selected>Выберите услугу</option>';
            services.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s._id;
                opt.textContent = s.title;
                serviceSelect.appendChild(opt);
            });
        }

        if (masters.length === 0) {
            container.innerHTML = '<p style="color:#8a5a65;">Мастеров пока нет.</p>';
            return;
        }
        container.innerHTML = masters.map(m => `
            <div class="admin-row">
                <div>
                    <strong>${m.name}</strong>
                    <span style="color:#8a5a65; margin-left:8px;">${m.specialization}</span>
                </div>
                <button class="btn-delete" onclick="deleteMaster('${m._id}')">Удалить</button>
            </div>`).join('');
    } catch (err) {
        container.innerHTML = '<p class="error-text">Не удалось загрузить мастеров.</p>';
    }
}

function initAddServiceForm() {
    const form = document.getElementById('addServiceForm');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const msg   = document.getElementById('svcMsg');
        const token = localStorage.getItem('token');
        const body  = {
            title:       document.getElementById('svcTitle').value.trim(),
            price:       Number(document.getElementById('svcPrice').value),
            description: document.getElementById('svcDesc').value.trim(),
            zone:        document.getElementById('svcZone').value
        };

        if (!body.title || !body.price) {
            msg.style.color = 'red';
            msg.textContent = 'Заполните название и цену.';
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                msg.style.color = 'green';
                msg.textContent = 'Услуга добавлена!';
                form.reset();
                await loadAdminServices();
            } else {
                const data = await res.json();
                msg.style.color = 'red';
                msg.textContent = data.message || 'Ошибка при добавлении.';
            }
        } catch (err) {
            msg.style.color = 'red';
            msg.textContent = 'Нет соединения с сервером.';
        }
    };
}

function initAddMasterForm() {
    const form = document.getElementById('addMasterForm');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const msg   = document.getElementById('mstrMsg');
        const token = localStorage.getItem('token');
        const body  = {
            name:           document.getElementById('mstrName').value.trim(),
            specialization: document.getElementById('mstrSpec').value.trim(),
            experience:     document.getElementById('mstrExp').value.trim(),
            photo:          document.getElementById('mstrPhoto').value.trim() || undefined,
            service:        document.getElementById('mstrService').value
        };

        if (!body.name || !body.specialization || !body.service) {
            msg.style.color = 'red';
            msg.textContent = 'Заполните имя, специализацию и выберите услугу.';
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/masters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                msg.style.color = 'green';
                msg.textContent = 'Мастер добавлен!';
                form.reset();
                await loadAdminMasters();
            } else {
                const data = await res.json();
                msg.style.color = 'red';
                msg.textContent = data.message || 'Ошибка при добавлении.';
            }
        } catch (err) {
            msg.style.color = 'red';
            msg.textContent = 'Нет соединения с сервером.';
        }
    };
}

window.deleteService = async (id) => {
    if (!confirm('Удалить эту услугу?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/services/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            await loadAdminServices();
        } else {
            showModal('Ошибка', 'Не удалось удалить услугу.');
        }
    } catch (err) {
        showModal('Ошибка', 'Нет соединения с сервером.');
    }
};

window.deleteMaster = async (id) => {
    if (!confirm('Удалить этого мастера?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/masters/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            await loadAdminMasters();
        } else {
            showModal('Ошибка', 'Не удалось удалить мастера.');
        }
    } catch (err) {
        showModal('Ошибка', 'Нет соединения с сервером.');
    }
};

// Квиз: подбор процедуры

const QUIZ_STEPS = [
    {
        id: 'zone',
        question: 'Какую зону вы хотите проработать?',
        options: ['Лицо', 'Тело', 'Руки', 'Ноги']
    },
    {
        id: 'problem',
        question: 'Какая у вас основная задача?',
        options: ['Увлажнение и питание', 'Омоложение и лифтинг', 'Очищение и сужение пор', 'Устранение пигментации', 'Расслабление и снятие стресса']
    },
    {
        id: 'budget',
        question: 'Ваш бюджет на процедуру?',
        options: ['До 50 руб.', '50–100 руб.', '100–200 руб.', 'Более 200 руб.']
    },
    {
        id: 'time',
        question: 'Сколько времени вы готовы уделить?',
        options: ['До 30 минут', '30–60 минут', 'Более часа']
    }
];

// Хранит ответы пользователя
const quizAnswers = {};

// Инициализирует квиз — показывает первый шаг
function initQuiz() {
    const container = document.getElementById('quizStep');
    if (!container) return;
    quizAnswers.currentStep = 0;
    renderQuizStep(0);
}

// Отрисовывает текущий шаг квиза
function renderQuizStep(stepIndex) {
    const container = document.getElementById('quizStep');
    const progressBar = document.getElementById('quizProgressBar');
    if (!container) return;

    const step = QUIZ_STEPS[stepIndex];
    const progress = Math.round(((stepIndex + 1) / QUIZ_STEPS.length) * 100);
    if (progressBar) progressBar.style.width = progress + '%';

    container.innerHTML = `
        <div class="quiz-card fade-in">
            <p class="quiz-step-label">Вопрос ${stepIndex + 1} из ${QUIZ_STEPS.length}</p>
            <h2 class="quiz-question">${step.question}</h2>
            <div class="quiz-options">
                ${step.options.map(opt => `
                    <button class="quiz-option" onclick="selectQuizOption('${step.id}', '${opt}', ${stepIndex})">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            ${stepIndex > 0 ? `<button class="btn btn-secondary quiz-back" onclick="renderQuizStep(${stepIndex - 1})">← Назад</button>` : ''}
        </div>`;
}

// Обрабатывает выбор варианта ответа
window.selectQuizOption = (stepId, value, stepIndex) => {
    quizAnswers[stepId] = value;

    // Подсвечиваем выбранный вариант
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent.trim() === value);
    });

    // Небольшая задержка для визуального отклика, затем переходим дальше
    setTimeout(() => {
        if (stepIndex + 1 < QUIZ_STEPS.length) {
            renderQuizStep(stepIndex + 1);
        } else {
            showQuizResults();
        }
    }, 300);
};

// Загружает и показывает результаты квиза
async function showQuizResults() {
    const container = document.getElementById('quizStep');
    const progressBar = document.getElementById('quizProgressBar');
    if (!container) return;

    if (progressBar) progressBar.style.width = '100%';

    container.innerHTML = `
        <div class="quiz-card fade-in" style="text-align:center;">
            <div class="spinner-wrap"><div class="spinner"></div></div>
            <p style="color:#8a5a65;">Подбираем процедуры...</p>
        </div>`;

    try {
        // Строим параметры запроса на основе ответов
        const query = new URLSearchParams();

        if (quizAnswers.zone) query.set('zone', quizAnswers.zone);

        // Переводим бюджет в диапазон цен
        const budgetMap = {
            'До 50 руб.':      { max: 50 },
            '50–100 руб.':     { min: 50,  max: 100 },
            '100–200 руб.':    { min: 100, max: 200 },
            'Более 200 руб.':  { min: 200 }
        };
        const budget = budgetMap[quizAnswers.budget];
        if (budget?.min) query.set('minPrice', budget.min);
        if (budget?.max) query.set('maxPrice', budget.max);

        const res = await fetch(`http://localhost:5000/api/services?${query}`);
        if (!res.ok) throw new Error();
        const services = await res.json();

        if (services.length === 0) {
            container.innerHTML = `
                <div class="quiz-card fade-in" style="text-align:center;">
                    <h2>Ничего не найдено 😔</h2>
                    <p>По вашим параметрам пока нет подходящих процедур. Попробуйте изменить критерии.</p>
                    <button class="btn btn-primary" onclick="initQuiz()">Пройти заново</button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="fade-in">
                <h2 style="color:#ff8fa3; margin-bottom:20px;">Мы подобрали для вас ${services.length} процедур${services.length === 1 ? 'у' : 'ы'}:</h2>
                <div class="services-grid">${renderServices(services, [])}</div>
                <button class="btn btn-secondary" onclick="initQuiz()" style="margin-top:30px;">← Пройти заново</button>
            </div>`;

    } catch (err) {
        container.innerHTML = `
            <div class="quiz-card fade-in" style="text-align:center;">
                <p class="error-text">Не удалось загрузить результаты. Проверьте соединение.</p>
                <button class="btn btn-primary" onclick="initQuiz()">Попробовать снова</button>
            </div>`;
    }
}

// ─────────────────────────────────────────────────────────────────────────────

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

    const viewFunc = routes[hash] || (() => '<div class="fade-in"><h1>404 — Страница не найдена</h1><p>Такой страницы не существует.</p><a href="#/" class="btn btn-primary" style="margin-top:20px;">На главную</a></div>');
    app.innerHTML = await viewFunc();

    if (hash === '/auth') {
        initLoginLogic();
        initRegLogic(); 
    }
    if (hash === '/catalog') {
        loadCatalog();
    }
    if (hash === '/quiz') {
        initQuiz();
    }
    if (hash === '/admin') {
        initAdmin();
    }
    updateNav(); 
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);