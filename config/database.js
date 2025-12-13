const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor(dbPath = 'orders.db') {
        this.db = null;
        this.dbPath = path.join(__dirname, '..', dbPath);
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Ошибка подключения к базе данных:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Подключено к базе данных SQLite');
                    this.initializeTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    initializeTables() {
        return new Promise((resolve, reject) => {
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    address TEXT NOT NULL,
                    datetime TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(createTableSQL, (err) => {
                if (err) {
                    console.error('❌ Ошибка создания таблицы:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Таблица orders готова');
                    this.addColumnIfNotExists('name', 'TEXT')
                        .then(() => this.addColumnIfNotExists('status', 'TEXT DEFAULT "pending"'))
                        .then(() => this.addColumnIfNotExists('updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP'))
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    addColumnIfNotExists(columnName, columnDefinition) {
        return new Promise((resolve) => {
            this.db.all(`PRAGMA table_info(orders)`, [], (err, columns) => {
                if (err) {
                    resolve();
                    return;
                }
                
                const columnExists = columns.some(col => col.name === columnName);
                if (!columnExists) {
                    this.db.run(`ALTER TABLE orders ADD COLUMN ${columnName} ${columnDefinition}`, () => {
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            
            this.db.close((err) => {
                if (err) {
                    console.error('❌ Ошибка закрытия БД:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Соединение с базой данных закрыто');
                    resolve();
                }
            });
        });
    }

    getDb() {
        return this.db;
    }
}

module.exports = new Database();

