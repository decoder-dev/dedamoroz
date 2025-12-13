const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '..', 'logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getLogFile() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `app-${date}.log`);
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level}] ${message}`;
        
        if (data) {
            logMessage += ` ${JSON.stringify(data)}`;
        }
        
        return logMessage + '\n';
    }

    log(level, message, data = null) {
        const logMessage = this.formatMessage(level, message, data);
        
        // Вывод в консоль
        const colors = {
            INFO: '\x1b[36m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m',
            SUCCESS: '\x1b[32m',
            RESET: '\x1b[0m'
        };
        
        const color = colors[level] || colors.RESET;
        console.log(`${color}${logMessage.trim()}${colors.RESET}`);
        
        // Запись в файл
        try {
            fs.appendFileSync(this.getLogFile(), logMessage);
        } catch (error) {
            console.error('Ошибка записи в лог файл:', error);
        }
    }

    info(message, data = null) {
        this.log('INFO', message, data);
    }

    warn(message, data = null) {
        this.log('WARN', message, data);
    }

    error(message, data = null) {
        this.log('ERROR', message, data);
    }

    success(message, data = null) {
        this.log('SUCCESS', message, data);
    }
}

module.exports = new Logger();

