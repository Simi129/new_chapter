const express = require('express');
const { createOrGetUser, updateUser } = require('../controllers/userController');
const router = express.Router();

// Маршрут для создания или получения пользователя
router.post('/create-or-get', createOrGetUser);

// Маршрут для обновления данных пользователя
router.put('/:telegramId', updateUser);

module.exports = router;