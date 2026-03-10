// API для работы с сервером
const API = {
    // ВРЕМЕННО отключаем запросы к серверу
    // baseUrl: 'https://your-api.onrender.com/api',
    
    // Используем локальное хранилище, пока нет сервера
    useLocalOnly: true,
    
    // ========== ПОЛЬЗОВАТЕЛИ ==========
    
    async getUser(telegramId) {
        // Пока нет сервера, берем из localStorage
        const user = await DB.getUser();
        return user;
    },
    
    async createUser(userData) {
        // Просто сохраняем локально
        await DB.saveUser(userData);
        return {status: 'ok', short_id: userData.short_id};
    },
    
    async updateUser(userId, userData) {
        try {
            // Сохраняем локально
            const user = await DB.getUser();
            Object.assign(user, userData);
            await DB.saveUser(user);
            
            // Пытаемся отправить на сервер, но не ждем
            if (!this.useLocalOnly) {
                fetch(`${this.baseUrl}/user/${userId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(userData)
                }).catch(e => console.log('Сервер недоступен, данные сохранены локально'));
            }
            
            return {status: 'ok'};
        } catch (error) {
            console.error('Ошибка обновления пользователя:', error);
            // Даже при ошибке считаем, что сохранили локально
            return {status: 'ok', local: true};
        }
    },
    
    // ========== ЗАКАЗЫ ==========
    
    async getOrders(telegramId) {
        // Берем из локального хранилища
        return await DB.getOrders(telegramId) || [];
    },
    
    async createOrder(orderData) {
        try {
            // Сохраняем локально
            const orders = await DB.getOrders(orderData.user_id) || [];
            orders.push(orderData);
            await DB.saveOrders(orders);
            
            return {status: 'ok', order_number: orderData.number || 'OFFLINE'};
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            return {status: 'error'};
        }
    },
    
    async updateOrder(orderNumber, orderData) {
        return {status: 'ok'};
    },
    
    // ========== ОТЗЫВЫ ==========
    
    async getReviews() {
        return [];
    },
    
    async createReview(reviewData) {
        return {status: 'ok'};
    },
    
    // ========== ВРЕМЯ ==========
    
    async getAvailableTimes() {
        // Генерируем тестовые данные
        const times = [];
        const now = new Date();
        
        for (let i = 0; i < 6; i++) {
            const time = new Date(now);
            time.setHours(20 + Math.floor(i/2));
            time.setMinutes((i%2) * 30);
            if (time > now) {
                times.push({
                    time: time.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}),
                    timestamp: Math.floor(time.getTime() / 1000),
                    available: true
                });
            }
        }
        
        return {
            today: times.slice(0, 4),
            tomorrow: times.map(t => ({...t, time: t.time}))
        };
    },
    
    async checkTime(timestamp) {
        return {available: true};
    }
};
