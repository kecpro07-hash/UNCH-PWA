// ================== НАСТРОЙКА ПОДКЛЮЧЕНИЯ К NEON ==================
import { neon, neonConfig } from 'https://esm.sh/@neondatabase/serverless';

// Настройка WebSocket для работы в браузере
neonConfig.wsProxy = (host, port) => `wss://${host}/v1?address=${host}:${port}`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

// ВАЖНО: Замени на свою строку подключения из Neon!
// Получить можно здесь: https://console.neon.tech → Project → Connection Details
const DATABASE_URL = 'napi_0y0w9ek4xojlrnm6io1eohv2811kgyz81h2l599e5ffpajqaahcmboqluqgd067g';

// Создаем экземпляр для запросов
const sql = neon(DATABASE_URL);

// Проверка подключения (будет в консоли браузера)
(async () => {
    try {
        const result = await sql`SELECT NOW()`;
        console.log('✅ Подключение к Neon успешно!', result[0]);
    } catch (error) {
        console.error('❌ Ошибка подключения к Neon:', error);
    }
})();

export default sql;
