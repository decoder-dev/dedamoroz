/**
 * Утилиты для валидации форм
 */
export class FormValidator {
    static validateName(name) {
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
    }

    static validateAddress(address) {
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
    }

    static validateDateTime(datetime) {
        if (!datetime) {
            return { valid: false, message: 'Дата и время обязательны' };
        }
        const selectedDate = new Date(datetime);
        const now = new Date();
        if (selectedDate < now) {
            return { valid: false, message: 'Дата и время не могут быть в прошлом' };
        }
        return { valid: true };
    }

    static validatePhone(phone) {
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
    }

    static formatPhone(value) {
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
    }

    static validateForm(formData) {
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
}

