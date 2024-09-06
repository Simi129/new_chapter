require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { sequelize } = require('./src/models');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Функция для проверки данных инициализации Telegram
function verifyTelegramWebAppData(initData) {
  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN);
  const secretKey = secret.digest();
  
  const hash = initData.hash;
  delete initData.hash;
  
  const checkString = Object.keys(initData)
    .sort()
    .map(k => `${k}=${initData[k]}`)
    .join('\n');
  
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  
  return hmac === hash;
}

// Middleware для проверки данных Telegram
const checkTelegramAuth = (req, res, next) => {
  const initData = req.body.initData || req.query.initData;
  if (!initData) {
    return res.status(401).json({ message: 'Отсутствуют данные инициализации Telegram' });
  }

  const parsedInitData = Object.fromEntries(new URLSearchParams(initData));
  
  if (!verifyTelegramWebAppData(parsedInitData)) {
    return res.status(401).json({ message: 'Неверные данные инициализации Telegram' });
  }
  
  req.telegramUser = JSON.parse(parsedInitData.user);
  next();
};

app.use('/api/users', checkTelegramAuth, userRoutes);

sequelize.sync({ force: false })
  .then(() => {
    console.log('База данных синхронизирована');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => console.error('Ошибка синхронизации с базой данных:', err));