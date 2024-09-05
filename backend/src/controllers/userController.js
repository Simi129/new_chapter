const { User } = require('../models');

const createUser = async (req, res) => {
  try {
    const { telegramId, username } = req.body;

    // Проверяем, существует ли пользователь
    let user = await User.findOne({ where: { telegramId } });

    if (user) {
      return res.status(200).json({ message: 'Пользователь уже существует', user });
    }

    // Создаем нового пользователя
    user = await User.create({
      telegramId,
      username,
      totalCoins: 0,
      hasPremium: false,
    });

    res.status(201).json({ message: 'Пользователь успешно создан', user });
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  createUser,
};