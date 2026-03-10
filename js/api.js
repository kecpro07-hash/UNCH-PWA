// API для работы с Neon
const API = {
    baseUrl: 'https://your-api.onrender.com/api', // Замени на свой URL
    
    // ========== ПОЛЬЗОВАТЕЛИ ==========
    async getUser(telegramId) {
        try {
            const response = await fetch(`${this.baseUrl}/user/${telegramId}`);
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
            return null;
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
            return null;
        }
    },
    
    // ========== ЗАКАЗЫ ==========
    async getOrders(telegramId) {
        try {
            const response = await fetch(`${this.baseUrl}/orders/${telegramId}`);
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
            return null;
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
            return null;
        }
    },
    
    // ========== ОТЗЫВЫ ==========
    async getReviews() {
        try {
            const response = await fetch(`${this.baseUrl}/reviews`);
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
            return null;
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
    }
};