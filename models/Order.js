const db = require('../config/database');

class Order {
    static async create(orderData) {
        return new Promise((resolve, reject) => {
            const { name, address, datetime, phone } = orderData;
            const phoneDigits = phone.replace(/\D/g, '');
            
            const sql = `
                INSERT INTO orders (name, address, datetime, phone, status)
                VALUES (?, ?, ?, ?, 'pending')
            `;
            
            db.getDb().run(sql, [name || null, address, datetime, phoneDigits], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        name,
                        address,
                        datetime,
                        phone: phoneDigits,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    });
                }
            });
        });
    }

    static async findAll() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM orders ORDER BY created_at DESC`;
            
            db.getDb().all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM orders WHERE id = ?`;
            
            db.getDb().get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM orders WHERE id = ?`;
            
            db.getDb().run(sql, [id], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Заявка не найдена'));
                } else {
                    resolve({ id, deleted: true });
                }
            });
        });
    }

    static async updateStatus(id, status) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE orders 
                SET status = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;
            
            db.getDb().run(sql, [status, id], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Заявка не найдена'));
                } else {
                    resolve({ id, status });
                }
            });
        });
    }
}

module.exports = Order;

