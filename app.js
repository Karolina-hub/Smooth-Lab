// Базовый URL API
const API_URL = (() => {
    const fromWindow = window.__API_URL__;
    const fromMeta = document.querySelector('meta[name="api-url"]')?.content;
    return (fromWindow || fromMeta || 'http://localhost:5000').replace(/\/$/, '');
})();

function isAdminUser() {
    return localStorage.getItem('isAdmin') === 'true';
}

function getRoutePath() {
    let path = window.location.pathname || '/';
    if (path.endsWith('/index.html')) path = path.replace(/\/index\.html$/, '') || '/';
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path || '/';
}

window.navigateTo = (path) => {
    const target = path.startsWith('/') ? path : `/${path}`;
    window.history.pushState({}, '', target);
    router();
};

function migrateHashRouteIfNeeded() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
        const path = hash.slice(1) || '/';
        window.history.replaceState({}, '', path);
    }
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="/"]');
    if (!link || link.getAttribute('target') === '_blank') return;
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    e.preventDefault();
    navigateTo(url.pathname + url.search);
});

const METHOD_META = {
    'Лазерная эпиляция': { icon: '✨', desc: 'Стойкое сокращение волос. Идеально для тёмных волос.' },
    'Электроэпиляция':   { icon: '⚡', desc: 'Перманентный результат на любом типе волос.' },
    'Шугаринг':          { icon: '🍯', desc: 'Натуральная паста, минимум раздражения.' },
    'Вакcинг':           { icon: '🌿', desc: 'Быстрое удаление воском на 2–4 недели.' }
};

const FALLBACK_CONTENT = {
    pages: {
        home: {
            heroTitle: 'Smooth Lab',
            heroSubtitle: 'Профессиональное удаление волос — лазер, вакcинг, шугаринг, электроэпиляция'
        },
        catalog: {
            title: 'Каталог услуг',
            subtitle: 'Выберите метод или отфильтруйте все услуги ниже.'
        },
        search: {
            title: 'Поиск услуг',
            placeholder: 'Введите название или метод...'
        },
        quiz: {
            title: 'Подбор процедуры',
            subtitle: 'Ответьте на несколько вопросов — мы подберём подходящие услуги именно для вас.'
        }
    },
    quizSteps: []
};

let contentCache = null;
async function getContent() {
    if (contentCache) return contentCache;
    try {
        const res = await fetch(`${API_URL}/api/content`);
        if (!res.ok) throw new Error();
        contentCache = await res.json();
        return contentCache;
    } catch (_) {
        return FALLBACK_CONTENT;
    }
}

function buildMethodCardsHtml(services) {
    const methods = [...new Set(services.map(s => s.method).filter(Boolean))];
    if (methods.length === 0) {
        return '<p style="color:#8a5a65;">Методы скоро появятся в каталоге.</p>';
    }
    return methods.map(key => {
        const m = METHOD_META[key] || { icon: '💆', desc: 'Услуги студии' };
        return `
        <div class="method-card method-card-link" onclick="navigateTo('/catalog/${encodeURIComponent(key)}')">
            <div class="method-icon">${m.icon}</div>
            <h3>${key}</h3>
            <p>${m.desc}</p>
            <span class="method-card-cta">Смотреть цены →</span>
        </div>`;
    }).join('');
}

function renderCatalogFiltersBlock() {
    return `
        <h2 style="margin-top:40px;">Все услуги</h2>
        <p style="color:#8a5a65; margin-bottom:16px;">Фильтрация по зоне, цене и специалисту.</p>
        <div class="filters-panel">
            <div class="filter-group">
                <label for="filterZone">Зона</label>
                <select id="filterZone">
                    <option value="">Все</option>
                    <option value="Лицо">Лицо</option>
                    <option value="Тело">Тело</option>
                    <option value="Руки">Руки</option>
                    <option value="Ноги">Ноги</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="filterMinPrice">Цена от</label>
                <input type="number" id="filterMinPrice" min="0" placeholder="0">
            </div>
            <div class="filter-group">
                <label for="filterMaxPrice">Цена до</label>
                <input type="number" id="filterMaxPrice" min="0" placeholder="500">
            </div>
            <div class="filter-group">
                <label for="filterMaster">Специалист</label>
                <select id="filterMaster"><option value="">Все</option></select>
            </div>
            <button type="button" class="btn btn-primary" onclick="applyFilters()">Применить</button>
            <button type="button" class="btn btn-secondary" onclick="resetFilters()">Сбросить</button>
        </div>
        <div id="catalogSpinner" class="spinner-wrap"><div class="spinner"></div></div>
        <div id="catalogEmpty" style="display:none; text-align:center; padding:30px;">
            <p style="color:#8a5a65;">По выбранным фильтрам ничего не найдено.</p>
        </div>
        <div id="servicesList" class="services-grid" style="display:none;"></div>`;
}

