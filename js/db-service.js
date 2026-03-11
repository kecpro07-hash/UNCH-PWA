import sql from './neon-config.js';

// ================== СЕРВИС ДЛЯ РАБОТЫ С БАЗОЙ ДАННЫХ ==================
const DBService = {
    // ========== ПОЛЬЗОВАТЕЛИ ==========
    
    async getUserByPhone(phone) {
        try {
            // Очищаем телефон от лишних символов
            const cleanPhone = phone.replace(/\D/g, '');
            
            const result = await sql`
                SELECT * FROM users 
                WHERE phone LIKE ${'%' + cleanPhone + '%'}
                LIMIT 1
            `;
            return result[0] || null;
        } catch (error) {
            console.error('❌ Ошибка поиска по телефону:', error);
            return null;
        }
    },

    async getUserByShortId(shortId) {
        try {
            const result = await sql`
                SELECT * FROM users 
                WHERE short_id = ${shortId.toUpperCase()}
                LIMIT 1
            `;
            return result[0] || null;
        } catch (error) {
            console.error('❌ Ошибка поиска по ID:', error);
            return null;
        }
    },

    async getUserByTelegramId(telegramId) {
        try {
            const result = await sql`
                SELECT * FROM users 
                WHERE user_id = ${String(telegramId)}
                LIMIT 1
            `;
            return result[0] || null;
        } catch (error) {
            console.error('❌ Ошибка поиска по Telegram ID:', error);
            return null;
        }
    },

    async getAllUsers() {
        try {
            const result = await sql`
                SELECT user_id, name, phone, address, short_id, created_at 
                FROM users 
                ORDER BY created_at DESC
            `;
            return result;
        } catch (error) {
            console.error('❌ Ошибка получения пользователей:', error);
            return [];
        }
    },

    // ========== ЗАКАЗЫ ==========

    async getUserOrders(telegramId) {
        try {
            const result = await sql`
                SELECT * FROM orders 
                WHERE user_id = ${String(telegramId)}
                ORDER BY created_at DESC
                LIMIT 50
            `;
            return result;
        } catch (error) {
            console.error('❌ Ошибка загрузки заказов:', error);
            return [];
        }
    },

    async getOrderByNumber(orderNumber) {
        try {
            const result = await sql`
                SELECT * FROM orders 
                WHERE number = ${orderNumber}
                LIMIT 1
            `;
            return result[0] || null;
        } catch (error) {
            console.error('❌ Ошибка получения заказа:', error);
            return null;
        }
    },

    async createOrder(orderData) {
        try {
            const result = await sql`
                INSERT INTO orders (
                    number, user_id, name, phone, address, username,
                    short_id, exact_time, bags, amount, status, payment, created_at
                ) VALUES (
                    ${orderData.number}, ${orderData.user_id}, ${orderData.name},
                    ${orderData.phone}, ${orderData.address}, ${orderData.username},
                    ${orderData.short_id}, ${orderData.exact_time}, ${orderData.bags},
                    ${orderData.amount}, 'новый', 'ожидает', NOW()
                ) RETURNING number
            `;
            return result[0];
        } catch (error) {
            console.error('❌ Ошибка создания заказа:', error);
            throw error;
        }
    },

    async updateOrderStatus(orderNumber, status, payment) {
        try {
            await sql`
                UPDATE orders 
                SET status = ${status}, payment = ${payment}
                WHERE number = ${orderNumber}
            `;
            return true;
        } catch (error) {
            console.error('❌ Ошибка обновления заказа:', error);
            return false;
        }
    },

    // ========== ОТЗЫВЫ ==========

    async getUserReviews(shortId) {
        try {
            const result = await sql`
                SELECT * FROM reviews 
                WHERE short_id = ${shortId}
                ORDER BY timestamp DESC
            `;
            return result;
        } catch (error) {
            console.error('❌ Ошибка загрузки отзывов:', error);
            return [];
        }
    },

    async getAllReviews() {
        try {
            const result = await sql`
                SELECT * FROM reviews 
                ORDER BY timestamp DESC 
                LIMIT 100
            `;
            return result;
        } catch (error) {
            console.error('❌ Ошибка загрузки отзывов:', error);
            return [];
        }
    },

    async createReview(reviewData) {
        try {
            await sql`
                INSERT INTO reviews (
                    user_id, short_id, order_number, rating, text, date, timestamp
                ) VALUES (
                    ${reviewData.user_id}, ${reviewData.short_id}, 
                    ${reviewData.order_number || 'GENERAL'}, ${reviewData.rating},
                    ${reviewData.text || ''}, ${reviewData.date}, ${reviewData.timestamp}
                )
            `;
            return true;
        } catch (error) {
            console.error('❌ Ошибка создания отзыва:', error);
            return false;
        }
    },

    // ========== КОДЫ ДЛЯ ВХОДА ==========

    async saveLoginCode(shortId, code, expiresAt) {
        try {
            await sql`
                INSERT INTO login_codes (short_id, code, expires_at)
                VALUES (${shortId}, ${code}, ${expiresAt})
                ON CONFLICT (short_id) DO UPDATE
                SET code = ${code}, expires_at = ${expiresAt}
            `;
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения кода:', error);
            return false;
        }
    },

    async verifyLoginCode(shortId, code) {
        try {
            const result = await sql`
                SELECT * FROM login_codes 
                WHERE short_id = ${shortId} 
                AND code = ${code}
                AND expires_at > NOW()
                LIMIT 1
            `;
            return result[0] || null;
        } catch (error) {
            console.error('❌ Ошибка проверки кода:', error);
            return null;
        }
    },

    async deleteLoginCode(shortId) {
        try {
            await sql`DELETE FROM login_codes WHERE short_id = ${shortId}`;
            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления кода:', error);
            return false;
        }
    },

    // ========== СТАТИСТИКА ==========

    async getStats() {
        try {
            const users = await sql`SELECT COUNT(*) FROM users`;
            const orders = await sql`SELECT COUNT(*) FROM orders`;
            const completed = await sql`SELECT COUNT(*) FROM orders WHERE status = 'выполнен'`;
            const reviews = await sql`SELECT COUNT(*) FROM reviews`;
            
            return {
                users: parseInt(users[0].count),
                orders: parseInt(orders[0].count),
                completed: parseInt(completed[0].count),
                reviews: parseInt(reviews[0].count)
            };
        } catch (error) {
            console.error('❌ Ошибка статистики:', error);
            return null;
        }
    },

    // ========== ПРОВЕРКА ПОДКЛЮЧЕНИЯ ==========

    async testConnection() {
        try {
            const result = await sql`SELECT NOW() as time`;
            return { success: true, time: result[0].time };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

export default DBService;
