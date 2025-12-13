const { body, validationResult } = require('express-validator');

const validateOrder = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Имя должно быть от 2 до 100 символов')
        .escape(),
    
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Адрес обязателен для заполнения')
        .isLength({ min: 5, max: 500 })
        .withMessage('Адрес должен быть от 5 до 500 символов')
        .escape(),
    
    body('datetime')
        .notEmpty()
        .withMessage('Дата и время обязательны')
        .isISO8601()
        .withMessage('Неверный формат даты и времени')
        .custom((value) => {
            const selectedDate = new Date(value);
            const now = new Date();
            if (selectedDate < now) {
                throw new Error('Дата и время не могут быть в прошлом');
            }
            return true;
        }),
    
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Номер телефона обязателен')
        .custom((value) => {
            const phoneDigits = value.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 15) {
                throw new Error('Некорректный номер телефона');
            }
            return true;
        })
];

const validateId = [
    body('id').optional().isInt({ min: 1 }).withMessage('Некорректный ID')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Ошибка валидации',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateOrder,
    validateId,
    handleValidationErrors
};

