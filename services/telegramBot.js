const https = require('https');
const config = require('../config/config');
const Order = require('../models/Order');
const logger = require('../middleware/logger');

class TelegramBot {
    constructor() {
        this.botToken = config.telegram.botToken;
        this.chatId = config.telegram.chatId;
        this.enabled = config.telegram.enabled;
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.webhookUrl = null;
    }

    async sendMessage(chatId, text, options = {}) {
        if (!this.enabled) {
            logger.info('📱 Telegram отключен. Сообщение:', text);
            return { success: false, message: 'Telegram не настроен' };
        }

        return new Promise((resolve) => {
            const messageData = {
                chat_id: chatId || this.chatId,
                text: text,
                parse_mode: options.parseMode || 'HTML',
                ...options
            };

            if (options.replyMarkup) {
                messageData.reply_markup = JSON.stringify(options.replyMarkup);
            }

            const postData = JSON.stringify(messageData);

            const url = new URL(`${this.apiUrl}/sendMessage`);
            
            const requestOptions = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);

                        if (!response.ok) {
                            logger.error('❌ Ошибка отправки в Telegram:', response);
                            resolve({ success: false, message: response.description || 'Ошибка отправки' });
                            return;
                        }

                        logger.success('✅ Сообщение отправлено в Telegram');
                        resolve({ success: true, data: response });
                    } catch (error) {
                        logger.error('❌ Ошибка парсинга ответа Telegram:', error);
                        resolve({ success: false, message: error.message });
                    }
                });
            });

            req.on('error', (error) => {
                logger.error('❌ Ошибка Telegram API:', error);
                resolve({ success: false, message: error.message });
            });

            req.write(postData);
            req.end();
        });
    }

    formatOrderMessage(order) {
        const date = new Date(order.datetime);
        const formattedDate = date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const createdDate = new Date(order.created_at);
        const createdFormatted = createdDate.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let message = `🎅 <b>НОВАЯ ЗАЯВКА НА ДЕДА МОРОЗА!</b>\n\n`;
        message += `🆔 <b>ID заявки:</b> #${order.id}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (order.name) {
            message += `👤 <b>Имя клиента:</b> ${this.escapeHtml(order.name)}\n`;
        }
        
        message += `📍 <b>Адрес доставки:</b>\n${this.escapeHtml(order.address)}\n\n`;
        message += `🕐 <b>Дата и время визита:</b>\n${formattedDate}\n\n`;
        message += `📞 <b>Телефон:</b> <code>${this.formatPhone(order.phone)}</code>\n\n`;
        message += `📅 <b>Заявка создана:</b>\n${createdFormatted}\n`;
        
        if (order.status) {
            const statusInfo = this.getStatusInfo(order.status);
            message += `\n${statusInfo.emoji} <b>Статус:</b> ${statusInfo.label}`;
        }

        return message;
    }

    formatPhone(phone) {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.startsWith('7') && digits.length === 11) {
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
        }
        return phone;
    }

    getStatusInfo(status) {
        const statuses = {
            'pending': { emoji: '⏳', label: 'Ожидает подтверждения' },
            'confirmed': { emoji: '✅', label: 'Подтверждена' },
            'completed': { emoji: '🎉', label: 'Выполнена' },
            'cancelled': { emoji: '❌', label: 'Отменена' }
        };
        return statuses[status] || { emoji: '📋', label: status };
    }

    createOrderKeyboard(orderId, phone = null) {
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '✅ Подтвердить', callback_data: `confirm_${orderId}` },
                    { text: '❌ Отменить', callback_data: `cancel_${orderId}` }
                ],
                [
                    { text: '📋 Все заявки', callback_data: 'list_orders' },
                    { text: '📊 Статистика', callback_data: 'stats' }
                ]
            ]
        };

        if (phone) {
            keyboard.inline_keyboard.splice(1, 0, [
                { text: '📞 Позвонить', url: `tel:+${phone}` }
            ]);
        }

        return keyboard;
    }

    createMainKeyboard() {
        return {
            inline_keyboard: [
                [
                    { text: '📋 Список заявок', callback_data: 'list_orders' },
                    { text: '📊 Статистика', callback_data: 'stats' }
                ],
                [
                    { text: '⏳ Ожидают', callback_data: 'filter_pending' },
                    { text: '✅ Подтверждены', callback_data: 'filter_confirmed' }
                ],
                [
                    { text: '🔄 Обновить', callback_data: 'refresh' }
                ]
            ]
        };
    }

    async notifyNewOrder(order) {
        if (!this.enabled) {
            return { success: false, message: 'Telegram не настроен' };
        }

        const message = this.formatOrderMessage(order);
        const keyboard = this.createOrderKeyboard(order.id, order.phone);
        
        return await this.sendMessage(this.chatId, message, {
            replyMarkup: keyboard
        });
    }

    async sendStats() {
        try {
            const orders = await Order.findAll();
            const stats = this.calculateStats(orders);
            
            let message = `📊 <b>СТАТИСТИКА ЗАЯВОК</b>\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            message += `📋 <b>Всего заявок:</b> ${stats.total}\n\n`;
            message += `⏳ <b>Ожидают:</b> ${stats.pending}\n`;
            message += `✅ <b>Подтверждены:</b> ${stats.confirmed}\n`;
            message += `🎉 <b>Выполнены:</b> ${stats.completed}\n`;
            message += `❌ <b>Отменены:</b> ${stats.cancelled}\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            message += `📅 <b>Сегодня:</b> ${stats.today}\n`;
            message += `📅 <b>На этой неделе:</b> ${stats.thisWeek}\n`;
            message += `📅 <b>В этом месяце:</b> ${stats.thisMonth}\n`;

            return await this.sendMessage(this.chatId, message, {
                replyMarkup: this.createMainKeyboard()
            });
        } catch (error) {
            logger.error('Ошибка получения статистики:', error);
            return { success: false, message: error.message };
        }
    }

    async sendOrdersList(filter = null) {
        try {
            let orders = await Order.findAll();
            
            if (filter) {
                orders = orders.filter(o => o.status === filter);
            }

            if (orders.length === 0) {
                const filterText = filter ? ` со статусом "${this.getStatusInfo(filter).label}"` : '';
                return await this.sendMessage(
                    this.chatId,
                    `📭 Заявок${filterText} не найдено`,
                    { replyMarkup: this.createMainKeyboard() }
                );
            }

            // Отправляем последние 10 заявок
            const recentOrders = orders.slice(0, 10);
            
            let message = `📋 <b>СПИСОК ЗАЯВОК</b>\n\n`;
            if (filter) {
                message += `Фильтр: ${this.getStatusInfo(filter).label}\n\n`;
            }
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            recentOrders.forEach((order, index) => {
                const date = new Date(order.datetime);
                const formattedDate = date.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const statusInfo = this.getStatusInfo(order.status || 'pending');
                message += `${index + 1}. ${statusInfo.emoji} <b>#${order.id}</b>\n`;
                if (order.name) {
                    message += `   👤 ${this.escapeHtml(order.name)}\n`;
                }
                message += `   📅 ${formattedDate}\n`;
                message += `   📍 ${this.escapeHtml(order.address.substring(0, 30))}${order.address.length > 30 ? '...' : ''}\n\n`;
            });

            if (orders.length > 10) {
                message += `\n... и еще ${orders.length - 10} заявок`;
            }

            return await this.sendMessage(this.chatId, message, {
                replyMarkup: this.createMainKeyboard()
            });
        } catch (error) {
            logger.error('Ошибка получения списка заявок:', error);
            return { success: false, message: error.message };
        }
    }

    calculateStats(orders) {
        const stats = {
            total: orders.length,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        orders.forEach(order => {
            // Статусы
            const status = order.status || 'pending';
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            }

            // Даты
            const createdDate = new Date(order.created_at);
            if (createdDate >= today) stats.today++;
            if (createdDate >= weekAgo) stats.thisWeek++;
            if (createdDate >= monthAgo) stats.thisMonth++;
        });

        return stats;
    }

    escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    async handleCallbackQuery(callbackQuery) {
        const { data, message, from } = callbackQuery;
        const chatId = message.chat.id;

        try {
            if (data.startsWith('confirm_')) {
                const orderId = parseInt(data.split('_')[1]);
                const order = await Order.findById(orderId);
                if (order) {
                    await Order.updateStatus(orderId, 'confirmed');
                    await this.sendMessage(chatId, `✅ Заявка #${orderId} подтверждена!`);
                    const updatedOrder = await Order.findById(orderId);
                    await this.sendMessage(chatId, this.formatOrderMessage(updatedOrder), {
                        replyMarkup: this.createOrderKeyboard(orderId, updatedOrder.phone)
                    });
                } else {
                    await this.sendMessage(chatId, `❌ Заявка #${orderId} не найдена`);
                }
            } else if (data.startsWith('cancel_')) {
                const orderId = parseInt(data.split('_')[1]);
                const order = await Order.findById(orderId);
                if (order) {
                    await Order.updateStatus(orderId, 'cancelled');
                    await this.sendMessage(chatId, `❌ Заявка #${orderId} отменена.`);
                } else {
                    await this.sendMessage(chatId, `❌ Заявка #${orderId} не найдена`);
                }
            } else if (data === 'list_orders') {
                await this.sendOrdersList();
            } else if (data === 'stats') {
                await this.sendStats();
            } else if (data.startsWith('filter_')) {
                const filter = data.split('_')[1];
                await this.sendOrdersList(filter);
            } else if (data === 'refresh') {
                await this.sendMessage(chatId, '🔄 Обновлено!', {
                    replyMarkup: this.createMainKeyboard()
                });
            }
        } catch (error) {
            logger.error('Ошибка обработки callback:', error);
            await this.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
        }
    }

    async setWebhook(url) {
        if (!this.enabled) {
            return { success: false, message: 'Telegram не настроен' };
        }

        return new Promise((resolve) => {
            const postData = JSON.stringify({ url });

            const requestUrl = new URL(`${this.apiUrl}/setWebhook`);
            
            const options = {
                hostname: requestUrl.hostname,
                port: 443,
                path: requestUrl.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.ok) {
                            logger.success('✅ Webhook установлен:', url);
                        } else {
                            logger.error('❌ Ошибка установки webhook:', response);
                        }
                        resolve({ success: response.ok, data: response });
                    } catch (error) {
                        logger.error('❌ Ошибка парсинга ответа setWebhook:', error);
                        resolve({ success: false, message: error.message });
                    }
                });
            });

            req.on('error', (error) => {
                logger.error('❌ Ошибка установки webhook:', error);
                resolve({ success: false, message: error.message });
            });

            req.write(postData);
            req.end();
        });
    }
}

module.exports = new TelegramBot();

