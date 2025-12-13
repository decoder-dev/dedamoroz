# 🎅 Сайт для заказа Деда Мороза

Профессиональный веб-сайт для заказа Деда Мороза с полнофункциональным Telegram ботом для управления заявками.

## ✨ Возможности

### 🌐 Сайт
- **Современный дизайн** с анимациями и эффектами
- **Адаптивная верстка** для всех устройств
- **Информативные секции**: услуги, цены, отзывы, FAQ
- **Форма заказа** с валидацией
- **Плавная прокрутка** и навигация

### 🤖 Telegram Бот
- **Автоматические уведомления** о новых заявках
- **Интерактивные кнопки** для управления заявками
- **Статистика** заявок (всего, по статусам, по периодам)
- **Список заявок** с фильтрацией
- **Команды**: `/start`, `/stats`, `/list`, `/pending`, `/confirmed`
- **Управление статусами** заявок прямо из Telegram

## 🚀 Быстрый старт

### Установка

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start
```

Сайт будет доступен по адресу: `http://localhost:3000`

### Настройка Telegram бота

1. **Создайте бота** через [@BotFather](https://t.me/BotFather)
2. **Получите токен** бота
3. **Узнайте ваш Chat ID** (можно через [@userinfobot](https://t.me/userinfobot))
4. **Настройте переменные окружения**:

Создайте файл `.env` в корне проекта:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id
TELEGRAM_ENABLED=true
PORT=3000
NODE_ENV=development
```

Или отредактируйте `config/config.js` напрямую.

### Настройка Webhook (опционально)

Для получения обновлений от Telegram через webhook:

```bash
curl -X POST http://localhost:3000/api/telegram/set-webhook?url=https://ваш-домен.ru/api/telegram/webhook
```

## 📁 Структура проекта

```
├── config/           # Конфигурация
│   ├── config.js     # Основные настройки
│   └── database.js   # Подключение к БД
├── controllers/      # Контроллеры
│   └── orderController.js
├── middleware/       # Middleware
│   ├── errorHandler.js
│   └── logger.js    # Логирование
├── models/          # Модели данных
│   └── Order.js
├── routes/          # Маршруты
│   ├── orderRoutes.js
│   └── telegramRoutes.js
├── services/        # Сервисы
│   └── telegramBot.js
├── public/          # Статические файлы
│   ├── css/
│   └── js/
├── views/           # HTML шаблоны
│   └── index.html
├── logs/            # Логи (создается автоматически)
└── server.js        # Главный файл сервера
```

## 🤖 Команды Telegram бота

- `/start` или `/help` - Показать помощь и главное меню
- `/stats` - Статистика заявок
- `/list` - Список всех заявок
- `/pending` - Заявки в ожидании
- `/confirmed` - Подтвержденные заявки
- `/order_<ID>` - Просмотр конкретной заявки

## 📊 Статусы заявок

- `pending` - Ожидает подтверждения
- `confirmed` - Подтверждена
- `completed` - Выполнена
- `cancelled` - Отменена

## 🎨 Особенности дизайна

- **Glassmorphism** эффекты
- **Анимации** снежинок и звезд
- **Градиенты** и современная типографика
- **Плавные переходы** и hover-эффекты
- **Адаптивность** для мобильных устройств

## 📝 Логирование

Все логи сохраняются в папке `logs/` с датой в имени файла:
- `logs/app-2024-01-01.log`

Уровни логирования:
- `INFO` - Информационные сообщения
- `WARN` - Предупреждения
- `ERROR` - Ошибки
- `SUCCESS` - Успешные операции

## 🔧 API Endpoints

### Заявки
- `POST /api/orders` - Создать заявку
- `GET /api/orders` - Получить все заявки
- `GET /api/orders/:id` - Получить заявку по ID
- `DELETE /api/orders/:id` - Удалить заявку
- `PATCH /api/orders/:id/status` - Обновить статус

### Telegram
- `POST /api/telegram/webhook` - Webhook для Telegram
- `POST /api/telegram/set-webhook` - Установить webhook

### Система
- `GET /health` - Проверка работоспособности

## 🛠 Технологии

- **Backend**: Node.js, Express.js
- **База данных**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Интеграции**: Telegram Bot API

## 📦 Зависимости

```json
{
  "express": "^4.18.2",
  "sqlite3": "^5.1.6",
  "body-parser": "^1.20.2",
  "cors": "^2.8.5",
  "express-validator": "^7.0.1",
  "dotenv": "^16.3.1"
}
```

## 🚀 Деплой

### Рекомендации для продакшена:

1. Установите `NODE_ENV=production`
2. Настройте HTTPS для webhook
3. Используйте PM2 или systemd для автозапуска
4. Настройте резервное копирование БД
5. Мониторинг логов и ошибок

## 📄 Лицензия

MIT

## 🌐 Установка домена

### Настройка домена для продакшена

1. **Купите домен** у регистратора (например, Namecheap, GoDaddy, Reg.ru)

2. **Настройте DNS записи**:
   - Добавьте A-запись, указывающую на IP вашего сервера
   - Или используйте CNAME для поддомена

3. **Настройте SSL сертификат** (обязательно для Telegram webhook):
   ```bash
   # Используйте Let's Encrypt (Certbot)
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d ваш-домен.ru
   ```

4. **Настройте Nginx** (рекомендуется):
   ```nginx
   server {
       listen 80;
       server_name ваш-домен.ru;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name ваш-домен.ru;

       ssl_certificate /etc/letsencrypt/live/ваш-домен.ru/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/ваш-домен.ru/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Обновите webhook** после настройки домена:
   ```bash
   curl -X POST https://ваш-домен.ru/api/telegram/set-webhook?url=https://ваш-домен.ru/api/telegram/webhook
   ```

6. **Используйте PM2** для автозапуска:
   ```bash
   npm install -g pm2
   pm2 start server.js --name dedmoroz
   pm2 save
   pm2 startup
   ```

## 👨‍💻 Авторы

**messanpo** and **decoder-dev**

Создано с ❤️ для новогодних праздников!

