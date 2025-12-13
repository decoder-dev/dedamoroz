// Универсальная версия админ-панели без ES6 модулей
(function() {
    'use strict';
    
    console.log('🚀 Инициализация админ-панели...');
    
    // API клиент
    const api = {
        async request(endpoint, options = {}) {
            const url = endpoint;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            if (config.body && typeof config.body === 'object') {
                config.body = JSON.stringify(config.body);
            }

            try {
                const response = await fetch(url, config);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }

                return data;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },
        
        async getOrders() {
            return this.request('/api/orders', { method: 'GET' });
        },
        
        async deleteOrder(id) {
            return this.request(`/api/orders/${id}`, { method: 'DELETE' });
        }
    };
    
    // UI Helper
    const UIHelper = {
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        }
    };
    
    class AdminPanel {
        constructor() {
            this.allOrders = [];
            this.filteredOrders = [];
            this.container = document.getElementById('ordersContainer');
            this.searchBox = document.getElementById('searchBox');
            
            if (this.container) {
                this.init();
            }
        }
        
        createElement(tag, attributes = {}, textContent = '') {
            const element = document.createElement(tag);
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'style') {
                    element.style.cssText = attributes[key];
                } else if (key === 'textContent') {
                    element.textContent = attributes[key];
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });
            if (textContent) {
                element.textContent = textContent;
            }
            return element;
        }

        init() {
            this.setupSearch();
            this.setupRefreshButton();
            this.loadOrders();
            
            setInterval(() => this.loadOrders(), 30000);
        }

        setupSearch() {
            if (!this.searchBox) return;
            
            this.searchBox.addEventListener('input', (e) => {
                this.filterOrders(e.target.value.toLowerCase().trim());
            });
        }

        setupRefreshButton() {
            const refreshBtn = document.getElementById('refreshBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.loadOrders());
            }
        }

        async loadOrders() {
            if (!this.container) return;
            
            const isLocalFile = window.location.protocol === 'file:';
            if (isLocalFile) {
                this.container.innerHTML = `
                    <div class="empty">
                        <div class="empty-icon">⚠️</div>
                        <p>Для работы админ-панели необходимо запустить сервер.<br>
                        Запустите: <code>npm start</code><br>
                        И откройте: <code>http://localhost:3000/admin</code></p>
                    </div>
                `;
                return;
            }
            
            this.container.innerHTML = '<div class="loading">⏳ Загрузка заявок...</div>';
            
            try {
                const response = await api.getOrders();
                
                if (response.success) {
                    this.allOrders = response.data || [];
                    this.filteredOrders = [...this.allOrders];
                    this.displayOrders(this.filteredOrders);
                    this.updateStats(this.allOrders);
                } else {
                    this.showError('Ошибка загрузки заявок');
                }
            } catch (error) {
                console.error('Ошибка загрузки заявок:', error);
                this.showError('Ошибка подключения к серверу');
            }
        }

        filterOrders(query) {
            if (!query) {
                this.filteredOrders = [...this.allOrders];
            } else {
                this.filteredOrders = this.allOrders.filter(order => {
                    const name = (order.name || '').toLowerCase();
                    const address = (order.address || '').toLowerCase();
                    const phone = (order.phone || '').toLowerCase();
                    const id = order.id.toString();
                    
                    return name.includes(query) || 
                           address.includes(query) || 
                           phone.includes(query) || 
                           id.includes(query);
                });
            }
            
            this.displayOrders(this.filteredOrders);
            this.updateStats(this.filteredOrders);
        }

        displayOrders(orders) {
            if (!this.container) return;
            
            if (orders.length === 0) {
                this.container.innerHTML = '';
                const emptyDiv = this.createElement('div', { className: 'empty' });
                const iconDiv = this.createElement('div', { className: 'empty-icon' }, '📭');
                const p = this.createElement('p', {}, 'Заявок не найдено');
                emptyDiv.appendChild(iconDiv);
                emptyDiv.appendChild(p);
                this.container.appendChild(emptyDiv);
                return;
            }
            
            this.container.innerHTML = '';
            orders.forEach((order, index) => {
                const formattedDate = UIHelper.formatDate(order.datetime);
                const createdFormatted = UIHelper.formatDate(order.created_at);
                
                // Безопасное создание элементов
                const card = this.createElement('div', { 
                    className: 'order-card',
                    style: `animation-delay: ${index * 0.1}s`
                });
                
                const header = this.createElement('div', { className: 'order-header' });
                const headerLeft = this.createElement('div');
                
                const orderId = this.createElement('div', { className: 'order-id' }, `Заявка #${order.id}`);
                const orderDate = this.createElement('div', { className: 'order-date' }, `Создана: ${createdFormatted}`);
                
                headerLeft.appendChild(orderId);
                headerLeft.appendChild(orderDate);
                
                if (order.status) {
                    const statusDiv = this.createElement('div', { 
                        className: `order-status status-${order.status}` 
                    }, this.getStatusLabel(order.status));
                    headerLeft.appendChild(statusDiv);
                }
                
                const deleteBtn = this.createElement('button', { 
                    className: 'delete-btn',
                    title: 'Удалить заявку'
                }, '🗑️ Удалить');
                deleteBtn.addEventListener('click', () => this.deleteOrder(order.id));
                
                header.appendChild(headerLeft);
                header.appendChild(deleteBtn);
                
                const info = this.createElement('div', { className: 'order-info' });
                
                if (order.name) {
                    const nameItem = this.createElement('div', { className: 'info-item' });
                    nameItem.appendChild(this.createElement('strong', {}, '👤 Имя:'));
                    nameItem.appendChild(this.createElement('span', {}, UIHelper.escapeHtml(order.name)));
                    info.appendChild(nameItem);
                }
                
                const addressItem = this.createElement('div', { className: 'info-item' });
                addressItem.appendChild(this.createElement('strong', {}, '📍 Адрес:'));
                addressItem.appendChild(this.createElement('span', {}, UIHelper.escapeHtml(order.address)));
                info.appendChild(addressItem);
                
                const datetimeItem = this.createElement('div', { className: 'info-item' });
                datetimeItem.appendChild(this.createElement('strong', {}, '🕐 Дата и время:'));
                datetimeItem.appendChild(this.createElement('span', {}, formattedDate));
                info.appendChild(datetimeItem);
                
                const phoneItem = this.createElement('div', { className: 'info-item' });
                phoneItem.appendChild(this.createElement('strong', {}, '📞 Телефон:'));
                phoneItem.appendChild(this.createElement('span', {}, UIHelper.escapeHtml(order.phone)));
                info.appendChild(phoneItem);
                
                card.appendChild(header);
                card.appendChild(info);
                this.container.appendChild(card);
            });
        }

        getStatusLabel(status) {
            const labels = {
                'pending': '⏳ Ожидает',
                'confirmed': '✅ Подтверждена',
                'completed': '🎉 Выполнена',
                'cancelled': '❌ Отменена'
            };
            return labels[status] || status;
        }

        updateStats(orders) {
            const totalEl = document.getElementById('totalOrders');
            const todayEl = document.getElementById('todayOrders');
            
            if (totalEl) {
                totalEl.textContent = orders.length;
            }
            
            if (todayEl) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayOrders = orders.filter(order => {
                    const orderDate = new Date(order.created_at);
                    orderDate.setHours(0, 0, 0, 0);
                    return orderDate.getTime() === today.getTime();
                });
                todayEl.textContent = todayOrders.length;
            }
        }

        async deleteOrder(id) {
            if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
                return;
            }
            
            try {
                const response = await api.deleteOrder(id);
                
                if (response.success) {
                    this.loadOrders();
                } else {
                    alert('Ошибка при удалении заявки');
                }
            } catch (error) {
                console.error('Ошибка удаления заявки:', error);
                alert(`Ошибка: ${error.message || 'Не удалось удалить заявку'}`);
            }
        }

        showError(message) {
            if (!this.container) return;
            this.container.innerHTML = `
                <div class="empty">
                    <div class="empty-icon">⚠️</div>
                    <p>${message}</p>
                </div>
            `;
        }
    }
    
    // Глобальная переменная
    let adminPanel;
    
    // Инициализация
    document.addEventListener('DOMContentLoaded', () => {
        adminPanel = new AdminPanel();
        console.log('✅ Админ-панель инициализирована');
        
        // Глобальные функции для совместимости
        window.loadOrders = () => adminPanel.loadOrders();
        window.deleteOrder = (id) => adminPanel.deleteOrder(id);
    });
})();

