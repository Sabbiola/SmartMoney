// Configuration
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// State
let state = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accounts: [],
    transactions: [],
    categories: [],
    goals: [],
    budgets: []
};

// DOM Elements
const loginPage = document.getElementById('login-page');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menu-toggle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (state.token) {
        showApp();
        loadDashboard();
    } else {
        showLogin();
    }
    setupEventListeners();
});

// API Helper
async function api(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        logout();
        throw new Error('Sessione scaduta');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Errore del server');
    }

    return data;
}

// Auth Functions
async function login(email, password) {
    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showApp();
        loadDashboard();
        showToast('Accesso effettuato!', 'success');
    } catch (error) {
        loginError.textContent = error.message;
    }
}

async function register(name, email, password) {
    try {
        const data = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showApp();
        loadDashboard();
        showToast('Registrazione completata!', 'success');
    } catch (error) {
        loginError.textContent = error.message;
    }
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showLogin();
}

// UI Functions
function showLogin() {
    loginPage.classList.add('active');
    appContainer.classList.add('hidden');
}

function showApp() {
    loginPage.classList.remove('active');
    appContainer.classList.remove('hidden');
    document.getElementById('user-name').textContent = state.user?.name || '';
}

function showPage(pageName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    // Update pages
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.toggle('active', page.id === `${pageName}-page`);
    });

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        transactions: 'Transazioni',
        accounts: 'Conti',
        goals: 'Obiettivi di Risparmio',
        budgets: 'Budget'
    };
    document.getElementById('page-title').textContent = titles[pageName];

    // Load page data
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'accounts':
            loadAccounts();
            break;
        case 'goals':
            loadGoals();
            break;
        case 'budgets':
            loadBudgets();
            break;
    }

    // Close mobile sidebar
    sidebar.classList.remove('open');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Data Loading Functions
