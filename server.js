const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const db = require('./config/database');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы с правильными заголовками для ES6 модулей
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            // CORS заголовки для модулей
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
    }
}));

// Логирование запросов
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
        
        if (res.statusCode >= 500) {
            logger.error(logMessage);
        } else if (res.statusCode >= 400) {
            logger.warn(logMessage);
        } else {
            logger.info(logMessage);
        }
    });
    
    next();
});

// API Routes
app.use('/api/orders', orderRoutes);
app.use('/api/telegram', require('./routes/telegramRoutes'));

// HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});



// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler (должен быть последним)
app.use(errorHandler);

// Инициализация сервера
async function startServer() {
    try {
        // Подключение к базе данных
        await db.connect();
        
        // Запуск сервера
        app.listen(config.port, () => {
            logger.success('\n🚀 ========================================');
            logger.success(`✅ Сервер запущен на http://localhost:${config.port}`);
            logger.info(`📁 Статические файлы: ${path.join(__dirname, 'public')}`);
            logger.info(`📄 HTML файлы: ${path.join(__dirname, 'views')}`);
            logger.info(`🌍 Окружение: ${config.nodeEnv}`);
            logger.info(`📱 Telegram: ${config.telegram.enabled ? '✅ Включен' : '❌ Отключен'}`);
            logger.success('========================================\n');
        });
    } catch (error) {
        logger.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('\n⏳ Завершение работы сервера...');
    try {
        await db.close();
        logger.success('✅ Сервер успешно остановлен');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Ошибка при остановке сервера:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    logger.info('\n⏳ Завершение работы сервера...');
    try {
        await db.close();
        logger.success('✅ Сервер успешно остановлен');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Ошибка при остановке сервера:', error);
        process.exit(1);
    }
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Запуск
startServer();