// Глобальный перехватчик сетевых ошибок
const _originalFetch = window.fetch;
window.fetch = async (...args) => {
    try {
        const res = await _originalFetch(...args);
        return res;
    } catch (err) {
        const banner = document.getElementById('networkError');
        if (banner) {
            banner.style.display = 'block';
            clearTimeout(banner._timer);
            banner._timer = setTimeout(() => { banner.style.display = 'none'; }, 4000);
        }
        throw err;
    }
};

// Маршруты SPA
const routes = {
    '/': async () => {
        try {
            const content = await getContent();
            const homeContent = content.pages?.home || FALLBACK_CONTENT.pages.home;
            const [servicesRes, mastersRes] = await Promise.all([
                fetch(`${API_URL}/api/services`),
                fetch(`${API_URL}/api/masters`)
            ]);
            const services = await servicesRes.json();
            const masters  = await mastersRes.json();

            const methodNames = [...new Set(services.map(s => s.method).filter(Boolean))];
            const procedures = methodNames.map(name => ({
                name,
                icon: (METHOD_META[name] || {}).icon || '💆',
                desc: (METHOD_META[name] || {}).desc || 'Услуги студии'
            }));

            return `
                <div class="fade-in">
                    <section class="hero">
                        <h1 class="hero-title">${homeContent.heroTitle.replace(' ', ' <span>')}${homeContent.heroTitle.includes(' ') ? '</span>' : ''}</h1>
                        <p class="hero-sub">${homeContent.heroSubtitle}</p>
                        <div class="hero-actions">
                            <a href="/quiz" class="btn btn-primary">Подобрать процедуру</a>
                            <a href="/catalog" class="btn btn-secondary">Весь каталог</a>
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
                            <span class="stat-num">${methodNames.length || 0}</span>
                            <span class="stat-label">Метода</span>
                        </div>
                    </section>

                    <section>
                        <h2 class="section-title">Методы</h2>
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
                        <a href="/quiz" class="btn btn-primary">Пройти квиз</a>
                    </section>
                </div>`;
        } catch (err) {
            return `
                <div class="fade-in">
                    <section class="hero">
                        <h1 class="hero-title">Smooth <span>Lab</span></h1>
                        <p class="hero-sub">Профессиональное удаление волос — лазер, вакcинг, шугаринг, электроэпиляция</p>
                        <div class="hero-actions">
                            <a href="/quiz" class="btn btn-primary">Подобрать процедуру</a>
                            <a href="/catalog" class="btn btn-secondary">Весь каталог</a>
                        </div>
                    </section>
                </div>`;
        }
    },
    
    '/catalog': async () => {
        try {
            const content = await getContent();
            const catalogContent = content.pages?.catalog || FALLBACK_CONTENT.pages.catalog;
            const res = await fetch(`${API_URL}/api/services`);
            if (!res.ok) throw new Error();
            const services = await res.json();
            return `
            <div class="fade-in">
                <h1>${catalogContent.title}</h1>
                <p style="color:#8a5a65; margin-bottom:30px;">${catalogContent.subtitle}</p>
                <div class="methods-grid">${buildMethodCardsHtml(services)}</div>
                ${renderCatalogFiltersBlock()}
                <p style="color:#8a5a65; font-size:14px; margin-top:8px;">В блоке «Все услуги» нажмите 🤍 для добавления в избранное.</p>
            </div>`;
        } catch (err) {
            return `
            <div class="fade-in">
                <h1>Каталог услуг</h1>
                <p class="error-text">Не удалось загрузить каталог. Проверьте соединение.</p>
            </div>`;
        }
    },

    '/specialists': async () => {
        try {
            const res = await fetch(`${API_URL}/api/masters`);
            if (!res.ok) throw new Error();
            const masters = await res.json();

            if (masters.length === 0) {
                return `
                <div class="fade-in">
                    <h1>Специалисты</h1>
                    <div style="min-height: 180px;"></div>
                </div>`;
            }

            return `
            <div class="fade-in">
                <h1>Специалисты</h1>
                <p style="color:#8a5a65; margin-bottom:24px;">Команда Smooth Lab</p>
                <div class="services-grid">
                    ${masters.map(m => `
                        <div class="card">
                            <img src="${m.photo || 'https://via.placeholder.com/150'}" style="width:100%; border-radius:10px; margin-bottom:10px;" alt="${m.name}">
                            <h3>${m.name}</h3>
                            <p><em>${m.specialization}</em></p>
                            <p>Опыт: ${m.experience}</p>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        } catch (err) {
            return `<div class="fade-in"><h1>Специалисты</h1><p class="error-text">Не удалось загрузить список специалистов.</p></div>`;
        }
    },

    '/search': () => `
        <div class="fade-in">
            <h1>Поиск услуг</h1>
            <div style="display:flex; gap:10px; flex-wrap:wrap; max-width:600px; margin:0 auto 20px;">
                <input type="text" id="searchInput" placeholder="${FALLBACK_CONTENT.pages.search.placeholder}" oninput="debouncedSearch(this.value)" onkeydown="if(event.key==='Enter')handleSearchFromButton()" autocomplete="off" style="flex:1; min-width:200px;">
                <button type="button" class="btn btn-primary" onclick="handleSearchFromButton()">Найти</button>
            </div>
            <div id="searchResults" class="services-grid" style="margin-top:20px;"></div>
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
                <button type="submit" id="loginSubmitBtn">Войти</button>
                <button type="button" id="forgotPasswordBtn" class="forgot-link">Забыли пароль?</button>
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
            const res = await fetch(`${API_URL}/api/auth/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Ошибка доступа");
            const user = await res.json();
            if (user?.name) localStorage.setItem('userName', user.name);
            localStorage.setItem('isAdmin', user?.isAdmin ? 'true' : 'false');
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
            navigateTo('/auth');
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
                    <input type="text" id="svcTitle" placeholder="Зона (напр. Подмышечные впадины)" required>
                    <input type="number" id="svcPrice" placeholder="Цена (руб.)" min="1" required>
                    <select id="svcMethod">
                        <option value="Лазерная эпиляция">Лазерная эпиляция</option>
                        <option value="Электроэпиляция">Электроэпиляция</option>
                        <option value="Шугаринг">Шугаринг</option>
                        <option value="Вакcинг">Вакcинг</option>
                    </select>
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
                    <select id="mstrSpec" required>
                        <option value="" disabled selected>Специализация мастера</option>
                        <option value="Лазерная эпиляция">Мастер лазерной эпиляции</option>
                        <option value="Электроэпиляция">Мастер электроэпиляции</option>
                        <option value="Шугаринг">Мастер шугаринга</option>
                        <option value="Вакcинг">Мастер вакcинга</option>
                    </select>
                    <input type="text" id="mstrExp" placeholder="Опыт (напр. 5 лет)" required>
                    <input type="url" id="mstrPhoto" placeholder="Ссылка на фото (необязательно)">
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
            const res = await fetch(`${API_URL}/api/favorites`, {
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
                               <a href="/catalog" class="btn btn-primary">Перейти в каталог</a>
                           </div>`
                        : `<div class="services-grid">${renderServices(services, [])}</div>`
                    }
                </div>`;
        } catch (err) {
            return `<div class="fade-in"><h1>Избранное</h1><p class="error-text">Не удалось загрузить избранное.</p></div>`;
        }
    }
};

