require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    dbPath: process.env.DB_PATH || 'orders.db',
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 минут
        max: 100 // лимит запросов
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || '',
        enabled: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
    }
};

