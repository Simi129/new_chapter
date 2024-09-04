const express = require('express');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_, res) => {
  res.send('Сервер работает!');
});

sequelize.sync({ force: true }) // В продакшене используйте { force: false }
  .then(() => {
    console.log('База данных синхронизирована');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => console.error('Ошибка синхронизации с базой данных:', err));