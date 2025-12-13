const Order = require('../models/Order');
const telegramBot = require('../services/telegramBot');
const logger = require('../middleware/logger');

class OrderController {
    async create(req, res, next) {
        try {
            const order = await Order.create(req.body);
            
            // Отправка уведомления в Telegram
            try {
                const telegramResult = await telegramBot.notifyNewOrder(order);
                if (telegramResult.success) {
                    logger.success(`✅ Уведомление в Telegram отправлено для заявки #${order.id}`);
                } else {
                    logger.warn(`⚠️ Не удалось отправить уведомление в Telegram для заявки #${order.id}:`, telegramResult.message);
                }
            } catch (telegramError) {
                // Логируем ошибку, но не прерываем создание заявки
                logger.error('⚠️ Ошибка отправки в Telegram:', telegramError);
            }
            
            logger.info(`📝 Создана новая заявка #${order.id}`, { name: order.name, phone: order.phone });
            
            res.status(201).json({
                success: true,
                message: 'Заявка успешно создана!',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const orders = await Order.findAll();
            
            res.json({
                success: true,
                count: orders.length,
                data: orders
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Заявка не найдена'
                });
            }
            
            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await Order.delete(id);
            
            res.json({
                success: true,
                message: 'Заявка успешно удалена'
            });
        } catch (error) {
            if (error.message === 'Заявка не найдена') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Некорректный статус'
                });
            }
            
            await Order.updateStatus(id, status);
            
            res.json({
                success: true,
                message: 'Статус заявки обновлен',
                data: { id, status }
            });
        } catch (error) {
            if (error.message === 'Заявка не найдена') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
}

module.exports = new OrderController();

