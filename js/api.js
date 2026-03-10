// API для работы с сервером
const API = {
    // Замени на свой URL, когда будет готов
    baseUrl: 'https://your-api.onrender.com/api',
    
    // ========== ПОЛЬЗОВАТЕЛИ ==========
    
    async getUser(telegramId) {
        try {
            const response = await fetch(`${this.baseUrl}/user/${telegramId}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
            return null;
        }
    },
    
    async createUser(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка создания пользователя:', error);
            throw error;
        }
    },
    
    async updateUser(userId, userData) {
        try {
            const response = await fetch(`${this.baseUrl}/user/${userId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления пользователя:', error);
            throw error;
        }
    },
    
    // ========== ЗАКАЗЫ ==========
    
    async getOrders(telegramId) {
        try {
            const response = await fetch(`${this.baseUrl}/orders/${telegramId}`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Ошибка получения заказов:', error);
            return [];
        }
    },
    
    async createOrder(orderData) {
        try {
            const response = await fetch(`${this.baseUrl}/order`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(orderData)
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            throw error;
        }
    },
    
    async updateOrder(orderNumber, orderData) {
        try {
            const response = await fetch(`${this.baseUrl}/order/${orderNumber}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(orderData)
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления заказа:', error);
            throw error;
        }
    },
    
    // ========== ОТЗЫВЫ ==========
    
    async getReviews() {
        try {
            const response = await fetch(`${this.baseUrl}/reviews`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Ошибка получения отзывов:', error);
            return [];
        }
    },
    
    async createReview(reviewData) {
        try {
            const response = await fetch(`${this.baseUrl}/review`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(reviewData)
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка создания отзыва:', error);
            throw error;
        }
    },
    
    // ========== ВРЕМЯ ==========
    
    async getAvailableTimes() {
        try {
            const response = await fetch(`${this.baseUrl}/times`);
            return await response.json();
        } catch (error) {
            console.error('Ошибка получения времени:', error);
            return {today: [], tomorrow: []};
        }
    },
    
    async checkTime(timestamp) {
        try {
            const response = await fetch(`${this.baseUrl}/check-time`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({timestamp})
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка проверки времени:', error);
            return {available: false};
        }
    }
};
