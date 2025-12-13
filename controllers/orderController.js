const Order = require('../models/Order');
const telegramService = require('../services/telegramService');

class OrderController {
    async create(req, res, next) {
        try {
            const order = await Order.create(req.body);
            
            // Отправка уведомления в Telegram
            try {
                await telegramService.notifyNewOrder(order);
            } catch (telegramError) {
                // Логируем ошибку, но не прерываем создание заявки
                console.error('⚠️ Ошибка отправки в Telegram:', telegramError);
            }
            
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

