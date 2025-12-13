const express = require('express');
const router = express.Router();
const telegramBot = require('../services/telegramBot');
const Order = require('../models/Order');
const logger = require('../middleware/logger');

// Webhook для получения обновлений от Telegram
router.post('/webhook', async (req, res) => {
    try {
        const update = req.body;

        // Обработка сообщений
        if (update.message) {
            const { text, chat } = update.message;
            const chatId = chat.id;

            // Проверка, что сообщение от админа
            if (chatId.toString() !== telegramBot.chatId) {
                return res.json({ ok: true });
            }

            // Обработка команд
            if (text) {
                if (text.startsWith('/start') || text.startsWith('/help')) {
                    await telegramBot.sendMessage(chatId, 
                        `🎅 <b>БОТ ДЕДА МОРОЗА</b>\n\n` +
                        `Доступные команды:\n\n` +
                        `/start - Начать работу\n` +
                        `/stats - Статистика заявок\n` +
                        `/list - Список всех заявок\n` +
                        `/pending - Заявки в ожидании\n` +
                        `/confirmed - Подтвержденные заявки\n` +
                        `/help - Показать помощь\n\n` +
                        `Используйте кнопки для быстрого доступа к функциям!`,
                        { replyMarkup: telegramBot.createMainKeyboard() }
                    );
                } else if (text.startsWith('/stats')) {
                    await telegramBot.sendStats();
                } else if (text.startsWith('/list')) {
                    await telegramBot.sendOrdersList();
                } else if (text.startsWith('/pending')) {
                    await telegramBot.sendOrdersList('pending');
                } else if (text.startsWith('/confirmed')) {
                    await telegramBot.sendOrdersList('confirmed');
                } else if (text.startsWith('/order_')) {
                    const orderId = parseInt(text.split('_')[1]);
                    const order = await Order.findById(orderId);
                    if (order) {
                        await telegramBot.sendMessage(chatId, 
                            telegramBot.formatOrderMessage(order),
                            { replyMarkup: telegramBot.createOrderKeyboard(orderId) }
                        );
                    } else {
                        await telegramBot.sendMessage(chatId, `❌ Заявка #${orderId} не найдена`);
                    }
                }
            }
        }

        // Обработка callback query (нажатия на кнопки)
        if (update.callback_query) {
            // Отвечаем на callback query сразу
            res.json({
                ok: true
            });
            
            // Обрабатываем callback асинхронно
            telegramBot.handleCallbackQuery(update.callback_query).catch(err => {
                logger.error('Ошибка обработки callback:', err);
            });
            
            return;
        }

        res.json({ ok: true });
    } catch (error) {
        logger.error('Ошибка обработки webhook:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Установка webhook
router.post('/set-webhook', async (req, res) => {
    try {
        const webhookUrl = req.body.url || req.query.url;
        
        if (!webhookUrl) {
            return res.status(400).json({
                success: false,
                message: 'URL webhook не указан'
            });
        }

        const result = await telegramBot.setWebhook(webhookUrl);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