async function loadDashboard() {
    try {
        const [summary, transactions, accounts] = await Promise.all([
            api('/reports/summary'),
            api('/transactions?limit=5'),
            api('/accounts')
        ]);

        state.accounts = accounts;
        state.transactions = transactions;

        // Update summary cards
        document.getElementById('total-balance').textContent = formatCurrency(summary.totalBalance || 0);
        document.getElementById('monthly-income').textContent = formatCurrency(summary.monthlyIncome || 0);
        document.getElementById('monthly-expenses').textContent = formatCurrency(summary.monthlyExpenses || 0);
        document.getElementById('total-savings').textContent = formatCurrency(summary.totalSavings || 0);

        // Update recent transactions
        const txList = document.getElementById('recent-transactions');
        if (transactions.length === 0) {
            txList.innerHTML = '<li class="empty-state"><i class="fas fa-receipt"></i><p>Nessuna transazione</p></li>';
        } else {
            txList.innerHTML = transactions.slice(0, 5).map(tx => `
                <li class="transaction-item">
                    <div class="tx-icon" style="background: ${tx.category?.color || '#666'}20; color: ${tx.category?.color || '#666'}">
                        <i class="fas fa-${getIcon(tx.category?.icon)}"></i>
                    </div>
                    <div class="tx-info">
                        <h4>${tx.description}</h4>
                        <span>${formatDate(tx.date)}</span>
                    </div>
                    <span class="tx-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}</span>
                </li>
            `).join('');
        }

        // Update accounts list
        const accList = document.getElementById('accounts-list');
        if (accounts.length === 0) {
            accList.innerHTML = '<li class="empty-state"><i class="fas fa-university"></i><p>Nessun conto</p></li>';
        } else {
            accList.innerHTML = accounts.map(acc => `
                <li class="account-item">
                    <div class="acc-icon" style="background: ${acc.color}">
                        <i class="fas fa-${getAccountIcon(acc.type)}"></i>
                    </div>
                    <div class="acc-info">
                        <h4>${acc.name}</h4>
                        <span>${acc.type}</span>
                    </div>
                    <span class="acc-balance">${formatCurrency(acc.balance)}</span>
                </li>
            `).join('');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadTransactions() {
    try {
        const [transactions, categories, accounts] = await Promise.all([
            api('/transactions'),
            api('/categories').catch(() => []),
            state.accounts.length ? Promise.resolve(state.accounts) : api('/accounts')
        ]);

        state.transactions = transactions;
        state.categories = categories;
        state.accounts = accounts;

        // Populate filter
        const filterMonth = document.getElementById('filter-month');
        if (!filterMonth.value) {
            filterMonth.value = new Date().toISOString().slice(0, 7);
        }

        // Populate form selects
        populateAccountSelect('tx-account');
        populateCategorySelect('tx-category');

        // Render transactions
        renderTransactions(transactions);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderTransactions(transactions) {
    const list = document.getElementById('all-transactions');
    if (transactions.length === 0) {
        list.innerHTML = '<li class="empty-state"><i class="fas fa-receipt"></i><p>Nessuna transazione trovata</p></li>';
        return;
    }

    list.innerHTML = transactions.map(tx => `
        <li class="transaction-item">
            <div class="tx-icon" style="background: ${tx.category?.color || '#666'}20; color: ${tx.category?.color || '#666'}">
                <i class="fas fa-${getIcon(tx.category?.icon)}"></i>
            </div>
            <div class="tx-info">
                <h4>${tx.description}</h4>
                <span>${formatDate(tx.date)} - ${tx.category?.name || 'Senza categoria'}</span>
            </div>
            <span class="tx-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}</span>
        </li>
    `).join('');
}

async function loadAccounts() {
    try {
        const accounts = await api('/accounts');
        state.accounts = accounts;

        const grid = document.getElementById('accounts-grid');
        if (accounts.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-university"></i><p>Nessun conto. Creane uno!</p></div>';
            return;
        }

        grid.innerHTML = accounts.map(acc => `
            <div class="account-card">
                <div class="account-card-header">
                    <div class="account-card-icon" style="background: ${acc.color}">
                        <i class="fas fa-${getAccountIcon(acc.type)}"></i>
                    </div>
                    <div>
                        <h3>${acc.name}</h3>
                        <span class="type">${getAccountTypeName(acc.type)}</span>
                    </div>
                </div>
                <p class="balance">${formatCurrency(acc.balance)}</p>
            </div>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadGoals() {
    try {
        const goals = await api('/goals');
        state.goals = goals;

        const grid = document.getElementById('goals-grid');
        if (goals.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-bullseye"></i><p>Nessun obiettivo. Creane uno!</p></div>';
            return;
        }

        grid.innerHTML = goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return `
                <div class="goal-card">
                    <div class="goal-card-header">
                        <div>
                            <h3>${goal.name}</h3>
                            <span class="target-date">Obiettivo: ${formatDate(goal.targetDate)}</span>
                        </div>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(progress, 100)}%; background: ${goal.color}"></div>
                        </div>
                        <div class="progress-text">
                            <span class="current">${formatCurrency(goal.currentAmount)}</span>
                            <span class="target">${formatCurrency(goal.targetAmount)}</span>
                        </div>
                    </div>
                    <div class="goal-card-actions">
                        <button class="btn btn-primary btn-sm" onclick="openContributeModal('${goal.id}')">
                            <i class="fas fa-plus"></i> Aggiungi
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadBudgets() {
    try {
        const [budgets, categories] = await Promise.all([
            api('/budgets/current').catch(() => []),
            state.categories.length ? Promise.resolve(state.categories) : api('/categories').catch(() => [])
        ]);

        state.budgets = budgets;
        state.categories = categories;

        populateCategorySelect('budget-category', 'expense');

        const grid = document.getElementById('budgets-grid');
        if (budgets.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><p>Nessun budget attivo. Creane uno!</p></div>';
            return;
        }

        grid.innerHTML = budgets.map(budget => {
            const progress = (budget.spent / budget.amount) * 100;
            const isOverBudget = budget.spent > budget.amount;
            return `
                <div class="budget-card">
                    <h3>${budget.category?.name || 'Budget Generale'}</h3>
                    <div class="budget-info">
                        <span class="budget-spent" style="color: ${isOverBudget ? 'var(--danger)' : 'var(--text-primary)'}">
                            ${formatCurrency(budget.spent)} spesi
                        </span>
                        <span class="budget-limit">di ${formatCurrency(budget.amount)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%; background: ${isOverBudget ? 'var(--danger)' : 'var(--secondary)'}"></div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Helper Functions
function getIcon(icon) {
    const iconMap = {
        'restaurant': 'utensils',
        'car': 'car',
        'home': 'home',
        'shopping-bag': 'shopping-bag',
        'film': 'film',
        'heart': 'heart',
        'dumbbell': 'dumbbell',
        'plane': 'plane',
        'book': 'book',
        'credit-card': 'credit-card',
        'gift': 'gift',
        'more-horizontal': 'ellipsis-h',
        'briefcase': 'briefcase',
        'laptop': 'laptop',
        'trending-up': 'chart-line',
        'refresh-cw': 'sync'
    };
    return iconMap[icon] || 'circle';
}

function getAccountIcon(type) {
    const icons = {
        'bank': 'university',
        'cash': 'money-bill',
        'card': 'credit-card',
        'investment': 'chart-line'
    };
    return icons[type] || 'wallet';
}

function getAccountTypeName(type) {
    const names = {
        'bank': 'Conto Bancario',
        'cash': 'Contanti',
        'card': 'Carta',
        'investment': 'Investimento'
    };
    return names[type] || type;
}

function populateAccountSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = state.accounts.map(acc =>
        `<option value="${acc.id}">${acc.name}</option>`
    ).join('');
}

function populateCategorySelect(selectId, type = null) {
    const select = document.getElementById(selectId);
    const categories = type
        ? state.categories.filter(c => c.type === type)
        : state.categories;

    select.innerHTML = categories.map(cat =>
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
}

function openContributeModal(goalId) {
    document.getElementById('contribute-goal-id').value = goalId;
    document.getElementById('contribute-amount').value = '';
    document.getElementById('contribute-notes').value = '';
    showModal('contribute-modal');
}

// Event Listeners
function setupEventListeners() {
    // Auth forms
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login(
            document.getElementById('login-email').value,
            document.getElementById('login-password').value
        );
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        register(
            document.getElementById('register-name').value,
            document.getElementById('register-email').value,
            document.getElementById('register-password').value
        );
    });

    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginError.textContent = '';
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        loginError.textContent = '';
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => showPage(item.dataset.page));
    });

    document.querySelectorAll('[data-page]').forEach(link => {
        if (link.tagName === 'A') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(link.dataset.page);
            });
        }
    });

    // Mobile menu
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });

    // Add buttons
    document.getElementById('add-transaction-btn').addEventListener('click', () => {
        document.getElementById('transaction-form').reset();
        document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
        updateCategoryOptions();
        showModal('transaction-modal');
    });

    document.getElementById('add-account-btn').addEventListener('click', () => {
        document.getElementById('account-form').reset();
        showModal('account-modal');
    });

    document.getElementById('add-goal-btn').addEventListener('click', () => {
        document.getElementById('goal-form').reset();
        showModal('goal-modal');
    });

    document.getElementById('add-budget-btn').addEventListener('click', () => {
        document.getElementById('budget-form').reset();
        showModal('budget-modal');
    });

    // Transaction type change
    document.getElementById('tx-type').addEventListener('change', updateCategoryOptions);

    // Forms
    document.getElementById('transaction-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/transactions', {
                method: 'POST',
                body: JSON.stringify({
                    type: document.getElementById('tx-type').value,
                    amount: parseFloat(document.getElementById('tx-amount').value),
                    description: document.getElementById('tx-description').value,
                    accountId: document.getElementById('tx-account').value,
                    categoryId: document.getElementById('tx-category').value,
                    date: document.getElementById('tx-date').value,
                    currency: 'EUR',
                    isRecurring: false
                })
            });
            hideModal('transaction-modal');
            showToast('Transazione aggiunta!', 'success');
            loadTransactions();
            loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('account-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/accounts', {
                method: 'POST',
                body: JSON.stringify({
                    name: document.getElementById('acc-name').value,
                    type: document.getElementById('acc-type').value,
                    balance: parseFloat(document.getElementById('acc-balance').value) || 0,
                    color: document.getElementById('acc-color').value,
                    currency: 'EUR',
                    icon: 'wallet',
                    isActive: true
                })
            });
            hideModal('account-modal');
            showToast('Conto creato!', 'success');
            loadAccounts();
            loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('goal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/goals', {
                method: 'POST',
                body: JSON.stringify({
                    name: document.getElementById('goal-name').value,
                    targetAmount: parseFloat(document.getElementById('goal-target').value),
                    targetDate: document.getElementById('goal-date').value,
                    color: document.getElementById('goal-color').value,
                    priority: 1
                })
            });
            hideModal('goal-modal');
            showToast('Obiettivo creato!', 'success');
            loadGoals();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('contribute-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const goalId = document.getElementById('contribute-goal-id').value;
            await api(`/goals/${goalId}/contribute`, {
                method: 'POST',
                body: JSON.stringify({
                    amount: parseFloat(document.getElementById('contribute-amount').value),
                    notes: document.getElementById('contribute-notes').value
                })
            });
            hideModal('contribute-modal');
            showToast('Contributo aggiunto!', 'success');
            loadGoals();
            loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('budget-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const now = new Date();
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            await api('/budgets', {
                method: 'POST',
                body: JSON.stringify({
                    categoryId: document.getElementById('budget-category').value,
                    amount: parseFloat(document.getElementById('budget-amount').value),
                    period: document.getElementById('budget-period').value,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                })
            });
            hideModal('budget-modal');
            showToast('Budget creato!', 'success');
            loadBudgets();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Filters
    document.getElementById('filter-type').addEventListener('change', filterTransactions);
    document.getElementById('filter-month').addEventListener('change', filterTransactions);
}

function updateCategoryOptions() {
    const type = document.getElementById('tx-type').value;
    populateCategorySelect('tx-category', type);
}

async function filterTransactions() {
    const type = document.getElementById('filter-type').value;
    const month = document.getElementById('filter-month').value;

    let filtered = state.transactions;

    if (type) {
        filtered = filtered.filter(tx => tx.type === type);
    }

    if (month) {
        filtered = filtered.filter(tx => tx.date.startsWith(month));
    }

    renderTransactions(filtered);
}

// Make openContributeModal available globally
window.openContributeModal = openContributeModal;
