require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка CORS
app.use(cors({
  origin: ['https://simi129.github.io', 'http://localhost:3000' , 'https://1349-78-84-19-24.ngrok-free.app'], // Добавьте все нужные домены
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-bot-token']
}));

app.use(express.json());

// Middleware для проверки токена бота
const checkBotToken = (req, res, next) => {
  const botToken = req.headers['x-telegram-bot-token'];
  if (botToken !== process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(401).json({ message: 'Неавторизованный запрос' });
  }
  next();
};

// Применяем middleware checkBotToken только к маршрутам /api/users
app.use('/api/users', checkBotToken, userRoutes);

// Обработка префлайт-запросов для всех маршрутов
app.options('*', cors());

sequelize.sync({ force: false })
  .then(() => {
    console.log('База данных синхронизирована');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => console.error('Ошибка синхронизации с базой данных:', err));