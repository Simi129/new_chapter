const { User } = require('../models');

const createOrGetUser = async (req, res) => {
  try {
    const { telegramId, username } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID обязателен' });
    }

    // Проверяем, существует ли пользователь
    let user = await User.findOne({ where: { telegramId } });

    if (user) {
      // Обновляем username, если он изменился
      if (username && user.username !== username) {
        user.username = username;
        await user.save();
      }
      return res.status(200).json({ message: 'Пользователь найден', user });
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
    console.error('Ошибка при создании или получении пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { telegramId } = req.params;
    const updateData = req.body;

    const user = await User.findOne({ where: { telegramId } });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await user.update(updateData);

    res.status(200).json({ message: 'Пользователь успешно обновлен', user });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  createOrGetUser,
  updateUser,
};