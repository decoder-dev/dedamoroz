const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
    logger.error('❌ Ошибка:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method
    });

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Внутренняя ошибка сервера' 
        : err.message;

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};

