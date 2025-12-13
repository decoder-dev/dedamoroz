/**
 * Утилиты для работы с UI
 */
export class UIHelper {
    static showMessage(element, text, type = 'info') {
        if (!element) return;
        
        element.textContent = text;
        element.className = `message ${type}`;
        
        // Автоматически скрыть через 6 секунд
        setTimeout(() => {
            this.hideMessage(element);
        }, 6000);
    }

    static hideMessage(element) {
        if (!element) return;
        element.style.animation = 'slideIn 0.5s ease-out reverse';
        setTimeout(() => {
            element.className = 'message';
            element.style.animation = '';
        }, 500);
    }

    static setLoading(button, isLoading, loadingText = '⏳ Отправка...') {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Отправить заявку';
        }
    }

    static showFieldError(field, message) {
        if (!field) return;
        
        field.classList.add('error');
        
        // Удаляем старое сообщение об ошибке
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Добавляем новое сообщение
        if (message) {
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            field.parentElement.appendChild(errorElement);
        }
    }

    static clearFieldError(field) {
        if (!field) return;
        
        field.classList.remove('error');
        const errorElement = field.parentElement.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    static scrollToElement(element, behavior = 'smooth') {
        if (!element) return;
        element.scrollIntoView({ behavior, block: 'nearest' });
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

