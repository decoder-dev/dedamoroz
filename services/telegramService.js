const config = require('../config/config');
const https = require('https');

class TelegramService {
    constructor() {
        this.botToken = config.telegram.botToken;
        this.chatId = config.telegram.chatId;
        this.enabled = config.telegram.enabled;
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    async sendMessage(text, parseMode = 'HTML') {
        if (!this.enabled) {
            console.log('📱 Telegram отключен. Сообщение:', text);
            return { success: false, message: 'Telegram не настроен' };
        }

        return new Promise((resolve) => {
            const postData = JSON.stringify({
                chat_id: this.chatId,
                text: text,
                parse_mode: parseMode
            });

            const url = new URL(`${this.apiUrl}/sendMessage`);
            
            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname,
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

                        if (!response.ok) {
                            console.error('❌ Ошибка отправки в Telegram:', response);
                            resolve({ success: false, message: response.description || 'Ошибка отправки' });
                            return;
                        }

                        console.log('✅ Сообщение отправлено в Telegram');
                        resolve({ success: true, data: response });
                    } catch (error) {
                        console.error('❌ Ошибка парсинга ответа Telegram:', error);
                        resolve({ success: false, message: error.message });
                    }
                });
            });

            req.on('error', (error) => {
                console.error('❌ Ошибка Telegram API:', error);
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

        let message = `🎅 <b>Новая заявка на Деда Мороза!</b>\n\n`;
        message += `🆔 <b>ID:</b> #${order.id}\n`;
        
        if (order.name) {
            message += `👤 <b>Имя:</b> ${this.escapeHtml(order.name)}\n`;
        }
        
        message += `📍 <b>Адрес:</b> ${this.escapeHtml(order.address)}\n`;
        message += `🕐 <b>Дата и время:</b> ${formattedDate}\n`;
        message += `📞 <b>Телефон:</b> <code>${this.escapeHtml(order.phone)}</code>\n`;
        message += `📅 <b>Создана:</b> ${new Date(order.created_at).toLocaleString('ru-RU')}\n`;
        
        if (order.status) {
            const statusEmoji = {
                'pending': '⏳',
                'confirmed': '✅',
                'completed': '🎉',
                'cancelled': '❌'
            };
            message += `\n${statusEmoji[order.status] || '📋'} <b>Статус:</b> ${order.status}`;
        }

        return message;
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

    async notifyNewOrder(order) {
        if (!this.enabled) {
            return { success: false, message: 'Telegram не настроен' };
        }

        const message = this.formatOrderMessage(order);
        return await this.sendMessage(message);
    }
}

module.exports = new TelegramService();

