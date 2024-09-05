import { Sequelize, DataTypes } from 'sequelize';

// Инициализация подключения к базе данных с использованием отдельных переменных окружения
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Определение модели User
const User = sequelize.define('User', {
  telegramId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  totalCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hasPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Синхронизация модели с базой данных
sequelize.sync();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  const botToken = req.headers['x-telegram-bot-token'];
  if (botToken !== process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(401).json({ message: 'Неавторизованный запрос' });
  }

  try {
    const { telegramId, username } = req.body;

    // Проверка существования пользователя
    let user = await User.findOne({ where: { telegramId } });

    if (user) {
      return res.status(200).json({ message: 'Пользователь уже существует', user });
    }

    // Создание нового пользователя
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
}