async function fetchFavoriteIds() {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
        const favRes = await fetch(`${API_URL}/api/favorites/ids`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (favRes.ok) return await favRes.json();
    } catch (_) {}
    return [];
}

function renderServices(items, favoriteIds = []) {
    return items.map(s => {
        const isFav = favoriteIds.includes(s._id);
        return `
        <div class="card service-card" id="card-${s._id}">
            <h3 class="service-card-title">${s.title}</h3>
            <p class="service-card-method">${s.method || ''}</p>
            <p class="card-price">${s.price} руб.</p>
            <div class="card-actions">
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

function renderPriceRows(services, favoriteIds = []) {
    if (!services.length) {
        return '<p style="color:#8a5a65; padding:20px;">Прайс скоро появится.</p>';
    }
    return services.map(s => {
        const isFav = favoriteIds.includes(String(s._id));
        return `
        <div class="price-row price-row-with-like">
            <span class="price-zone">${s.title}</span>
            <div class="price-row-actions">
                <span class="price-amount">${s.price} руб.</span>
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

// Каталог: загрузка, фильтры, лайки

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
            fetch(`${API_URL}/api/services?${query}`),
            fetch(`${API_URL}/api/masters`)
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

        const favoriteIds = await fetchFavoriteIds();

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
        const res = await fetch(`${API_URL}/api/favorites/${serviceId}`, {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            btn.classList.toggle('liked', !isLiked);
            btn.textContent = isLiked ? '🤍' : '❤️';
            btn.title = isLiked ? 'В избранное' : 'Убрать из избранного';
        } else {
            const errorText = await getApiErrorMessage(res, 'Не удалось обновить избранное.');
            showModal('Ошибка', errorText);
        }
    } catch (err) {
        showModal('Ошибка', 'Нет соединения с сервером.');
    }
};

function updateNav() {
    const token = localStorage.getItem('token');
    const path = getRoutePath();

    const navItems = {
        'nav-auth':      !token,
        'nav-logout':    !!token,
        'nav-profile':   !!token,
        'nav-favorites': !!token,
        'nav-admin':     !!token && isAdminUser(),
        'nav-quiz':      !!token
    };
    for (const [id, show] of Object.entries(navItems)) {
        const el = document.getElementById(id);
        if (el) el.style.display = show ? 'block' : 'none';
    }
    // Подсвечиваем активный пункт меню
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPath = new URL(href, window.location.origin).pathname || '/';
        const isActive = path === linkPath || (linkPath !== '/' && path.startsWith(linkPath));
        link.classList.toggle('nav-active', isActive);
    });
}

