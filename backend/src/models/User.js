const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  telegramId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  totalCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hasPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  invitedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Самоссылающаяся связь для приглашенных пользователей
User.belongsTo(User, { as: 'Inviter', foreignKey: 'invitedBy' });
User.hasMany(User, { as: 'InvitedUsers', foreignKey: 'invitedBy' });

module.exports = User;