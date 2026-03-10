// Главный файл приложения
let currentUser = null;
let tg = null;

// Инициализация Telegram WebApp
try {
    tg = window.Telegram?.WebApp;
    if (tg) {
        tg.expand();
        tg.ready();
        tg.setHeaderColor('#FF8C00');
        tg.setBackgroundColor('#f8f9fa');
    }
} catch (e) {
    console.log('Не в Telegram WebApp');
}

// Загрузка при старте
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    await loadDashboardData();
    checkInstallPrompt();
    updateUI();
});

// Загрузка пользователя
async function loadUserData() {
    let user = await DB.getUser();
    
    if (!user && tg?.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        user = {
            id: 'current',
            user_id: tgUser.id,
            name: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
            username: tgUser.username,
            phone: '',
            address: '',
            short_id: generateShortId()
        };
        
        // Сохраняем в БД
        await DB.saveUser(user);
        
        // Отправляем на сервер
        try {
            await API.createUser({
                user_id: user.user_id,
                name: user.name,
                username: user.username,
                short_id: user.short_id
            });
        } catch (e) {
            // Если нет интернета, добавляем в синхронизацию
            await DB.addToSync({
                type: 'create_user',
                data: user
            });
        }
    }
    
    currentUser = user;
}

function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Загрузка данных на главную
async function loadDashboardData() {
    if (!currentUser) return;
    
    try {
        // Загружаем заказы
        const orders = await API.getOrders(currentUser.user_id);
        await DB.saveOrders(orders);
        
        const activeOrders = orders.filter(o => o.status === 'новый').length;
        document.getElementById('ordersCount').textContent = orders.length;
        document.getElementById('activeOrdersBadge').textContent = activeOrders || '';
        
        // Загружаем отзывы
        const reviews = await API.getReviews();
        document.getElementById('reviewsCount').textContent = reviews.length;
        
        // Считаем средний рейтинг
        if (reviews.length > 0) {
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            document.getElementById('averageRating').textContent = avg.toFixed(1);
        }
        
    } catch (e) {
        // Если нет интернета, грузим из кэша
        const cachedOrders = await DB.getOrders(currentUser.user_id);
        document.getElementById('ordersCount').textContent = cachedOrders.length;
        document.getElementById('activeOrdersBadge').textContent = 
            cachedOrders.filter(o => o.status === 'новый').length;
    }
}

function updateUI() {
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.name || 'Пользователь';
        document.getElementById('profilePhone').textContent = currentUser.phone || 'Телефон не указан';
        
        // Аватар
        const avatar = document.getElementById('profileAvatar');
        if (currentUser.name) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            avatar.textContent = initials || '👤';
        }
    }
}

function goToProfile() {
    window.location.href = 'profile.html';
}

// PWA установка
let deferredPrompt;

function checkInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        setTimeout(() => {
            document.getElementById('installBanner').style.display = 'flex';
        }, 2000);
    });
}

function installPWA() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        document.getElementById('installBanner').style.display = 'none';
    });
}

// Для iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
if (isIOS && !window.navigator.standalone) {
    setTimeout(() => {
        alert('📱 Добавьте на рабочий стол: нажмите "Поделиться" → "На экран домой"');
    }, 3000);
}

// Синхронизация офлайн-данных
async function syncOfflineData() {
    if (!navigator.onLine) return;
    
    const unsynced = await DB.getUnsynced();
    for (const item of unsynced) {
        try {
            if (item.data.type === 'create_order') {
                await API.createOrder(item.data.data);
            } else if (item.data.type === 'create_review') {
                await API.createReview(item.data.data);
            } else if (item.data.type === 'update_user') {
                await API.updateUser(item.data.user_id, item.data.data);
            }
            
            await DB.markSynced(item.id);
        } catch (e) {
            console.error('Ошибка синхронизации:', e);
        }
    }
}

// Синхронизируем при подключении интернета
window.addEventListener('online', syncOfflineData);