// Fallback версия без ES6 модулей для совместимости
(function() {
    'use strict';
    
    // Проверка поддержки ES6 модулей
    if (!window.fetch) {
        console.error('Браузер не поддерживает fetch API');
        return;
    }
    
    // Простая версия без модулей
    console.log('Инициализация приложения...');
    
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
    function initForm() {
        const form = document.getElementById('orderForm');
        if (!form) return;
        
        const submitBtn = document.getElementById('submitBtn');
        const messageDiv = document.getElementById('message');
        const datetimeInput = document.getElementById('datetime');
        const phoneInput = document.getElementById('phone');
        
        // Установка минимальной даты
        if (datetimeInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            datetimeInput.min = now.toISOString().slice(0, 16);
        }
        
        // Форматирование телефона
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.startsWith('8')) value = '7' + value.slice(1);
                if (value.startsWith('7') && value.length > 1) {
                    let formatted = '+7';
                    if (value.length > 1) formatted += ' (' + value.slice(1, 4);
                    if (value.length > 4) formatted += ') ' + value.slice(4, 7);
                    if (value.length > 7) formatted += '-' + value.slice(7, 9);
                    if (value.length > 9) formatted += '-' + value.slice(9, 11);
                    e.target.value = formatted;
                }
            });
        }
        
        // Обработка отправки
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name')?.value.trim() || '',
                address: document.getElementById('address')?.value.trim() || '',
                datetime: document.getElementById('datetime')?.value || '',
                phone: document.getElementById('phone')?.value.trim().replace(/\D/g, '') || ''
            };
            
            if (!formData.name || !formData.address || !formData.datetime || !formData.phone) {
                showMessage('❌ Пожалуйста, заполните все поля', 'error');
                return;
            }
            
            if (formData.phone.length < 10) {
                showMessage('❌ Введите корректный номер телефона', 'error');
                return;
            }
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '⏳ Отправка...';
            }
            
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время. С наступающим Новым Годом! 🎉', 'success');
                    form.reset();
                } else {
                    showMessage('❌ Ошибка: ' + (data.message || 'Неизвестная ошибка'), 'error');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showMessage('❌ Произошла ошибка при отправке заявки. Проверьте подключение к интернету и попробуйте позже.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '✨ Отправить заявку ✨';
                }
            }
        });
        
        function showMessage(text, type) {
            if (!messageDiv) return;
            messageDiv.textContent = text;
            messageDiv.className = 'message ' + type;
            setTimeout(() => {
                messageDiv.style.animation = 'slideIn 0.5s ease-out reverse';
                setTimeout(() => {
                    messageDiv.className = 'message';
                    messageDiv.style.animation = '';
                }, 500);
            }, 6000);
        }
    }
    
    // Инициализация
    document.addEventListener('DOMContentLoaded', function() {
        createStars();
        initSnow();
        initForm();
        console.log('✅ Приложение инициализировано');
    });
})();

