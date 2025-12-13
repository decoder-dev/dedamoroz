/**
 * API клиент для работы с сервером
 */
export class ApiClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
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
    }

    async createOrder(orderData) {
        return this.request('/api/orders', {
            method: 'POST',
            body: orderData
        });
    }

    async getOrders() {
        return this.request('/api/orders', {
            method: 'GET'
        });
    }

    async getOrder(id) {
        return this.request(`/api/orders/${id}`, {
            method: 'GET'
        });
    }

    async deleteOrder(id) {
        return this.request(`/api/orders/${id}`, {
            method: 'DELETE'
        });
    }

    async updateOrderStatus(id, status) {
        return this.request(`/api/orders/${id}/status`, {
            method: 'PATCH',
            body: { status }
        });
    }
}

export const api = new ApiClient();

