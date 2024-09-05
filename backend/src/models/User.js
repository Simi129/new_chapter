const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
  }, {
    tableName: 'Users',
    timestamps: true,
    updatedAt: false
  });

  User.associate = (models) => {
    // Самоссылающаяся связь для приглашенных пользователей
    User.belongsTo(models.User, { as: 'Inviter', foreignKey: 'invitedBy' });
    User.hasMany(models.User, { as: 'InvitedUsers', foreignKey: 'invitedBy' });
  };

  return User;
};