function closeMobileMenu() {
    const nav = document.querySelector('.nav');
    const btn = document.getElementById('navToggle');
    if (!nav || !btn) return;
    nav.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
}

function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const btn = document.getElementById('navToggle');
    if (!nav || !btn) return;
    const isOpen = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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

async function getApiErrorMessage(res, fallback = 'Произошла ошибка') {
    try {
        const data = await res.json();
        return data.message || data.error || fallback;
    } catch (_) {
        return fallback;
    }
}

let searchTimer = null;

window.handleSearchFromButton = () => {
    const input = document.getElementById('searchInput');
    const q = (input?.value || '').trim();
    if (q.length < 2) {
        showModal('Внимание', 'Введите минимум 2 символа для поиска.');
        return;
    }
    handleSearch(q);
};

window.debouncedSearch = (query) => {
    clearTimeout(searchTimer);
    const results = document.getElementById('searchResults');
    if (!results) return;

    const q = query.trim();
    if (q.length < 2) {
        results.innerHTML = '';
        return;
    }

    results.innerHTML = '<div class="spinner-wrap" style="grid-column:1/-1;"><div class="spinner"></div></div>';
    searchTimer = setTimeout(() => handleSearch(q), 400);
};

window.handleSearch = async (query) => {
    const results = document.getElementById('searchResults');
    if (!results) return;

    try {
        const res = await fetch(`${API_URL}/api/services?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error();
        const services = await res.json();

        if (services.length === 0) {
            results.innerHTML = '<p style="color:#8a5a65; grid-column:1/-1;">Ничего не найдено.</p>';
            return;
        }

        let favoriteIds = [];
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const favRes = await fetch(`${API_URL}/api/favorites/ids`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (favRes.ok) favoriteIds = await favRes.json();
            } catch (_) {}
        }

        results.innerHTML = renderServices(services, favoriteIds);
    } catch (err) {
        results.innerHTML = '<p class="error-text" style="grid-column:1/-1;">Ошибка при поиске. Проверьте соединение.</p>';
    }
};

window.logout = () => {
    AuthState.clear();
    navigateTo('/auth');
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

function setAuthMessage(text, color = 'red') {
    const msg = document.getElementById('authMessage');
    if (!msg) return;
    msg.style.color = color;
    msg.innerText = text;
}

function openRecoveryModal(question) {
    const modal = document.getElementById('recoveryModal');
    const questionText = document.getElementById('recoveryQuestion');
    const errorBlock = document.getElementById('recoveryError');
    const answerInput = document.getElementById('recoveryAnswer');
    if (errorBlock) errorBlock.innerText = '';
    if (answerInput) answerInput.value = '';
    if (questionText) questionText.innerHTML = `<strong>Вопрос:</strong> ${question}`;
    if (modal) {
        modal.classList.add('is-open');
        modal.style.display = 'flex';
    }
}

window.closeRecoveryModal = () => {
    const modal = document.getElementById('recoveryModal');
    if (modal) {
        modal.classList.remove('is-open');
        modal.style.display = 'none';
    }
    const err = document.getElementById('recoveryError');
    const ans = document.getElementById('recoveryAnswer');
    if (err) err.innerText = '';
    if (ans) ans.value = '';
};
window.closeModal = window.closeRecoveryModal;

window.forgotPassword = async () => {
    const emailInput = document.getElementById('loginIdentifier');
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    const email = (emailInput?.value || '').trim().toLowerCase();

    if (!email) {
        setAuthMessage('Введите email в поле выше, затем нажмите «Забыли пароль?»');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setAuthMessage('Введите корректный email');
        return;
    }

    if (forgotBtn) {
        forgotBtn.disabled = true;
        forgotBtn.textContent = 'Загрузка...';
    }
    setAuthMessage('Запрашиваем секретный вопрос...', '#8a5a65');

    try {
        const res = await fetch(
            `${API_URL}/api/auth/get-question?email=${encodeURIComponent(email)}`
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            setAuthMessage(data.message || 'Пользователь с таким email не найден');
            showModal('Ошибка', data.message || 'Пользователь не найден');
            return;
        }

        setAuthMessage('');
        openRecoveryModal(data.question || 'Секретный вопрос не задан');
    } catch (err) {
        setAuthMessage('Не удалось связаться с сервером. Подождите и попробуйте снова.');
        showModal('Ошибка', 'Не удалось связаться с сервером. Если сервер «спит», подождите до 1 минуты.');
    } finally {
        if (forgotBtn) {
            forgotBtn.disabled = false;
            forgotBtn.textContent = 'Забыли пароль?';
        }
    }
};

// Функция отправки ответа 
window.submitRecovery = async () => {
    const email = (document.getElementById('loginIdentifier')?.value || '').trim().toLowerCase();
    const answer = document.getElementById('recoveryAnswer').value.trim();
    const errorBlock = document.getElementById('recoveryError');

    if (!answer) {
        errorBlock.innerText = 'Введите ответ!';
        return;
    }

    try {
        const verifyRes = await fetch(`${API_URL}/api/auth/verify-secret`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, answer })
        });
        
        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
            AuthState.setToken(verifyData.token);
            if (verifyData.user?.name) localStorage.setItem('userName', verifyData.user.name);
            localStorage.setItem('isAdmin', verifyData.user?.isAdmin ? 'true' : 'false');
            closeRecoveryModal();
            navigateTo('/profile');
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
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    if (!form) return;

    if (forgotBtn && !forgotBtn.dataset.bound) {
        forgotBtn.dataset.bound = '1';
        forgotBtn.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPassword();
        });
    }

    if (form.dataset.bound) return;
    form.dataset.bound = '1';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('loginSubmitBtn');
        const email = (document.getElementById('loginIdentifier')?.value || '').trim().toLowerCase();
        const password = (document.getElementById('loginPassword')?.value || '').trim();

        if (!email || !password) {
            setAuthMessage('Введите email и пароль');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Вход...';
        }
        setAuthMessage('Выполняется вход...', '#8a5a65');

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                const data = await res.json();
                AuthState.setToken(data.token);
                if (data.user?.name) localStorage.setItem('userName', data.user.name);
                localStorage.setItem('isAdmin', data.user?.isAdmin ? 'true' : 'false');
                setAuthMessage('Успешный вход!', 'green');
                setTimeout(() => navigateTo('/profile'), 800);
            } else {
                setAuthMessage(await getApiErrorMessage(res, 'Ошибка авторизации'));
            }
        } catch (err) {
            setAuthMessage('Ошибка сервера. Подождите и попробуйте снова.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Войти';
            }
        }
    });
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
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (res.ok) {
                const data = await res.json();
                AuthState.setToken(data.token);
                if (data.user?.name) localStorage.setItem('userName', data.user.name);
                localStorage.setItem('isAdmin', data.user?.isAdmin ? 'true' : 'false');
                msg.style.color = "green";
                msg.innerText = "Регистрация успешна!";
                setTimeout(() => navigateTo('/profile'), 600);
            } else {
                msg.innerText = await getApiErrorMessage(res, 'Не удалось зарегистрироваться');
            }
        } catch (err) { msg.innerText = "Ошибка сервера"; }
    };
}

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
        const res = await fetch(`${API_URL}/api/services`);
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
    if (!container) return;
    try {
        const mastersRes = await fetch(`${API_URL}/api/masters`);
        const masters  = await mastersRes.json();

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
            zone:        document.getElementById('svcZone').value,
            method:      document.getElementById('svcMethod').value
        };

        if (!body.title || !body.price) {
            msg.style.color = 'red';
            msg.textContent = 'Заполните название и цену.';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/services`, {
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
                msg.style.color = 'red';
                msg.textContent = await getApiErrorMessage(res, 'Ошибка при добавлении.');
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
            photo:          document.getElementById('mstrPhoto').value.trim() || undefined
        };

        if (!body.name || !body.specialization) {
            msg.style.color = 'red';
            msg.textContent = 'Заполните имя и специализацию.';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/masters`, {
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
                msg.style.color = 'red';
                msg.textContent = await getApiErrorMessage(res, 'Ошибка при добавлении.');
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
        const res = await fetch(`${API_URL}/api/services/${id}`, {
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
        const res = await fetch(`${API_URL}/api/masters/${id}`, {
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

// Квиз: подбор метода эпиляции

let QUIZ_STEPS = [
    {
        id: 'hair',
        question: 'Какой у вас цвет волос в зоне обработки?',
        options: [
            'Тёмные (чёрные или тёмно-коричневые)',
            'Светлые (русые, рыжие, седые или пушковые)'
        ]
    },
    {
        id: 'pain',
        question: 'Как вы относитесь к болевым ощущениям?',
        options: [
            'Хочу минимум боли',
            'Терплю умеренную боль',
            'Готова терпеть ради результата'
        ]
    },
    {
        id: 'result',
        question: 'Какой результат вам важен?',
        options: [
            'Навсегда — хочу забыть об эпиляции',
            'Надолго — стойкое сокращение волос',
            'На 2–4 недели — регулярный уход'
        ]
    },
    {
        id: 'budget',
        question: 'Ваш бюджет на одну процедуру?',
        options: [
            'До 30 руб.',
            '30–60 руб.',
            'Более 60 руб.'
        ]
    }
];

const quizAnswers = {};

function initQuiz() {
    const container = document.getElementById('quizStep');
    if (!container) return;
    Object.keys(quizAnswers).forEach(k => delete quizAnswers[k]);
    getContent().then((content) => {
        const steps = content.quizSteps;
        if (Array.isArray(steps) && steps.length > 0) {
            QUIZ_STEPS = steps;
        }
        renderQuizStep(0);
    }).catch(() => {
        renderQuizStep(0);
    });
}

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
                    <button class="quiz-option" onclick="selectQuizOption('${step.id}', this, ${stepIndex})">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            ${stepIndex > 0 ? `<button class="btn btn-secondary quiz-back" onclick="renderQuizStep(${stepIndex - 1})">← Назад</button>` : ''}
        </div>`;
}

window.selectQuizOption = (stepId, btn, stepIndex) => {
    quizAnswers[stepId] = btn.textContent.trim();
    document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    setTimeout(() => {
        if (stepIndex + 1 < QUIZ_STEPS.length) {
            renderQuizStep(stepIndex + 1);
        } else {
            showQuizResults();
        }
    }, 300);
};

function getRecommendedMethod() {
    const { hair, pain, result, budget } = quizAnswers;

    // Светлые/седые/рыжие волосы — лазер не работает
    if (hair && hair.includes('Светлые')) {
        if (result && result.includes('Навсегда')) return 'Электроэпиляция';
        return 'Шугаринг';
    }

    // Тёмные волосы
    if (result && result.includes('Навсегда')) return 'Электроэпиляция';
    if (result && result.includes('Надолго')) return 'Лазер';

    // На 2–4 недели
    if (pain && pain.includes('минимум')) return 'Шугаринг';
    if (budget && budget.includes('До 30')) return 'Шугаринг';
    return 'Вакcинг';
}

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

    const method = getRecommendedMethod();

    const methodInfo = {
        'Лазер': {
            title: 'Лазерная эпиляция',
            key:   'Лазерная эпиляция',
            desc:  'Стойкое сокращение волос на 80–95% после курса. Идеально для тёмных волос. Быстро — зона подмышек всего 3 минуты.',
            icon:  '✨'
        },
        'Электроэпиляция': {
            title: 'Электроэпиляция',
            key:   'Электроэпиляция',
            desc:  'Единственный метод со 100% перманентным результатом. Работает на любом цвете волос, включая седые и пушковые.',
            icon:  '⚡'
        },
        'Шугаринг': {
            title: 'Шугаринг',
            key:   'Шугаринг',
            desc:  'Натуральная паста, минимум боли и раздражения. Подходит для чувствительной кожи. Гладкость на 2–4 недели.',
            icon:  '🍯'
        },
        'Вакcинг': {
            title: 'Вакcинг',
            key:   'Вакcинг',
            desc:  'Быстрое удаление воском для больших зон. Гладкость на 2–4 недели. Подходит для жёстких волос.',
            icon:  '🌿'
        }
    };

    const info = methodInfo[method];

    try {
        const res = await fetch(`${API_URL}/api/services?method=${encodeURIComponent(info.key)}`);
        const services = await res.json();

        container.innerHTML = `
            <div class="fade-in">
                <div class="quiz-result-header">
                    <div class="quiz-result-icon">${info.icon}</div>
                    <div>
                        <p class="quiz-step-label">Наша рекомендация</p>
                        <h2 style="margin:0; color:#ff8fa3;">${info.title}</h2>
                    </div>
                </div>
                <p style="color:#8a5a65; margin-bottom:30px;">${info.desc}</p>

                ${services.length > 0 ? `
                    <h3 style="margin-bottom:15px;">Доступные процедуры:</h3>
                    <div class="services-grid">${renderServices(services, [])}</div>
                ` : '<p style="color:#8a5a65;">Процедуры этого метода скоро появятся в каталоге.</p>'}

                <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:30px;">
                    <a href="/catalog/${encodeURIComponent(info.key)}" class="btn btn-primary">Перейти к методу →</a>
                    <button class="btn btn-secondary" onclick="initQuiz()">← Пройти заново</button>
                </div>
            </div>`;

    } catch (err) {
        container.innerHTML = `
            <div class="quiz-card fade-in" style="text-align:center;">
                <p class="error-text">Не удалось загрузить результаты. Проверьте соединение.</p>
                <button class="btn btn-primary" onclick="initQuiz()">Попробовать снова</button>
            </div>`;
    }
}

// Глобальное состояние авторизации
const AuthState = {
    token: localStorage.getItem('token'),
    get isLoggedIn() { return !!this.token; },
    setToken(token) {
        this.token = token;
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
        updateNav();
    },
    clear() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('isAdmin');
        updateNav();
    }
};

const MethodSortState = {};

function getMethodSortConfig(methodName) {
    const value = MethodSortState[methodName] || 'price-asc';
    if (value === 'price-desc') return { sortBy: 'price', order: 'desc', value };
    if (value === 'title-asc') return { sortBy: 'title', order: 'asc', value };
    if (value === 'date-desc') return { sortBy: 'createdAt', order: 'desc', value };
    return { sortBy: 'price', order: 'asc', value: 'price-asc' };
}

window.setMethodSort = (methodName, value) => {
    MethodSortState[methodName] = value;
    router();
};

// Загружает следующую порцию зон в прайс-таблицу
window.loadMoreZones = async (methodName, btn) => {
    const skip  = parseInt(btn.dataset.skip) || 0;
    const table = document.getElementById('priceTable');
    if (!table) return;

    btn.disabled = true;
    btn.textContent = 'Загрузка...';

    try {
        const { sortBy, order } = getMethodSortConfig(methodName);
        const res = await fetch(
            `${API_URL}/api/services?method=${encodeURIComponent(methodName)}&limit=5&skip=${skip}&sortBy=${sortBy}&order=${order}`
        );
        const { items, total } = await res.json();
        const favoriteIds = await fetchFavoriteIds();

        items.forEach(s => {
            const row = document.createElement('div');
            row.className = 'price-row price-row-with-like';
            const isFav = favoriteIds.includes(String(s._id));
            row.innerHTML = `
                <span class="price-zone">${s.title}</span>
                <div class="price-row-actions">
                    <span class="price-amount">${s.price} руб.</span>
                    <button class="btn-like ${isFav ? 'liked' : ''}" onclick="toggleFavorite('${s._id}', this)">${isFav ? '❤️' : '🤍'}</button>
                </div>`;
            table.appendChild(row);
        });

        const loaded = skip + items.length;
        if (loaded >= total) {
            btn.remove();
        } else {
            btn.dataset.skip = loaded;
            btn.disabled = false;
            btn.textContent = `Загрузить ещё (показано ${loaded} из ${total})`;
        }
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Ошибка. Попробовать снова';
    }
};

// Главный роутер
async function router() {
    const path = getRoutePath();
    const app = document.getElementById('app');
    const token = AuthState.token;

    if (['/profile', '/admin', '/favorites', '/quiz'].includes(path) && !token) {
        navigateTo('/auth');
        return;
    }
    if (path === '/admin' && !isAdminUser()) {
        navigateTo('/profile');
        return;
    }

    if (path.startsWith('/catalog/')) {
        const methodName = decodeURIComponent(path.split('/catalog/')[1]);
        try {
            const { sortBy, order, value: selectedSort } = getMethodSortConfig(methodName);
            const spinner = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
            app.innerHTML = `<div class="fade-in"><h1>${methodName}</h1>${spinner}</div>`;

            const [servicesRes, mastersRes, favoriteIds] = await Promise.all([
                fetch(`${API_URL}/api/services?method=${encodeURIComponent(methodName)}&limit=5&skip=0&sortBy=${sortBy}&order=${order}`),
                fetch(`${API_URL}/api/masters`),
                fetchFavoriteIds()
            ]);
            const { items: services, total } = await servicesRes.json();
            const masters  = await mastersRes.json();

            const methodMasters = masters.filter(m => {
                return (m.specialization || '').trim().toLowerCase() === methodName.trim().toLowerCase();
            });

            const priceHeading = methodName === 'Электроэпиляция' ? 'Тарифы' : 'Зоны и цены';

            const methodIcons = {
                'Лазерная эпиляция': '✨',
                'Электроэпиляция':   '⚡',
                'Шугаринг':          '🍯',
                'Вакcинг':           '🌿'
            };

            app.innerHTML = `
                <div class="fade-in">
                    <button class="btn btn-secondary" onclick="navigateTo('/catalog')" style="margin-bottom:20px;">← Назад к методам</button>
                    <h1>${methodIcons[methodName] || ''} ${methodName}</h1>

                    <h2 style="margin:30px 0 15px;">${priceHeading}</h2>
                    <p style="color:#8a5a65; font-size:14px; margin:-8px 0 12px;">Нажмите 🤍, чтобы добавить в избранное (нужен вход).</p>
                    <div class="filters-panel" style="margin-bottom:12px; max-width:600px;">
                        <div class="filter-group">
                            <label for="methodSort">Сортировка</label>
                            <select id="methodSort" onchange="setMethodSort('${methodName}', this.value)">
                                <option value="price-asc" ${selectedSort === 'price-asc' ? 'selected' : ''}>Цена: по возрастанию</option>
                                <option value="price-desc" ${selectedSort === 'price-desc' ? 'selected' : ''}>Цена: по убыванию</option>
                                <option value="title-asc" ${selectedSort === 'title-asc' ? 'selected' : ''}>Название: А-Я</option>
                                <option value="date-desc" ${selectedSort === 'date-desc' ? 'selected' : ''}>Сначала новые</option>
                            </select>
                        </div>
                    </div>
                    <div class="price-table" id="priceTable">
                        ${renderPriceRows(services, favoriteIds)}
                    </div>
                    ${total > 5 ? `
                        <button class="btn btn-secondary" id="loadMoreBtn"
                            onclick="loadMoreZones('${methodName}', this)"
                            data-skip="5"
                            style="margin-top:12px;">
                            Загрузить ещё (показано ${services.length} из ${total})
                        </button>
                    ` : ''}

                    ${methodMasters.length > 0 ? `
                        <h2 style="margin:40px 0 15px;">Наши специалисты</h2>
                        <div class="services-grid">
                            ${methodMasters.map(m => `
                                <div class="card">
                                    <img src="${m.photo || 'https://via.placeholder.com/150'}" style="width:100%; border-radius:10px; margin-bottom:10px;" alt="${m.name}">
                                    <h3>${m.name}</h3>
                                    <p><em>${m.specialization}</em></p>
                                    <p>Опыт: ${m.experience}</p>
                                    <button class="btn btn-primary" onclick="showModal('Запись', 'Вы выбрали специалиста: ${m.name}. Ожидайте звонка!')">Записаться</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>`;
            return;
        } catch (err) {
            app.innerHTML = `<div class="fade-in"><h1>Ошибка загрузки</h1><p class="error-text">Не удалось загрузить данные. Проверьте соединение.</p></div>`;
            return;
        }
    }

    const viewFunc = routes[path] || (() => '<div class="fade-in"><h1>404 — Страница не найдена</h1><p>Такой страницы не существует.</p><a href="/" class="btn btn-primary" style="margin-top:20px;">На главную</a></div>');
    app.innerHTML = await viewFunc();

    if (path === '/auth') {
        initLoginLogic();
        initRegLogic(); 
    }
    if (path === '/catalog') {
        loadCatalog();
    }
    if (path === '/quiz') {
        initQuiz();
    }
    if (path === '/admin') {
        initAdmin();
    }
    updateNav(); 
}

window.addEventListener('popstate', router);
window.addEventListener('load', () => {
    migrateHashRouteIfNeeded();
    const navToggle = document.getElementById('navToggle');
    if (navToggle) navToggle.addEventListener('click', toggleMobileMenu);
    document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', closeMobileMenu));
    router();
});