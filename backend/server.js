require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Middleware для проверки токена бота
const checkBotToken = (req, res, next) => {
  const botToken = req.headers['x-telegram-bot-token'];
  if (botToken !== process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(401).json({ message: 'Неавторизованный запрос' });
  }
  next();
};

app.use('/api/users', checkBotToken, userRoutes);

sequelize.sync({ force: false })
  .then(() => {
    console.log('База данных синхронизирована');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => console.error('Ошибка синхронизации с базой данных:', err));