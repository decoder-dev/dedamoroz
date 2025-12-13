const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder, validateId, handleValidationErrors } = require('../middleware/validation');

// Создание заявки
router.post(
    '/',
    validateOrder,
    handleValidationErrors,
    orderController.create.bind(orderController)
);

// Получение всех заявок
router.get('/', orderController.getAll.bind(orderController));

// Получение заявки по ID
router.get('/:id', orderController.getById.bind(orderController));

// Удаление заявки
router.delete('/:id', orderController.delete.bind(orderController));

// Обновление статуса заявки
router.patch('/:id/status', orderController.updateStatus.bind(orderController));

module.exports = router;

