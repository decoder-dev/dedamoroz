/**
 * Админ-панель
 */
import { api } from './utils/api.js';
import { UIHelper } from './utils/ui.js';

class AdminPanel {
    constructor() {
        this.allOrders = [];
        this.filteredOrders = [];
        this.container = document.getElementById('ordersContainer');
        this.searchBox = document.getElementById('searchBox');
        
        this.init();
    }

    init() {
        this.setupSearch();
        this.setupRefreshButton();
        this.loadOrders();
        
        // Автообновление каждые 30 секунд
        setInterval(() => this.loadOrders(), 30000);
    }

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadOrders());
        }
    }

    setupSearch() {
        if (!this.searchBox) return;
        
        this.searchBox.addEventListener('input', (e) => {
            this.filterOrders(e.target.value.toLowerCase().trim());
        });
    }

    async loadOrders() {
        if (!this.container) return;
        
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
            this.container.innerHTML = `
                <div class="empty">
                    <div class="empty-icon">📭</div>
                    <p>Заявок не найдено</p>
                </div>
            `;
            return;
        }
        
        this.container.innerHTML = orders.map((order, index) => {
            const formattedDate = UIHelper.formatDate(order.datetime);
            const createdFormatted = UIHelper.formatDate(order.created_at);
            
            return `
                <div class="order-card" style="animation-delay: ${index * 0.1}s">
                    <div class="order-header">
                        <div>
                            <div class="order-id">Заявка #${order.id}</div>
                            <div class="order-date">Создана: ${createdFormatted}</div>
                            ${order.status ? `<div class="order-status status-${order.status}">${this.getStatusLabel(order.status)}</div>` : ''}
                        </div>
                        <button class="delete-btn" onclick="deleteOrder(${order.id})" title="Удалить заявку">
                            🗑️ Удалить
                        </button>
                    </div>
                    <div class="order-info">
                        ${order.name ? `
                        <div class="info-item">
                            <strong>👤 Имя:</strong>
                            <span>${UIHelper.escapeHtml(order.name)}</span>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <strong>📍 Адрес:</strong>
                            <span>${UIHelper.escapeHtml(order.address)}</span>
                        </div>
                        <div class="info-item">
                            <strong>🕐 Дата и время:</strong>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="info-item">
                            <strong>📞 Телефон:</strong>
                            <span>${UIHelper.escapeHtml(order.phone)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
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

// Глобальная переменная для доступа из HTML
let adminPanel;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
    console.log('✅ Админ-панель инициализирована');
    
    // Делаем функции доступными глобально для совместимости
    window.loadOrders = () => adminPanel.loadOrders();
    window.deleteOrder = (id) => adminPanel.deleteOrder(id);
});
