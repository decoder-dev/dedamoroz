/**
 * Главный файл приложения
 */
// Обработка ошибок загрузки модулей
window.addEventListener('error', (e) => {
    if (e.filename && e.filename.includes('.js') && e.message.includes('Failed to fetch')) {
        console.error('Ошибка загрузки модуля:', e.filename, e.message);
        // Перезагрузка страницы через 2 секунды
        setTimeout(() => {
            console.log('Попытка перезагрузки...');
            window.location.reload();
        }, 2000);
    }
}, true);

import { FormValidator } from './utils/validation.js';
import { api } from './utils/api.js';
import { UIHelper } from './utils/ui.js';
import { SnowAnimation } from './animations/snow.js';
import { StarsAnimation } from './animations/stars.js';

class OrderForm {
    constructor() {
        this.form = document.getElementById('orderForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.messageDiv = document.getElementById('message');
        
        if (!this.form) return;
        
        this.init();
    }

    init() {
        this.setupDateTimeInput();
        this.setupPhoneInput();
        this.setupFormValidation();
        this.setupSubmitHandler();
    }

    setupDateTimeInput() {
        const datetimeInput = document.getElementById('datetime');
        if (!datetimeInput) return;
        
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        datetimeInput.min = now.toISOString().slice(0, 16);
    }

    setupPhoneInput() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            const formatted = FormValidator.formatPhone(e.target.value);
            e.target.value = formatted;
            UIHelper.clearFieldError(e.target);
        });
    }

    setupFormValidation() {
        const fields = ['name', 'address', 'datetime', 'phone'];
        
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field) return;
            
            field.addEventListener('blur', () => {
                this.validateField(fieldName, field.value);
            });
            
            field.addEventListener('input', () => {
                UIHelper.clearFieldError(field);
            });
        });
    }

    validateField(fieldName, value) {
        const field = document.getElementById(fieldName);
        if (!field) return true;
        
        let validation;
        
        switch (fieldName) {
            case 'name':
                validation = FormValidator.validateName(value);
                break;
            case 'address':
                validation = FormValidator.validateAddress(value);
                break;
            case 'datetime':
                validation = FormValidator.validateDateTime(value);
                break;
            case 'phone':
                validation = FormValidator.validatePhone(value);
                break;
            default:
                return true;
        }
        
        if (!validation.valid) {
            UIHelper.showFieldError(field, validation.message);
            return false;
        } else {
            UIHelper.clearFieldError(field);
            return true;
        }
    }

    setupSubmitHandler() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    async handleSubmit() {
        // Собираем данные формы
        const formData = {
            name: document.getElementById('name')?.value.trim() || '',
            address: document.getElementById('address')?.value.trim() || '',
            datetime: document.getElementById('datetime')?.value || '',
            phone: document.getElementById('phone')?.value.trim() || ''
        };
        
        // Валидация всех полей
        const validation = FormValidator.validateForm(formData);
        
        if (!validation.valid) {
            // Показываем ошибки для каждого поля
            Object.keys(validation.errors).forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (field) {
                    UIHelper.showFieldError(field, validation.errors[fieldName]);
                }
            });
            
            UIHelper.showMessage(
                this.messageDiv,
                '❌ Пожалуйста, исправьте ошибки в форме',
                'error'
            );
            return;
        }
        
        // Подготовка данных для отправки
        const orderData = {
            ...formData,
            phone: formData.phone.replace(/\D/g, '')
        };
        
        // Отправка
        UIHelper.setLoading(this.submitBtn, true);
        
        try {
            const response = await api.createOrder(orderData);
            
            if (response.success) {
                UIHelper.showMessage(
                    this.messageDiv,
                    '✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время. С наступающим Новым Годом! 🎉',
                    'success'
                );
                
                this.form.reset();
                UIHelper.scrollToElement(this.messageDiv);
                
                // Очистка ошибок полей
                ['name', 'address', 'datetime', 'phone'].forEach(fieldName => {
                    const field = document.getElementById(fieldName);
                    if (field) {
                        UIHelper.clearFieldError(field);
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка отправки заявки:', error);
            UIHelper.showMessage(
                this.messageDiv,
                `❌ ${error.message || 'Произошла ошибка при отправке заявки. Проверьте подключение к интернету и попробуйте позже.'}`,
                'error'
            );
        } finally {
            UIHelper.setLoading(this.submitBtn, false);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Инициализация анимаций
        new StarsAnimation('stars', 100);
        new SnowAnimation('snowCanvas');
        
        // Инициализация формы
        new OrderForm();
        
        console.log('✅ Приложение инициализировано');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        // Fallback на простую версию
        const script = document.createElement('script');
        script.src = '/js/main-legacy.js';
        document.body.appendChild(script);
    }
});
