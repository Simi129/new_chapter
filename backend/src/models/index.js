const sequelize = require('../config/database');
const User = require('./User');

const models = {
  User: User(sequelize)
};

// Инициализация связей между моделями
Object.values(models)
  .filter(model => typeof model.associate === "function")
  .forEach(model => model.associate(models));

module.exports = {
  sequelize,
  ...models
};