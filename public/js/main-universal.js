// Универсальная версия без ES6 модулей - работает везде
(function() {
    'use strict';
    
    console.log('🚀 Инициализация приложения...');
    
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
        
        async createOrder(orderData) {
            return this.request('/api/orders', {
                method: 'POST',
                body: orderData
            });
        }
    };
    
    // Валидация
    const FormValidator = {
        validateName(name) {
            const trimmed = name.trim();
            if (!trimmed) {
                return { valid: false, message: 'Имя обязательно для заполнения' };
            }
            if (trimmed.length < 2) {
                return { valid: false, message: 'Имя должно содержать минимум 2 символа' };
            }
            if (trimmed.length > 100) {
                return { valid: false, message: 'Имя слишком длинное (максимум 100 символов)' };
            }
            return { valid: true };
        },

        validateAddress(address) {
            const trimmed = address.trim();
            if (!trimmed) {
                return { valid: false, message: 'Адрес обязателен для заполнения' };
            }
            if (trimmed.length < 5) {
                return { valid: false, message: 'Адрес слишком короткий (минимум 5 символов)' };
            }
            if (trimmed.length > 500) {
                return { valid: false, message: 'Адрес слишком длинный (максимум 500 символов)' };
            }
            return { valid: true };
        },

        validateDateTime(datetime) {
            if (!datetime) {
                return { valid: false, message: 'Дата и время обязательны' };
            }
            const selectedDate = new Date(datetime);
            const now = new Date();
            if (selectedDate < now) {
                return { valid: false, message: 'Дата и время не могут быть в прошлом' };
            }
            return { valid: true };
        },

        validatePhone(phone) {
            const digits = phone.replace(/\D/g, '');
            if (!digits) {
                return { valid: false, message: 'Номер телефона обязателен' };
            }
            if (digits.length < 10) {
                return { valid: false, message: 'Номер телефона слишком короткий' };
            }
            if (digits.length > 15) {
                return { valid: false, message: 'Номер телефона слишком длинный' };
            }
            return { valid: true };
        },

        formatPhone(value) {
            let digits = value.replace(/\D/g, '');
            
            if (digits.startsWith('8')) {
                digits = '7' + digits.slice(1);
            }
            
            if (digits.startsWith('7') && digits.length > 1) {
                let formatted = '+7';
                if (digits.length > 1) {
                    formatted += ' (' + digits.slice(1, 4);
                }
                if (digits.length > 4) {
                    formatted += ') ' + digits.slice(4, 7);
                }
                if (digits.length > 7) {
                    formatted += '-' + digits.slice(7, 9);
                }
                if (digits.length > 9) {
                    formatted += '-' + digits.slice(9, 11);
                }
                return formatted;
            }
            
            return value;
        },

        validateForm(formData) {
            const errors = {};
            
            const nameValidation = this.validateName(formData.name);
            if (!nameValidation.valid) {
                errors.name = nameValidation.message;
            }
            
            const addressValidation = this.validateAddress(formData.address);
            if (!addressValidation.valid) {
                errors.address = addressValidation.message;
            }
            
            const datetimeValidation = this.validateDateTime(formData.datetime);
            if (!datetimeValidation.valid) {
                errors.datetime = datetimeValidation.message;
            }
            
            const phoneValidation = this.validatePhone(formData.phone);
            if (!phoneValidation.valid) {
                errors.phone = phoneValidation.message;
            }
            
            return {
                valid: Object.keys(errors).length === 0,
                errors
            };
        }
    };
    
    // UI Helper
    const UIHelper = {
        showMessage(element, text, type = 'info') {
            if (!element) return;
            
            element.textContent = text;
            element.className = `message ${type}`;
            
            setTimeout(() => {
                this.hideMessage(element);
            }, 6000);
        },

        hideMessage(element) {
            if (!element) return;
            element.style.animation = 'slideIn 0.5s ease-out reverse';
            setTimeout(() => {
                element.className = 'message';
                element.style.animation = '';
            }, 500);
        },

        setLoading(button, isLoading, loadingText = '⏳ Отправка...') {
            if (!button) return;
            
            if (isLoading) {
                button.disabled = true;
                button.dataset.originalText = button.textContent;
                button.textContent = loadingText;
            } else {
                button.disabled = false;
                button.textContent = button.dataset.originalText || 'Отправить заявку';
            }
        },

        showFieldError(field, message) {
            if (!field) return;
            
            field.classList.add('error');
            
            const existingError = field.parentElement.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
            
            if (message) {
                const errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                errorElement.textContent = message;
                field.parentElement.appendChild(errorElement);
            }
        },

        clearFieldError(field) {
            if (!field) return;
            
            field.classList.remove('error');
            const errorElement = field.parentElement.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        },

        scrollToElement(element, behavior = 'smooth') {
            if (!element) return;
            element.scrollIntoView({ behavior, block: 'nearest' });
        }
    };
    
    // Создание звезд
    function createStars() {
        const starsContainer = document.getElementById('stars');
        if (!starsContainer) return;
        
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (Math.random() * 2 + 2) + 's';
            starsContainer.appendChild(star);
        }
    }
    
    // Анимация снежинок
    let canvas, ctx, snowflakes = [];
    
    function initSnow() {
        canvas = document.getElementById('snowCanvas');
        if (!canvas) return;
        
        ctx = canvas.getContext('2d');
        setCanvasSize();
        animate();
        
        window.addEventListener('resize', setCanvasSize);
    }
    
    function setCanvasSize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        generateSnowflakes();
    }
    
    function generateSnowflakes() {
        if (!canvas) return;
        snowflakes = [];
        const count = Math.min(400, Math.floor((canvas.width * canvas.height) / 5000));
        for (let i = 0; i < count; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 1.5,
                opacity: Math.random() * 0.5 + 0.5,
                sway: Math.random() * 0.5 - 0.25
            });
        }
    }
    
    function drawSnowflakes() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snowflakes.forEach(snowflake => {
            ctx.beginPath();
            ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${snowflake.opacity})`;
            ctx.fill();
            
            snowflake.y += snowflake.speed;
            snowflake.x += snowflake.sway;
            
            if (snowflake.y > canvas.height) {
                snowflake.y = 0;
                snowflake.x = Math.random() * canvas.width;
            }
            if (snowflake.x < 0) snowflake.x = canvas.width;
            if (snowflake.x > canvas.width) snowflake.x = 0;
        });
    }
    
    function animate() {
        drawSnowflakes();
        requestAnimationFrame(animate);
    }
    
    // Инициализация формы
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
            const formData = {
                name: document.getElementById('name')?.value.trim() || '',
                address: document.getElementById('address')?.value.trim() || '',
                datetime: document.getElementById('datetime')?.value || '',
                phone: document.getElementById('phone')?.value.trim() || ''
            };
            
            const validation = FormValidator.validateForm(formData);
            
            if (!validation.valid) {
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
            
            const orderData = {
                ...formData,
                phone: formData.phone.replace(/\D/g, '')
            };
            
            UIHelper.setLoading(this.submitBtn, true);
            
            try {
                // Проверяем, запущен ли сервер
                const isLocalFile = window.location.protocol === 'file:';
                if (isLocalFile) {
                    UIHelper.showMessage(
                        this.messageDiv,
                        '⚠️ Для отправки заявки необходимо запустить сервер. Запустите: npm start и откройте http://localhost:3000',
                        'error'
                    );
                    UIHelper.setLoading(this.submitBtn, false);
                    return;
                }
                
                const response = await api.createOrder(orderData);
                
                if (response.success) {
                    UIHelper.showMessage(
                        this.messageDiv,
                        '✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время. С наступающим Новым Годом! 🎉',
                        'success'
                    );
                    
                    this.form.reset();
                    UIHelper.scrollToElement(this.messageDiv);
                    
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
    
    // Инициализация
    document.addEventListener('DOMContentLoaded', () => {
        createStars();
        initSnow();
        new OrderForm();
        console.log('✅ Приложение инициализировано');
    });
})();

