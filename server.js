const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const db = require('./config/database');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

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
    if (config.nodeEnv === 'development') {
        console.log(`${req.method} ${req.path}`);
    }
    next();
});

// API Routes
app.use('/api/orders', orderRoutes);

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
            console.log('\n🚀 ========================================');
            console.log(`✅ Сервер запущен на http://localhost:${config.port}`);
            console.log(`📁 Статические файлы: ${path.join(__dirname, 'public')}`);
            console.log(`📄 HTML файлы: ${path.join(__dirname, 'views')}`);
            console.log(`🌍 Окружение: ${config.nodeEnv}`);
            console.log('========================================\n');
        });
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏳ Завершение работы сервера...');
    try {
        await db.close();
        console.log('✅ Сервер успешно остановлен');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при остановке сервера:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n⏳ Завершение работы сервера...');
    try {
        await db.close();
        console.log('✅ Сервер успешно остановлен');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при остановке сервера:', error);
        process.exit(1);
    }
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Запуск
startServer();
